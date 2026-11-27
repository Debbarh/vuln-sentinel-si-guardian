import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {createHash} from 'node:crypto';
import {LocalSnmp} from '../src/snmp-local.mjs';import {DesktopEngine} from '../src/engine.mjs';
import {parse,stringify} from 'lossless-json';
import {handleCollector} from './server-handler.ts';
async function main(){
if(process.env.GITHUB_ACTIONS!=='true')throw Error('Disposable CI only');
const target=Object.values(os.networkInterfaces()).flat().find(i=>i?.family==='IPv4'&&!i.internal&&(/^(10\.|192\.168\.)/.test(i.address)||/^172\.(1[6-9]|2\d|3[01])\./.test(i.address)))?.address;
assert.ok(target,'Runner needs a private address belonging to itself');
const desktop=path.resolve('tools/inventory-desktop'),dir=fs.mkdtempSync(path.join(desktop,'.snmp-fixture-'));
const script=path.join(desktop,'qa/snmp-agent.py'),deps=path.join(desktop,'qa/snmp-fixture-deps'),python=process.env.CS_FIXTURE_PYTHON||'python';
const agent=spawn(process.platform==='win32'?python:'sudo',process.platform==='win32'?[script,target,deps]:['-n','--preserve-env=GITHUB_ACTIONS',python,script,target,deps],{stdio:['ignore','pipe','pipe'],windowsHide:true,env:process.env});let ready='';let diagnostics='';agent.stderr.on('data',b=>{diagnostics+=b.toString();});
try{
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Fixture startup timeout '+diagnostics.slice(-1000))),30000);agent.on('error',reject);agent.on('exit',code=>{clearTimeout(timer);reject(Error('Fixture agent exit '+code+' '+diagnostics.slice(-1000)));});agent.stdout.on('data',b=>{ready+=b.toString();if(ready.includes('READY')){clearTimeout(timer);resolve();}});});
 fs.renameSync(path.join(desktop,'network-runtime'),path.join(dir,'relocated-runtime'));
 const worker=new LocalSnmp(path.join(dir,'relocated-runtime'),path.join(desktop,'network-runtime-manifest.json'),path.join(desktop,'network/client'),dir),verified=await worker.verify();
 const config={enabled:true,site:'CI fixture',ranges:[target+'/32'],exclusions:[],interval_minutes:60,timezone:'UTC',start_minute:0,end_minute:1440,credential_ref:'fixture'};
 const profile={username:'cs-fixture-ro',authProtocol:'SHA256',privacyProtocol:'AES',authPassword:'fixture-auth-only',privacyPassword:'fixture-priv-only'};
 const bytes=await worker.collect(verified,target,config,profile);let report;try{report=parse(bytes.toString());if(!bytes.toString().includes('18446744073709551615'))console.log(JSON.stringify({syntheticCounterStatus:report.fields?.i_octet_in64,syntheticCounter:String(report.values?.i_octet_in64?.['1']),syntheticInterface:report.values?.i_name}));assert.ok(bytes.toString().includes('18446744073709551615'));}finally{bytes.fill(0);}
 assert.equal(report.values.name,'cs-fixture-switch');assert.equal(report.target,target);assert.ok(report.values.description.includes('CI fixture'));assert.ok(report.values.snmpEngineID);assert.ok(!JSON.stringify(report).includes('fixture-auth-only'));
 await assert.rejects(worker.collect(verified,'8.8.8.8',config,profile));
 await assert.rejects(worker.collect(verified,target,config,{...profile,authPassword:'wrong-fixture-password'}));
 let record=null,key='',fingerprint='',sequence='0',received=0;const id='11111111-1111-4111-8111-111111111111',hash=b=>createHash('sha256').update(b).digest('hex');
 const rpc=async(url,init)=>{const p=JSON.parse(await new Response(init.body).text());if(url.endsWith('watch_collector_enroll')){key=p.public_key;fingerprint=hash(Buffer.from(key,'hex'));return Response.json({id,status:'active',fingerprint});}if(url.endsWith('watch_collector_key'))return Response.json({id,public_key:key,fingerprint,status:'active',sequence});if(url.endsWith('watch_collector_begin'))return Response.json({ack:false,lease:'33333333-3333-4333-8333-333333333333'});if(url.endsWith('watch_collector_receive_network')){assert.ok(p.payload_text.includes('cs-fixture-switch'));assert.ok(!p.payload_text.includes('fixture-auth-only'));received++;sequence='1';return Response.json({ack:true,id:p.batch,sequence,hash:hash(p.payload_text),status:'queued'});}throw Error('Unexpected fixture RPC');};
 const http=(url,init)=>handleCollector(new Request(url,init),{url:'http://fixture.invalid',serviceKey:'FIXTURE-NOT-REAL',collectorOrigin:'https://cyber-skill.com'},rpc);
 const store={read:async()=>structuredClone(record),write:async r=>{record=structuredClone(r);},exclusive:async fn=>fn(),available:async()=>true};const engine=new DesktopEngine(store,{http});
 await engine.initialise();await engine.enroll('22222222-2222-4222-8222-222222222222','cse_'+'a'.repeat(64));await engine.prepareNetwork([Buffer.from(stringify({...report,policy_revision:1}))]);await assert.rejects(engine.deliver('push',true),/review_required/);await engine.preview();await engine.deliver('push',true);assert.equal(received,1);
 const sourceFiles=['src/snmp-local.mjs','src/network-discovery.mjs','network/client/snmp-info.pl','network/client/CyberSkill/SnmpInfo.pm','shared/client.mjs'];const sourceHashes=Object.fromEntries(sourceFiles.map(p=>[p,hash(fs.readFileSync(path.join(desktop,p)))]));
 const proof={passed:true,platform:process.platform,arch:process.arch,snmpV3AuthPriv:true,sha256Aes:true,ownRunnerFixtureOnly:true,publicTargetRefused:true,wrongCredentialsRefused:true,manualReviewEnforced:true,signedNetworkTransmission:true,engineIdObserved:true,exactCounter64:true,runtimeManifestSha256:hash(fs.readFileSync(path.join(desktop,'network-runtime-manifest.json'))),sourceHashes,actualCustomerRequests:0};fs.mkdirSync('.codex/artifacts/cyber-skill/desktop-client',{recursive:true});fs.writeFileSync('.codex/artifacts/cyber-skill/desktop-client/snmp-qa.json',JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof));
}finally{if(fs.existsSync(path.join(dir,'relocated-runtime')))fs.renameSync(path.join(dir,'relocated-runtime'),path.join(desktop,'network-runtime'));if(agent.exitCode===null){if(process.platform==='win32')agent.kill();else{spawn('sudo',['-n','kill','-TERM',String(agent.pid)],{stdio:'ignore'});}}fs.rmSync(dir,{recursive:true,force:true,maxRetries:3,retryDelay:100});}

}
main().catch(error=>{console.error(error);process.exitCode=1;});
