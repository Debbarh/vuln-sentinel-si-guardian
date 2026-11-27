import {policyDigest} from './automation.mjs';
import {stringify} from 'lossless-json';
import {fetchNetworkMandate} from './mandate.mjs';
import {readFullReport} from '../shared/report-json.ts';
import {fail,MAX_REPORT_BYTES} from '../shared/client.mjs';
const hash=m=>policyDigest(m.value.config);
export class NetworkDiscovery{
 constructor(engine,worker,{clock=Date.now,mandate=fetchNetworkMandate}={}){this.engine=engine;this.worker=worker;this.clock=clock;this.mandate=mandate;this.running=false;this.controller=null;this.progress=null;}
 stop(){this.controller?.abort();}
 async authority(){const r=await this.engine.record();return this.mandate(r.identity,this.engine.http,this.clock,this.engine.monotonic);}
 async step(expected,{consent=false,signal,authorize,scheduled,cycle=null}={}){
  if(consent!==true)fail('collection_consent');if(this.running)fail('collector_locked');this.running=true;this.controller=new AbortController();const cancel=()=>this.controller?.abort();signal?.addEventListener('abort',cancel,{once:true});if(signal?.aborted)cancel();const files=[];let total=0;
  try{
   const initial=await this.engine.store.exclusive(async()=>{const r=await this.engine.record();if(r.pending)fail('pending_batch_exists');return r;}),fingerprint=hash(expected);
   if(expected.summary(this.clock(),this.engine.monotonic(),initial.profiles.map(p=>p.name)).status!=='ready')fail('mandate_required');
   const fresh=async target=>{if(this.controller.signal.aborted)fail('collection_cancelled');await authorize?.();const m=await this.authority();if(m.value.revision!==expected.value.revision||hash(m)!==fingerprint)fail('mandate_changed');m.authoriseTarget(target,this.clock(),this.engine.monotonic(),initial.profiles.map(p=>p.name));return m;};
   const verified=await this.worker.verify(this.controller.signal),old=initial.networkRun;
   let run=old&&old.hash===fingerprint&&old.revision===expected.value.revision&&old.cycle===cycle&&old.index<expected.targets.length?{...old}:{revision:expected.value.revision,hash:fingerprint,cycle,index:0,successes:0,failures:0,total:expected.targets.length,startedAt:this.clock(),completedAt:null};
   const profile=initial.profiles.find(p=>p.name===expected.value.config.credential_ref);if(!profile)fail('credentials_invalid');
   for(let index=run.index;index<expected.targets.length;index++){
    const target=expected.targets[index],m=await fresh(target),started=performance.now();this.progress={...run,index,total:expected.targets.length};let raw,clean,validationError=null,validation=null;const timer=setInterval(()=>{if(validation)return;validation=fresh(target).catch(error=>{validationError=error;this.controller.abort();}).finally(()=>{validation=null;});},30000);
    try{
     const remaining=Date.parse(m.value.expires_at)-this.clock();if(remaining<1000)fail('mandate_required');
     raw=await this.worker.collect(verified,target,m.value.config,profile,{signal:this.controller.signal,timeout:Math.min(65000,remaining)});
     if(validation)await validation;if(validationError)throw validationError;await fresh(target);const result=readFullReport(new TextDecoder('utf-8',{fatal:true}).decode(raw));const report=result.payload;
     if(report.target!==target||report.format!=='cyber-skill-snmp-info-1'||report.source!=='netdisco-snmp-info')fail('invalid_report');
     clean=Buffer.from(stringify({...report,policy_revision:m.value.revision}));if(clean.length>MAX_REPORT_BYTES)fail('file_size');
    }catch(error){
     if(validationError)throw validationError;if(this.controller.signal.aborted||['mandate_changed','mandate_required','forbidden','automation_changed','automation_window','collection_cancelled'].includes(error.code))throw error;
     // A failed target is not manufactured into a discovered asset or a successful inventory.
     run={...run,index:index+1,failures:run.failures+1};if(!files.length)await this.save(run);continue;
    }finally{clearInterval(timer);if(validation)await validation;raw?.fill(0);const delay=1000-(performance.now()-started);if(delay>0&&!this.controller.signal.aborted)await new Promise(resolve=>setTimeout(resolve,delay));}
    if(total+clean.length>MAX_REPORT_BYTES){clean.fill(0);break;}
    files.push(clean);total+=clean.length;run={...run,index:index+1,successes:run.successes+1};this.progress={...run};
    if(files.length===50)break;
    // The finally block rate-limits successes and failures alike. Neighbours are never followed.
   }
   if(run.index===expected.targets.length)run.completedAt=this.clock();
   if(files.length)return await this.engine.prepareNetwork(files,run,scheduled);
   await this.save(run);return await this.engine.state();
  }finally{signal?.removeEventListener('abort',cancel);for(const bytes of files)bytes.fill(0);this.running=false;this.controller=null;this.progress=null;}
 }
 async save(run){await this.engine.store.exclusive(async()=>{const r=await this.engine.record();r.networkRun=run;await this.engine.store.write(r);});}
}
