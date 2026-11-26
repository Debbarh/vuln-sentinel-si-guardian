// Run hardware inventory ONLY on a disposable GitHub Actions runner.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {LocalGlpi, GLPI_VERSION} from '../src/glpi-local.mjs';
import {DesktopEngine} from '../src/engine.mjs';
import {http} from './fixture.mjs';
async function main(){
const versionOnly=process.argv.includes('--version-only');
if(!versionOnly&&(process.env.GITHUB_ACTIONS!=='true'||process.env.CS_GLPI_DISPOSABLE_RUNNER!=='true'))throw Error('Real inventory requires an explicitly designated disposable CI runner');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'cs-glpi-qualification-'));
const id='11111111-1111-4111-8111-111111111111';
const glpi=new LocalGlpi(directory,path.resolve('tools/inventory-desktop/src/glpi-runner.pl'));
try {
 const version=await glpi.collect(id,{mode:'version'});assert.equal(version.toString().trim(),process.platform==='linux'?'1.21-1':GLPI_VERSION);version.fill(0);
 if(!versionOnly){
  process.env.CS_DESKTOP_QA_PROOF=path.join(directory,'transport-proof.json');let value=null;
  const store={read:async()=>structuredClone(value),write:async r=>{value=structuredClone(r);},exclusive:async fn=>fn(),available:async()=>true};
  const engine=new DesktopEngine(store,{http});await engine.initialise();await engine.enroll('22222222-2222-4222-8222-222222222222','cse_'+'a'.repeat(64));
  const generated=await engine.generate((collectorId,options)=>glpi.collect(collectorId,options),{consent:true});assert.equal(generated.pending.count,1);
  assert.equal(JSON.parse(fs.readFileSync(process.env.CS_DESKTOP_QA_PROOF,'utf8')).received,0);
  await assert.rejects(engine.deliver('push',true),/review_required/);
  const preview=await engine.preview(),report=JSON.parse(preview.reports[0]);
  assert.equal(report.deviceid,'cyber-skill-'+id);assert.ok(report.content.versionclient.includes(GLPI_VERSION));
  assert.ok(report.content.hardware);assert.ok(report.content.operatingsystem);assert.ok(Array.isArray(report.content.softwares)&&report.content.softwares.length>0);
  await engine.deliver('push',true);assert.equal(JSON.parse(fs.readFileSync(process.env.CS_DESKTOP_QA_PROOF,'utf8')).received,1);assert.equal((await engine.state()).pending,null);
  // No host names, serial numbers, users or software details in qualification output.
  const sources=['src/glpi-local.mjs','src/glpi-runner.pl','src/engine.mjs','shared/client.mjs'];
  const sourceHashes=Object.fromEntries(sources.map(file=>[file,createHash('sha256').update(fs.readFileSync(path.join('tools/inventory-desktop',file))).digest('hex')]));
  const proof={passed:true,platform:process.platform,arch:process.arch,glpi:GLPI_VERSION,sourceHashes,standalone:true,stableDeviceId:true,softwareDetected:true,generatedReportValidated:true,reviewRequired:true,signedFixtureTransmission:true,actualCustomerRequests:0,networkScans:0};
  fs.mkdirSync('.codex/artifacts/cyber-skill/desktop-client',{recursive:true});fs.writeFileSync('.codex/artifacts/cyber-skill/desktop-client/glpi-qa.json',JSON.stringify(proof,null,2)+'\n');console.log(JSON.stringify(proof));
 }else console.log(JSON.stringify({versionVerified:GLPI_VERSION,hardwareInventoryPerformed:false}));
 assert.deepEqual(fs.readdirSync(path.join(directory,'work')),[]);
}finally{fs.rmSync(directory,{recursive:true,force:true,maxRetries:3,retryDelay:200});}

}
main().catch(error=>{console.error(error);process.exitCode=1;});
