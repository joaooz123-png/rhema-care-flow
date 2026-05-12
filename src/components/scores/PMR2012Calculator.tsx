import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

interface Item { id: string; label: string; points: number; }

const ITEMS: Item[] = [
  { id: 'morning_stiffness', label: 'Rigidez matinal > 45 minutos', points: 2 },
  { id: 'hip_pain', label: 'Dor ou amplitude reduzida em quadril', points: 1 },
  { id: 'rf_negative', label: 'Fator reumatoide e anti-CCP negativos', points: 2 },
  { id: 'no_other_joints', label: 'Ausência de envolvimento de outras articulações periféricas', points: 1 },
];

const US_ITEMS: Item[] = [
  { id: 'us_shoulder', label: 'US: ≥1 ombro com bursite subdeltoidea, tenossinovite bicipital ou sinovite glenoumeral E ≥1 quadril com sinovite ou bursite trocantérica', points: 1 },
  { id: 'us_bilateral', label: 'US: ambos ombros com bursite subdeltoidea, tenossinovite bicipital ou sinovite glenoumeral', points: 1 },
];

export function PMR2012Calculator() {
  const [entryAge, setEntryAge] = useState(true);
  const [entryShoulder, setEntryShoulder] = useState(true);
  const [entryAcutePhase, setEntryAcutePhase] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [useUs, setUseUs] = useState(false);
  const [result, setResult] = useState<{ score: number; classifies: boolean; threshold: number } | null>(null);

  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const calculate = () => {
    const all = [...ITEMS, ...(useUs ? US_ITEMS : [])];
    const score = all.filter(i => selected.has(i.id)).reduce((sum, i) => sum + i.points, 0);
    const threshold = useUs ? 5 : 4;
    const entry = entryAge && entryShoulder && entryAcutePhase;
    const classifies = entry && score >= threshold;
    setResult({ score, classifies, threshold });
    addToHistory({ calculatorId: 'pmr-2012', score, inputs: { useUs: useUs ? 'us' : 'clinical', criteria: Array.from(selected).join(',') } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Critérios PMR 2012 (EULAR/ACR)</CardTitle>
        <CardDescription>Classificação de Polimialgia Reumática — Dasgupta et al. 2012</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 p-4 rounded-lg bg-muted/30">
          <p className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">Critérios obrigatórios de entrada</p>
          {[
            { v: entryAge, set: setEntryAge, l: 'Idade ≥ 50 anos' },
            { v: entryShoulder, set: setEntryShoulder, l: 'Dor bilateral em ombros' },
            { v: entryAcutePhase, set: setEntryAcutePhase, l: 'VHS e/ou PCR elevados' },
          ].map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <Checkbox checked={c.v} onCheckedChange={(v) => c.set(v === true)} />
              <Label className="cursor-pointer">{c.l}</Label>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">Critérios pontuáveis</p>
          {ITEMS.map(i => (
            <div key={i.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
              <Checkbox checked={selected.has(i.id)} onCheckedChange={() => toggle(i.id)} />
              <Label className="cursor-pointer flex-1">{i.label}</Label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">+{i.points}</span>
            </div>
          ))}

          <div className="flex items-center gap-2 mt-4 pt-3 border-t">
            <Checkbox checked={useUs} onCheckedChange={(v) => setUseUs(v === true)} />
            <Label className="cursor-pointer text-sm font-medium">Incluir critérios de ultrassonografia (limite ≥5 ao invés de ≥4)</Label>
          </div>

          {useUs && US_ITEMS.map(i => (
            <div key={i.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 ml-6">
              <Checkbox checked={selected.has(i.id)} onCheckedChange={() => toggle(i.id)} />
              <Label className="cursor-pointer flex-1 text-sm">{i.label}</Label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">+{i.points}</span>
            </div>
          ))}
        </div>

        <Button onClick={calculate} className="gap-2"><Calculator className="h-4 w-4" />Avaliar</Button>

        {result && (
          <Alert className={result.classifies ? 'border-success bg-success/10' : ''}>
            {result.classifies ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>
              <p className="text-2xl font-bold">{result.score} <span className="text-base font-normal text-muted-foreground">/ {useUs ? 8 : 6} pts</span></p>
              <p className={`font-medium ${result.classifies ? 'text-success' : ''}`}>
                {result.classifies ? `Classifica PMR (≥${result.threshold})` : `Não classifica (necessita ≥${result.threshold} + critérios de entrada)`}
              </p>
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">Fonte: Dasgupta B et al. Ann Rheum Dis 2012;71:484-92.</p>
      </CardContent>
    </Card>
  );
}
