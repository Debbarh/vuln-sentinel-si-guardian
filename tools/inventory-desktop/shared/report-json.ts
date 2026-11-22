import { isLosslessNumber, parse, stringify, type LosslessNumber } from 'lossless-json';

export type ReportValue = null | boolean | string | LosslessNumber | ReportValue[] | { [key:string]:ReportValue };
export type Exclusion = { path:string[]; reason:'authentication'|'license' };
export const REDACTED = '[REDACTED]';
const AUTH_KEYS = new Set(['password','passwd','pwd','passwordhash','passworddigest','passwdhash','pwdhash','ntlmhash','nthash','lmhash','kerberoskey','sessiontoken','sessioncookie','cookie','setcookie','passphrase','secret','clientsecret','authorization','authtoken','apitoken','awssecretaccesskey','awsaccesskeyid','accesstoken','refreshtoken','idtoken','token','apikey','privatekey','sshprivatekey','snmpcommunity','community','authenticationkey','privacykey','authpassword','privpassword','credentials','credential']);
const LICENSE_KEYS = new Set(['winprodkey','productkey','licensekey','licencekey','activationkey','cdkey','serialkey','licensecode','licencecode']);
const normal = (key:string) => key.toLowerCase().replace(/[^a-z0-9]/g,'');
export function secretField(key:string):Exclusion['reason']|null {
  const name=normal(key);
  if(LICENSE_KEYS.has(name)||/(?:licensekey|licencekey|productkey|activationkey)$/.test(name))return 'license';
  if(AUTH_KEYS.has(name)||/(?:password|passwd|passphrase|token|secret|apikey|privatekey|community)$/.test(name))return 'authentication';
  return null;
}
function cleanString(value:string):{value:string;reason:Exclusion['reason']|null} {
  let result=value;
  if(/-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/i.test(result))return{value:REDACTED,reason:'authentication'};
  result=result.replace(/\bBasic\s+[A-Za-z0-9+/=]{8,}/gi,`Basic ${REDACTED}`)
    .replace(/\bBearer\s+[a-zA-Z0-9_.-]{12,}/gi,`Bearer ${REDACTED}`)
    .replace(/\bsk-(?:ant-)?[a-zA-Z0-9_-]{16,}\b/g,REDACTED)
    .replace(/\bAKIA[A-Z0-9]{16}\b/g,REDACTED)
    .replace(/([a-z][a-z0-9+.-]*:\/\/[^\s/@:]+:)[^\s/@]+@/gi,`$1${REDACTED}@`)
    .replace(/([?&](?:access_token|refresh_token|token|api_key|apikey|password|secret)=)[^&\s]+/gi,`$1${REDACTED}`)
    .replace(/((?:password|passwd|pwd|passphrase|api[_-]?key|client[_-]?secret)\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;&]+)/gi,`$1${REDACTED}`)
    .replace(/(--(?:password|passwd|passphrase|api-key|client-secret)\s+)(?:"[^"]*"|'[^']*'|[^\s,;&]+)/gi,`$1${REDACTED}`);
  const authentication=result!==value;
  result=result.replace(/\b[A-Z0-9]{5}(?:-[A-Z0-9]{5}){4}\b/gi,REDACTED);
  return{value:result,reason:authentication?'authentication':result!==value?'license':null};
}
export function reportStringify(value:unknown):string {
  const result=stringify(value);if(typeof result!=='string')throw Error('inventory.local_invalid');return result;
}
/** Preserve every ordinary field, array and exact numeric value. Mask secret values without dropping keys. */
export function readFullReport(text:string):{payload:ReportValue;json:string;exclusions:Exclusion[]} {
  const exclusions:Exclusion[]=[];let nodes=0;
  const walk=(value:unknown,path:string[],forced:Exclusion['reason']|null=null):ReportValue=>{
    if(++nodes>500000||path.length>32)throw Error('inventory.local_structure');
    if(forced&&!(path.length>0&&['credential','credentials'].includes(normal(path[path.length-1]!))&&value!==null&&typeof value==='object')){exclusions.push({path,reason:forced});return REDACTED;}
    if(value===null)return null;
    if(typeof value==='boolean'||isLosslessNumber(value))return value;
    if(typeof value==='string'){
      const cleaned=cleanString(value);if(cleaned.reason)exclusions.push({path,reason:cleaned.reason});return cleaned.value;
    }
    if(Array.isArray(value))return value.map((v,i)=>walk(v,[...path,String(i)]));
    if(typeof value!=='object'||value===null)throw Error('inventory.local_invalid');
    const data=value as Record<string,unknown>,result:Record<string,ReportValue>=Object.create(null);
    // Named values also occur in environment/extension records: {name|key|variable, value|val|data}.
    const label=[data.name,data.key,data.variable].find(v=>typeof v==='string');
    const namedReason=typeof label==='string'?secretField(label):null;
    for(const [key,entry]of Object.entries(data))result[key]=walk(entry,[...path,key],secretField(key)??(namedReason&&['value','val','data'].includes(key)?namedReason:null));
    return result;
  };
  let parsed:unknown;
  try{parsed=parse(text.replace(/^\uFEFF/,''));}catch{throw Error('inventory.local_invalid');}
  const payload=walk(parsed,[]);
  return{payload,json:reportStringify(payload),exclusions};
}
