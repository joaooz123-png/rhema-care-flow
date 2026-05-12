import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, AlertCircle } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

// APACHE II — Knaus WA et al. Crit Care Med 1985;13:818-29.
// Returns 0–4 by clinical band.

function pickBand(value: number, bands: Array<{ min: number; max: number; pts: number }>): number {
  for (const b of bands) {
    if (value >= b.min && value <= b.max) return b.pts;
  }
  return 0;
}

function tempPts(t: number) {
  if (t >= 41) return 4;
  if (t >= 39) return 3;
  if (t >= 38.5) return 1;
  if (t >= 36) return 0;
  if (t >= 34) return 1;
  if (t >= 32) return 2;
  if (t >= 30) return 3;
  return 4;
}
function mapPts(m: number) {
  if (m >= 160) return 4;
  if (m >= 130) return 3;
  if (m >= 110) return 2;
  if (m >= 70) return 0;
  if (m >= 50) return 2;
  return 4;
}
function hrPts(h: number) {
  if (h >= 180) return 4;
  if (h >= 140) return 3;
  if (h >= 110) return 2;
  if (h >= 70) return 0;
  if (h >= 55) return 2;
  if (h >= 40) return 3;
  return 4;
}
function rrPts(r: number) {
  if (r >= 50) return 4;
  if (r >= 35) return 3;
  if (r >= 25) return 1;
  if (r >= 12) return 0;
  if (r >= 10) return 1;
  if (r >= 6) return 2;
  return 4;
}
function oxyPts(fio2: number, paO2: number, aaDO2: number) {
  if (fio2 >= 0.5) {
    if (aaDO2 >= 500) return 4;
    if (aaDO2 >= 350) return 3;
    if (aaDO2 >= 200) return 2;
    return 0;
  } else {
    if (paO2 > 70) return 0;
    if (paO2 >= 61) return 1;
    if (paO2 >= 55) return 3;
    return 4;
  }
}
function phPts(ph: number) {
  if (ph >= 7.7) return 4;
  if (ph >= 7.6) return 3;
  if (ph >= 7.5) return 1;
  if (ph >= 7.33) return 0;
  if (ph >= 7.25) return 2;
  if (ph >= 7.15) return 3;
  return 4;
}
function naPts(n: number) {
  if (n >= 180) return 4;
  if (n >= 160) return 3;
  if (n >= 155) return 2;
  if (n >= 150) return 1;
  if (n >= 130) return 0;
  if (n >= 120) return 2;
  if (n >= 111) return 3;
  return 4;
}
function kPts(k: number) {
  if (k >= 7) return 4;
  if (k >= 6) return 3;
  if (k >= 5.5) return 1;
  if (k >= 3.5) return 0;
  if (k >= 3) return 1;
  if (k >= 2.5) return 2;
  return 4;
}
function crPts(c: number, akf: boolean) {
  let p = 0;
  if (c >= 3.5) p = 4;
  else if (c >= 2) p = 3;
  else if (c >= 1.5) p = 2;
  else if (c >= 0.6) p = 0;
  else p = 2;
  return akf ? p * 2 : p;
}
function htcPts(h: number) {
  if (h >= 60) return 4;
  if (h >= 50) return 2;
  if (h >= 46) return 1;
  if (h >= 30) return 0;
  if (h >= 20) return 2;
  return 4;
}
function wbcPts(w: number) {
  if (w >= 40) return 4;
  if (w >= 20) return 2;
  if (w >= 15) return 1;
  if (w >= 3) return 0;
  if (w >= 1) return 2;
  return 4;
}
function agePts(a: number) {
  if (a <= 44) return 0;
  if (a <= 54) return 2;
  if (a <= 64) return 3;
  if (a <= 74) return 5;
  return 6;
}

function mortality(s: number, postopNonElective: boolean) {
  // Approximate mortality bands from Knaus 1985
  if (s <= 4) return '~4%';
  if (s <= 9) return '~8%';
  if (s <= 14) return postopNonElective ? '~15%' : '~15%';
  if (s <= 19) return '~25%';
  if (s <= 24) return '~40%';
  if (s <= 29) return '~55%';
  if (s <= 34) return '~73%';
  return '~85%';
}

