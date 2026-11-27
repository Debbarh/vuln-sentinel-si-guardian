import fs from 'node:fs';
import path from 'node:path';
import {fail} from '../shared/client.mjs';
/** A native directory picker selects the parent; no remote-controlled filenames. */
export function exportRecoveredReports(directory,{kind,reports}){
 const selected=fs.lstatSync(directory);if(!selected.isDirectory()||selected.isSymbolicLink())fail('private_directory_required');
 const root=fs.realpathSync(directory);let output;
 try{
  output=fs.mkdtempSync(path.join(root,'cyber-skill-recovered-'+kind+'-'));fs.chmodSync(output,0o700);
  reports.forEach((report,index)=>{const file=path.join(output,'report-'+String(index+1).padStart(2,'0')+'.json');const fd=fs.openSync(file,fs.constants.O_WRONLY|fs.constants.O_CREAT|fs.constants.O_EXCL|(fs.constants.O_NOFOLLOW??0),0o600);try{fs.writeFileSync(fd,report);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}});
  return output;
 }catch(error){if(output)fs.rmSync(output,{recursive:true,force:true});throw error;}
}
