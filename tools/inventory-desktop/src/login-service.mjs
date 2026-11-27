import fs from 'node:fs';
import path from 'node:path';
import {fail} from '../shared/client.mjs';
const xml=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
function startupFile(directory,name,body){
 fs.mkdirSync(directory,{recursive:true,mode:0o700});
 if(fs.lstatSync(directory).isSymbolicLink())fail('service_path_invalid');
 const file=path.join(directory,name);
 try{const s=fs.lstatSync(file);if(!s.isFile()||s.isSymbolicLink()||s.nlink!==1)fail('service_path_invalid');}catch(e){if(e.code!=='ENOENT')throw e;}
 if(body===null){fs.rmSync(file,{force:true});return;}
 const temp=path.join(directory,name+'.'+process.pid+'.tmp');let fd;
 try{fd=fs.openSync(temp,fs.constants.O_WRONLY|fs.constants.O_CREAT|fs.constants.O_EXCL|(fs.constants.O_NOFOLLOW??0),0o600);fs.writeFileSync(fd,body);fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;fs.renameSync(temp,file);}finally{if(fd!==undefined)fs.closeSync(fd);fs.rmSync(temp,{force:true});}
}
/** Per-user session service: never installs root services or stores a login password. */
export function configureLoginService(app,enabled,{platform=process.platform,home=app.getPath('home'),executable=process.execPath}={}){
 if(!app.isPackaged)fail('packaged_service_required');
 if(typeof enabled!=='boolean'||!path.isAbsolute(executable)||/[\r\n\0]/.test(executable))fail('invalid_arguments');
 const s=fs.lstatSync(executable);if(!s.isFile()||s.isSymbolicLink())fail('service_path_invalid');
 if(platform==='win32'){app.setLoginItemSettings({openAtLogin:enabled,path:executable,args:['--background']});const state=app.getLoginItemSettings({path:executable,args:['--background']});if(enabled&&!state.openAtLogin)fail('service_unavailable');return;}
 if(platform==='darwin'){
  // A user LaunchAgent also works for the explicitly approved ad-hoc preview; Keychain still gates execution.
  const directory=path.join(home,'Library','LaunchAgents'),name='com.cyber-skill.inventory.collector.plist';
  if(!enabled){startupFile(directory,name,null);return;}
  const body='<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>Label</key><string>com.cyber-skill.inventory.collector</string><key>ProgramArguments</key><array><string>'+xml(executable)+'</string><string>--background</string></array><key>RunAtLoad</key><true/><key>ProcessType</key><string>Background</string><key>LimitLoadToSessionType</key><string>Aqua</string><key>KeepAlive</key><dict><key>SuccessfulExit</key><false/></dict><key>ThrottleInterval</key><integer>60</integer></dict></plist>';
  startupFile(directory,name,body);return;
 }
 if(platform!=='linux')fail('service_unavailable');
 // AppImage mount paths are transient. Until its persistent launcher is qualified, use the DEB.
 if(enabled&&executable.includes('/.mount_'))fail('service_requires_deb');
 const directory=path.join(home,'.config','autostart'),name='cyber-skill-collector.desktop';
 if(!enabled){startupFile(directory,name,null);return;}
 const command='"'+executable.replaceAll('\\','\\\\').replaceAll('"','\\"').replaceAll('`','\\`').replaceAll('$','\\$').replaceAll('%','%%')+'" --background';
 startupFile(directory,name,'[Desktop Entry]\nType=Application\nName=Cyber-Skill Collector\nExec='+command+'\nTerminal=false\nX-GNOME-Autostart-enabled=true\n');
}
