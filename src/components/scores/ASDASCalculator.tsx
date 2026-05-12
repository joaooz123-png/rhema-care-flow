import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, Info } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

type Variant = 'crp' | 'esr';

export function ASDASCalculator() {
  const [variant, setVariant] = useState<Variant>('crp');
  const [backPain, setBackPain] = useState('');
  const [duration, setDuration] = useState('');
  const [pga, setPga] = useState('');
  const [peripheral, setPeripheral] = useState('');
  const [crp, setCrp] = useState('');
  const [esr, setEsr] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const bp = parseFloat(backPain);
    const dur = parseFloat(duration);
    const pg = parseFloat(pga);
    const per = parseFloat(peripheral);
    if ([bp, dur, pg, per].some(v => isNaN(v) || v < 0 || v > 10)) return;

    let score: number;
    if (variant === 'crp') {
      const c = parseFloat(crp);
      if (isNaN(c) || c < 0) return;
      // ASDAS-CRP = 0.12*BackPain + 0.06*Duration + 0.11*PGA + 0.07*Peripheral + 0.58*ln(CRP+1)
      score = 0.12 * bp + 0.06 * dur + 0.11 * pg + 0.07 * per + 0.58 * Math.log(c + 1);
    } else {
      const e = parseFloat(esr);
      if (isNaN(e) || e < 0) return;
      // ASDAS-ESR = 0.08*BackPain + 0.07*Duration + 0.11*PGA + 0.09*Peripheral + 0.29*sqrt(ESR)
      score = 0.08 * bp + 0.07 * dur + 0.11 * pg + 0.09 * per + 0.29 * Math.sqrt(e);
    }
    const rounded = Math.round(score * 100) / 100;
    setResult(rounded);
    addToHistory({ calculatorId: `asdas-${variant}`, score: rounded, inputs: { backPain, duration, pga, peripheral, crp, esr } });
  };

  const interpret = (s: number) => {
    if (s < 1.3) return { label: 'Doença inativa', color: 'text-success' };
    if (s < 2.1) return { label: 'Atividade baixa', color: 'text-primary' };
    if (s <= 3.5) return { label: 'Atividade alta', color: 'text-warning' };
    return { label: 'Atividade muito alta', color: 'text-destructive' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ASDAS — Ankylosing Spondylitis Disease Activity Score
          <Info className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
        <CardDescription>Atividade de espondiloartrite axial — variante CRP (preferencial) ou VHS</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={variant} onValueChange={(v) => { setVariant(v as Variant); setResult(null); }}>
          <TabsList className="grid grid-cols-2 w-full max-w-sm">
            <TabsTrigger value="crp">ASDAS-CRP</TabsTrigger>
            <TabsTrigger value="esr">ASDAS-VHS</TabsTrigger>
          </TabsList>
          <TabsContent value={variant} className="space-y-4 mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Dor lombar (0–10)</Label>
                <Input type="number" min={0} max={10} step="0.1" value={backPain} onChange={e => setBackPain(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Duração da rigidez matinal (0–10)</Label>
                <Input type="number" min={0} max={10} step="0.1" value={duration} onChange={e => setDuration(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Avaliação global do paciente (0–10)</Label>
                <Input type="number" min={0} max={10} step="0.1" value={pga} onChange={e => setPga(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Dor/edema periférico (0–10)</Label>
                <Input type="number" min={0} max={10} step="0.1" value={peripheral} onChange={e => setPeripheral(e.target.value)} />
              </div>
              {variant === 'crp' ? (
                <div className="space-y-1.5">
                  <Label>PCR (mg/L)</Label>
                  <Input type="number" min={0} step="0.1" value={crp} onChange={e => setCrp(e.target.value)} />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label>VHS (mm/h)</Label>
                  <Input type="number" min={0} step="1" value={esr} onChange={e => setEsr(e.target.value)} />
                </div>
              )}
            </div>
            <Button onClick={calculate} className="gap-2"><Calculator className="h-4 w-4" />Calcular</Button>
          </TabsContent>
        </Tabs>

        {result !== null && (
          <Alert>
            <AlertDescription className="space-y-1">
              <p className="text-2xl font-bold">{result.toFixed(2)}</p>
              <p className={`font-medium ${interpret(result).color}`}>{interpret(result).label}</p>
              <p className="text-xs text-muted-foreground">
                Cortes: &lt;1.3 inativo · 1.3–2.0 baixa · 2.1–3.5 alta · &gt;3.5 muito alta. Mudança clinicamente importante: ≥1.1; mudança maior: ≥2.0.
              </p>
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">Fonte: Lukas C et al. Ann Rheum Dis 2009; ASAS Handbook.</p>
      </CardContent>
    </Card>
  );
}
