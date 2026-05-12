import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

const AREAS = [
  'Face', 'Tórax anterior', 'Abdome',
  'Braço direito', 'Braço esquerdo',
  'Antebraço direito', 'Antebraço esquerdo',
  'Mão direita', 'Mão esquerda',
  'Dedos da mão direita', 'Dedos da mão esquerda',
  'Coxa direita', 'Coxa esquerda',
  'Perna direita', 'Perna esquerda',
  'Pé direito', 'Pé esquerdo',
];

const SCORE_LABELS = ['0 — pele normal', '1 — leve espessamento', '2 — espessamento moderado', '3 — espessamento severo (não pinçável)'];

export function MRSSCalculator() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [result, setResult] = useState<number | null>(null);

  const setScore = (area: string, value: number) => setScores({ ...scores, [area]: value });

  const calculate = () => {
    const total = AREAS.reduce((sum, a) => sum + (scores[a] ?? 0), 0);
    setResult(total);
    addToHistory({ calculatorId: 'mrss', score: total, inputs: scores });
  };

  const interpret = (s: number) => {
    if (s <= 14) return 'Esclerose cutânea limitada';
    if (s <= 29) return 'Acometimento moderado';
    return 'Acometimento difuso/severo';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>mRSS — Modified Rodnan Skin Score</CardTitle>
        <CardDescription>Esclerose sistêmica — espessamento cutâneo em 17 áreas anatômicas (0–3 cada, total 0–51)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          {AREAS.map(area => (
            <div key={area} className="space-y-1">
              <Label className="text-sm">{area}</Label>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setScore(area, v)}
                    className={`flex-1 py-2 rounded text-sm font-semibold border transition-colors ${
                      scores[area] === v ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted border-border'
                    }`}
                  >{v}</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground space-y-0.5 pt-2">
          {SCORE_LABELS.map(l => <p key={l}>{l}</p>)}
        </div>

        <Button onClick={calculate} className="gap-2"><Calculator className="h-4 w-4" />Calcular</Button>

        {result !== null && (
          <Alert>
            <AlertDescription>
              <p className="text-3xl font-bold">{result} <span className="text-base font-normal text-muted-foreground">/ 51</span></p>
              <p className="font-medium mt-1">{interpret(result)}</p>
              <p className="text-xs text-muted-foreground mt-1">Mudança clinicamente significativa: ≥ 5 pontos ou ≥ 25% do basal.</p>
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">Fonte: Khanna D et al. J Scleroderma Relat Disord 2017;2:11-18.</p>
      </CardContent>
    </Card>
  );
}
