import {Card,CardHeader,CardTitle,CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {automationLocales} from './automation-locales';
import type {Automation} from './bridge';
import type {Language} from './locales';
export function AutomationCard({value,language,busy,enable,pause,refresh}:{value?:Automation|null;language:Language;busy:boolean;enable:()=>void;pause:()=>void;refresh:()=>void}){
 const t=automationLocales[language],date=(v:number)=>new Intl.DateTimeFormat(language,{dateStyle:'medium',timeStyle:'short'}).format(v);
 return <Card><CardHeader><CardTitle>{t.title}</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">{t.help}</p><Badge variant="outline">{value?.running?t.running:value?.enabled?t.enabled:t.disabled}</Badge>
 {value?.lastSuccess&&<p className="text-sm">{t.last} : {date(value.lastSuccess)}</p>}{value?.enabled&&value.nextAt&&<p className="text-sm">{t.next} : {date(value.nextAt)}</p>}{value?.error&&<p role="status" className="text-sm">{t.error}</p>}
 <div className="flex flex-wrap gap-2"><Button disabled={busy||value?.running} onClick={enable}>{t.enable}</Button><Button variant="outline" disabled={!value?.enabled&&!value?.running} onClick={pause}>{t.pause}</Button><Button variant="ghost" disabled={busy} onClick={refresh}>{t.refresh}</Button></div></CardContent></Card>;
}
