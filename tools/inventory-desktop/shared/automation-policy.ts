const formatDate=(value:number|Date,options:Intl.DateTimeFormatOptions,locale:string)=>new Intl.DateTimeFormat(locale,options).format(value);
export type AutomationPolicy={enabled:boolean;glpi:boolean;network:boolean;transmit:boolean;interval_minutes:number;timezone:string;start_minute:number;end_minute:number};
export type AutomationPolicyState={revision:number;config:AutomationPolicy|null;updated_at:string|null};
export const defaultAutomationPolicy=():AutomationPolicy=>({enabled:false,glpi:true,network:false,transmit:false,interval_minutes:1440,timezone:'Africa/Casablanca',start_minute:0,end_minute:1440});
export function validateAutomationPolicy(c:AutomationPolicy):AutomationPolicy{
 const keys=['enabled','glpi','network','transmit','interval_minutes','timezone','start_minute','end_minute'];
 if(!c||Object.keys(c).length!==keys.length||keys.some(k=>!Object.hasOwn(c,k))||[c.enabled,c.glpi,c.network,c.transmit].some(v=>typeof v!=='boolean')||typeof c.timezone!=='string'||!Number.isInteger(c.interval_minutes)||c.interval_minutes<60||c.interval_minutes>10080||!Number.isInteger(c.start_minute)||!Number.isInteger(c.end_minute)||c.start_minute<0||c.end_minute>1440||c.start_minute>=c.end_minute||(c.enabled&&!c.glpi&&!c.network))throw Error('collector.invalid');
 formatDate(0,{timeZone:c.timezone},'en-GB');return c;
}
export function automationWindow(c:AutomationPolicy,at:number):boolean{
 validateAutomationPolicy(c);const parts=formatDate(at,{timeZone:c.timezone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'},'en-GB').split(':');const n=Number(parts[0])*60+Number(parts[1]);return c.enabled&&n>=c.start_minute&&n<c.end_minute;
}
