import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MandateSummary } from './bridge';
import type { Language } from './locales';
import { mandateLocales } from './mandate-locales';

const minute = (n: number) => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
export function NetworkMandateCard({ value, language, busy, retrieve }: {
  value?: MandateSummary | null; language: Language; busy: boolean; retrieve: () => void;
}) {
  const t = mandateLocales[language], [now, setNow] = useState(Date.now);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const status = value && (now >= Date.parse(value.expiresAt) ? 'expired' : value.status);
  return <Card>
    <CardHeader><CardTitle>{t.title}</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{t.help}</p>
      <Button variant="outline" disabled={busy} onClick={retrieve}><RefreshCw />{t.fetch}</Button>
      {!value ? <p className="text-sm text-muted-foreground">{t.empty}</p> : <>
        <p role="status"><Badge variant="outline">{t.status[status!]}</Badge></p>
        <p className="break-words text-sm">{t.revision} {value.revision} · {t.expires}{' '}
          <bdi>{new Intl.DateTimeFormat(language === 'ary' ? 'ar-MA' : language, { dateStyle: 'short', timeStyle: 'medium' }).format(Date.parse(value.expiresAt))}</bdi>
        </p>
        {value.config && <dl className="grid min-w-0 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div><dt className="text-muted-foreground">{t.targets}</dt><dd data-testid="mandate-target-count">{value.targetCount}</dd></div>
          <div><dt className="text-muted-foreground">{t.ranges}</dt><dd className="break-all" dir="ltr">{value.config.ranges.join(', ')}</dd></div>
          <div><dt className="text-muted-foreground">{t.exclusions}</dt><dd className="break-all" dir="ltr">{value.config.exclusions.join(', ') || '—'}</dd></div>
          <div><dt className="text-muted-foreground">{t.profile}</dt><dd className="break-all" dir="ltr">{value.config.credential_ref}</dd></div>
          <div><dt className="text-muted-foreground">{t.window}</dt><dd dir="ltr">{minute(value.config.start_minute)}–{minute(value.config.end_minute)} · {value.config.timezone}</dd></div>
          <div><dt className="text-muted-foreground">{t.cadence}</dt><dd>{value.config.interval_minutes}</dd></div>
        </dl>}
      </>}
    </CardContent>
  </Card>;
}
