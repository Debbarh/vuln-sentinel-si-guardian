import {it,expect,afterEach} from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {archiveDigest,collectionEnvironment,runBounded,privateDirectory,LocalGlpi} from '../src/glpi-local.mjs';
const directories=[];
afterEach(()=>{for(const dir of directories.splice(0))fs.rmSync(dir,{recursive:true,force:true,maxRetries:5,retryDelay:100});});
function temporary(){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'glpi-security-'));directories.push(dir);return dir;}
it('removes interpreter, loader, proxy and agent configuration injection variables',()=>{
 const env=collectionEnvironment('/runtime','/work','linux',{HOME:'/home/user',PATH:'/hostile',PERL5OPT:'-Mmalware',LD_PRELOAD:'/malware',HTTPS_PROXY:'https://proxy',GLPIAGENT_SCRIPT:'glpi-netdiscovery',NODE_OPTIONS:'--inspect'});
 expect(env).toMatchObject({HOME:'/home/user',PATH:'/usr/bin:/bin:/usr/sbin:/sbin'});
 for(const key of ['PERL5OPT','LD_PRELOAD','HTTPS_PROXY','GLPIAGENT_SCRIPT','NODE_OPTIONS'])expect(env).not.toHaveProperty(key);
});
it('rejects a modified or substituted runtime cache before any execution',async()=>{
 const dir=temporary(),cache=path.join(dir,'packages');fs.mkdirSync(cache,{mode:0o700});fs.writeFileSync(path.join(cache,'GLPI-Agent-1.21_arm64.pkg'),'changed',{mode:0o600});
 const glpi=new LocalGlpi(dir,'/never-run',{platform:'darwin',arch:'arm64',http:()=>{throw Error('network must not run');}});
 await expect(glpi.collect('11111111-1111-4111-8111-111111111111')).rejects.toThrow('glpi_integrity');expect(fs.readdirSync(path.join(dir,'work'))).toEqual([]);
});
it.skipIf(process.platform==='win32')('rejects symlink caches and directories with broad permissions',async()=>{
 const dir=temporary(),file=path.join(dir,'runtime');fs.writeFileSync(file,'x',{mode:0o600});fs.symlinkSync(file,path.join(dir,'alias'));
 await expect(archiveDigest(path.join(dir,'alias'))).rejects.toThrow('glpi_integrity');fs.chmodSync(dir,0o755);expect(()=>privateDirectory(dir)).toThrow('private_directory_required');
});
it('bounds stdout without accepting a truncated report',async()=>{
 await expect(runBounded(process.execPath,['-e','process.stdout.write("x".repeat(2048))'],{limit:128,env:{}})).rejects.toThrow('collection_size');
});
it('stops a stalled process at its time limit',async()=>{
 await expect(runBounded(process.execPath,['-e','setInterval(()=>{},1000)'],{timeout:100,env:{}})).rejects.toThrow('collection_timeout');
});
it('cancels collection and refuses an already aborted invocation',async()=>{
 const c=new AbortController();const pending=runBounded(process.execPath,['-e','setInterval(()=>{},1000)'],{signal:c.signal,env:{}});c.abort();await expect(pending).rejects.toThrow('collection_cancelled');
 expect(()=>runBounded('/never-execute',[],{signal:c.signal})).toThrow('collection_cancelled');
});
it('never chooses an arbitrary runtime or accepts arguments for remote discovery',async()=>{
 const glpi=new LocalGlpi(temporary(),'/unused',{platform:'linux',arch:'arm64'});
 expect(glpi.supported()).toBe(false);await expect(glpi.collect('11111111-1111-4111-8111-111111111111')).rejects.toThrow('glpi_platform');
 await expect(glpi.collect('https://attacker.invalid')).rejects.toThrow('invalid_arguments');
});
