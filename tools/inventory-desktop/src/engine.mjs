import{fetchNetworkMandate}from'./mandate.mjs';
import{createIdentity,identityParts,enrollIdentity,getIdentityStatus,preparePayload,checkPending,deliverPending,fail}from'../shared/client.mjs';
export const ORIGIN='https://cyber-skill.com';
const initial=()=>({version:1,identity:null,pending:null,profiles:[],status:null,verifiedAt:null});
const profileSummary=p=>({name:p.name,username:p.username,authProtocol:p.authProtocol,privacyProtocol:p.privacyProtocol});
export class DesktopEngine{
 constructor(store,{http=fetch,clock=Date.now,monotonic=()=>performance.now()}={}){this.store=store;this.http=http;this.clock=clock;this.monotonic=monotonic;this.reviewedId=null;this.networkMandate=null;}
 async record(){const r=await this.store.read()??initial();if(r.version!==1||!Array.isArray(r.profiles)||r.profiles.length>20)fail('invalid_state');if(r.identity){identityParts(r.identity);if(r.identity.state.origin!==ORIGIN)fail('invalid_origin');if(r.pending)checkPending(r.identity.state,r.pending);}else if(r.pending)fail('invalid_state');return r;}
 summary(r){const s=r.identity?.state;return{initialised:!!s,enrolled:!!s?.collectorId,collectorId:s?.collectorId??null,fingerprint:s?.fingerprint??null,origin:ORIGIN,status:r.status??(s?.collectorId?'pending':'local'),verifiedAt:r.verifiedAt,sequence:s?.sequence??'0',pending:r.pending?{id:r.pending.id,count:r.pending.count,masked:r.pending.masked,reviewed:this.reviewedId===r.pending.id}:null,networkMandate:this.networkMandate?.summary(this.clock(),this.monotonic(),r.profiles.map(p=>p.name))??null,profiles:r.profiles.map(profileSummary)};}
 async state(){return this.store.exclusive(async()=>{if(!await this.store.available())return{available:false,origin:ORIGIN};return{available:true,...this.summary(await this.record())};});}
 async initialise(){return this.store.exclusive(async()=>{const r=await this.record();if(r.identity)fail('already_initialised');r.identity=createIdentity(ORIGIN);await this.store.write(r);return this.summary(r);});}
 async enroll(invitation,token){return this.store.exclusive(async()=>{const r=await this.record();if(!r.identity)fail('not_initialised');const result=await enrollIdentity(r.identity,invitation,token,this.http);r.identity.state.collectorId=result.id;r.status=result.status;await this.store.write(r);return this.summary(r);});}
 async refresh(){return this.store.exclusive(async()=>{this.networkMandate=null;const r=await this.record();const result=await getIdentityStatus(r.identity,this.http,this.clock);r.status=result.status;r.verifiedAt=new Date(this.clock()).toISOString();await this.store.write(r);return this.summary(r);});}
 async fetchMandate(){return this.store.exclusive(async()=>{this.networkMandate=null;const r=await this.record();this.networkMandate=await fetchNetworkMandate(r.identity,this.http,this.clock,this.monotonic);return this.summary(r);});}
 async prepare(files){return this.store.exclusive(async()=>{const r=await this.record();if(!r.identity)fail('not_initialised');if(r.pending)fail('pending_batch_exists');r.pending=preparePayload(r.identity.state,files);this.reviewedId=null;await this.store.write(r);return this.summary(r);});}
 async generate(collect,{signal,consent=false}={}){return this.store.exclusive(async()=>{
  if(consent!==true)fail('collection_consent');const r=await this.record();if(!r.identity?.state.collectorId)fail('not_enrolled');if(r.pending)fail('pending_batch_exists');
  const active=async()=>{if(signal?.aborted)fail('collection_cancelled');const result=await getIdentityStatus(r.identity,(url,init)=>this.http(url,{...init,signal:AbortSignal.any([init.signal,signal,AbortSignal.timeout(10000)].filter(Boolean))}),this.clock);if(result.status!=='active')fail('collector_not_active');};
  await active();const controller=new AbortController(),cancel=()=>controller.abort();signal?.addEventListener('abort',cancel,{once:true});
  let verificationError=null,validation=null;
  const timer=setInterval(async()=>{if(validation)return;validation=active().catch(error=>{verificationError=error;controller.abort();}).finally(()=>{validation=null;});},30000);
  let bytes;
  try{
   if(signal?.aborted)controller.abort();bytes=await collect(r.identity.state.collectorId,{signal:controller.signal});
   if(validation)await validation;if(verificationError)throw verificationError;await active();r.pending=preparePayload(r.identity.state,[bytes]);this.reviewedId=null;
   await this.store.write(r);return this.summary(r);
  }finally{clearInterval(timer);signal?.removeEventListener('abort',cancel);bytes?.fill(0);}
 });}
 async preview(){return this.store.exclusive(async()=>{const r=await this.record();if(!r.pending)fail('no_pending_batch');this.reviewedId=r.pending.id;return{batch:r.pending.id,reports:JSON.parse(r.pending.body).reports};});}
 async deliver(action,confirmed=false){return this.store.exclusive(async()=>{const r=await this.record();if(!r.pending)fail('no_pending_batch');if(action==='push'&&(!confirmed||this.reviewedId!==r.pending.id))fail('review_required');const result=await deliverPending(r.identity,r.pending,action,this.http,this.clock);r.identity.state.sequence=r.pending.sequence;r.pending=null;this.reviewedId=null;await this.store.write(r);return{...this.summary(r),receipt:result.status};});}
 async saveProfile(p){return this.store.exclusive(async()=>{if(!p||Object.keys(p).sort().join(',')!=='authPassword,authProtocol,name,privacyPassword,privacyProtocol,username'||typeof p.name!=='string'||!/^[a-zA-Z][a-zA-Z0-9_.-]{0,63}$/.test(p.name)||typeof p.username!=='string'||Buffer.byteLength(p.username)<1||Buffer.byteLength(p.username)>32||[...p.username].some(c=>c.charCodeAt(0)<=32||c.charCodeAt(0)===127)||!['SHA256','SHA384','SHA512'].includes(p.authProtocol)||!['AES','AES256'].includes(p.privacyProtocol)||[p.authPassword,p.privacyPassword].some(v=>typeof v!=='string'||v.length<8||v.length>255||[...v].some(c=>c.charCodeAt(0)<32||c.charCodeAt(0)===127)))fail('credentials_invalid');
  const r=await this.record();if(!r.identity)fail('not_initialised');const index=r.profiles.findIndex(x=>x.name===p.name);if(index>=0)r.profiles[index]={...p};else{if(r.profiles.length>=20)fail('profile_limit');r.profiles.push({...p});}await this.store.write(r);return this.summary(r);});}
 async removeProfile(name){return this.store.exclusive(async()=>{if(typeof name!=='string'||!/^[a-zA-Z][a-zA-Z0-9_.-]{0,63}$/.test(name))fail('credentials_invalid');const r=await this.record();r.profiles=r.profiles.filter(p=>p.name!==name);await this.store.write(r);return this.summary(r);});}
}
