import type{NetworkPolicy}from'../shared/network-policy';
export type MandateSummary={revision:number;expiresAt:string;targetCount:number;status:'expired'|'missing'|'disabled'|'outside_window'|'profile_missing'|'ready';config:NetworkPolicy|null};
export type Profile={name:string;username:string;authProtocol:string;privacyProtocol:string};
export type Snapshot={available?:boolean;initialised?:boolean;enrolled?:boolean;collectorId?:string|null;fingerprint?:string|null;origin:string;status?:string;verifiedAt?:string|null;sequence?:string;pending?:{id:string;count:number;masked:number;reviewed:boolean}|null;networkMandate?:MandateSummary|null;profiles?:Profile[];receipt?:string};
export type Reply<T>={ok:true;value:T}|{ok:false;error:string};
export type Preview={batch:string;reports:string[]};
export type CollectorApi={state:()=>Promise<Reply<Snapshot>>;initialise:()=>Promise<Reply<Snapshot>>;enroll:(id:string,token:string)=>Promise<Reply<Snapshot>>;refresh:()=>Promise<Reply<Snapshot>>;fetchMandate:()=>Promise<Reply<Snapshot>>;chooseReports:()=>Promise<Reply<Snapshot|null>>;preview:()=>Promise<Reply<Preview>>;sendReports:(confirmed:boolean)=>Promise<Reply<Snapshot>>;discardReports:(language:string)=>Promise<Reply<Snapshot|null>>;saveProfile:(p:Profile&{authPassword:string;privacyPassword:string})=>Promise<Reply<Snapshot>>;removeProfile:(name:string)=>Promise<Reply<Snapshot>>;copyFingerprint:()=>Promise<Reply<null>>;openConsole:()=>Promise<Reply<null>>};
declare global{interface Window{collector:CollectorApi}}
