import fs from 'node:fs';
import path from 'node:path';
import {createHash, randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import {fail, MAX_REPORT_BYTES} from '../shared/client.mjs';

// Published upstream release checksums, never supplied by the renderer or server.
export const GLPI_VERSION = '1.21';
export const GLPI_RELEASE = 'https://github.com/glpi-project/glpi-agent/releases/tag/1.21';
export const GLPI_PACKAGES = Object.freeze({
 'darwin-arm64': {file:'GLPI-Agent-1.21_arm64.pkg', sha256:'8bc6e200fd100f2f818d9b0028c94b7a624c497a33547789c4bd2aeea8a0d69a'},
 'win32-x64': {file:'GLPI-Agent-1.21-x64.zip', sha256:'f0d3d534f370572c1843fd6da21da1bfa6ce43f8437293f6f54b7fae3a7e0b10'},
 'linux-x64': {file:'glpi-agent-1.21-x86_64.AppImage', sha256:'285eccea560c0e9f253be0feb19786903110d5189d28285d4f1cc2097bb1bd33'},
});
const MAX_ARCHIVE = 64*1024*1024;
const abort = signal => {if(signal?.aborted) fail('collection_cancelled');};

export function privateDirectory(directory) {
 fs.mkdirSync(directory,{recursive:true,mode:0o700});
 const s=fs.lstatSync(directory);
 if(!s.isDirectory()||s.isSymbolicLink()||(process.platform!=='win32'&&(s.uid!==process.getuid()||(s.mode&0o077)!==0)))fail('private_directory_required');
 return fs.realpathSync(directory);
}
export async function archiveDigest(file) {
 const s=fs.lstatSync(file);
 if(!s.isFile()||s.isSymbolicLink()||s.nlink!==1||s.size>MAX_ARCHIVE||(process.platform!=='win32'&&(s.uid!==process.getuid()||(s.mode&0o077)!==0)))fail('glpi_integrity');
 const handle=await fs.promises.open(file,fs.constants.O_RDONLY|(fs.constants.O_NOFOLLOW??0));
 try {
  const opened=await handle.stat();if(opened.ino!==s.ino||opened.dev!==s.dev||opened.size!==s.size)fail('glpi_integrity');
  const h=createHash('sha256');let total=0;
  for await(const bytes of handle.createReadStream({autoClose:false})){total+=bytes.length;if(total>MAX_ARCHIVE)fail('glpi_integrity');h.update(bytes);}
  return h.digest('hex');
 } finally {await handle.close();}
}
export function collectionEnvironment(runtimeRoot, work, platform=process.platform, source=process.env) {
 const env={LANG:'C',LC_ALL:'C',CS_GLPI_ROOT:runtimeRoot,CS_GLPI_WORK:work,TMPDIR:work,TMP:work,TEMP:work};
 // Never inherit PERL*, NODE*, proxy, GLPI*, DYLD* or LD_* injection variables.
 if(platform==='win32') {
  for(const key of ['SystemRoot','WINDIR','USERPROFILE','APPDATA','LOCALAPPDATA','ProgramData','ProgramFiles','ProgramFiles(x86)','ProgramW6432'])if(source[key])env[key]=source[key];
  const system=source.SystemRoot||'C:\\Windows';env.PATH=[path.join(runtimeRoot,'perl','bin'),path.join(system,'System32'),system,path.join(system,'System32','Wbem')].join(';');
 } else {if(source.HOME)env.HOME=source.HOME;env.PATH='/usr/bin:/bin:/usr/sbin:/sbin';}
 return env;
}

/** Bounded pipes; no shell, persistent logs, inherited stdin or elevated privileges. */
export function runBounded(command,args,{cwd,env,signal,timeout=180000,limit=MAX_REPORT_BYTES,capture=true,platform=process.platform,input}={}) {
 abort(signal);
 if(input!==undefined&&(!Buffer.isBuffer(input)||input.length>16384))fail('invalid_arguments');
 return new Promise((resolve,reject)=>{
  const child=spawn(command,args,{cwd,env,shell:false,windowsHide:true,detached:platform!=='win32',stdio:[input===undefined?'ignore':'pipe','pipe','pipe']});
  if(input!==undefined){child.stdin.on('error',()=>{});child.stdin.end(input);}
  let bytes=0,stderr=0,reason=null,done=false;const chunks=[];
  const stop=code=>{if(reason)return;reason=code;
   if(child.pid){if(platform==='win32'){
    const system=env?.SystemRoot||'C:\\Windows';const killer=spawn(path.join(system,'System32','taskkill.exe'),['/PID',String(child.pid),'/T','/F'],{windowsHide:true,shell:false,stdio:'ignore',env});killer.on('error',()=>child.kill());
   }else{try{process.kill(-child.pid,'SIGKILL');}catch{child.kill('SIGKILL');}}}
  };
  const onAbort=()=>stop('collection_cancelled');signal?.addEventListener('abort',onAbort,{once:true});
  const timer=setTimeout(()=>stop('collection_timeout'),timeout);
  const cleanup=()=>{clearTimeout(timer);signal?.removeEventListener('abort',onAbort);};
  child.stdout.on('data',chunk=>{bytes+=chunk.length;if(bytes>limit)stop('collection_size');else if(capture)chunks.push(chunk);});
  child.stderr.on('data',chunk=>{stderr+=chunk.length;if(stderr>1024*1024)stop('collection_failed');});
  child.on('error',()=>{if(done)return;done=true;cleanup();reject(Error('collection_failed'));});
  child.on('close',code=>{if(done)return;done=true;cleanup();
   if(reason||code!==0){for(const chunk of chunks)chunk.fill(0);try{fail(reason??'collection_failed');}catch(e){reject(e);}return;}
   const result=Buffer.concat(chunks);for(const chunk of chunks)chunk.fill(0);resolve(result);
  });
  if(signal?.aborted)onAbort();
 });
}

async function downloadPackage(spec,file,signal,http) {
 if(process.env.NODE_TLS_REJECT_UNAUTHORIZED==='0')fail('tls_verification_required');
 let url=`https://github.com/glpi-project/glpi-agent/releases/download/${GLPI_VERSION}/${spec.file}`;
 const allowed=new Set(['github.com','release-assets.githubusercontent.com']);
 let response;
 for(let redirects=0;redirects<=3;redirects++) {
  abort(signal);const u=new URL(url);if(u.protocol!=='https:'||!allowed.has(u.hostname)||u.username||u.password||u.port)fail('glpi_download');
  response=await http(url,{redirect:'manual',signal:AbortSignal.any([signal,AbortSignal.timeout(120000)].filter(Boolean))});
  if(![301,302,303,307,308].includes(response.status))break;
  const location=response.headers.get('location');await response.body?.cancel();if(!location)fail('glpi_download');url=new URL(location,url).href;response=null;
 }
 if(!response?.ok||!response.body)fail('glpi_download');
 const temp=file+'.'+randomUUID();let handle;const reader=response.body.getReader(),hash=createHash('sha256');let count=0;
 try {
  handle=await fs.promises.open(temp,'wx',0o600);
  while(true){abort(signal);const{done,value}=await reader.read();if(done)break;count+=value.length;if(count>MAX_ARCHIVE)fail('glpi_download');hash.update(value);await handle.writeFile(value);}
  if(hash.digest('hex')!==spec.sha256)fail('glpi_integrity');await handle.sync();await handle.close();handle=null;fs.renameSync(temp,file);
 }finally{await reader.cancel().catch(()=>{});await handle?.close();fs.rmSync(temp,{force:true});}
}

export class LocalGlpi {
 constructor(directory,runner,{platform=process.platform,arch=process.arch,http=fetch}={}){this.directory=directory;this.runner=runner;this.platform=platform;this.arch=arch;this.http=http;}
 supported(){return !!GLPI_PACKAGES[this.platform+'-'+this.arch];}
 async collect(collectorId,{signal,mode='inventory',onPhase=()=>{}}={}) {
  if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(collectorId)||!['inventory','version'].includes(mode))fail('invalid_arguments');
  const spec=GLPI_PACKAGES[this.platform+'-'+this.arch];if(!spec)fail('glpi_platform');
  const base=privateDirectory(this.directory),cache=privateDirectory(path.join(base,'packages')),workRoot=privateDirectory(path.join(base,'work'));
  // Exclusive application instance: unfinished private workspaces from a crash are disposable.
  for(const name of fs.readdirSync(workRoot)){if(/^run-[a-f0-9-]{36}$/.test(name))fs.rmSync(path.join(workRoot,name),{recursive:true,force:true});}
  const archive=path.join(cache,spec.file);
  if(!fs.existsSync(archive)){onPhase('download');await downloadPackage(spec,archive,signal,this.http);}
  onPhase('verify');abort(signal);if(await archiveDigest(archive)!==spec.sha256)fail('glpi_integrity');
  const named=path.join(workRoot,'run-'+randomUUID());fs.mkdirSync(named,{mode:0o700});
  try {
   onPhase('extract');const extract=path.join(named,'extracted'),env=collectionEnvironment('',named,this.platform);let root,command,args;
   if(this.platform==='darwin') {
    await runBounded('/usr/sbin/pkgutil',['--expand-full',archive,extract],{env,cwd:named,signal,capture:false,limit:1024*1024});
    root=path.join(extract,'GLPI-Agent-1.21_arm64.pkg','Payload','Applications','GLPI-Agent');command=path.join(root,'bin','perl');
    args=['-I'+path.join(root,'lib'),'-I'+path.join(root,'lib','darwin-thread-multi-2level'),'-I'+path.join(root,'lib','perl5','site_perl','5.44.0'),'-I'+path.join(root,'agent')];
   } else if(this.platform==='win32') {
    const system=env.SystemRoot||'C:\\Windows';
    await runBounded(path.join(system,'System32','WindowsPowerShell','v1.0','powershell.exe'),['-NoLogo','-NoProfile','-NonInteractive','-Command','Expand-Archive -LiteralPath $env:CS_GLPI_ARCHIVE -DestinationPath $env:CS_GLPI_EXTRACT -Force'],{env:{...env,CS_GLPI_ARCHIVE:archive,CS_GLPI_EXTRACT:extract},cwd:named,signal,capture:false,limit:1024*1024});
    root=extract;command=path.join(root,'perl','bin','glpi-agent.exe');args=['-I'+path.join(root,'perl','lib'),'-I'+path.join(root,'perl','agent')];
   } else {
    // Use a verified private copy; extraction does not install the AppImage service or require FUSE.
    const image=path.join(named,'glpi.AppImage');fs.copyFileSync(archive,image,fs.constants.COPYFILE_EXCL);fs.chmodSync(image,0o700);
    await runBounded(image,['--appimage-extract'],{env,cwd:named,signal,capture:false,limit:4*1024*1024});
    root=path.join(named,'squashfs-root');command=path.join(root,'AppRun');args=['--perl'];
   }
   abort(signal);
   const runtimeEnv=collectionEnvironment(root,named,this.platform);
   if(this.platform==='linux') {runtimeEnv.APPDIR=root;runtimeEnv.PERL5LIB=[path.join(root,'usr/share/glpi-agent/lib'),path.join(root,'usr/lib/x86_64-linux-gnu/perl5/5.26'),path.join(root,'usr/share/perl5'),path.join(root,'usr/lib/x86_64-linux-gnu/perl/5.26'),path.join(root,'usr/share/perl/5.26'),path.join(root,'usr/lib/x86_64-linux-gnu/perl-base')].join(':');}
   const libdir=this.platform==='win32'?path.join(root,'perl','agent'):this.platform==='linux'?path.join(root,'usr','share','glpi-agent','lib'):path.join(root,'agent');
   runtimeEnv.CS_GLPI_LIB=libdir;
   runtimeEnv.CS_GLPI_DATA=this.platform==='linux'?path.join(root,'usr','share','glpi-agent'):path.join(root,'share');
   fs.mkdirSync(path.join(named,'var'),{mode:0o700});
   fs.writeFileSync(path.join(named,'setup.pm'),`package setup; use strict; use warnings; use parent qw(Exporter); our @EXPORT=('%setup'); our %setup=(datadir=>$ENV{CS_GLPI_DATA},libdir=>$ENV{CS_GLPI_LIB},vardir=>$ENV{CS_GLPI_WORK}.'/var'); 1;\n`,{mode:0o600,flag:'wx'});
   // Electron can read ASAR paths; an external Perl interpreter cannot. Materialise only
   // this trusted, packaged script in the private workspace, never a renderer-selected path.
   const runner=path.join(named,'glpi-runner.pl');fs.writeFileSync(runner,fs.readFileSync(this.runner),{mode:0o600,flag:'wx'});
   // Our first include path replaces only upstream installation paths. Collection modules remain upstream.
   onPhase(mode);return await runBounded(command,[...args,'-I'+named,runner,collectorId,mode],{cwd:named,env:runtimeEnv,signal});
  } finally {fs.rmSync(named,{recursive:true,force:true,maxRetries:3,retryDelay:100});}
 }
}
