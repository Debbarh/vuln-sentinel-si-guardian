import{enrollmentMessage,requestMessage,verify,sha256,UUID,HEX,SIGNATURE,MAX_WIRE_BYTES}from'../shared/protocol.ts';
import type{ApiEnv}from'../shared/api-env.ts';
type Http=(input:string,init?:RequestInit)=>Promise<Response>;
class CollectorError extends Error{constructor(readonly code:string,readonly status:number){super(code);}}
const RESPONSE_LIMIT=16384;
async function limitedJson(response:Response,limit=RESPONSE_LIMIT,capture?:(text:string)=>void):Promise<unknown>{
 const reader=response.body?.getReader();if(!reader)throw new CollectorError('unavailable',503);
 let text='',bytes=0;const decoder=new TextDecoder('utf-8',{fatal:true});
 try{while(true){const{value,done}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>limit)throw new CollectorError('invalid',413);text+=decoder.decode(value,{stream:true});}const raw=text+decoder.decode();capture?.(raw);return JSON.parse(raw);}
 catch(e){if(e instanceof CollectorError)throw e;throw new CollectorError('invalid',400);}
 finally{await reader.cancel().catch(()=>{});}
}
async function result(response:Response):Promise<unknown>{
 const data=await limitedJson(response)as{message?:unknown};if(response.ok)return data;
 const message=typeof data?.message==='string'?data.message:'';
 if(message==='org.storage_limit_reached')throw new CollectorError('storage',409);
 const code=message.replace(/^collector\./,'');
 const statuses:Record<string,number>={forbidden:401,invalid:400,integrity:422,size:413,replay:409,busy:409,quota:429,conflict:409};
 if(Object.hasOwn(statuses,code))throw new CollectorError(code,statuses[code]!);
 throw new CollectorError('unavailable',503);
}
const headersOf=(env:ApiEnv)=>({'Content-Type':'application/json',apikey:env.serviceKey,Authorization:`Bearer ${env.serviceKey}`});
const call=async<T>(env:ApiEnv,http:Http,name:string,args:unknown):Promise<T>=>await result(await http(`${env.url}/rest/v1/rpc/${name}`,{method:'POST',headers:headersOf(env),body:JSON.stringify(args),signal:AbortSignal.timeout(10000)}))as T;
/** Stream/escape the original UTF-8 JSON into one text RPC argument. PostgreSQL checks its signed hash before parsing it.
 * No reports are parsed or accumulated in the 150 MiB Edge worker; unfinished/oversized streams never form a valid RPC. */
