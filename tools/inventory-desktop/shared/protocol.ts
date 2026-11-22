export const PROTOCOL='CYBERSKILL-COLLECTOR-1';
export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const HEX=/^[0-9a-f]{64}$/;
export const SIGNATURE=/^[0-9a-f]{128}$/;
export const MAX_WIRE_BYTES=45*1024*1024;
export function fromHex(value:string):Uint8Array<ArrayBuffer>{return Uint8Array.from(value.match(/../g)??[],v=>parseInt(v,16));}
export async function sha256(value:string):Promise<string>{return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),b=>b.toString(16).padStart(2,'0')).join('');}
export const enrollmentMessage=(origin:string,invitation:string,key:string,tokenHash:string)=>`${PROTOCOL}\nenroll\n${origin}\n${invitation}\n${key}\n${tokenHash}\n`;
export const requestMessage=(origin:string,action:string,id:string,batch:string,sequence:string,time:string,hash:string)=>`${PROTOCOL}\nPOST\n/collector/v1/${action}\n${origin}\n${id}\n${batch}\n${sequence}\n${time}\n${hash}\n`;
export async function verify(publicKey:string,message:string,signature:string):Promise<boolean>{
 if(!HEX.test(publicKey)||!SIGNATURE.test(signature))return false;
 try{const key=await crypto.subtle.importKey('raw',fromHex(publicKey),{name:'Ed25519'},false,['verify']);return await crypto.subtle.verify('Ed25519',key,fromHex(signature),new TextEncoder().encode(message));}catch{return false;}
}
