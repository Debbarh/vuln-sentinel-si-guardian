import{app,BrowserWindow,ipcMain,protocol,session,dialog,safeStorage,shell,clipboard,Menu}from'electron';
import fs from'node:fs';import path from'node:path';
import{EncryptedStore,readLimited}from'./store.mjs';import{DesktopEngine,ORIGIN}from'./engine.mjs';import{UI_URL,CSP,assetPath,browserPreferences,validSender}from'./security.mjs';
import{MAX_REPORT_BYTES,LocalCollectorError,fail}from'../shared/client.mjs';
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
 let window;app.on('second-instance',()=>{window?.restore();window?.focus();});
 protocol.registerSchemesAsPrivileged([{scheme:'cyberskill',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
 await app.whenReady();app.setAppUserModelId('com.cyber-skill.inventory.collector');Menu.setApplicationMenu(null);
 const renderer=path.join(__dirname,'renderer');
 const store=new EncryptedStore(path.join(app.getPath('userData'),'private'),crypto??osCrypto()),engine=new DesktopEngine(store,{...(http?{http}:{})});
 const isolated=session.fromPartition('cyber-skill-collector');isolated.setPermissionRequestHandler((_webContents,_permission,callback)=>callback(false));isolated.setPermissionCheckHandler(()=>false);isolated.on('will-download',event=>event.preventDefault());
 isolated.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*','ws://*/*','wss://*/*']},(_details,callback)=>callback({cancel:true}));
 isolated.protocol.handle('cyberskill',request=>{
  const file=request.method==='GET'?assetPath(request.url):null;if(!file)return new Response('Not found',{status:404});
  try{return new Response(fs.readFileSync(path.join(renderer,file)),{headers:{'Content-Type':mime[path.extname(file)]??'application/octet-stream','Content-Security-Policy':CSP,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'}});}catch{return new Response('Not found',{status:404});}
 });
 window=new BrowserWindow({width:1100,height:840,minWidth:480,minHeight:620,title:'Cyber-Skill Collector',show:false,autoHideMenuBar:true,webPreferences:browserPreferences(path.join(__dirname,'preload.cjs'))});
 window.webContents.setWindowOpenHandler(()=>({action:'deny'}));window.webContents.on('will-navigate',event=>event.preventDefault());window.webContents.on('will-frame-navigate',event=>event.preventDefault());window.webContents.on('will-attach-webview',event=>event.preventDefault());
 let invoking=false;
 const actions={
  state:async(...args)=>{noArgs(args);return engine.state();},initialise:async(...args)=>{noArgs(args);return engine.initialise();},
  enroll:async(...args)=>{if(args.length!==2||typeof args[0]!=='string'||typeof args[1]!=='string'||args[0].length>36||args[1].length>68)fail('invalid_arguments');return engine.enroll(args[0],args[1]);},
  refresh:async(...args)=>{noArgs(args);return engine.refresh();},
  chooseReports:async(...args)=>{noArgs(args);const result=await dialogs.showOpenDialog(window,{properties:['openFile','multiSelections'],filters:[{name:'GLPI Agent JSON',extensions:['json']}]});if(result.canceled)return null;if(result.filePaths.length<1||result.filePaths.length>50)fail('file_count');
   function*files(){let total=0;for(const filename of result.filePaths){const before=fs.lstatSync(filename);if(!before.isFile()||before.isSymbolicLink())fail('invalid_report');total+=before.size;if(total>MAX_REPORT_BYTES)fail('file_size');const fd=fs.openSync(filename,fs.constants.O_RDONLY|(fs.constants.O_NOFOLLOW??0));try{const opened=fs.fstatSync(fd);if(opened.ino!==before.ino||opened.dev!==before.dev||opened.size!==before.size||!opened.isFile())fail('invalid_report');const bytes=readLimited(fd,MAX_REPORT_BYTES);if(bytes.length!==opened.size)fail('invalid_report');yield bytes;}finally{fs.closeSync(fd);}}}
   return engine.prepare(files());},
  preview:async(...args)=>{noArgs(args);return engine.preview();},
  sendReports:async(...args)=>{if(args.length!==1||args[0]!==true)fail('review_required');return engine.deliver('push',true);},
  discardReports:async(...args)=>{if(args.length!==1||!['fr','en','ar','ary'].includes(args[0]))fail('invalid_arguments');const text={fr:['Abandonner le lot local ? Les rapports déjà reçus dans la console seront conservés.','Annuler','Abandonner'],en:['Discard the local batch? Reports already received in the console will be retained.','Cancel','Discard'],ar:['التخلي عن الدفعة المحلية؟ التقارير التي وصلت إلى لوحة التحكم ستبقى محفوظة.','إلغاء','تأكيد'],ary:['نسدو الدفعة المحلية؟ التقارير اللي وصلات للوحة التحكم غادي تبقى محفوظة.','إلغاء','تأكيد']}[args[0]];const result=await dialogs.showMessageBox(window,{type:'warning',message:'Cyber-Skill Collector',detail:text[0],buttons:text.slice(1),defaultId:0,cancelId:0,noLink:true});if(result.response!==1)return null;return engine.deliver('discard');},
  saveProfile:async(...args)=>{if(args.length!==1)fail('invalid_arguments');return engine.saveProfile(args[0]);},
  removeProfile:async(...args)=>{if(args.length!==1)fail('invalid_arguments');return engine.removeProfile(args[0]);},
  copyFingerprint:async(...args)=>{noArgs(args);const s=await engine.state();if(!s.fingerprint)fail('not_initialised');clipboard.writeText(s.fingerprint);return null;},
  openConsole:async(...args)=>{noArgs(args);await shell.openExternal(ORIGIN+'/veille?tab=pilotage&section=connectors');return null;},
 };
 for(const[name,action]of Object.entries(actions))ipcMain.handle('collector:'+name,async(event,...args)=>{
  if(!validSender(event,window))return{ok:false,error:'forbidden'};
  if(invoking)return{ok:false,error:'collector_locked'};invoking=true;try{return{ok:true,value:await action(...args)};}catch(error){return{ok:false,error:error instanceof LocalCollectorError?error.code:'unavailable'};}finally{invoking=false;}
 });
 app.on('window-all-closed',()=>app.quit());window.once('ready-to-show',()=>window.show());await window.loadURL(UI_URL);return{window,engine,store};
}
