import{app,BrowserWindow,ipcMain,protocol,session,dialog,safeStorage,shell,clipboard,Menu,Tray,nativeImage}from'electron';
import fs from'node:fs';import path from'node:path';
import{EncryptedStore,readLimited}from'./store.mjs';import{DesktopEngine,ORIGIN}from'./engine.mjs';import{UI_URL,CSP,assetPath,browserPreferences,validSender}from'./security.mjs';
import{MAX_REPORT_BYTES,LocalCollectorError,fail}from'../shared/client.mjs';
import{LocalGlpi}from'./glpi-local.mjs';
import{collectionLocales}from'../renderer/collection-locales.ts';
import{automationLocales}from'../renderer/automation-locales.ts';
import{CollectorScheduler,policyDigest}from'./automation.mjs';
import{LocalSnmp}from'./snmp-local.mjs';
import{NetworkDiscovery}from'./network-discovery.mjs';
import{discoveryLocales}from'../renderer/discovery-locales.ts';
import{associationLocales}from'../renderer/association-locales.ts';
import{exportRecoveredReports}from'./recovery-export.mjs';
import{configureLoginService}from'./login-service.mjs';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2'};
function osCrypto(){
 const legacyLinux=()=>process.platform==='linux';
 const protectedLinux=()=>safeStorage.isEncryptionAvailable()&&['gnome_libsecret','kwallet','kwallet5','kwallet6'].includes(safeStorage.getSelectedStorageBackend());
 return{
  available:async()=>legacyLinux()?protectedLinux():await safeStorage.isAsyncEncryptionAvailable(),
  encrypt:async text=>{if(legacyLinux()){if(!protectedLinux())fail('secure_storage_unavailable');return safeStorage.encryptString(text);}return await safeStorage.encryptStringAsync(text);},
  decrypt:async bytes=>{if(legacyLinux()){if(!protectedLinux())fail('secure_storage_unavailable');return safeStorage.decryptString(bytes);}return(await safeStorage.decryptStringAsync(bytes)).result;},
 };
}
const noArgs=args=>{if(args.length)fail('invalid_arguments');};
export async function startApplication({dataDirectory,crypto,http,dialogs=dialog}={}){
 app.setName('Cyber-Skill Collector');if(dataDirectory){if(app.isPackaged)throw Error('Test data directory is forbidden in packaged application');app.setPath('userData',dataDirectory);}
 if(app.isPackaged&&['remote-debugging-port','remote-debugging-pipe','inspect','inspect-brk','no-sandbox','disable-web-security','ignore-certificate-errors'].some(s=>app.commandLine.hasSwitch(s))){app.quit();return;}
 if(!app.requestSingleInstanceLock()){app.quit();return;}
 let window;app.on('second-instance',()=>{window?.show();window?.restore();window?.focus();});
 protocol.registerSchemesAsPrivileged([{scheme:'cyberskill',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
 await app.whenReady();app.setAppUserModelId('com.cyber-skill.inventory.collector');Menu.setApplicationMenu(null);
 const renderer=path.join(__dirname,'renderer');
 const store=new EncryptedStore(path.join(app.getPath('userData'),'private'),crypto??osCrypto()),engine=new DesktopEngine(store,{...(http?{http}:{})});
 const localGlpi=new LocalGlpi(path.join(app.getPath('userData'),'glpi'),path.join(__dirname,'glpi-runner.pl'));
 const snmp=new LocalSnmp(app.isPackaged?path.join(process.resourcesPath,'network-runtime'):path.resolve(__dirname,'../network-runtime'),path.join(__dirname,'network-runtime-manifest.json'),path.join(__dirname,'network'),path.join(app.getPath('userData'),'snmp'));
 const discovery=new NetworkDiscovery(engine,snmp);
 const scheduler=new CollectorScheduler(engine,(id,options)=>localGlpi.collect(id,options),{network:discovery});let tray=null,lastSnapshot=null,snapshotPromise=null;
 const snapshot=async()=>{if((!scheduler.running&&!discovery.running&&!collectionController)||!lastSnapshot){if(!snapshotPromise)snapshotPromise=engine.state().then(value=>{lastSnapshot=value;}).finally(()=>{snapshotPromise=null;});await snapshotPromise;}return{...lastSnapshot,capabilities:{network:snmp.available()},networkProgress:discovery.progress,networkRunning:discovery.running,automation:lastSnapshot?.automation?{...lastSnapshot.automation,running:scheduler.running}:null};};
 const isolated=session.fromPartition('cyber-skill-collector');isolated.setPermissionRequestHandler((_webContents,_permission,callback)=>callback(false));isolated.setPermissionCheckHandler(()=>false);isolated.on('will-download',event=>event.preventDefault());
 isolated.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*','ws://*/*','wss://*/*']},(_details,callback)=>callback({cancel:true}));
 isolated.protocol.handle('cyberskill',request=>{
  const file=request.method==='GET'?assetPath(request.url):null;if(!file)return new Response('Not found',{status:404});
  try{return new Response(fs.readFileSync(path.join(renderer,file)),{headers:{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Content-Security-Policy':CSP,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'}});}catch{return new Response('Not found',{status:404});}
 });
 window=new BrowserWindow({width:1100,height:840,minWidth:480,minHeight:620,title:'Cyber-Skill Collector',show:false,autoHideMenuBar:true,webPreferences:browserPreferences(path.join(__dirname,'preload.cjs'))});
 window.webContents.setWindowOpenHandler(()=>({action:'deny'}));window.webContents.on('will-navigate',event=>event.preventDefault());window.webContents.on('will-frame-navigate',event=>event.preventDefault());window.webContents.on('will-attach-webview',event=>event.preventDefault());
 let invoking=false,collectionController=null,quitting=false;
 app.on('before-quit',event=>{quitting=true;if(collectionController||scheduler.running||discovery.running){event.preventDefault();collectionController?.abort();scheduler.stop();discovery.stop();}});
 window.on('close',event=>{if(!quitting&&(lastSnapshot?.automation?.enabled||scheduler.running)){event.preventDefault();if(tray)window.hide();}});
 app.on('activate',()=>window?.show());
 try{tray=new Tray(nativeImage.createFromPath(path.join(__dirname,'tray.png')).resize({width:16,height:16}));tray.setToolTip('Cyber-Skill Collector');tray.setContextMenu(Menu.buildFromTemplate([{label:'Cyber-Skill Collector',click:()=>window.show()},{label:automationLocales.fr.pause,click:()=>void scheduler.pause().then(()=>{configureLoginService(app,false);return snapshot();}).catch(()=>{})},{type:'separator'},{label:automationLocales.fr.quit,click:()=>app.quit()}]));tray.on('click',()=>window.show());}catch{tray=null;}
 const actions={
  state:async(...args)=>{noArgs(args);return snapshot();},initialise:async(...args)=>{noArgs(args);return engine.initialise();},
  enroll:async(...args)=>{if(args.length!==2||typeof args[0]!=='string'||typeof args[1]!=='string'||args[0].length>36||args[1].length>68)fail('invalid_arguments');return engine.enroll(args[0],args[1]);},
  refresh:async(...args)=>{noArgs(args);return engine.refresh();},
  reassociate:async(...args)=>{if(args.length!==1||!Object.hasOwn(associationLocales,args[0]))fail('invalid_arguments');const text=associationLocales[args[0]],before=await engine.state();
   const result=await dialogs.showMessageBox(window,{type:'warning',message:text.confirm,detail:text.detail,buttons:[text.cancel,text.accept],defaultId:0,cancelId:0,noLink:true});if(result.response!==1)return null;
   await scheduler.pause();if(app.isPackaged)configureLoginService(app,false);await engine.reassociate(true,before.fingerprint);return snapshot();
  },
  exportRecovery:async(...args)=>{if(args.length!==1||!Object.hasOwn(associationLocales,args[0]))fail('invalid_arguments');const text=associationLocales[args[0]],reports=await engine.recoveredReports();const result=await dialogs.showOpenDialog(window,{title:text.exportTitle,properties:['openDirectory','createDirectory']});if(result.canceled)return null;if(result.filePaths.length!==1)fail('invalid_arguments');exportRecoveredReports(result.filePaths[0],reports);return snapshot();},
  clearRecovery:async(...args)=>{if(args.length!==1||!Object.hasOwn(associationLocales,args[0]))fail('invalid_arguments');const text=associationLocales[args[0]],before=await engine.state();const result=await dialogs.showMessageBox(window,{type:'warning',message:text.removeTitle,detail:text.removeDetail,buttons:[text.cancel,text.removeAccept],defaultId:0,cancelId:0,noLink:true});if(result.response!==1)return null;return engine.clearRecovery(true,before.recovery?.id);},
  fetchMandate:async(...args)=>{noArgs(args);return engine.fetchMandate();},
  generateReport:async(...args)=>{
   if(args.length!==1||!Object.hasOwn(collectionLocales,args[0]))fail('invalid_arguments');
   if(!localGlpi.supported())fail('glpi_platform');const text=collectionLocales[args[0]];
   const confirmation=await dialogs.showMessageBox(window,{type:'question',message:text.generate,detail:text.detail,buttons:[text.back,text.confirm],defaultId:0,cancelId:0,noLink:true});
   if(confirmation.response!==1)return null;
   collectionController=new AbortController();try{return await engine.generate((id,options)=>localGlpi.collect(id,options),{signal:collectionController.signal,consent:true});}finally{collectionController=null;if(quitting)app.quit();}
  },
  cancelGeneration:async(...args)=>{noArgs(args);collectionController?.abort();return null;},
  discoverNetwork:async(...args)=>{if(args.length!==1||!Object.hasOwn(discoveryLocales,args[0]))fail('invalid_arguments');if(!snmp.available())fail('dependency_unavailable');const text=discoveryLocales[args[0]],m=await discovery.authority(),r=await engine.record();if(m.summary(engine.clock(),engine.monotonic(),r.profiles.map(p=>p.name)).status!=='ready')fail('mandate_required');const result=await dialogs.showMessageBox(window,{type:'warning',message:text.confirm,detail:text.detail+'\n\n'+m.value.config.ranges.join(', ')+'\n'+text.exclusions+': '+m.value.config.exclusions.join(', ')+'\n'+text.targets+': '+m.targets.length,buttons:[text.cancel,text.accept],defaultId:0,cancelId:0,noLink:true});if(result.response!==1)return null;try{await discovery.step(m,{consent:true});return snapshot();}finally{if(quitting)app.quit();}},
  cancelDiscovery:async(...args)=>{noArgs(args);discovery.stop();return null;},
  enableAutomation:async(...args)=>{if(args.length!==1||!Object.hasOwn(automationLocales,args[0]))fail('invalid_arguments');
   const c=automationLocales[args[0]],m=await scheduler.authority();if(!m.config?.enabled||(!m.config.glpi&&!m.config.network))fail('automation_unavailable');if(m.config.network){if(!snmp.available())fail('dependency_unavailable');const n=await discovery.authority(),r=await engine.record();if(n.summary(engine.clock(),engine.monotonic(),r.profiles.map(p=>p.name)).status!=='ready')fail('mandate_required');m.networkConsent={revision:n.value.revision,hash:policyDigest(n.value.config)};m.networkConfig=n.value.config;}
   const config=m.config,detail=c.detail+'\nGLPI: '+(config.glpi?c.yes:c.no)+' · SNMP: '+(config.network?c.yes:c.no)+(m.networkConfig?'\n'+JSON.stringify(m.networkConfig):'')+'\n\n'+c.revision+': '+m.revision+'\n'+c.interval+': '+config.interval_minutes+'\n'+config.timezone+' · '+c.window+': '+config.start_minute+'–'+config.end_minute+'\n'+c.transmit+': '+(config.transmit?c.yes:c.no);
   const result=await dialogs.showMessageBox(window,{type:'warning',message:c.confirm,detail,buttons:[c.cancel,c.accept],defaultId:0,cancelId:0,noLink:true});if(result.response!==1)return null;
   const wasEnabled=lastSnapshot?.automation?.enabled;configureLoginService(app,true);try{await scheduler.enable(true,m);}catch(error){if(!wasEnabled)configureLoginService(app,false);throw error;}return snapshot();
  },
  pauseAutomation:async(...args)=>{noArgs(args);await scheduler.pause();configureLoginService(app,false);return snapshot();},
  chooseReports:async(...args)=>{noArgs(args);const result=await dialogs.showOpenDialog(window,{properties:['openFile','multiSelections'],filters:[{name:'GLPI Agent JSON',extensions:['json']}]});if(result.canceled)return null;if(result.filePaths.length<1||result.filePaths.length>50)fail('file_count');
   function*files(){let total=0;for(const filename of result.filePaths){const before=fs.lstatSync(filename);if(!before.isFile()||before.isSymbolicLink())fail('invalid_report');total+=before.size;if(total>MAX_REPORT_BYTES)fail('file_size');const fd=fs.openSync(filename,fs.constants.O_RDONLY|(fs.constants.O_NOFOLLOW??0));try{const opened=fs.fstatSync(fd);if(opened.ino!==before.ino||opened.dev!==before.dev||opened.size!==before.size||!opened.isFile())fail('invalid_report');const bytes=readLimited(fd,MAX_REPORT_BYTES);if(bytes.length!==opened.size)fail('invalid_report');yield bytes;}finally{fs.closeSync(fd);}}}
   return engine.prepare(files());},
  preview:async(...args)=>{noArgs(args);return engine.preview();},
  sendReports:async(...args)=>{if(args.length!==1||args[0]!==true)fail('review_required');return engine.deliver('push',true);},
  discardReports:async(...args)=>{if(args.length!==1||!['fr','en','ar','ary'].includes(args[0]))fail('invalid_arguments');const text={fr:['Abandonner le lot local ? Les rapports déjà reçus dans la console seront conservés.','Annuler','Abandonner'],en:['Discard the local batch? Reports already received in the console will be retained.','Cancel','Discard'],ar:['التخلي عن الدفعة المحلية؟ التقارير التي وصلت إلى لوحة التحكم ستبقى محفوظة.','إلغاء','تأكيد'],ary:['نسدو الدفعة المحلية؟ التقارير اللي وصلات للوحة التحكم غادي تبقى محفوظة.','إلغاء','تأكيد']}[args[0]];const result=await dialogs.showMessageBox(window,{type:'warning',message:'Cyber-Skill Collector',detail:text[0],buttons:text.slice(1),defaultId:0,cancelId:0,noLink:true});if(result.response!==1)return null;return engine.deliver('discard');},
  saveProfile:async(...args)=>{if(args.length!==1)fail('invalid_arguments');return engine.saveProfile(args[0]);},
  removeProfile:async(...args)=>{if(args.length!==1)fail('invalid_arguments');return engine.removeProfile(args[0]);},
  copyFingerprint:async(...args)=>{noArgs(args);const s=await engine.state();if(!s.fingerprint)fail('not_initialised');clipboard.writeText(s.fingerprint);return null;},
  openConsole:async(...args)=>{noArgs(args);await shell.openExternal(ORIGIN+'/organization?tab=collectors');return null;},
 };
 for(const[name,action]of Object.entries(actions))ipcMain.handle('collector:'+name,async(event,...args)=>{
  if(!validSender(event,window))return{ok:false,error:'forbidden'};
  if(['cancelGeneration','cancelDiscovery','pauseAutomation','state'].includes(name)){try{return{ok:true,value:await action(...args)};}catch(error){return{ok:false,error:error instanceof LocalCollectorError?error.code:'unavailable'};}}
  if(invoking||scheduler.running||discovery.running)return{ok:false,error:'collector_locked'};invoking=true;try{return{ok:true,value:await action(...args)};}catch(error){return{ok:false,error:error instanceof LocalCollectorError?error.code:'unavailable'};}finally{invoking=false;}
 });
 const heartbeat=setInterval(async()=>{if(invoking||scheduler.running||quitting)return;try{await scheduler.tick();lastSnapshot=await snapshot();}catch{}finally{if(quitting)app.quit();}},30000);
 app.on('will-quit',()=>{clearInterval(heartbeat);tray?.destroy();});
 app.on('window-all-closed',()=>{if(!lastSnapshot?.automation?.enabled)app.quit();});window.once('ready-to-show',async()=>{try{lastSnapshot=await snapshot();}catch{}if(!app.isPackaged||!process.argv.includes('--background')||!lastSnapshot?.automation?.enabled||!tray)window.show();});await window.loadURL(UI_URL);return{window,engine,store};
}
