const formatDate=(value:number|Date,options:Intl.DateTimeFormatOptions,locale:string)=>new Intl.DateTimeFormat(locale,options).format(value);
/** Local checks mirror the server; only the server may authorise a scope. No DNS resolution. */
export type NetworkPolicy={enabled:boolean;site:string;ranges:string[];exclusions:string[];interval_minutes:number;timezone:string;start_minute:number;end_minute:number;credential_ref:string};
export type NetworkPolicyState={revision:number;config:NetworkPolicy|null;updated_at:string|null};
export const defaultNetworkPolicy=():NetworkPolicy=>({enabled:false,site:'',ranges:[],exclusions:[],interval_minutes:1440,timezone:'Africa/Casablanca',start_minute:0,end_minute:1440,credential_ref:'snmp-local'});
type Address={bits:32|128;value:bigint};
export function parseAddress(input:string):Address{
 if(/^\d+\.\d+\.\d+\.\d+$/.test(input)){
  const parts=input.split('.');if(parts.some(p=>String(Number(p))!==p||Number(p)>255))throw Error('collector.network_invalid');
  return{bits:32,value:parts.reduce((v,p)=>(v<<8n)+BigInt(p),0n)};
 }
 if(!/^[a-fA-F0-9:]+$/.test(input)||!input.includes(':')||input.includes(':::')||input.split('::').length>2)throw Error('collector.network_invalid');
 const halves=input.split('::'),left=halves[0]!.split(':').filter(Boolean),right=(halves[1]??'').split(':').filter(Boolean);
 if([...left,...right].some(p=>p.length>4)||(!input.includes('::')&&left.length!==8)||(input.includes('::')&&left.length+right.length>=8)||(!input.includes('::')&&(input.startsWith(':')||input.endsWith(':'))))throw Error('collector.network_invalid');
 const groups=input.includes('::')?[...left,...Array<string>(8-left.length-right.length).fill('0'),...right]:left;
 return{bits:128,value:groups.reduce((v,p)=>(v<<16n)+BigInt('0x'+p),0n)};
}
function formatAddress(a:Address):string{
 if(a.bits===32)return[24n,16n,8n,0n].map(n=>String((a.value>>n)&255n)).join('.');
 const groups=Array.from({length:8},(_,i)=>Number((a.value>>BigInt((7-i)*16))&65535n).toString(16));let start=-1,count=0;
 for(let i=0;i<8;){if(groups[i]!=='0'){i++;continue;}let j=i;while(j<8&&groups[j]==='0')j++;if(j-i>count&&j-i>=2){start=i;count=j-i;}i=j;}
 return start<0?groups.join(':'):groups.slice(0,start).join(':')+'::'+groups.slice(start+count).join(':');
}
export type NetworkRange=Address&{prefix:number;last:bigint;size:bigint};
export function parseRange(input:string):NetworkRange{
 const parts=input.split('/');if(parts.length!==2||!/^(0|[1-9]\d{0,2})$/.test(parts[1]!))throw Error('collector.network_invalid');
 const a=parseAddress(parts[0]!),prefix=Number(parts[1]);if(prefix>a.bits)throw Error('collector.network_invalid');
 const size=1n<<BigInt(a.bits-prefix);if(a.value%size!==0n||formatAddress(a)!==parts[0])throw Error('collector.network_invalid');
 return{...a,prefix,size,last:a.value+size-1n};
}
const inside=(a:Address,b:NetworkRange)=>a.bits===b.bits&&a.value>=b.value&&a.value<=b.last;
const privateRanges=['10.0.0.0/8','172.16.0.0/12','192.168.0.0/16','fc00::/7'].map(parseRange);
export function networkTargets(policy:NetworkPolicy):string[]{
 const keys=['enabled','site','ranges','exclusions','interval_minutes','timezone','start_minute','end_minute','credential_ref'];
 if(!policy||Object.keys(policy).length!==keys.length||keys.some(k=>!Object.hasOwn(policy,k))||typeof policy.enabled!=='boolean'||typeof policy.site!=='string'||policy.site.trim().length<2||policy.site.trim().length>120||/\p{Cc}/u.test(policy.site)||typeof policy.credential_ref!=='string'||!/^[a-zA-Z][a-zA-Z0-9_.-]{0,63}$/.test(policy.credential_ref)
 ||!Array.isArray(policy.ranges)||policy.ranges.length<1||policy.ranges.length>16||!Array.isArray(policy.exclusions)||policy.exclusions.length>64
 ||!Number.isInteger(policy.interval_minutes)||policy.interval_minutes<60||policy.interval_minutes>10080
 ||!Number.isInteger(policy.start_minute)||!Number.isInteger(policy.end_minute)||policy.start_minute<0||policy.end_minute>1440||policy.start_minute>=policy.end_minute||typeof policy.timezone!=='string')throw Error('collector.network_invalid');
 try{formatDate(0,{timeZone:policy.timezone},'en-GB');}catch{throw Error('collector.network_invalid');}
 const ranges=policy.ranges.map(parseRange),excluded=policy.exclusions.map(parseRange);let count=0n;
 for(let i=0;i<ranges.length;i++){
  const range=ranges[i]!;count+=range.size;
  if(!privateRanges.some(p=>inside(range,p)&&inside({bits:range.bits,value:range.last},p))||range.size>4096n||count>4096n||ranges.slice(0,i).some(r=>r.bits===range.bits&&r.value<=range.last&&range.value<=r.last))throw Error('collector.network_invalid');
 }
 if(new Set(policy.exclusions).size!==excluded.length||excluded.some(e=>!ranges.some(r=>inside(e,r)&&inside({bits:e.bits,value:e.last},r))))throw Error('collector.network_invalid');
 const targets:string[]=[];
 for(const r of ranges)for(let n=r.value;n<=r.last;n++){
  if(r.bits===32&&r.prefix<=30&&(n===r.value||n===r.last))continue;
  const a={bits:r.bits,value:n};if(!excluded.some(e=>inside(a,e)))targets.push(formatAddress(a));
 }
 if(!targets.length)throw Error('collector.network_invalid');return targets;
}
export function inCollectionWindow(policy:NetworkPolicy,at:Date):boolean{
 const parts=formatDate(at,{timeZone:policy.timezone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'},'en-GB').split(':');
 const minutes=Number(parts[0])*60+Number(parts[1]);
 return minutes>=policy.start_minute&&minutes<policy.end_minute;
}
