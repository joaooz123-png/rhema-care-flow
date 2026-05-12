import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, AlertCircle } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

// RAPID3 — Pincus T et al. J Rheumatol 2008.
// MDHAQ-derived: Function (0–10), Pain (0–10), PGA (0–10) → soma 0–30.
// Categorias: ≤3 quase remissão; 3.1–6 baixa; 6.1–12 moderada; >12 alta.

const FUNCTION_ITEMS = [
  'Vestir-se sozinho, incluindo amarrar cadarços',
  'Entrar e sair da cama',
  'Levar copo cheio aos lábios',
  'Caminhar ao ar livre em terreno plano',
  'Lavar e secar todo o corpo',
  'Curvar-se e apanhar roupa do chão',
  'Abrir e fechar torneiras',
  'Entrar e sair de um carro/ônibus/trem',
  'Caminhar 2 km',
  'Praticar esportes ou atividades físicas como gostaria',
];
// Each item 0–3, total 0–30 → ÷10 → 0–3, then ×10/3 to bring to 0–10? Pincus uses simpler:
// Function score: sum of 10 items × 0.33 (or sum/30 × 10) → 0–10.

const SCALE = [
  { v: 0, l: 'Sem dificuldade' },
  { v: 1, l: 'Pouca' },
  { v: 2, l: 'Muita' },
  { v: 3, l: 'Incapaz' },
];

export function RAPID3Calculator() {
  const [funcScores, setFuncScores] = useState<Record<number, number>>({});
  const [pain, setPain] = useState(0);
  const [pga, setPga] = useState(0);
  const [result, setResult] = useState<{ funcScore: number; total: number; cat: string; tone: 'success' | 'warning' | 'destructive' } | null>(null);

  const calculate = () => {
    const fnScores = FUNCTION_ITEMS.map((_, i) => funcScores[i] ?? 0);
    const sumFn = fnScores.reduce((a, b) => a + b, 0); // 0–30
    const funcScore = sumFn / 3; // → 0–10
    const total = funcScore + pain + pga; // 0–30
    let cat = '', tone: 'success' | 'warning' | 'destructive' = 'success';
    if (total <= 3) { cat = 'Quase remissão (≤3)'; tone = 'success'; }
    else if (total <= 6) { cat = 'Baixa atividade (3,1–6)'; tone = 'success'; }
    else if (total <= 12) { cat = 'Atividade moderada (6,1–12)'; tone = 'warning'; }
    else { cat = 'Atividade alta (>12)'; tone = 'destructive'; }
    setResult({ funcScore, total, cat, tone });
    addToHistory({ calculatorId: 'rapid3', score: parseFloat(total.toFixed(1)), inputs: { funcScore: funcScore.toFixed(1), pain, pga } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>RAPID3 — Routine Assessment of Patient Index Data 3</CardTitle>
        <CardDescription>Atividade da AR avaliada pelo paciente — Pincus T et al. J Rheumatol 2008</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2 p-3 rounded-lg bg-muted/20">
          <p className="text-sm font-semibold">Função física (10 atividades, na semana passada)</p>
          {FUNCTION_ITEMS.map((item, i) => (
            <div key={i} className="space-y-1">
              <Label className="text-sm">{item}</Label>
              <div className="flex flex-wrap gap-2">
                {SCALE.map(s => (
                  <Button
                    key={s.v}
                    type="button"
                    size="sm"
                    variant={funcScores[i] === s.v ? 'default' : 'outline'}
                    onClick={() => setFuncScores({ ...funcScores, [i]: s.v })}
                    className="h-7 text-xs"
                  >
                    {s.v} — {s.l}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 p-3 rounded-lg bg-muted/20">
          <Label className="text-sm font-semibold">Dor nos últimos 7 dias (0 = sem dor; 10 = pior dor): {pain}</Label>
          <Slider value={[pain]} min={0} max={10} step={0.5} onValueChange={(v) => setPain(v[0])} />
        </div>

        <div className="space-y-2 p-3 rounded-lg bg-muted/20">
          <Label className="text-sm font-semibold">Avaliação global do paciente (PGA, 0–10): {pga}</Label>
          <Slider value={[pga]} min={0} max={10} step={0.5} onValueChange={(v) => setPga(v[0])} />
        </div>

        <Button onClick={calculate} className="gap-2"><Calculator className="h-4 w-4" />Calcular RAPID3</Button>

        {result && (
          <Alert className={
            result.tone === 'success' ? 'border-success bg-success/10' :
            result.tone === 'warning' ? 'border-warning bg-warning/10' :
            'border-destructive bg-destructive/10'
          }>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="text-2xl font-bold">{result.total.toFixed(1)} <span className="text-base font-normal text-muted-foreground">/ 30</span></p>
              <p className="text-sm">Função: {result.funcScore.toFixed(1)} • Dor: {pain} • PGA: {pga}</p>
              <p className="font-medium mt-1">{result.cat}</p>
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">Pincus T et al. RAPID3 (Routine Assessment of Patient Index Data 3). J Rheumatol 2008.</p>
      </CardContent>
    </Card>
  );
}
