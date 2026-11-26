import { randomUUID } from 'node:crypto';
import { identityParts, signedHeaders, send, fail } from '../shared/client.mjs';
import { networkTargets, inCollectionWindow } from '../shared/network-policy.ts';

const TTL = 300000;
const keys = ['collector_id', 'request_id', 'key_fingerprint', 'revision', 'issued_at', 'expires_at', 'config'];

/** A mandate is memory-only. Neither a restart nor an offline cache can grant permission. */
export class NetworkMandate {
  constructor(value, receivedAt, receivedMonotonic) {
    this.value = value;
    this.receivedAt = receivedAt;
    this.receivedMonotonic = receivedMonotonic;
    this.targets = value.config ? networkTargets(value.config) : [];
    this.remaining = Math.min(TTL, Date.parse(value.expires_at) - receivedAt,
      Date.parse(value.expires_at) - Date.parse(value.issued_at));
  }

  fresh(now, monotonic) {
    const elapsed = monotonic - this.receivedMonotonic;
    const wallElapsed = now - this.receivedAt;
    return Number.isFinite(elapsed) && elapsed >= 0 && elapsed < this.remaining
      && wallElapsed >= 0 && Math.abs(wallElapsed - elapsed) <= 5000
      && now < Date.parse(this.value.expires_at);
  }

  summary(now, monotonic, profiles) {
    const config = this.value.config;
    const status = !this.fresh(now, monotonic) ? 'expired' : !config ? 'missing'
      : !config.enabled ? 'disabled' : !inCollectionWindow(config, new Date(now)) ? 'outside_window'
        : !profiles.includes(config.credential_ref) ? 'profile_missing' : 'ready';
    return { revision: this.value.revision, expiresAt: new Date(this.receivedAt + this.remaining).toISOString(),
      targetCount: this.targets.length, status, config };
  }

  // Revalidate before every future SNMP request. There is deliberately no scan here.
  authoriseTarget(target, now, monotonic, profiles) {
    if (this.summary(now, monotonic, profiles).status !== 'ready' || !this.targets.includes(target)) {
      fail('mandate_required');
    }
  }
}

export async function fetchNetworkMandate(identity, http = fetch, clock = Date.now,
  monotonic = () => performance.now()) {
  const { state, key } = identityParts(identity);
  if (!state.collectorId) fail('not_enrolled');
  const requestId = randomUUID(), body = '{}', started = clock(), startedMonotonic = monotonic();
  const value = await send(state, 'policy', body,
    signedHeaders(state, key, 'policy', requestId, String(Number(state.sequence) + 1), body, clock), http);
  const now = clock(), currentMonotonic = monotonic(), elapsed = currentMonotonic - startedMonotonic;
  if (!value || Object.keys(value).length !== keys.length || keys.some(k => !Object.hasOwn(value, k))
    || value.collector_id !== state.collectorId || value.key_fingerprint !== state.fingerprint
    || value.request_id !== requestId || !Number.isSafeInteger(value.revision) || value.revision < 0
    || (value.config !== null && (typeof value.config !== 'object' || Array.isArray(value.config)))
    || (value.revision === 0) !== (value.config === null)
    || typeof value.issued_at !== 'string' || typeof value.expires_at !== 'string'
    || !Number.isFinite(Date.parse(value.issued_at)) || !Number.isFinite(Date.parse(value.expires_at))
    || Date.parse(value.expires_at) <= Date.parse(value.issued_at)
    || Date.parse(value.expires_at) - Date.parse(value.issued_at) > TTL
    || Date.parse(value.expires_at) <= now || Math.abs(now - Date.parse(value.issued_at)) > TTL
    || elapsed < 0 || elapsed > 30000 || now < started || Math.abs(now - started - elapsed) > 5000) {
    fail('invalid_mandate');
  }
  try { return new NetworkMandate(value, now, currentMonotonic); }
  catch { fail('invalid_mandate'); }
}