export function escapedPayload(request:Request,params:Record<string,unknown>):ReadableStream<Uint8Array>{
 const encoder=new TextEncoder(),decoder=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}),reader=request.body?.getReader();let bytes=0,started=false,pending:Uint8Array|undefined,offset=0;
 const prefix=JSON.stringify({...params,payload_text:''}).slice(0,-2);
 return new ReadableStream({async pull(controller){try{
  if(!started){started=true;controller.enqueue(encoder.encode(prefix));return;}
  if(!reader)throw new CollectorError('invalid',400);
  if(!pending||offset>=pending.length){
   const{done,value}=await reader.read();
   if(done){const tail=decoder.decode();controller.enqueue(encoder.encode(JSON.stringify(tail).slice(1,-1)+'"}'));controller.close();return;}
   bytes+=value.byteLength;if(bytes>MAX_WIRE_BYTES)throw new CollectorError('size',413);pending=value;offset=0;
  }
  const part=pending.subarray(offset,offset+65536);offset+=part.length;
  controller.enqueue(encoder.encode(JSON.stringify(decoder.decode(part,{stream:true})).slice(1,-1)));
 }catch(e){await reader?.cancel().catch(()=>{});controller.error(e);}},async cancel(){await reader?.cancel().catch(()=>{});}});
}
export async function handleCollector(request:Request,env:ApiEnv,http:Http=fetch,now:()=>number=Date.now):Promise<Response>{
 const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Allow':'POST'};
 const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...headers,...(status===429?{'Retry-After':'3600'}:status===409?{'Retry-After':'5'}:{})}});
 let lease:string|undefined,id:string|undefined,batch:string|undefined;
 try{
  const url=new URL(request.url),action=/^\/collector\/v1\/(enroll|push|status|discard|policy)$/.exec(url.pathname.replace(/^.*\/veille-api/,''))?.[1];
  if(!['enroll','push','status','discard','policy'].includes(action??''))return reply({error:'not_found'},404);
  if(request.method!=='POST')return reply({error:'method_not_allowed'},405);
  if(request.headers.has('origin')||url.search||!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get('content-type')??'')||!['identity',''].includes(request.headers.get('content-encoding')??''))throw new CollectorError('invalid',400);
  const origin=env.collectorOrigin;if(!origin||!env.url||!env.serviceKey||!/^https:\/\//.test(origin)||new URL(origin).origin!==origin)throw new CollectorError('unavailable',503);
  if(action==='enroll'){
   if(Number(request.headers.get('content-length')??0)>4096)throw new CollectorError('size',413);
   const data=await limitedJson(new Response(request.body),4096)as Record<string,unknown>;
   if(!data||Array.isArray(data)||typeof data.invitation!=='string'||!UUID.test(data.invitation)||typeof data.token!=='string'||!/^cse_[a-f0-9]{64}$/.test(data.token)||typeof data.publicKey!=='string'||!HEX.test(data.publicKey)||typeof data.signature!=='string')throw new CollectorError('forbidden',401);
   const tokenHash=await sha256(data.token);
   if(!await verify(data.publicKey,enrollmentMessage(origin,data.invitation,data.publicKey,tokenHash),data.signature))throw new CollectorError('forbidden',401);
   return reply(await call(env,http,'watch_collector_enroll',{invitation:data.invitation,token_hash:tokenHash,public_key:data.publicKey}));
  }
  id=request.headers.get('x-cs-collector')??'';batch=request.headers.get('x-cs-batch')??'';
  const sequence=request.headers.get('x-cs-sequence')??'',time=request.headers.get('x-cs-time')??'',hash=request.headers.get('x-cs-hash')??'',signature=request.headers.get('x-cs-signature')??'';
  if(!UUID.test(id)||!UUID.test(batch)||!/^\d{1,16}$/.test(sequence)||String(Number(sequence))!==sequence||!Number.isSafeInteger(Number(sequence))||Number(sequence)<1||!HEX.test(hash)||!SIGNATURE.test(signature)
   ||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(time)||!Number.isFinite(Date.parse(time))||new Date(time).toISOString()!==time||Math.abs(now()-Date.parse(time))>300000)throw new CollectorError('forbidden',401);
  const key=await call<{public_key:string;fingerprint:string;status:string;id:string;sequence:string;expires_at:string}>(env,http,'watch_collector_key',{collector:id});
  if(!key||key.id!==id||!await verify(key.public_key,requestMessage(origin,action!,id,batch,sequence,time,hash),signature))throw new CollectorError('forbidden',401);
  if(action==='status'||action==='policy'){
   let raw='';const content=await limitedJson(new Response(request.body),512,value=>{raw=value;});if(JSON.stringify(content)!=='{}'||hash!==await sha256(raw))throw new CollectorError('integrity',422);
   if(action==='policy'){
    if(key.status!=='active')throw new CollectorError('forbidden',401);
    return reply(await call(env,http,'watch_collector_network_mandate',{collector:id,key_fingerprint:key.fingerprint,request_id:batch}));
   }
   return reply({id:key.id,fingerprint:key.fingerprint,status:key.status,sequence:key.sequence,expires_at:key.expires_at});
  }
  if(key.status!=='active')throw new CollectorError('forbidden',401);
  let expectedHash=hash;
  if(action==='discard'){let raw='';const data=await limitedJson(new Response(request.body),512,value=>{raw=value;})as{hash?:unknown};if(!data||Object.keys(data).length!==1||typeof data.hash!=='string'||!HEX.test(data.hash)||hash!==await sha256(raw))throw new CollectorError('integrity',422);expectedHash=data.hash;}
  if(Number(request.headers.get('content-length')??0)>MAX_WIRE_BYTES)throw new CollectorError('size',413);
  const admission=await call<{ack:boolean;lease?:string}>(env,http,'watch_collector_begin',{collector:id,batch,sequence:Number(sequence),body_hash:expectedHash,key_fingerprint:key.fingerprint});
  if(admission.ack)return reply(admission);
  if(!admission.lease||!UUID.test(admission.lease))throw new CollectorError('unavailable',503);lease=admission.lease;
  if(action==='discard'){const discarded=await call(env,http,'watch_collector_discard',{collector:id,batch,lease,key_fingerprint:key.fingerprint});lease=undefined;return reply(discarded);}
  const init:RequestInit&{duplex:string}={method:'POST',headers:headersOf(env),body:escapedPayload(request,{collector:id,batch,lease,key_fingerprint:key.fingerprint}),duplex:'half',signal:AbortSignal.timeout(100000)};
  const received=await result(await http(`${env.url}/rest/v1/rpc/watch_collector_receive`,init));lease=undefined;return reply(received);
 }catch(error){
  if(lease)await call(env,http,'watch_collector_abort',{collector:id,batch,lease}).catch(()=>{});
  if(error instanceof CollectorError)return reply({error:error.code},error.status);
  return reply({error:'unavailable'},503);
 }finally{if(!request.bodyUsed)await request.body?.cancel().catch(()=>{});}
}
