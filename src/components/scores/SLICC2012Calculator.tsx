import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

interface Item { id: string; label: string; }

const CLINICAL: Item[] = [
  { id: 'cutaneous_acute', label: 'Lúpus cutâneo agudo (rash malar, fotossensível, bolhoso, NET-like) ou subagudo' },
  { id: 'cutaneous_chronic', label: 'Lúpus cutâneo crônico (discoide, hipertrófico, paniculite, mucoso, túmido)' },
  { id: 'oral_nasal', label: 'Úlceras orais ou nasais' },
  { id: 'alopecia', label: 'Alopecia não cicatricial' },
  { id: 'synovitis', label: 'Sinovite ≥ 2 articulações ou rigidez matinal ≥ 30 min' },
  { id: 'serositis', label: 'Serosite (pleurite ou pericardite > 1 dia)' },
  { id: 'renal', label: 'Renal: proteinúria > 500 mg/24h ou cilindros hemáticos' },
  { id: 'neurological', label: 'Neurológico (convulsões, psicose, mononeurite múltipla, mielite, neuropatia, estado confusional agudo)' },
  { id: 'hemolytic', label: 'Anemia hemolítica' },
  { id: 'leukopenia', label: 'Leucopenia < 4.000 ou linfopenia < 1.000' },
  { id: 'thrombocytopenia', label: 'Trombocitopenia < 100.000' },
];

const IMMUNOLOGIC: Item[] = [
  { id: 'ana', label: 'ANA acima do título de referência' },
  { id: 'anti_dna', label: 'Anti-DNA acima do título de referência (ou >2× ELISA)' },
  { id: 'anti_sm', label: 'Anti-Sm positivo' },
  { id: 'apl', label: 'Antifosfolípide positivo (anticoagulante lúpico, anticardiolipina, anti-β2GP1, ou VDRL falso-positivo)' },
  { id: 'low_complement', label: 'Complemento baixo (C3, C4 ou CH50)' },
  { id: 'direct_coombs', label: 'Coombs direto positivo (sem anemia hemolítica)' },
];

export function SLICC2012Calculator() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [biopsyProven, setBiopsyProven] = useState(false);
  const [biopsyAna, setBiopsyAna] = useState(false);
  const [result, setResult] = useState<{ clinical: number; immuno: number; total: number; classifies: boolean; suff: boolean } | null>(null);

  const toggle = (id: string) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const calculate = () => {
    const clinical = CLINICAL.filter(i => selected.has(i.id)).length;
    const immuno = IMMUNOLOGIC.filter(i => selected.has(i.id)).length;
    const total = clinical + immuno;
    const suff = biopsyProven && biopsyAna;
    const classifies = suff || (clinical >= 1 && immuno >= 1 && total >= 4);
    setResult({ clinical, immuno, total, classifies, suff });
    addToHistory({ calculatorId: 'slicc-sle', score: total, inputs: { criteria: Array.from(selected).join(',') } });
  };

  const Section = ({ title, items }: { title: string; items: Item[] }) => (
    <div className="space-y-2">
      <p className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">{title}</p>
      {items.map(i => (
        <div key={i.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
          <Checkbox checked={selected.has(i.id)} onCheckedChange={() => toggle(i.id)} />
          <Label className="cursor-pointer flex-1 text-sm">{i.label}</Label>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Critérios SLICC 2012 — LES</CardTitle>
        <CardDescription>Systemic Lupus International Collaborating Clinics — Petri M et al. 2012</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 p-4 rounded-lg bg-muted/30">
          <p className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">Critério suficiente</p>
          <div className="flex items-start gap-2">
            <Checkbox checked={biopsyProven} onCheckedChange={(v) => setBiopsyProven(v === true)} />
            <Label className="cursor-pointer text-sm">Nefrite lúpica comprovada por biópsia</Label>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox checked={biopsyAna} onCheckedChange={(v) => setBiopsyAna(v === true)} />
            <Label className="cursor-pointer text-sm">+ ANA ou anti-DNA positivo (juntos classificam imediatamente)</Label>
          </div>
        </div>

        <Section title="Critérios clínicos" items={CLINICAL} />
        <Section title="Critérios imunológicos" items={IMMUNOLOGIC} />

        <Button onClick={calculate} className="gap-2"><Calculator className="h-4 w-4" />Avaliar</Button>

        {result && (
          <Alert className={result.classifies ? 'border-success bg-success/10' : ''}>
            {result.classifies ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>
              <p className="text-2xl font-bold">{result.total} critérios</p>
              <p className="text-sm text-muted-foreground">Clínicos: {result.clinical} · Imunológicos: {result.immuno}</p>
              <p className={`font-medium mt-1 ${result.classifies ? 'text-success' : ''}`}>
                {result.classifies
                  ? (result.suff ? 'Classifica LES (nefrite lúpica + ANA/anti-DNA)' : 'Classifica LES (≥4 critérios incluindo ≥1 clínico e ≥1 imunológico)')
                  : 'Não classifica (necessita ≥4 critérios com ≥1 clínico + ≥1 imunológico, OU nefrite biopsiada + ANA/anti-DNA)'}
              </p>
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">Fonte: Petri M et al. Arthritis Rheum 2012;64:2677-86.</p>
      </CardContent>
    </Card>
  );
}
