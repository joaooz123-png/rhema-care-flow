import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, AlertCircle } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

// BASMI (linear) — Jenkinson TR et al. J Rheumatol 1994; van der Heijde D et al. J Rheumatol 2008.
// 5 medições, cada uma 0–10 (linear); BASMI = média dos 5.

interface Measure {
  id: string;
  label: string;
  unit: string;
  // Linear formula coefficients: clamp(score(value)) → 0..10
  toScore: (v: number) => number;
  hint: string;
}

// Linear BASMI scoring per van der Heijde 2008 (formulas approx.):
// Tragus-to-wall: ((cm - 15) / (35-15)) * 10
// Lumbar flexion (modified Schober): ((7 - cm) / (7-1)) * 10
// Cervical rotation (mean degrees): ((85 - deg) / (85-10)) * 10
// Lumbar side flexion (cm): ((20 - cm) / (20-0)) * 10
// Intermalleolar distance (cm): ((120 - cm) / (120-30)) * 10

function clamp(v: number) { return Math.max(0, Math.min(10, v)); }

const MEASURES: Measure[] = [
  { id: 'tragus', label: 'Distância Tragus-Parede', unit: 'cm',
    toScore: v => clamp(((v - 15) / (35 - 15)) * 10),
    hint: 'Maior valor entre os dois lados. ≤15 cm = 0 pts; ≥35 cm = 10 pts.' },
  { id: 'schober', label: 'Flexão lombar (Schober modificado)', unit: 'cm',
    toScore: v => clamp(((7 - v) / (7 - 1)) * 10),
    hint: 'Diferença entre marcação supra e infra-L5 após flexão. ≥7 cm = 0; ≤1 cm = 10.' },
  { id: 'cervRot', label: 'Rotação cervical (média)', unit: '°',
    toScore: v => clamp(((85 - v) / (85 - 10)) * 10),
    hint: 'Média da rotação direita e esquerda. ≥85° = 0; ≤10° = 10.' },
  { id: 'sideFlex', label: 'Flexão lateral lombar (média)', unit: 'cm',
    toScore: v => clamp(((20 - v) / (20 - 0)) * 10),
    hint: 'Diferença na ponta do dedo médio antes e depois. ≥20 cm = 0; 0 cm = 10.' },
  { id: 'intermall', label: 'Distância intermaleolar', unit: 'cm',
    toScore: v => clamp(((120 - v) / (120 - 30)) * 10),
    hint: 'Abdução máxima dos quadris em decúbito dorsal. ≥120 cm = 0; ≤30 cm = 10.' },
];

function category(s: number) {
  if (s < 2) return { label: 'Mobilidade preservada', tone: 'success' as const };
  if (s < 4) return { label: 'Limitação leve', tone: 'success' as const };
  if (s < 7) return { label: 'Limitação moderada', tone: 'warning' as const };
  return { label: 'Limitação grave', tone: 'destructive' as const };
}

export function BASMICalculator() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ basmi: number; per: Record<string, number>; cat: ReturnType<typeof category> } | null>(null);

  const calculate = () => {
    const per: Record<string, number> = {};
    let sum = 0;
    let count = 0;
    for (const m of MEASURES) {
      const raw = parseFloat(values[m.id]);
      if (isNaN(raw)) return;
      const s = m.toScore(raw);
      per[m.id] = s;
      sum += s;
      count++;
    }
    if (count !== MEASURES.length) return;
    const basmi = sum / count;
    const cat = category(basmi);
    setResult({ basmi, per, cat });
    addToHistory({ calculatorId: 'basmi', score: parseFloat(basmi.toFixed(1)), inputs: values });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>BASMI — Bath Ankylosing Spondylitis Metrology Index</CardTitle>
        <CardDescription>Mobilidade axial em espondiloartrite (versão linear) — van der Heijde D et al. 2008</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {MEASURES.map(m => (
          <div key={m.id} className="space-y-1.5 p-3 rounded-lg bg-muted/20">
            <Label className="text-sm font-semibold">{m.label} ({m.unit})</Label>
            <Input
              type="number"
              step="0.1"
              value={values[m.id] || ''}
              onChange={(e) => setValues({ ...values, [m.id]: e.target.value })}
              placeholder={m.unit}
              className="h-9"
            />
            <p className="text-xs text-muted-foreground">{m.hint}</p>
            {result && result.per[m.id] !== undefined && (
              <p className="text-xs font-medium text-primary">Pontuação parcial: {result.per[m.id].toFixed(1)} / 10</p>
            )}
          </div>
        ))}

        <Button onClick={calculate} className="gap-2"><Calculator className="h-4 w-4" />Calcular BASMI</Button>

        {result && (
          <Alert className={
            result.cat.tone === 'success' ? 'border-success bg-success/10' :
            result.cat.tone === 'warning' ? 'border-warning bg-warning/10' :
            'border-destructive bg-destructive/10'
          }>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="text-2xl font-bold">{result.basmi.toFixed(1)} <span className="text-base font-normal text-muted-foreground">/ 10</span></p>
              <p className="font-medium">{result.cat.label}</p>
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">
          Fonte: van der Heijde D et al. ASAS recommendations. J Rheumatol 2008. BASMI linear é o método recomendado pela ASAS.
        </p>
      </CardContent>
    </Card>
  );
}
