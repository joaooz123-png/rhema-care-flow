import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

// EULAR/ACR 2019 SLE Classification — Aringer M et al. Ann Rheum Dis 2019;78:1151-9.
// Entry: ANA ≥ 1:80. Then weighted criteria across 7 clinical + 3 immunologic domains.
// Within each domain, only the highest-weighted criterion counts. ≥10 pts + ≥1 clinical = SLE.

interface Crit { id: string; label: string; pts: number; }
interface Domain { id: string; label: string; type: 'clinical' | 'immuno'; items: Crit[]; }

const DOMAINS: Domain[] = [
  { id: 'constitutional', label: 'Constitucional', type: 'clinical', items: [
    { id: 'fever', label: 'Febre (>38.3°C, sem outra causa)', pts: 2 },
  ]},
  { id: 'hematologic', label: 'Hematológico', type: 'clinical', items: [
    { id: 'leukopenia', label: 'Leucopenia (<4.000/mm³)', pts: 3 },
    { id: 'thrombocytopenia', label: 'Trombocitopenia (<100.000/mm³)', pts: 4 },
    { id: 'aiha', label: 'Hemólise autoimune', pts: 4 },
  ]},
  { id: 'neuropsych', label: 'Neuropsiquiátrico', type: 'clinical', items: [
    { id: 'delirium', label: 'Delirium', pts: 2 },
    { id: 'psychosis', label: 'Psicose', pts: 3 },
    { id: 'seizure', label: 'Convulsão', pts: 5 },
  ]},
  { id: 'mucocutaneous', label: 'Mucocutâneo', type: 'clinical', items: [
    { id: 'alopecia', label: 'Alopecia não cicatricial', pts: 2 },
    { id: 'oral', label: 'Úlceras orais', pts: 2 },
    { id: 'subacute_discoid', label: 'Lúpus cutâneo subagudo OU discoide', pts: 4 },
    { id: 'acute', label: 'Lúpus cutâneo agudo', pts: 6 },
  ]},
  { id: 'serositis', label: 'Serosa', type: 'clinical', items: [
    { id: 'effusion', label: 'Derrame pleural ou pericárdico', pts: 5 },
    { id: 'pericarditis', label: 'Pericardite aguda', pts: 6 },
  ]},
  { id: 'msk', label: 'Musculoesquelético', type: 'clinical', items: [
    { id: 'joint', label: 'Envolvimento articular (sinovite ≥2 ou dor + rigidez ≥30min)', pts: 6 },
  ]},
  { id: 'renal', label: 'Renal', type: 'clinical', items: [
    { id: 'proteinuria', label: 'Proteinúria > 0,5 g/24h', pts: 4 },
    { id: 'biopsy_2_5', label: 'Biópsia renal classe II ou V', pts: 8 },
    { id: 'biopsy_3_4', label: 'Biópsia renal classe III ou IV', pts: 10 },
  ]},
  { id: 'apl', label: 'Antifosfolípide', type: 'immuno', items: [
    { id: 'apl_pos', label: 'Anticardiolipina IgG/IgM ou anti-β2GP1 médio/alto título OU anticoagulante lúpico', pts: 2 },
  ]},
  { id: 'complement', label: 'Complemento', type: 'immuno', items: [
    { id: 'c3_or_c4', label: 'C3 baixo OU C4 baixo', pts: 3 },
    { id: 'c3_and_c4', label: 'C3 baixo E C4 baixo', pts: 4 },
  ]},
  { id: 'sleSpecific', label: 'Anticorpos específicos', type: 'immuno', items: [
    { id: 'anti_dsdna', label: 'Anti-dsDNA', pts: 6 },
    { id: 'anti_sm', label: 'Anti-Sm', pts: 6 },
  ]},
];

export function EULARACR2019SLECalculator() {
  const [ana, setAna] = useState(true);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ score: number; classifies: boolean; clinical: number } | null>(null);

  const toggle = (id: string) => {
    const s = new Set(sel);
    s.has(id) ? s.delete(id) : s.add(id);
    setSel(s);
  };

  const calculate = () => {
    let score = 0;
    let clinical = 0;
    for (const d of DOMAINS) {
      const top = d.items.filter(i => sel.has(i.id)).reduce((max, i) => Math.max(max, i.pts), 0);
      score += top;
      if (d.type === 'clinical' && top > 0) clinical += top;
    }
    const classifies = ana && score >= 10 && clinical > 0;
    setResult({ score, classifies, clinical });
    addToHistory({ calculatorId: 'eular-acr-sle', score, inputs: { ana: ana ? 'pos' : 'neg', criteria: Array.from(sel).join(',') } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>EULAR/ACR 2019 — Critérios de Classificação para LES</CardTitle>
        <CardDescription>Aringer M et al. Ann Rheum Dis 2019;78:1151-1159</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="p-4 rounded-lg bg-muted/30 space-y-2">
          <p className="text-sm font-semibold uppercase text-muted-foreground tracking-wide">Critério obrigatório de entrada</p>
          <div className="flex items-center gap-2">
            <Checkbox checked={ana} onCheckedChange={(v) => setAna(v === true)} id="ana" />
            <Label htmlFor="ana" className="cursor-pointer">FAN ≥ 1:80 em células HEp-2 (ou equivalente positivo)</Label>
          </div>
          {!ana && <p className="text-xs text-destructive">Sem FAN positivo, não classifica como LES por estes critérios.</p>}
        </div>

        <div className="space-y-4">
          {DOMAINS.map(d => (
            <div key={d.id} className="space-y-1.5">
              <p className="text-sm font-semibold flex items-center gap-2">
                {d.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${d.type === 'clinical' ? 'bg-primary/10 text-primary' : 'bg-accent/30 text-accent-foreground'}`}>
                  {d.type === 'clinical' ? 'Clínico' : 'Imunológico'}
                </span>
              </p>
              {d.items.map(i => (
                <div key={i.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
                  <Checkbox checked={sel.has(i.id)} onCheckedChange={() => toggle(i.id)} id={i.id} />
                  <Label htmlFor={i.id} className="cursor-pointer flex-1">{i.label}</Label>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">+{i.pts}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <Button onClick={calculate} className="gap-2"><Calculator className="h-4 w-4" />Avaliar</Button>

        {result && (
          <Alert className={result.classifies ? 'border-success bg-success/10' : ''}>
            {result.classifies ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>
              <p className="text-2xl font-bold">{result.score} pts</p>
              <p className="text-sm">Pontos clínicos: {result.clinical} • FAN: {ana ? 'positivo' : 'negativo'}</p>
              <p className={`font-medium mt-1 ${result.classifies ? 'text-success' : ''}`}>
                {result.classifies ? 'Classifica LES (≥10 pts, ≥1 clínico, FAN+)' : 'Não classifica (necessita FAN+, ≥10 pts e ≥1 critério clínico)'}
              </p>
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">
          Em cada domínio, conta apenas o critério de maior peso. Critério atribuível ao LES (sem outra explicação mais provável).
        </p>
      </CardContent>
    </Card>
  );
}
