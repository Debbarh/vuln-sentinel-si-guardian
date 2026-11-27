import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {privateDirectory,collectionEnvironment,runBounded} from './glpi-local.mjs';
import {fail} from '../shared/client.mjs';
const relative=value=>typeof value==='string'&&value.length<4096&&!path.isAbsolute(value)&&!value.includes('\\')&&!value.split('/').some(p=>!p||p==='.'||p==='..')&&!/[\0\r\n]/.test(value);
export function perlPath(value,platform=process.platform){
 const normalized=value.replaceAll('\\','/');
 if(platform!=='win32')return normalized;
 const match=/^([a-z]):\/(.*)$/i.exec(normalized);
 if(!match)fail('snmp_integrity');
 return '/cygdrive/'+match[1].toLowerCase()+'/'+match[2];
}
export class LocalSnmp{
 constructor(root,manifest,runnerRoot,privateRoot){this.root=root;this.manifest=manifest;this.runnerRoot=runnerRoot;this.privateRoot=privateRoot;}
 available(){return fs.existsSync(this.manifest)&&fs.existsSync(this.root);}
 async verify(signal){
  if(!this.available())fail('dependency_unavailable');const bytes=fs.readFileSync(this.manifest);if(bytes.length>8*1024*1024)fail('snmp_integrity');let m;try{m=JSON.parse(bytes);}catch{fail('snmp_integrity');}
  const arch=({x64:['amd64','x86_64'],arm64:['arm64','aarch64']})[process.arch]??[];
  if(m.version!==1||m.platform!==process.platform||!arch.includes(m.arch)||m.snmpInfo!=='3.985004'||m.netSnmp!=='5.9.5.2'||!relative(m.executable)||!relative(m.limiter)||!Array.isArray(m.include)||!m.include.length||!Array.isArray(m.mibs)||!m.mibs.length||![...m.include,...m.mibs].every(relative)||!m.files||typeof m.files!=='object'||Object.keys(m.files).length>30000)fail('snmp_integrity');
  if(fs.lstatSync(this.root).isSymbolicLink())fail('snmp_integrity');const root=fs.realpathSync(this.root);let total=0;
  for(const[file,pin]of Object.entries(m.files)){
   if(signal?.aborted)fail('collection_cancelled');if(!relative(file)||typeof pin!=='string'||!/^[a-f0-9]{64}$/.test(pin))fail('snmp_integrity');const filename=path.join(root,file),stat=fs.lstatSync(filename);
   if(!stat.isFile()||stat.isSymbolicLink()||!fs.realpathSync(filename).startsWith(root+path.sep))fail('snmp_integrity');total+=stat.size;if(total>2*1024*1024*1024)fail('snmp_integrity');
   const hash=createHash('sha256');for await(const chunk of fs.createReadStream(filename))hash.update(chunk);if(hash.digest('hex')!==pin)fail('snmp_integrity');
  }
  if(!Object.hasOwn(m.files,m.executable)||!Object.hasOwn(m.files,m.limiter))fail('snmp_integrity');return{root,m};
 }
 async collect(verified,target,policy,profile,{signal,timeout=65000}={}){
  const{root,m}=verified;const base=privateDirectory(this.privateRoot),work=path.join(base,'snmp-'+randomUUID());fs.mkdirSync(work,{mode:0o700});
  let input;
  try{
   fs.mkdirSync(path.join(work,'CyberSkill'),{mode:0o700});
   for(const filename of ['snmp-info.pl','CyberSkill/SnmpInfo.pm'])fs.writeFileSync(path.join(work,filename),fs.readFileSync(path.join(this.runnerRoot,filename)),{mode:0o600,flag:'wx'});
   const env=collectionEnvironment(root,work);env.CS_SNMP_RUNTIME=perlPath(root);env.CS_SNMP_WORK=perlPath(work);env.CS_SNMP_MIBS=JSON.stringify(m.mibs.map(p=>perlPath(path.join(root,p))));env.HOME=perlPath(work);env.SNMPCONFPATH=perlPath(work);env.SNMP_PERSISTENT_DIR=perlPath(work);
   if(process.platform==='win32'){env.PATH=path.join(root,'bin')+';'+env.PATH;env.LANG='C.UTF-8';env.LC_ALL='C.UTF-8';}
   input=Buffer.from(JSON.stringify({host:target,scope:policy,credentials:{version:'3',security_level:'authPriv',username:profile.username,auth_protocol:profile.authProtocol,privacy_protocol:profile.privacyProtocol,auth_password:profile.authPassword,privacy_password:profile.privacyPassword}}));
   return await runBounded(path.join(root,m.limiter),[path.join(root,m.executable).replaceAll('\\','/'),'-f',...m.include.map(p=>'-I'+perlPath(path.join(root,p))),'-I'+perlPath(work),perlPath(path.join(work,'snmp-info.pl'))],{env,cwd:work,signal,input,timeout:Math.min(timeout,65000)});
  }finally{input?.fill(0);fs.rmSync(work,{recursive:true,force:true,maxRetries:3,retryDelay:100});}
 }
}
