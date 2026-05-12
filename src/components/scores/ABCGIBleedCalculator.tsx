import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, AlertCircle } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

// ABC score for upper GI bleed — Laursen SB et al. Gut 2021;70:707-716.
// Variables: Age, Urea, Creatinine, Albumin, Mental status, ASA grade.

interface State {
  age: string;
  urea: string;       // mmol/L
  creatinine: string; // µmol/L
  albumin: string;    // g/L
  alteredMental: boolean;
  asa: string;        // 1-5
}

function ageBand(a: number) {
  if (a >= 75) return 2;
  if (a >= 60) return 1;
  return 0;
}
function ureaBand(u: number) {
  if (u >= 10) return 1;
  return 0;
}
function creatBand(c: number) {
  if (c >= 150) return 2;
  if (c >= 100) return 1;
  return 0;
}
function albBand(a: number) {
  if (a < 30) return 2;
  return 0;
}
function asaBand(a: number) {
  if (a >= 4) return 3;
  if (a === 3) return 1;
  return 0;
}

function risk(score: number) {
  if (score <= 3) return { label: 'Baixo risco', mort: 'Mortalidade 30 dias < 1%', tone: 'success' as const };
  if (score <= 7) return { label: 'Risco médio', mort: 'Mortalidade 30 dias ~7%', tone: 'warning' as const };
  return { label: 'Alto risco', mort: 'Mortalidade 30 dias ~25%', tone: 'destructive' as const };
}

export function ABCGIBleedCalculator() {
  const [s, setS] = useState<State>({ age: '', urea: '', creatinine: '', albumin: '', alteredMental: false, asa: '1' });
  const [result, setResult] = useState<{ score: number; r: ReturnType<typeof risk> } | null>(null);

  const calc = () => {
    const age = parseFloat(s.age);
    const urea = parseFloat(s.urea);
    const cr = parseFloat(s.creatinine);
    const alb = parseFloat(s.albumin);
    const asa = parseInt(s.asa);
    if (!age || isNaN(urea) || isNaN(cr) || isNaN(alb) || !asa) return;
    const score = ageBand(age) + ureaBand(urea) + creatBand(cr) + albBand(alb) + (s.alteredMental ? 2 : 0) + asaBand(asa);
    const r = risk(score);
    setResult({ score, r });
    addToHistory({ calculatorId: 'abc-gi-bleed', score, inputs: { age, urea, cr, alb, asa, mental: s.alteredMental ? 'alt' : 'normal' } });
  };

  const F = (key: keyof State, label: string, placeholder?: string) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type="number" step="any" value={s[key] as string} onChange={(e) => setS({ ...s, [key]: e.target.value })} placeholder={placeholder} className="h-9" />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>ABC Score — Sangramento Gastrointestinal</CardTitle>
        <CardDescription>Predição de mortalidade em 30 dias para HDA e HDB — Laursen SB et al. Gut 2021</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {F('age', 'Idade (anos)')}
          {F('urea', 'Ureia (mmol/L)', 'mmol/L')}
          {F('creatinine', 'Creatinina (µmol/L)', 'µmol/L')}
          {F('albumin', 'Albumina (g/L)', 'g/L')}
          <div className="space-y-1">
            <Label className="text-xs">ASA (1–5)</Label>
            <Input type="number" min="1" max="5" value={s.asa} onChange={(e) => setS({ ...s, asa: e.target.value })} className="h-9" />
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
          <Checkbox id="mental" checked={s.alteredMental} onCheckedChange={(v) => setS({ ...s, alteredMental: v === true })} />
          <Label htmlFor="mental" className="cursor-pointer">Estado mental alterado (confusão, letargia, estupor, coma) — +2</Label>
        </div>

        <div className="text-xs text-muted-foreground space-y-1 p-3 rounded-lg bg-muted/20">
          <p><strong>Conversões úteis:</strong></p>
          <p>• Ureia: BUN (mg/dL) × 0.357 = ureia (mmol/L) — ou ureia (mg/dL) ÷ 6 ≈ mmol/L</p>
          <p>• Creatinina: mg/dL × 88.4 = µmol/L</p>
          <p>• Albumina: g/dL × 10 = g/L</p>
        </div>

        <Button onClick={calc} className="gap-2"><Calculator className="h-4 w-4" />Calcular ABC</Button>

        {result && (
          <Alert className={
            result.r.tone === 'success' ? 'border-success bg-success/10' :
            result.r.tone === 'warning' ? 'border-warning bg-warning/10' :
            'border-destructive bg-destructive/10'
          }>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="text-2xl font-bold">{result.score} pts</p>
              <p className="font-medium">{result.r.label}</p>
              <p className="text-sm">{result.r.mort}</p>
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">
          Laursen SB et al. ABC score: a new risk score that accurately predicts mortality in acute upper and lower gastrointestinal bleeding.
          Gut 2021;70:707-716. Bandas: 0–3 baixo, 4–7 médio, ≥8 alto risco.
        </p>
      </CardContent>
    </Card>
  );
}
