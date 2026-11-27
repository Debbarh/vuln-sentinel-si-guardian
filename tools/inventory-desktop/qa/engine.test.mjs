// @vitest-environment node
import{it,expect,vi,afterEach}from'vitest';import fs from'node:fs';import os from'node:os';import path from'node:path';import{randomBytes,createCipheriv,createDecipheriv}from'node:crypto';
import{EncryptedStore,readLimited}from'../src/store.mjs';import{DesktopEngine,ORIGIN}from'../src/engine.mjs';import{UI_URL,CSP,validSender,assetPath,browserPreferences}from'../src/security.mjs';import{handleCollector}from'./server-handler';import{digest}from'../shared/client.mjs';
const dirs=[];afterEach(()=>{for(const dir of dirs.splice(0))fs.rmSync(dir,{recursive:true,force:true,maxRetries:5,retryDelay:200});});
function provider(){const key=randomBytes(32);return{available:async()=>true,encrypt:async text=>{const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',key,iv),data=Buffer.concat([c.update(text,'utf8'),c.final()]);return Buffer.concat([iv,c.getAuthTag(),data]);},decrypt:async data=>{const c=createDecipheriv('aes-256-gcm',key,data.subarray(0,12));c.setAuthTag(data.subarray(12,28));return Buffer.concat([c.update(data.subarray(28)),c.final()]).toString('utf8');}};}
function fixture(crypto=provider()){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cs-desktop-'));dirs.push(dir);fs.chmodSync(dir,0o700);const store=new EncryptedStore(dir,crypto),net=backend();return{dir,store,net,engine:new DesktopEngine(store,{http:net.http})};}
const id='11111111-1111-4111-8111-111111111111',invitation='22222222-2222-4222-8222-222222222222',token='cse_'+'a'.repeat(64),lease='33333333-3333-4333-8333-333333333333';
const report=Buffer.from('{"deviceid":"DESKTOP-A","content":{"versionclient":"GLPI-Agent","hardware":{"name":"Fixture host","winprodkey":"LICENSE-SECRET"},"users":[{"login":"alice","password":"AUTH-SECRET"}],"counter":18446744073709551615,"future":{"empty":null,"off":false}}}');
function backend(){let publicKey='',fingerprint='',sequence='0';const accepted=new Map(),reports=[];const rpc=vi.fn(async(url,init)=>{const p=JSON.parse(await new Response(init.body).text());let result;
 if(url.endsWith('watch_collector_enroll')){publicKey=p.public_key;fingerprint=digest(Buffer.from(publicKey,'hex'));result={id,fingerprint,status:'pending'};}
 else if(url.endsWith('watch_collector_key'))result={id,public_key:publicKey,fingerprint,status:'active',sequence};
 else if(url.endsWith('watch_collector_begin'))result=accepted.get(p.batch)??{ack:false,lease};
 else if(url.endsWith('watch_collector_receive')){reports.push(p.payload_text);sequence=String(Number(sequence)+1);result={ack:true,id:p.batch,sequence,hash:digest(p.payload_text),status:'queued'};accepted.set(p.batch,result);}
 return new Response(JSON.stringify(result));});
 const http=vi.fn((url,init)=>handleCollector(new Request(url,init),{url:'http://rest.invalid',serviceKey:'SERVER-ONLY',collectorOrigin:ORIGIN},rpc));return{http,rpc,reports};}
async function enrolled(f){await f.engine.initialise();await f.engine.enroll(invitation,token);await f.engine.refresh();}
it('keeps identity and SNMP credentials encrypted and absent from renderer summaries and server traffic',async()=>{const f=fixture();await enrolled(f);const profile={name:'snmp-local',username:'inventory-ro',authProtocol:'SHA256',privacyProtocol:'AES',authPassword:'SNMP-AUTH-SECRET',privacyPassword:'SNMP-PRIV-SECRET'};f.net.http.mockClear();const summary=await f.engine.saveProfile(profile);expect(f.net.http).not.toHaveBeenCalled();const disk=fs.readFileSync(f.store.file).toString('utf8');expect(disk).not.toMatch(/PRIVATE KEY|SNMP-AUTH-SECRET|SNMP-PRIV-SECRET|cse_/);expect(JSON.stringify(summary)).not.toMatch(/Password|PRIVATE KEY|SNMP-AUTH|SNMP-PRIV/);expect((await f.store.read()).profiles[0]).toEqual(profile);if(process.platform!=='win32')expect(fs.statSync(f.store.file).mode&0o077).toBe(0);});
it('never falls back to plaintext when the OS vault is unavailable',async()=>{const f=fixture({...provider(),available:async()=>false});expect((await f.engine.state()).available).toBe(false);await expect(f.engine.initialise()).rejects.toThrow('secure_storage_unavailable');expect(fs.existsSync(f.store.file)).toBe(false);expect(f.net.http).not.toHaveBeenCalled();});
it('retains the existing ciphertext if the vault cannot decrypt it',async()=>{const f=fixture();await f.engine.initialise();const before=fs.readFileSync(f.store.file);f.store.crypto=provider();await expect(f.engine.state()).rejects.toThrow('local_state_unreadable');expect(fs.readFileSync(f.store.file)).toEqual(before);});
it.skipIf(process.platform==='win32')('refuses symlink and permissive local identity records before decrypting',async()=>{const f=fixture();await f.engine.initialise();fs.chmodSync(f.store.file,0o644);await expect(f.engine.state()).rejects.toThrow('private_file_required');fs.chmodSync(f.store.file,0o600);fs.renameSync(f.store.file,path.join(f.dir,'other.enc'));fs.symlinkSync(path.join(f.dir,'other.enc'),f.store.file);await expect(f.engine.state()).rejects.toThrow('private_file_required');});
it('bounds file reads even if the file is larger than its admission limit',()=>{const f=fixture(),file=path.join(f.dir,'large');fs.writeFileSync(file,'x'.repeat(200000));const fd=fs.openSync(file,'r');try{expect(()=>readLimited(fd,65536)).toThrow('file_size');}finally{fs.closeSync(fd);}});
it('stages full masked GLPI reports locally without network calls',async()=>{const f=fixture();await enrolled(f);f.net.http.mockClear();const result=await f.engine.prepare([report]);expect(result.pending.count).toBe(1);expect(result.pending.masked).toBe(2);expect(f.net.http).not.toHaveBeenCalled();const preview=await f.engine.preview();expect(preview.reports[0]).toContain('18446744073709551615');expect(preview.reports[0]).toContain('alice');expect(preview.reports[0]).not.toMatch(/AUTH-SECRET|LICENSE-SECRET/);expect(fs.readFileSync(f.store.file).toString()).not.toMatch(/DESKTOP-A|alice|AUTH-SECRET/);});
it('requires explicit local review and consent before sending, and resets review after restart',async()=>{const f=fixture();await enrolled(f);await f.engine.prepare([report]);await expect(f.engine.deliver('push',true)).rejects.toThrow('review_required');await f.engine.preview();await expect(f.engine.deliver('push',false)).rejects.toThrow('review_required');const restarted=new DesktopEngine(f.store,{http:f.net.http});await expect(restarted.deliver('push',true)).rejects.toThrow('review_required');await restarted.preview();expect((await restarted.deliver('push',true)).sequence).toBe('1');expect(f.net.reports).toHaveLength(1);});
it('retries a lost acknowledgement with the same identity, batch, hash and sequence',async()=>{const f=fixture();await enrolled(f);await f.engine.prepare([report]);await f.engine.preview();const original=f.engine.http;f.engine.http=async(...args)=>{await original(...args);throw Error('lost');};await expect(f.engine.deliver('push',true)).rejects.toThrow('lost');expect(f.net.reports).toHaveLength(1);const pending=(await f.store.read()).pending;const restarted=new DesktopEngine(f.store,{http:original});await restarted.preview();expect((await restarted.deliver('push',true)).sequence).toBe('1');expect(f.net.reports).toHaveLength(1);expect(pending.sequence).toBe('1');expect((await f.store.read()).pending).toBe(null);});
it('keeps pending state after local persistence failure following server acceptance',async()=>{const f=fixture();await enrolled(f);await f.engine.prepare([report]);await f.engine.preview();const original=f.store.write.bind(f.store);f.store.write=vi.fn().mockRejectedValueOnce(Error('disk full'));await expect(f.engine.deliver('push',true)).rejects.toThrow('disk full');expect((await f.store.read()).pending).not.toBe(null);f.store.write=original;await f.engine.preview();await f.engine.deliver('push',true);expect(f.net.reports).toHaveLength(1);});
it('rejects concurrent operations instead of queuing secrets and overwriting encrypted state',async()=>{const f=fixture();let finish;const pending=f.store.exclusive(()=>new Promise(resolve=>{finish=resolve;}));await expect(f.engine.initialise()).rejects.toThrow('collector_locked');finish();await pending;});
it('only accepts authenticated-and-encrypted SNMP profiles and never returns their passwords',async()=>{const f=fixture();await f.engine.initialise();await expect(f.engine.saveProfile({name:'x',username:'user',authProtocol:'MD5',privacyProtocol:'DES',authPassword:'abcdefgh',privacyPassword:'abcdefgh'})).rejects.toThrow('credentials_invalid');expect(f.net.http).not.toHaveBeenCalled();});
it('binds native IPC to the exact local main frame',()=>{const frame={url:UI_URL},contents={mainFrame:frame},window={webContents:contents,isDestroyed:()=>false};expect(validSender({sender:contents,senderFrame:frame},window)).toBe(true);expect(validSender({sender:contents,senderFrame:{url:UI_URL}},window)).toBe(false);expect(validSender({sender:{},senderFrame:frame},window)).toBe(false);frame.url='https://cyber-skill.com';expect(validSender({sender:contents,senderFrame:frame},window)).toBe(false);expect(browserPreferences('/trusted/preload.cjs')).toMatchObject({sandbox:true,contextIsolation:true,nodeIntegration:false,webviewTag:false,devTools:false});expect(CSP).toContain("connect-src 'none'");});
it.each(['file:///etc/passwd','cyberskill://other/index.html','cyberskill://collector/%2e%2e%2fidentity.pem','cyberskill://collector/assets/a%2f..%2fsecret.js','cyberskill://collector/index.html?token=x'])('denies renderer resource escape: %s',url=>{expect(assetPath(url)).toBe(null);});

it('keeps network mandates in memory only and clears them before a failed refresh or a restart',async()=>{
 const f=fixture();await enrolled(f);const before=fs.readFileSync(f.store.file);
 const config={enabled:true,site:'Site local',ranges:['192.168.10.0/30'],exclusions:['192.168.10.1/32'],interval_minutes:1440,timezone:'UTC',start_minute:0,end_minute:1440,credential_ref:'snmp-local'};
 f.engine.http=vi.fn(async(_url,init)=>Response.json({collector_id:id,request_id:init.headers['x-cs-batch'],key_fingerprint:(await f.store.read()).identity.state.fingerprint,revision:1,issued_at:new Date().toISOString(),expires_at:new Date(Date.now()+299000).toISOString(),config}));
 const value=await f.engine.fetchMandate();expect(value.networkMandate).toMatchObject({revision:1,targetCount:1,status:'profile_missing'});
 expect(fs.readFileSync(f.store.file)).toEqual(before);
 const restarted=new DesktopEngine(f.store,{http:f.engine.http});expect((await restarted.state()).networkMandate).toBe(null);
 f.engine.http=vi.fn().mockRejectedValue(Error('offline'));await expect(f.engine.fetchMandate()).rejects.toThrow('offline');expect((await f.engine.state()).networkMandate).toBe(null);
});

it('generates only with local consent and a live approved identity, stages masked output and never pushes automatically',async()=>{
 const f=fixture();await enrolled(f);const collect=vi.fn(async()=>Buffer.from(report));
 await expect(f.engine.generate(collect)).rejects.toThrow('collection_consent');expect(collect).not.toHaveBeenCalled();
 const result=await f.engine.generate(collect,{consent:true});expect(result.pending.count).toBe(1);expect(f.net.reports).toHaveLength(0);
 expect(collect).toHaveBeenCalledWith(id,expect.objectContaining({signal:expect.any(AbortSignal)}));
 await expect(f.engine.deliver('push',true)).rejects.toThrow('review_required');const preview=await f.engine.preview();expect(preview.reports[0]).not.toMatch(/AUTH-SECRET|LICENSE-SECRET/);
 await f.engine.deliver('push',true);expect(f.net.reports).toHaveLength(1);
});
it('refuses inactive, offline and revoked collectors before starting a local inventory',async()=>{
 const f=fixture();await enrolled(f);const collect=vi.fn();
 for(const status of ['pending','revoked','expired']){
  f.engine.http=vi.fn(async()=>Response.json({id,fingerprint:(await f.store.read()).identity.state.fingerprint,status}));
  await expect(f.engine.generate(collect,{consent:true})).rejects.toThrow('collector_not_active');
 }
 f.engine.http=vi.fn().mockRejectedValue(Error('offline'));await expect(f.engine.generate(collect,{consent:true})).rejects.toThrow('offline');expect(collect).not.toHaveBeenCalled();
});
it('rejects a generated result if approval was revoked during collection, without retaining report bytes',async()=>{
 const f=fixture();await enrolled(f);const bytes=Buffer.from(report),http=f.engine.http;
 await expect(f.engine.generate(async()=>{f.engine.http=async()=>Response.json({id,fingerprint:(await f.store.read()).identity.state.fingerprint,status:'revoked'});return bytes;},{consent:true})).rejects.toThrow('collector_not_active');
 expect(bytes.every(n=>n===0)).toBe(true);expect((await f.store.read()).pending).toBe(null);expect(f.net.reports).toHaveLength(0);f.engine.http=http;
});
it('keeps an existing batch intact and stops cancelled generation without creating another batch',async()=>{
 const f=fixture();await enrolled(f);const c=new AbortController(),bytes=Buffer.from(report);
 await expect(f.engine.generate(async()=>{c.abort();return bytes;},{consent:true,signal:c.signal})).rejects.toThrow('collection_cancelled');expect((await f.store.read()).pending).toBe(null);expect(bytes.every(n=>n===0)).toBe(true);
 await f.engine.prepare([report]);const pending=(await f.store.read()).pending,collect=vi.fn();await expect(f.engine.generate(collect,{consent:true})).rejects.toThrow('pending_batch_exists');expect((await f.store.read()).pending).toEqual(pending);expect(collect).not.toHaveBeenCalled();
});

it('creates a fresh association only after confirmation and a fresh revoked/expired status',async()=>{
 const f=fixture();await enrolled(f);const old=await f.store.read(),bytes=fs.readFileSync(f.store.file);
 await expect(f.engine.reassociate(false,old.identity.state.fingerprint)).rejects.toThrow('collection_consent');
 await expect(f.engine.reassociate(true,'0'.repeat(64))).rejects.toThrow('association_changed');
 await expect(f.engine.reassociate(true,old.identity.state.fingerprint)).rejects.toThrow('association_active');
 f.engine.http=vi.fn().mockRejectedValue(Error('offline'));await expect(f.engine.reassociate(true,old.identity.state.fingerprint)).rejects.toThrow('offline');expect(fs.readFileSync(f.store.file)).toEqual(bytes);
 for(const status of ['revoked','expired']){
  const g=fixture();await enrolled(g);const before=await g.store.read();g.engine.http=vi.fn(async()=>Response.json({id,fingerprint:before.identity.state.fingerprint,status}));
  const result=await g.engine.reassociate(true,before.identity.state.fingerprint),after=await g.store.read();expect(result.enrolled).toBe(false);expect(result.status).toBe('local');expect(result.fingerprint).not.toBe(before.identity.state.fingerprint);expect(after.identity.privateKey).not.toBe(before.identity.privateKey);expect(after.identity.state.sequence).toBe('0');expect(result.automation).toBe(null);expect(result.networkMandate).toBe(null);
 }
});
it('retains an old pending batch encrypted for export without transferring it to the new identity',async()=>{
 const f=fixture();await enrolled(f);await f.engine.prepare([report]);await f.engine.saveProfile({name:'snmp-local',username:'inventory-ro',authProtocol:'SHA256',privacyProtocol:'AES',authPassword:'SNMP-AUTH-SECRET',privacyPassword:'SNMP-PRIV-SECRET'});
 const before=await f.store.read();before.automation={enabled:true,revision:1,cycle:{id:'old-cycle'}};await f.store.write(before);
 f.engine.http=vi.fn(async()=>Response.json({id,fingerprint:before.identity.state.fingerprint,status:'revoked'}));const summary=await f.engine.reassociate(true,before.identity.state.fingerprint);const after=await f.store.read();
 expect(after.pending).toBe(null);expect(after.recoveryBatch.body).toBe(before.pending.body);expect(after.profiles).toEqual(before.profiles);expect(after.automation).toBe(null);expect(summary.recovery).toMatchObject({kind:'glpi',count:1});expect(JSON.stringify(summary)).not.toMatch(/PRIVATE KEY|SNMP-AUTH-SECRET|DESKTOP-A/);
 const recovered=await new DesktopEngine(f.store,{http:f.engine.http}).recoveredReports();expect(recovered.reports[0]).toContain('18446744073709551615');expect(recovered.reports[0]).not.toMatch(/LICENSE-SECRET|AUTH-SECRET/);
 expect(fs.readFileSync(f.store.file).toString()).not.toMatch(/PRIVATE KEY|alice|SNMP-AUTH|DESKTOP-A/);expect(f.net.reports).toHaveLength(0);
 await expect(f.engine.clearRecovery(false,summary.recovery.id)).rejects.toThrow('collection_consent');await expect(f.engine.clearRecovery(true,'wrong')).rejects.toThrow('association_changed');await f.engine.clearRecovery(true,summary.recovery.id);expect((await f.engine.state()).recovery).toBe(null);
});
it('keeps the old record intact if identity replacement cannot be persisted',async()=>{
 const f=fixture();await enrolled(f);await f.engine.prepare([report]);const old=await f.store.read();f.engine.http=vi.fn(async()=>Response.json({id,fingerprint:old.identity.state.fingerprint,status:'revoked'}));f.store.write=vi.fn().mockRejectedValue(Error('disk full'));await expect(f.engine.reassociate(true,old.identity.state.fingerprint)).rejects.toThrow('disk full');expect(await f.store.read()).toEqual(old);
});
it('never overwrites an existing retained batch on a second association recovery',async()=>{
 const f=fixture();await enrolled(f);await f.engine.prepare([report]);const old=await f.store.read();f.engine.http=vi.fn(async()=>Response.json({id,fingerprint:old.identity.state.fingerprint,status:'revoked'}));await f.engine.reassociate(true,old.identity.state.fingerprint);
 const record=await f.store.read();record.identity=old.identity;record.pending=old.pending;await f.store.write(record);const bytes=fs.readFileSync(f.store.file);await expect(f.engine.reassociate(true,old.identity.state.fingerprint)).rejects.toThrow('recovery_batch_exists');expect(fs.readFileSync(f.store.file)).toEqual(bytes);
});
it('persists the observed revocation and pauses previously authorised automatic work',async()=>{
 const f=fixture();await enrolled(f);const record=await f.store.read();record.automation={enabled:true};await f.store.write(record);f.engine.http=vi.fn(async()=>Response.json({id,fingerprint:record.identity.state.fingerprint,status:'revoked'}));const value=await f.engine.refresh();expect(value.status).toBe('revoked');expect(value.automation.enabled).toBe(false);expect(value.verifiedAt).not.toBe(null);
});