export function APACHEIICalculator() {
  const [v, setV] = useState({
    temp: '', map: '', hr: '', rr: '', fio2: '0.21', paO2: '', aaDO2: '',
    ph: '', na: '', k: '', cr: '', htc: '', wbc: '', gcs: '15', age: '',
  });
  const [akf, setAkf] = useState(false);
  const [chronic, setChronic] = useState(false);
  const [admType, setAdmType] = useState<'medical' | 'postop_emergency' | 'postop_elective'>('medical');
  const [result, setResult] = useState<{ aps: number; total: number; mort: string } | null>(null);

  const calc = () => {
    const num = (k: keyof typeof v) => parseFloat(v[k]);
    const fio2 = num('fio2');
    const aps =
      tempPts(num('temp')) +
      mapPts(num('map')) +
      hrPts(num('hr')) +
      rrPts(num('rr')) +
      oxyPts(fio2, num('paO2'), num('aaDO2')) +
      phPts(num('ph')) +
      naPts(num('na')) +
      kPts(num('k')) +
      crPts(num('cr'), akf) +
      htcPts(num('htc')) +
      wbcPts(num('wbc')) +
      (15 - (parseFloat(v.gcs) || 15));
    let chronicPts = 0;
    if (chronic) chronicPts = admType === 'postop_elective' ? 2 : 5;
    const total = aps + agePts(num('age')) + chronicPts;
    const mort = mortality(total, admType === 'postop_emergency');
    setResult({ aps, total, mort });
    addToHistory({ calculatorId: 'apache-ii', score: total, inputs: { aps, age: v.age, chronic: chronic ? 'yes' : 'no', admType } });
  };

  const F = (key: keyof typeof v, label: string, step = 'any') => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type="number" step={step} value={v[key]} onChange={(e) => setV({ ...v, [key]: e.target.value })} className="h-9" />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>APACHE II</CardTitle>
        <CardDescription>Acute Physiology And Chronic Health Evaluation II — Knaus WA et al. 1985</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-2">Variáveis fisiológicas (piores valores em 24 h)</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {F('temp', 'Temperatura retal (°C)')}
            {F('map', 'PAM (mmHg)')}
            {F('hr', 'FC (bpm)')}
            {F('rr', 'FR (irpm)')}
            {F('fio2', 'FiO₂ (0.21–1.0)')}
            {F('paO2', 'PaO₂ (mmHg, se FiO₂<0.5)')}
            {F('aaDO2', 'A-aDO₂ (mmHg, se FiO₂≥0.5)')}
            {F('ph', 'pH arterial')}
            {F('na', 'Sódio (mEq/L)')}
            {F('k', 'Potássio (mEq/L)')}
            {F('cr', 'Creatinina (mg/dL)')}
            {F('htc', 'Hematócrito (%)')}
            {F('wbc', 'Leucócitos (×10³/mm³)')}
            {F('gcs', 'Glasgow (3–15)')}
            {F('age', 'Idade (anos)')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="akf" checked={akf} onCheckedChange={(x) => setAkf(x === true)} />
          <Label htmlFor="akf" className="cursor-pointer">Insuficiência renal aguda (dobra os pontos da creatinina)</Label>
        </div>

        <div className="space-y-2 p-3 rounded-lg bg-muted/30">
          <Label className="text-sm font-semibold">Doença crônica grave (cirrose, NYHA IV, DPOC grave, diálise, imunossupressão)</Label>
          <div className="flex items-center gap-2">
            <Checkbox id="chronic" checked={chronic} onCheckedChange={(x) => setChronic(x === true)} />
            <Label htmlFor="chronic" className="cursor-pointer">Sim</Label>
          </div>
          {chronic && (
            <RadioGroup value={admType} onValueChange={(x) => setAdmType(x as typeof admType)} className="flex flex-col gap-1 pt-1">
              <div className="flex items-center gap-2"><RadioGroupItem value="medical" id="adm-m" /><Label htmlFor="adm-m" className="cursor-pointer text-sm">Clínico (+5)</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="postop_emergency" id="adm-pe" /><Label htmlFor="adm-pe" className="cursor-pointer text-sm">Pós-op de emergência (+5)</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="postop_elective" id="adm-po" /><Label htmlFor="adm-po" className="cursor-pointer text-sm">Pós-op eletivo (+2)</Label></div>
            </RadioGroup>
          )}
        </div>

        <Button onClick={calc} className="gap-2"><Calculator className="h-4 w-4" />Calcular APACHE II</Button>

        {result && (
          <Alert className={result.total >= 25 ? 'border-destructive bg-destructive/10' : result.total >= 15 ? 'border-warning bg-warning/10' : 'border-success bg-success/10'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="text-2xl font-bold">{result.total} pts</p>
              <p className="text-sm">APS: {result.aps} • Mortalidade hospitalar estimada: <strong>{result.mort}</strong></p>
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">
          Knaus WA, Draper EA, Wagner DP, Zimmerman JE. APACHE II: a severity of disease classification system. Crit Care Med 1985;13(10):818-29.
          Mortalidade aproximada — usar com julgamento clínico.
        </p>
      </CardContent>
    </Card>
  );
}
