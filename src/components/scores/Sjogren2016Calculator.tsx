import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

const ITEMS = [
  { id: 'lip_biopsy', label: 'Biópsia de glândula salivar menor com sialadenite linfocítica focal e focus score ≥ 1', points: 3 },
  { id: 'anti_ssa', label: 'Anti-SSA/Ro positivo', points: 3 },
  { id: 'ocular_staining', label: 'Ocular staining score ≥ 5 (ou van Bijsterveld ≥ 4) em pelo menos um olho', points: 1 },
  { id: 'schirmer', label: 'Teste de Schirmer ≤ 5 mm/5 min em pelo menos um olho', points: 1 },
  { id: 'unstimulated_flow', label: 'Fluxo salivar não estimulado ≤ 0,1 mL/min', points: 1 },
];

export function Sjogren2016Calculator() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hasSymptoms, setHasSymptoms] = useState(true);
  const [exclusionsAbsent, setExclusionsAbsent] = useState(true);
  const [result, setResult] = useState<{ score: number; classifies: boolean } | null>(null);

  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const calculate = () => {
    const score = ITEMS.filter(i => selected.has(i.id)).reduce((sum, i) => sum + i.points, 0);
    const classifies = hasSymptoms && exclusionsAbsent && score >= 4;
    setResult({ score, classifies });
    addToHistory({ calculatorId: 'sjogren-2016', score, inputs: { criteria: Array.from(selected).join(',') } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Critérios Sjögren 2016 ACR/EULAR</CardTitle>
        <CardDescription>Síndrome de Sjögren primária — Shiboski CH et al. 2017</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 p-4 rounded-lg bg-muted/30">
          <p className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">Critérios de entrada</p>
          <div className="flex items-start gap-2">
            <Checkbox checked={hasSymptoms} onCheckedChange={(v) => setHasSymptoms(v === true)} />
            <Label className="cursor-pointer text-sm">≥1 sintoma de olho/boca seca (questionário ACR-EULAR) OU suspeita de Sjögren a partir do ESSDAI</Label>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox checked={exclusionsAbsent} onCheckedChange={(v) => setExclusionsAbsent(v === true)} />
            <Label className="cursor-pointer text-sm">Ausência de condições de exclusão (HCV ativo, HIV, sarcoidose, amiloidose, GVHD, IgG4-RD, radioterapia cervical prévia)</Label>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">Itens pontuáveis</p>
          {ITEMS.map(i => (
            <div key={i.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
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
              <p className="text-2xl font-bold">{result.score} <span className="text-base font-normal text-muted-foreground">/ 9 pts</span></p>
              <p className={`font-medium ${result.classifies ? 'text-success' : ''}`}>
                {result.classifies ? 'Classifica Síndrome de Sjögren primária (≥4)' : 'Não classifica (necessita ≥4 + entrada + sem exclusões)'}
              </p>
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">Fonte: Shiboski CH et al. Arthritis Rheumatol 2017;69:35-45.</p>
      </CardContent>
    </Card>
  );
}
