import fs from'node:fs';import{createHash}from'node:crypto';import{handleCollector}from'./server-handler.ts';
const digest=x=>createHash('sha256').update(x).digest('hex');const id='11111111-1111-4111-8111-111111111111',lease='33333333-3333-4333-8333-333333333333';let publicKey='',fingerprint='',sequence='0';const accepted=new Map(),proof={requests:0,received:0,exactCounter:false,secretExcluded:false};
async function rpc(url,init){const p=JSON.parse(await new Response(init.body).text());let result;
 if(url.endsWith('watch_collector_enroll')){publicKey=p.public_key;fingerprint=digest(Buffer.from(publicKey,'hex'));result={id,fingerprint,status:'pending'};}
 else if(url.endsWith('watch_collector_key'))result={id,public_key:publicKey,fingerprint,status:'active',sequence};
 else if(url.endsWith('watch_collector_begin'))result=accepted.get(p.batch)??{ack:false,lease};
 else if(url.endsWith('watch_collector_receive')){proof.received++;proof.exactCounter=p.payload_text.includes('18446744073709551615');proof.secretExcluded=!/QA-PASSWORD|QA-LICENSE/.test(p.payload_text);sequence=String(Number(sequence)+1);result={ack:true,id:p.batch,sequence,hash:digest(p.payload_text),status:'queued'};accepted.set(p.batch,result);}
 else throw Error('unexpected fixture operation');return new Response(JSON.stringify(result));}
export const http=async(url,init)=>{proof.requests++;const r=await handleCollector(new Request(url,init),{url:'http://local-fixture.invalid',serviceKey:'NOT-A-REAL-KEY',collectorOrigin:'https://cyber-skill.com'},rpc);fs.writeFileSync(process.env.CS_DESKTOP_QA_PROOF,JSON.stringify(proof));return r;};
export const dialogs={showOpenDialog:async()=>({canceled:false,filePaths:[process.env.CS_DESKTOP_QA_REPORT]}),showMessageBox:async()=>({response:0})};
