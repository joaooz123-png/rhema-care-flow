import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

export function BooleanRemissionCalculator() {
  const [tjc, setTjc] = useState('');
  const [sjc, setSjc] = useState('');
  const [crp, setCrp] = useState('');
  const [pga, setPga] = useState('');
  const [variant, setVariant] = useState<'2011' | '2022'>('2022');
  const [result, setResult] = useState<{ remission: boolean; failed: string[] } | null>(null);

  const calculate = () => {
    const t = parseFloat(tjc);
    const s = parseFloat(sjc);
    const c = parseFloat(crp);
    const p = parseFloat(pga);
    if ([t, s, c, p].some(v => isNaN(v) || v < 0)) return;

    const failed: string[] = [];
    if (t > 1) failed.push('TJC28 > 1');
    if (s > 1) failed.push('SJC28 > 1');
    if (c > 1) failed.push('PCR > 1 mg/dL');
    const pgaThreshold = variant === '2022' ? 2 : 1;
    if (p > pgaThreshold) failed.push(`PGA > ${pgaThreshold} cm`);

    const remission = failed.length === 0;
    setResult({ remission, failed });
    addToHistory({ calculatorId: 'boolean-remission', score: remission ? 1 : 0, inputs: { tjc, sjc, crp, pga, variant } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Boolean Remission ACR/EULAR — AR</CardTitle>
        <CardDescription>Remissão por critérios booleanos em artrite reumatoide (Felson et al. 2011 / atualização 2022)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button variant={variant === '2011' ? 'default' : 'outline'} size="sm" onClick={() => { setVariant('2011'); setResult(null); }}>2011 (PGA ≤ 1)</Button>
          <Button variant={variant === '2022' ? 'default' : 'outline'} size="sm" onClick={() => { setVariant('2022'); setResult(null); }}>2022 (PGA ≤ 2)</Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Articulações dolorosas (TJC28)</Label>
            <Input type="number" min={0} max={28} value={tjc} onChange={e => setTjc(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Articulações edemaciadas (SJC28)</Label>
            <Input type="number" min={0} max={28} value={sjc} onChange={e => setSjc(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>PCR (mg/dL)</Label>
            <Input type="number" min={0} step="0.1" value={crp} onChange={e => setCrp(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Avaliação global do paciente (PGA, escala 0–10 cm)</Label>
            <Input type="number" min={0} max={10} step="0.1" value={pga} onChange={e => setPga(e.target.value)} />
          </div>
        </div>

        <Button onClick={calculate} className="gap-2"><Calculator className="h-4 w-4" />Avaliar remissão</Button>

        {result && (
          <Alert className={result.remission ? 'border-success bg-success/10' : ''}>
            {result.remission ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>
              <p className={`text-lg font-bold ${result.remission ? 'text-success' : ''}`}>
                {result.remission ? 'Em remissão (Boolean)' : 'Não em remissão'}
              </p>
              {!result.remission && (
                <p className="text-sm text-muted-foreground mt-1">Critérios não atingidos: {result.failed.join(' · ')}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Todos os 4 critérios devem ser ≤ limite simultaneamente. PGA: 0–10 cm em escala visual analógica.
              </p>
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">Fonte: Felson DT et al. Ann Rheum Dis 2011;70:404-13. Studenic P et al. Ann Rheum Dis 2023 (atualização PGA ≤ 2).</p>
      </CardContent>
    </Card>
  );
}
