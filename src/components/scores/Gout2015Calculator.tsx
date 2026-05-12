import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

interface Domain { id: string; label: string; options: { label: string; points: number }[]; }

const DOMAINS: Domain[] = [
  {
    id: 'pattern', label: 'Padrão de envolvimento articular',
    options: [
      { label: 'Tornozelo, ou MTF, ou interfalângica', points: 1 },
      { label: '1ª MTF (podagra)', points: 2 },
      { label: 'Outro padrão', points: 0 },
    ]
  },
  {
    id: 'episode_chars', label: 'Características do episódio (eritema, dor severa, dificuldade ao caminhar)',
    options: [
      { label: '1 característica', points: 1 },
      { label: '2 características', points: 2 },
      { label: '3 características', points: 3 },
      { label: 'Nenhuma', points: 0 },
    ]
  },
  {
    id: 'time_course', label: 'Curso temporal (≥2 episódios típicos: pico em <24h, resolução em ≤14d, retorno completo entre crises)',
    options: [
      { label: '1 episódio típico', points: 1 },
      { label: 'Episódios recorrentes (≥2)', points: 2 },
      { label: 'Nenhum episódio típico', points: 0 },
    ]
  },
  {
    id: 'tophus', label: 'Evidência clínica de tofo',
    options: [
      { label: 'Presente', points: 4 },
      { label: 'Ausente', points: 0 },
    ]
  },
  {
    id: 'urate', label: 'Ácido úrico sérico (mg/dL)',
    options: [
      { label: '< 4', points: -4 },
      { label: '4 a < 6', points: 0 },
      { label: '6 a < 8', points: 2 },
      { label: '8 a < 10', points: 3 },
      { label: '≥ 10', points: 4 },
    ]
  },
  {
    id: 'synovial', label: 'Análise de líquido sinovial (microscopia polarizada)',
    options: [
      { label: 'Negativa para urato monossódico', points: -2 },
      { label: 'Não realizada', points: 0 },
    ]
  },
  {
    id: 'imaging_dual', label: 'Imagem: dupla energia TC ou US com sinal de duplo contorno',
    options: [
      { label: 'Presente', points: 4 },
      { label: 'Ausente / não realizada', points: 0 },
    ]
  },
  {
    id: 'imaging_erosion', label: 'Imagem: erosão típica de gota (radiografia)',
    options: [
      { label: 'Presente', points: 4 },
      { label: 'Ausente / não realizada', points: 0 },
    ]
  },
];

export function Gout2015Calculator() {
  const [entryEpisode, setEntryEpisode] = useState(true);
  const [crystalProven, setCrystalProven] = useState(false);
  const [values, setValues] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; classifies: boolean; suff: boolean } | null>(null);

  const setVal = (id: string, points: number) => setValues({ ...values, [id]: points });

  const calculate = () => {
    const score = Object.values(values).reduce((s, v) => s + v, 0);
    const classifies = entryEpisode && (crystalProven || score >= 8);
    setResult({ score, classifies, suff: crystalProven });
    addToHistory({ calculatorId: 'acr-eular-gout', score, inputs: { crystalProven: crystalProven ? 'yes' : 'no' } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Critérios Gota 2015 ACR/EULAR</CardTitle>
        <CardDescription>Classificação de gota — Neogi T et al. 2015</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 p-4 rounded-lg bg-muted/30">
          <p className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">Entrada</p>
          <div className="flex items-start gap-2">
            <Checkbox checked={entryEpisode} onCheckedChange={(v) => setEntryEpisode(v === true)} />
            <Label className="cursor-pointer text-sm">≥1 episódio de edema, dor ou sensibilidade em articulação periférica ou bursa</Label>
          </div>
          <p className="text-sm font-semibold uppercase text-muted-foreground tracking-wide pt-2">Critério suficiente</p>
          <div className="flex items-start gap-2">
            <Checkbox checked={crystalProven} onCheckedChange={(v) => setCrystalProven(v === true)} />
            <Label className="cursor-pointer text-sm">Cristais de urato monossódico em líquido sinovial ou tofo (classifica imediatamente, dispensa pontuação)</Label>
          </div>
        </div>

        {!crystalProven && (
          <div className="space-y-4">
            {DOMAINS.map(d => (
              <div key={d.id} className="space-y-2">
                <Label className="text-sm font-medium">{d.label}</Label>
                <RadioGroup value={String(values[d.id] ?? '')} onValueChange={(v) => setVal(d.id, parseInt(v))}>
                  {d.options.map((o, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <RadioGroupItem value={String(o.points)} id={`${d.id}-${idx}`} />
                      <Label htmlFor={`${d.id}-${idx}`} className="cursor-pointer text-sm font-normal">
                        {o.label} <span className="text-xs text-muted-foreground">({o.points >= 0 ? '+' : ''}{o.points})</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
        )}

        <Button onClick={calculate} className="gap-2"><Calculator className="h-4 w-4" />Avaliar</Button>

        {result && (
          <Alert className={result.classifies ? 'border-success bg-success/10' : ''}>
            {result.classifies ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>
              <p className="text-2xl font-bold">{result.score} <span className="text-base font-normal text-muted-foreground">pts</span></p>
              <p className={`font-medium ${result.classifies ? 'text-success' : ''}`}>
                {result.classifies
                  ? (result.suff ? 'Classifica gota (cristais identificados)' : 'Classifica gota (≥8 pontos)')
                  : 'Não classifica (necessita entrada + cristais OU ≥8 pts)'}
              </p>
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">Fonte: Neogi T et al. Arthritis Rheumatol 2015;67:2557-68.</p>
      </CardContent>
    </Card>
  );
}
