// Shared signed transport. No filesystem, subprocess, platform credentials or automatic requests.
import{sign,createHash,generateKeyPairSync,createPrivateKey,createPublicKey,randomUUID}from'node:crypto';
import{enrollmentMessage,requestMessage,UUID,HEX,MAX_WIRE_BYTES}from'./protocol.ts';
import{readFullReport}from'./report-json.ts';
export const MAX_REPORT_BYTES=32*1024*1024;
export class LocalCollectorError extends Error{constructor(code){super(code);this.code=code;}}
export const fail=code=>{throw new LocalCollectorError(code);};
export const digest=value=>createHash('sha256').update(value).digest('hex');
export function validateOrigin(input){let u;try{u=new URL(input);}catch{fail('invalid_origin');}if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/'||u.origin!==input)fail('invalid_origin');return input;}
export function createIdentity(origin){validateOrigin(origin);const pair=generateKeyPairSync('ed25519'),privateKey=pair.privateKey.export({format:'pem',type:'pkcs8'}),publicKey=Buffer.from(pair.publicKey.export({format:'jwk'}).x,'base64url').toString('hex');return{privateKey,state:{version:1,origin,publicKey,fingerprint:digest(Buffer.from(publicKey,'hex')),collectorId:null,sequence:'0'}};}
export function identityParts(identity){
 const state=identity?.state;validateOrigin(state?.origin);
 if(state.version!==1||!HEX.test(state.publicKey)||!HEX.test(state.fingerprint)||!/^(0|[1-9]\d{0,15})$/.test(state.sequence)||!Number.isSafeInteger(Number(state.sequence))||(state.collectorId!==null&&!UUID.test(state.collectorId))||typeof identity.privateKey!=='string'||identity.privateKey.length>8192)fail('invalid_state');
 const key=createPrivateKey(identity.privateKey);if(key.asymmetricKeyType!=='ed25519')fail('invalid_identity');const publicKey=Buffer.from(createPublicKey(key).export({format:'jwk'}).x,'base64url').toString('hex');if(publicKey!==state.publicKey||digest(Buffer.from(publicKey,'hex'))!==state.fingerprint)fail('invalid_identity');return{state,key};
}
async function smallJson(response){if(!response.body)fail('invalid_acknowledgement');const reader=response.body.getReader(),decoder=new TextDecoder('utf-8',{fatal:true});let bytes=0,text='';try{while(true){const{done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>16384)fail('invalid_acknowledgement');text+=decoder.decode(value,{stream:true});}return JSON.parse(text+decoder.decode());}finally{await reader.cancel().catch(()=>{});}}
export async function send(state,action,body,headers,http=fetch){
 if(process.env.NODE_TLS_REJECT_UNAUTHORIZED==='0')fail('tls_verification_required');
 const response=await http(`${state.origin}/functions/v1/veille-api/collector/v1/${action}`,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json',...headers},body,signal:AbortSignal.timeout(120000)});
 const data=await smallJson(response);if(!response.ok){const known=['forbidden','replay','busy','quota','storage','size','integrity','invalid','unavailable'];fail(known.includes(data?.error)?data.error:'unavailable');}return data;
}
export function signedHeaders(state,key,action,batch,sequence,body,clock=Date.now){const time=new Date(clock()).toISOString(),hash=digest(body);return{'x-cs-collector':state.collectorId,'x-cs-batch':batch,'x-cs-sequence':sequence,'x-cs-time':time,'x-cs-hash':hash,'x-cs-signature':sign(null,Buffer.from(requestMessage(state.origin,action,state.collectorId,batch,sequence,time,hash)),key).toString('hex')};}
export async function enrollIdentity(identity,invitation,token,http=fetch){
 const{state,key}=identityParts(identity);if(!UUID.test(invitation)||!/^cse_[a-f0-9]{64}$/.test(token))fail('invalid_invitation');
 const body=JSON.stringify({invitation,token,publicKey:state.publicKey,signature:sign(null,Buffer.from(enrollmentMessage(state.origin,invitation,state.publicKey,digest(token))),key).toString('hex')});
 const data=await send(state,'enroll',body,{},http);if(!UUID.test(data?.id)||data.fingerprint!==state.fingerprint||!['pending','active','revoked','expired'].includes(data.status)||(state.collectorId&&state.collectorId!==data.id))fail('invalid_acknowledgement');return data;
}
export function preparePayload(state,files){
 if(!state.collectorId)fail('not_enrolled');let total=0,masked=0,count=0;const reports=[],seen=new Set();
 for(const bytes of files){count++;total+=bytes.length;if(count>50)fail('file_count');if(total>MAX_REPORT_BYTES)fail('file_size');let report;try{report=readFullReport(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{fail('invalid_report');}
  const root=report.payload,content=root?.content;if(!root||typeof root!=='object'||Array.isArray(root)||typeof root.deviceid!=='string'||!root.deviceid.trim()||root.deviceid.length>4096||root.deviceid.includes('[REDACTED]')||!content||typeof content!=='object'||Array.isArray(content)||typeof content.versionclient!=='string'||!content.versionclient.trim()||(root.itemtype!==undefined&&root.itemtype!=='Computer')||(root.action!==undefined&&!['inventory','injector'].includes(root.action)))fail('invalid_report');
  if(seen.has(root.deviceid))fail('duplicate_identity');seen.add(root.deviceid);masked+=report.exclusions.length;reports.push(report.json);
 }
 if(!count)fail('file_count');if(reports.reduce((n,s)=>n+Buffer.byteLength(s),0)>MAX_REPORT_BYTES)fail('file_size');const sequence=String(Number(state.sequence)+1);if(!Number.isSafeInteger(Number(sequence)))fail('invalid_state');const body=JSON.stringify({reports});if(Buffer.byteLength(body)>MAX_WIRE_BYTES)fail('file_size');return{version:1,id:randomUUID(),sequence,hash:digest(body),body,masked,count};
}
export function checkPending(state,pending){if(pending?.version!==1||!UUID.test(pending.id)||typeof pending.body!=='string'||Buffer.byteLength(pending.body)>MAX_WIRE_BYTES||digest(pending.body)!==pending.hash||![Number(state.sequence),Number(state.sequence)+1].includes(Number(pending.sequence))||!Number.isSafeInteger(Number(pending.sequence))||String(Number(pending.sequence))!==pending.sequence||Number(pending.sequence)<1)fail('invalid_pending_batch');}
export async function deliverPending(identity,pending,action,http=fetch,clock=Date.now){
 if(!['push','discard'].includes(action))fail('invalid_arguments');const{state,key}=identityParts(identity);if(!state.collectorId)fail('not_enrolled');checkPending(state,pending);
 const body=action==='discard'?JSON.stringify({hash:pending.hash}):pending.body,response=await send(state,action,body,signedHeaders(state,key,action,pending.id,pending.sequence,body,clock),http);
 if(response.ack!==true||response.id!==pending.id||response.sequence!==pending.sequence||response.hash!==pending.hash||!['queued','prepared','applied','rejected'].includes(response.status))fail('invalid_acknowledgement');return response;
}
export async function getIdentityStatus(identity,http=fetch,clock=Date.now){const{state,key}=identityParts(identity);if(!state.collectorId)fail('not_enrolled');const response=await send(state,'status','{}',signedHeaders(state,key,'status',randomUUID(),String(Number(state.sequence)+1),'{}',clock),http);if(response.id!==state.collectorId||response.fingerprint!==state.fingerprint||!['pending','active','revoked','expired'].includes(response.status))fail('invalid_acknowledgement');return response;}
