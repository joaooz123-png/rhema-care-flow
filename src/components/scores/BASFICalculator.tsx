import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

const QUESTIONS = [
  'Vestir-se, incluindo amarrar cadarços e abotoar',
  'Subir um lance de escada (12-15 degraus)',
  'Pegar e usar um saleiro/objeto pesado prateleira alta',
  'Abrir uma jarra nova (selada)',
  'Caminhar em terreno irregular',
  'Cuidados pessoais (banho, secar-se)',
  'Curvar-se para apanhar roupas do chão',
  'Realizar tarefas domésticas pesadas (esfregar chão)',
  'Atividades sociais ou recreativas',
  'Realizar atividades de tempo livre por ≥ 1 hora',
];

export function BASFICalculator() {
  const [values, setValues] = useState<number[]>(Array(10).fill(0));
  const [result, setResult] = useState<number | null>(null);

  const setVal = (idx: number, v: number) => {
    const next = [...values];
    next[idx] = v;
    setValues(next);
  };

  const calculate = () => {
    const total = values.reduce((s, v) => s + v, 0) / 10;
    const rounded = Math.round(total * 10) / 10;
    setResult(rounded);
    addToHistory({ calculatorId: 'basfi', score: rounded, inputs: Object.fromEntries(values.map((v, i) => [`q${i + 1}`, v])) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>BASFI — Bath Ankylosing Spondylitis Functional Index</CardTitle>
        <CardDescription>Capacidade funcional na espondiloartrite axial — 10 escalas 0–10</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-xs text-muted-foreground">Para cada atividade na última semana: 0 = fácil · 10 = impossível</p>
        {QUESTIONS.map((q, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-baseline">
              <Label className="text-sm">{i + 1}. {q}</Label>
              <span className="text-sm font-semibold tabular-nums">{values[i].toFixed(1)}</span>
            </div>
            <Slider value={[values[i]]} onValueChange={([v]) => setVal(i, v)} min={0} max={10} step={0.1} />
          </div>
        ))}

        <Button onClick={calculate} className="gap-2"><Calculator className="h-4 w-4" />Calcular BASFI</Button>

        {result !== null && (
          <Alert>
            <AlertDescription>
              <p className="text-3xl font-bold">{result.toFixed(1)} <span className="text-base font-normal text-muted-foreground">/ 10</span></p>
              <p className="text-xs text-muted-foreground mt-1">
                Média das 10 escalas. Valores mais altos indicam pior capacidade funcional. Mudança clinicamente importante: ~ 1 ponto.
              </p>
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">Fonte: Calin A et al. J Rheumatol 1994;21:2281-5.</p>
      </CardContent>
    </Card>
  );
}
