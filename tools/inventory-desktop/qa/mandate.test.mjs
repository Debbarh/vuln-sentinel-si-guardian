import { it, expect, vi } from 'vitest';
import { createIdentity, digest } from '../shared/client.mjs';
import { fetchNetworkMandate } from '../src/mandate.mjs';
import { handleCollector } from './server-handler';
const origin = 'https://cyber-skill.com', id = '11111111-1111-4111-8111-111111111111';
const initialTime = Date.parse('2026-11-22T10:00:00Z');
const config = { enabled: true, site: 'Site autorisé', ranges: ['192.168.10.0/30'],
  exclusions: ['192.168.10.1/32'], interval_minutes: 1440, timezone: 'UTC',
  start_minute: 0, end_minute: 1440, credential_ref: 'snmp-local' };
function fixture({ status = 'active', alter = value => value, delay = 0 } = {}) {
  const identity = createIdentity(origin); identity.state.collectorId = id;
  let wall = initialTime, mono = 0;
  const rpc = vi.fn(async (url, init) => {
    const p = JSON.parse(init.body);
    if (url.endsWith('watch_collector_key')) return Response.json({ id,
      public_key: identity.state.publicKey, fingerprint: identity.state.fingerprint, status, sequence: '0' });
    if (!url.endsWith('watch_collector_network_mandate')) throw Error('Unexpected RPC');
    wall += delay; mono += delay;
    return Response.json(alter({ collector_id: id, request_id: p.request_id,
      key_fingerprint: identity.state.fingerprint, revision: 3, issued_at: new Date(initialTime).toISOString(),
      expires_at: new Date(initialTime + 300000).toISOString(), config: structuredClone(config) }));
  });
  const http = vi.fn((url, init) => handleCollector(new Request(url, init),
    { url: 'http://rest.invalid', serviceKey: 'SERVER-ONLY', collectorOrigin: origin }, rpc, () => wall));
  const fetch = () => fetchNetworkMandate(identity, http, () => wall, () => mono);
  return { identity, rpc, http, fetch, advance: (w, m = w) => { wall += w; mono += m; },
    summary: mandate => mandate.summary(wall, mono, ['snmp-local']),
    allow: (mandate, ip, profiles = ['snmp-local']) => mandate.authoriseTarget(ip, wall, mono, profiles) };
}
it('retrieves only its signed read-only mandate through the real controller without consuming an upload sequence', async () => {
  const f = fixture(), mandate = await f.fetch();
  expect(f.summary(mandate)).toMatchObject({ revision: 3, targetCount: 1, status: 'ready' });
  expect(f.rpc).toHaveBeenCalledTimes(2);
  const args = JSON.parse(f.rpc.mock.calls[1][1].body);
  expect(args).toEqual({ collector: id, key_fingerprint: digest(Buffer.from(f.identity.state.publicKey, 'hex')),
    request_id: expect.stringMatching(/^[a-f0-9-]{36}$/) });
  expect(f.identity.state.sequence).toBe('0');
  expect(JSON.stringify(f.http.mock.calls)).not.toContain('PRIVATE KEY');
  expect(() => f.allow(mandate, '192.168.10.2')).not.toThrow();
  for (const ip of ['192.168.10.1', '192.168.10.0', '192.168.10.3', '192.168.11.2', 'example.com']) {
    expect(() => f.allow(mandate, ip)).toThrow('mandate_required');
  }
});
it.each(['pending', 'revoked', 'expired', 'closed'])('refuses %s identities before reading any network scope', async status => {
  const f = fixture({ status }); await expect(f.fetch()).rejects.toThrow('forbidden');
  expect(f.rpc).toHaveBeenCalledTimes(1);
});
it.each([
  value => ({ ...value, request_id: id }),
  value => ({ ...value, collector_id: '22222222-2222-4222-8222-222222222222' }),
  value => ({ ...value, key_fingerprint: 'a'.repeat(64) }),
  value => ({ ...value, expires_at: new Date(initialTime + 300001).toISOString() }),
  value => ({ ...value, expires_at: value.issued_at }),
  value => ({ ...value, issued_at: 'invalid' }),
  value => ({ ...value, revision: 0 }),
  value => ({ ...value, config: '' }),
  value => ({ ...value, config: { ...value.config, ranges: ['0.0.0.0/0'] } }),
  value => ({ ...value, config: { ...value.config, password: 'FORBIDDEN-SECRET' } }),
  value => ({ ...value, token: 'unexpected' }),
])('rejects mismatched, excessive or unsafe mandate responses %#', async alter => {
  await expect(fixture({ alter }).fetch()).rejects.toThrow('invalid_mandate');
});
it('does not extend a mandate by slow delivery or by rolling the wall clock back', async () => {
  const f = fixture({ delay: 30000 }), mandate = await f.fetch();
  f.advance(269999); expect(f.summary(mandate).status).toBe('ready');
  f.advance(1); expect(() => f.allow(mandate, '192.168.10.2')).toThrow('mandate_required');
  const g = fixture(), other = await g.fetch(); g.advance(-1000, 1000);
  expect(g.summary(other).status).toBe('expired');
});
it('rejects a slow response and expires on suspension or divergent clocks', async () => {
  await expect(fixture({ delay: 30001 }).fetch()).rejects.toThrow('invalid_mandate');
  const f = fixture(), mandate = await f.fetch(); f.advance(300001, 1000);
  expect(f.summary(mandate).status).toBe('expired');
});
it.each([
  [value => ({ ...value, revision: 0, config: null }), 'missing'],
  [value => ({ ...value, config: { ...value.config, enabled: false } }), 'disabled'],
  [value => ({ ...value, config: { ...value.config, start_minute: 0, end_minute: 1 } }), 'outside_window'],
])('requires an enabled policy inside its daily window %#', async (alter, expected) => {
  const f = fixture({ alter }), mandate = await f.fetch(); expect(f.summary(mandate).status).toBe(expected);
  expect(() => f.allow(mandate, '192.168.10.2')).toThrow('mandate_required');
});
it('requires the referenced local SNMP profile for every target', async () => {
  const f = fixture(), mandate = await f.fetch();
  expect(() => f.allow(mandate, '192.168.10.2', [])).toThrow('mandate_required');
});
