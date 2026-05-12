import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, AlertCircle } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

type Sex = 'F' | 'M';

function ckdEpi2021(scrMgDl: number, ageYears: number, sex: Sex): number {
  // CKD-EPI 2021 (race-free) — Inker LA et al. NEJM 2021
  const k = sex === 'F' ? 0.7 : 0.9;
  const a = sex === 'F' ? -0.241 : -0.302;
  const sexFactor = sex === 'F' ? 1.012 : 1.0;
  const min = Math.min(scrMgDl / k, 1);
  const max = Math.max(scrMgDl / k, 1);
  return 142 * Math.pow(min, a) * Math.pow(max, -1.200) * Math.pow(0.9938, ageYears) * sexFactor;
}

function stage(egfr: number): { label: string; tone: 'success' | 'warning' | 'destructive' } {
  if (egfr >= 90) return { label: 'G1 — Normal ou alto', tone: 'success' };
  if (egfr >= 60) return { label: 'G2 — Levemente diminuído', tone: 'success' };
  if (egfr >= 45) return { label: 'G3a — Leve a moderado', tone: 'warning' };
  if (egfr >= 30) return { label: 'G3b — Moderado a grave', tone: 'warning' };
  if (egfr >= 15) return { label: 'G4 — Grave', tone: 'destructive' };
  return { label: 'G5 — Falência renal', tone: 'destructive' };
}

export function CKDEPI2021Calculator() {
  const [scr, setScr] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState<Sex>('F');
  const [result, setResult] = useState<{ egfr: number; stage: ReturnType<typeof stage> } | null>(null);

  const calculate = () => {
    const s = parseFloat(scr);
    const a = parseFloat(age);
    if (!s || !a || s <= 0 || a <= 0) return;
    const egfr = ckdEpi2021(s, a, sex);
    const st = stage(egfr);
    setResult({ egfr, stage: st });
    addToHistory({ calculatorId: 'ckd-epi-2021', score: Math.round(egfr), inputs: { scr: s, age: a, sex } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CKD-EPI 2021 (eGFR)</CardTitle>
        <CardDescription>Estimativa da TFG sem coeficiente racial — Inker LA et al. NEJM 2021</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Creatinina sérica (mg/dL)</Label>
            <Input type="number" step="0.01" min="0" value={scr} onChange={(e) => setScr(e.target.value)} placeholder="ex: 1.10" />
          </div>
          <div className="space-y-2">
            <Label>Idade (anos)</Label>
            <Input type="number" min="0" value={age} onChange={(e) => setAge(e.target.value)} placeholder="ex: 55" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Sexo biológico</Label>
          <RadioGroup value={sex} onValueChange={(v) => setSex(v as Sex)} className="flex gap-6">
            <div className="flex items-center gap-2"><RadioGroupItem value="F" id="ckd-f" /><Label htmlFor="ckd-f" className="cursor-pointer">Feminino</Label></div>
            <div className="flex items-center gap-2"><RadioGroupItem value="M" id="ckd-m" /><Label htmlFor="ckd-m" className="cursor-pointer">Masculino</Label></div>
          </RadioGroup>
        </div>

        <Button onClick={calculate} className="gap-2"><Calculator className="h-4 w-4" />Calcular eGFR</Button>

        {result && (
          <Alert className={
            result.stage.tone === 'success' ? 'border-success bg-success/10' :
            result.stage.tone === 'warning' ? 'border-warning bg-warning/10' :
            'border-destructive bg-destructive/10'
          }>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="text-2xl font-bold">{result.egfr.toFixed(1)} <span className="text-base font-normal text-muted-foreground">mL/min/1.73m²</span></p>
              <p className="font-medium mt-1">Estágio KDIGO: {result.stage.label}</p>
            </AlertDescription>
          </Alert>
        )}

        <p className="text-xs text-muted-foreground">
          Fórmula: 142 × min(Scr/κ,1)^α × max(Scr/κ,1)^(-1.200) × 0.9938^idade × (1.012 se feminino).
          Fonte: Inker LA et al. New Creatinine- and Cystatin C–Based Equations to Estimate GFR without Race. N Engl J Med 2021;385:1737-1749.
        </p>
      </CardContent>
    </Card>
  );
}
