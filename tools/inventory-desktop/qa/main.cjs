const{http,dialogs,verifyAsarRunner}=require('./fixture.cjs');
const fs=require('node:fs'),path=require('node:path');
require('../build/runtime.cjs').startApplication({dataDirectory:process.env.CS_DESKTOP_QA_DATA,http,dialogs}).then(async()=>{
 const data=process.env.CS_DESKTOP_QA_DATA,proof=path.join(data,'asar-proof.json');if(fs.existsSync(proof))return;
 const directory=path.join(data,'asar-source'),archive=path.join(data,'runner.asar');fs.mkdirSync(directory,{recursive:true});fs.copyFileSync(path.join(__dirname,'../src/glpi-runner.pl'),path.join(directory,'glpi-runner.pl'));
 const{createPackage}=await import('@electron/asar');await createPackage(directory,archive);
 const passed=await verifyAsarRunner(path.join(data,'asar-engine'),path.join(archive,'glpi-runner.pl'));fs.writeFileSync(proof,JSON.stringify({passed,hardwareInventoryPerformed:false}));
}).catch(()=>{require('electron').app.quit();});
