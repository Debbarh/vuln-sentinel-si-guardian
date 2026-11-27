import {randomUUID,createHash} from 'node:crypto';
import {identityParts,signedHeaders,send,fail} from '../shared/client.mjs';
import {validateAutomationPolicy,automationWindow} from '../shared/automation-policy.ts';
export const policyDigest=c=>createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.keys(c).sort().map(k=>[k,c[k]])))).digest('hex');
export async function fetchTaskMandate(identity,http=fetch,clock=Date.now,monotonic=()=>performance.now()){
 const{state,key}=identityParts(identity);if(!state.collectorId)fail('not_enrolled');
 const request=randomUUID(),start=clock(),mono=monotonic();
 const v=await send(state,'tasks','{}',signedHeaders(state,key,'tasks',request,String(Number(state.sequence)+1),'{}',clock),(url,init)=>http(url,{...init,signal:AbortSignal.timeout(10000)}));
 const now=clock(),elapsed=monotonic()-mono,issued=Date.parse(v?.issued_at),expires=Date.parse(v?.expires_at);
 if(!v||Object.keys(v).sort().join(',')!=='collector_id,config,expires_at,issued_at,key_fingerprint,request_id,revision'||v.collector_id!==state.collectorId||v.key_fingerprint!==state.fingerprint||v.request_id!==request||!Number.isSafeInteger(v.revision)||v.revision<0||!Number.isFinite(issued)||!Number.isFinite(expires)||expires<=now||expires<=issued||expires-issued>300000||Math.abs(now-issued)>300000||elapsed<0||elapsed>30000||Math.abs(now-start-elapsed)>5000||(v.revision===0)!==(v.config===null))fail('invalid_mandate');
 if(v.config!==null)validateAutomationPolicy(v.config);
 return{revision:v.revision,config:v.config,hash:v.config?policyDigest(v.config):null,expiresAt:v.expires_at};
}
const defaults=()=>({enabled:false,revision:0,hash:null,lastAttempt:null,lastSuccess:null,nextAt:null,failures:0,error:null,networkRetryAt:null});
/** Explicit standing consent + fresh server mandate; no cached mandate can start a task. */
export class CollectorScheduler{
 constructor(engine,collect,{clock=Date.now,mandate=fetchTaskMandate,network=null}={}){this.network=network;this.engine=engine;this.collect=collect;this.clock=clock;this.mandate=mandate;this.running=false;this.controller=null;this.paused=false;}
 async state(){return this.engine.store.exclusive(async()=>({...defaults(),...(await this.engine.record()).automation,running:this.running}));}
 async authority(){const r=await this.engine.record();return this.mandate(r.identity,this.engine.http,this.clock,this.engine.monotonic);}
 async enable(confirmed=false,expected){if(confirmed!==true)fail('collection_consent');return this.engine.store.exclusive(async()=>{
  const r=await this.engine.record(),m=await this.authority();if(!m.config?.enabled||(!m.config.glpi&&!m.config.network)||m.config.network&&!this.network)fail('automation_unavailable');
  if(expected&&(expected.revision!==m.revision||expected.hash!==m.hash))fail('automation_changed');
  let networkConsent=null;if(m.config.network){const n=await this.network.authority();if(n.summary(this.clock(),this.engine.monotonic(),r.profiles.map(p=>p.name)).status!=='ready')fail('mandate_required');networkConsent={revision:n.value.revision,hash:policyDigest(n.value.config)};if(expected?.networkConsent&&(expected.networkConsent.revision!==networkConsent.revision||expected.networkConsent.hash!==networkConsent.hash))fail('automation_changed');}
  const previous=r.automation,samePolicy=previous?.revision===m.revision&&previous?.hash===m.hash&&previous?.networkConsent?.revision===networkConsent?.revision&&previous?.networkConsent?.hash===networkConsent?.hash;
  // Reauthorising an unchanged policy (for example after moving/updating the app)
  // repairs startup without discarding a pending cycle or advancing its due time.
  r.automation={...defaults(),...(samePolicy?previous:{}),enabled:true,revision:m.revision,hash:m.hash,networkConsent,error:null,nextAt:samePolicy?(previous.nextAt??this.clock()):this.clock()};await this.engine.store.write(r);this.paused=false;return r.automation;
 });}
 async pause(){this.paused=true;this.stop();if(this.running)await this.finished;return this.persistPause();}
 async persistPause(){return this.engine.store.exclusive(async()=>{const r=await this.engine.record();r.automation={...defaults(),...r.automation,enabled:false};await this.engine.store.write(r);return r.automation;});}
 stop(){this.controller?.abort();this.network?.stop();}
 async validate(expected){if(this.paused||this.controller?.signal.aborted)fail('collection_cancelled');const m=await this.authority();
  if(!m.config?.enabled||(!m.config.glpi&&!m.config.network)||m.revision!==expected.revision||m.hash!==expected.hash)fail('automation_changed');
  if(!automationWindow(m.config,this.clock()))fail('automation_window');if(m.config.network){const n=await this.network.authority();if(n.value.revision!==expected.networkConsent?.revision||policyDigest(n.value.config)!==expected.networkConsent?.hash)fail('automation_changed');if(n.summary(this.clock(),this.engine.monotonic(),(await this.engine.record()).profiles.map(p=>p.name)).status!=='ready')fail('mandate_required');m.network=n;}return m;
 }
 async tick(){
  if(this.running||this.paused)return false;this.running=true;this.controller=new AbortController();let finish;this.finished=new Promise(resolve=>{finish=resolve;});let current,retryFloor=60000;
  const authorised=async()=>{const m=await this.validate(current);retryFloor=Math.max(m.config.interval_minutes,m.network?.value.config.interval_minutes??0)*60000;return m;};
  try{
   current=await this.engine.store.exclusive(async()=>{const r=await this.engine.record(),a=r.automation;if(!a?.enabled)return null;
    if(a.lastAttempt!==null&&this.clock()<a.lastAttempt-5000)fail('automation_clock');
    if(a.nextAt!==null&&this.clock()<a.nextAt)return null;
    if(r.pending&&(!r.pending.automation||r.pending.automation.revision!==a.revision||r.pending.automation.hash!==a.hash))fail('pending_batch_exists');
    r.automation={...a,lastAttempt:this.clock(),nextAt:this.clock()+300000,error:null};await this.engine.store.write(r);return{...r.automation,pending:!!r.pending};
   });
   if(!current)return false;let m=await authorised();
   if(current.pending&&!m.config.transmit){await this.engine.store.exclusive(async()=>{const r=await this.engine.record();r.automation={...r.automation,error:'review_required',nextAt:this.clock()+m.config.interval_minutes*60000};await this.engine.store.write(r);});return false;}
   if(current.pending){await this.engine.deliverScheduled(current,()=>authorised());}
   let cycle=await this.engine.store.exclusive(async()=>{const r=await this.engine.record();if(!r.automation.cycle){r.automation.cycle={id:randomUUID(),glpiDone:!m.config.glpi,networkDone:!m.config.network};await this.engine.store.write(r);}return r.automation.cycle;});
   const scheduled=job=>({revision:current.revision,hash:current.hash,cycle:cycle.id,job});
   if(!cycle.glpiDone){
    await this.engine.generate(this.collect,{consent:true,signal:this.controller.signal,authorize:()=>authorised(),scheduled:scheduled('glpi')});
    m=await authorised();if(m.config.transmit)await this.engine.deliverScheduled(current,()=>authorised());
   }
   let r=await this.engine.record();
   if(!r.pending&&!r.automation.cycle.networkDone){
    m=await authorised();
    // After a lost acknowledgement, deliver the existing batch before deciding
    // when to retry failed targets. Never turn transport recovery into a new scan.
    if(r.networkRun?.cycle===cycle.id&&r.networkRun.completedAt&&r.networkRun.failures&&(!r.automation.networkRetryAt||this.clock()<r.automation.networkRetryAt))fail('network_partial');
    await this.network.step(m.network,{consent:true,signal:this.controller.signal,authorize:()=>authorised(),scheduled:scheduled('network'),cycle:cycle.id});
    r=await this.engine.record();if(r.pending&&m.config.transmit)await this.engine.deliverScheduled(current,()=>authorised());
    r=await this.engine.record();
    if(r.networkRun?.completedAt&&!r.pending){if(r.networkRun.failures)fail('network_partial');await this.engine.store.exclusive(async()=>{const saved=await this.engine.record();saved.automation.cycle.networkDone=true;await this.engine.store.write(saved);});}
   }
   m=await authorised();
   await this.engine.store.exclusive(async()=>{const r=await this.engine.record(),done=r.automation.cycle?.glpiDone&&r.automation.cycle?.networkDone;
    const waiting=!!r.pending&&!m.config.transmit;
    const interval=Math.max(m.config.interval_minutes,m.network?.value.config?.interval_minutes??0)*60000;
    r.automation={...r.automation,lastSuccess:done?this.clock():r.automation.lastSuccess,nextAt:this.clock()+(done||waiting?interval:300000),failures:0,error:waiting?'review_required':null,cycle:done?null:r.automation.cycle,networkRetryAt:done?null:r.automation.networkRetryAt};await this.engine.store.write(r);
   });
   return true;
  }catch(error){
   // Only fixed codes are persisted; dependency messages never enter logs or the renderer.
   const known=['automation_changed','automation_window','automation_clock','pending_batch_exists','collection_cancelled','collector_not_active','secure_storage_unavailable','network_partial','mandate_required'];
   const code=known.includes(error.code)?error.code:'automation_failed';
   await this.engine.store.exclusive(async()=>{const r=await this.engine.record();if(!r.automation)return;
    const failures=Math.min(30,(r.automation.failures??0)+1),pause=['automation_changed','automation_clock'].includes(code);
    const networkRetryAt=code==='network_partial'?(r.automation.networkRetryAt>this.clock()?r.automation.networkRetryAt:this.clock()+retryFloor):r.automation.networkRetryAt;
    const nextAt=code==='network_partial'?networkRetryAt:this.clock()+Math.min(3600000,60000*2**Math.min(failures-1,6));
    r.automation={...r.automation,enabled:pause?false:r.automation.enabled,failures,error:code,nextAt,networkRetryAt};await this.engine.store.write(r);
   }).catch(()=>{});return false;
  }finally{this.running=false;this.controller=null;if(this.paused)await this.persistPause().catch(()=>{});finish();}
 }
}
