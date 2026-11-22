import fs from'node:fs';import path from'node:path';import{randomUUID}from'node:crypto';
import{fail}from'../shared/client.mjs';
const MAX_BYTES=128*1024*1024;
export function readLimited(fd,limit){const chunks=[];let total=0;while(true){const buffer=Buffer.alloc(Math.min(65536,limit-total+1)),count=fs.readSync(fd,buffer,0,buffer.length,null);if(!count)break;total+=count;if(total>limit)fail('file_size');chunks.push(buffer.subarray(0,count));}return Buffer.concat(chunks,total);}
const statIfPresent=file=>{try{return fs.lstatSync(file);}catch(error){if(error.code==='ENOENT')return null;throw error;}};
/** One atomic OS-encrypted record. No plaintext key, report, profile or recovery fallback on disk. */
export class EncryptedStore{
 constructor(directory,crypto,{platform=process.platform,uid=process.getuid?.()}={}){this.directory=path.resolve(directory);this.crypto=crypto;this.platform=platform;this.uid=uid;this.file=path.join(this.directory,'collector.enc');this.active=false;}
 ensureDirectory(){
  if(!fs.existsSync(this.directory))fs.mkdirSync(this.directory,{recursive:true,mode:0o700});
  const s=fs.lstatSync(this.directory);if(!s.isDirectory()||s.isSymbolicLink()||(this.platform!=='win32'&&(s.uid!==this.uid||(s.mode&0o077)!==0)))fail('private_directory_required');
  // Resolve parent aliases once; subsequent access still checks the final directory and file.
  const real=fs.realpathSync(this.directory);if(this.realDirectory&&real!==this.realDirectory)fail('private_directory_required');this.realDirectory=real;
 }
 async available(){return await this.crypto.available();}
 async read(){this.ensureDirectory();if(!await this.available())fail('secure_storage_unavailable');const stat=statIfPresent(this.file);if(!stat)return null;
  if(!stat.isFile()||stat.isSymbolicLink()||stat.nlink!==1||stat.size>MAX_BYTES||(this.platform!=='win32'&&(stat.uid!==this.uid||(stat.mode&0o077)!==0)))fail('private_file_required');
  const fd=fs.openSync(this.file,fs.constants.O_RDONLY|(fs.constants.O_NOFOLLOW??0));let bytes;try{const opened=fs.fstatSync(fd);if(opened.ino!==stat.ino||opened.dev!==stat.dev||opened.size>MAX_BYTES)fail('private_file_required');bytes=readLimited(fd,MAX_BYTES);}finally{fs.closeSync(fd);}
  try{return JSON.parse(await this.crypto.decrypt(bytes));}catch{fail('local_state_unreadable');}
 }
 async write(value){this.ensureDirectory();if(!await this.available())fail('secure_storage_unavailable');
  const text=JSON.stringify(value);if(Buffer.byteLength(text)>MAX_BYTES-4096)fail('file_size');const bytes=await this.crypto.encrypt(text);if(!Buffer.isBuffer(bytes)||bytes.length>MAX_BYTES)fail('secure_storage_unavailable');
  const temp=path.join(this.directory,'.collector-'+randomUUID());let fd;
  try{fd=fs.openSync(temp,'wx',0o600);fs.writeFileSync(fd,bytes);fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;
   this.ensureDirectory();{const s=statIfPresent(this.file);if(s){if(!s.isFile()||s.isSymbolicLink()||s.nlink!==1)fail('private_file_required');}}
   fs.renameSync(temp,this.file);
   if(this.platform!=='win32'){const directory=fs.openSync(this.directory,'r');try{fs.fsyncSync(directory);}finally{fs.closeSync(directory);}}
  }finally{if(fd!==undefined)fs.closeSync(fd);if(fs.existsSync(temp))fs.unlinkSync(temp);}
 }
 async exclusive(fn){if(this.active)fail('collector_locked');this.active=true;try{return await fn();}finally{this.active=false;}}
}
