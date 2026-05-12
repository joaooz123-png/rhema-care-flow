import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, AlertCircle } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

// ESSDAI — Seror R et al. Ann Rheum Dis 2010;69:1103-9.
// 12 domains × activity level × weight.

interface Domain {
  id: string;
  label: string;
  weight: number;
  // Activity levels: index 0 = no activity (0), then low/moderate/high (varies)
  levels: Array<{ label: string; value: number }>;
}

const DOMAINS: Domain[] = [
  { id: 'constitutional', label: 'Constitucional', weight: 3, levels: [
    { label: 'Sem atividade', value: 0 },
    { label: 'Baixa (febre 37,5–38,5°C; sudorese; perda 5–10%)', value: 1 },
    { label: 'Moderada (febre >38,5°C; perda >10%)', value: 2 },
  ]},
  { id: 'lymphadenopathy', label: 'Linfadenopatia', weight: 4, levels: [
    { label: 'Sem atividade', value: 0 },
    { label: 'Baixa (linfonodos ≥1 cm em qualquer região)', value: 1 },
    { label: 'Moderada (≥2 cm cervical / ≥3 cm inguinal ou esplenomegalia)', value: 2 },
    { label: 'Alta (linfoma B atual ou recente)', value: 3 },
  ]},
  { id: 'glandular', label: 'Glandular', weight: 2, levels: [
    { label: 'Sem atividade', value: 0 },
    { label: 'Baixa (aumento glandular leve)', value: 1 },
    { label: 'Moderada (aumento glandular importante)', value: 2 },
  ]},
  { id: 'articular', label: 'Articular', weight: 2, levels: [
    { label: 'Sem atividade', value: 0 },
    { label: 'Baixa (artralgia em mãos/punhos/tornozelos)', value: 1 },
    { label: 'Moderada (1–5 sinovites)', value: 2 },
    { label: 'Alta (≥6 sinovites)', value: 3 },
  ]},
  { id: 'cutaneous', label: 'Cutâneo', weight: 3, levels: [
    { label: 'Sem atividade (ou estável)', value: 0 },
    { label: 'Baixa (eritema multiforme)', value: 1 },
    { label: 'Moderada (vasculite limitada / púrpura / urticária)', value: 2 },
    { label: 'Alta (vasculite difusa, úlceras cutâneas, glomerulonefrite associada)', value: 3 },
  ]},
  { id: 'pulmonary', label: 'Pulmonar', weight: 5, levels: [
    { label: 'Sem atividade', value: 0 },
    { label: 'Baixa (tosse persistente sem alteração radiológica)', value: 1 },
    { label: 'Moderada (DPI com 70%≤DLCO<80% ou 80%≤CVF<100%)', value: 2 },
    { label: 'Alta (DPI com DLCO<40% ou CVF<60%)', value: 3 },
  ]},
  { id: 'renal', label: 'Renal', weight: 5, levels: [
    { label: 'Sem atividade', value: 0 },
    { label: 'Baixa (acidose tubular sem falência; proteinúria 0,5–1 g/dia sem hematúria/IRA)', value: 1 },
    { label: 'Moderada (acidose tubular com falência ou GN com proteinúria 1–1,5 g/dia)', value: 2 },
    { label: 'Alta (GN com proteinúria >1,5 g/dia, hematúria ou IRA)', value: 3 },
  ]},
  { id: 'muscular', label: 'Muscular', weight: 6, levels: [
    { label: 'Sem atividade', value: 0 },
    { label: 'Baixa (miosite leve com força normal e CK 1,5–2× LSN)', value: 1 },
    { label: 'Moderada (miosite com fraqueza ou CK 2–4× LSN)', value: 2 },
    { label: 'Alta (miosite com fraqueza importante ou CK >4× LSN)', value: 3 },
  ]},
  { id: 'pns', label: 'SNP — Sistema nervoso periférico', weight: 5, levels: [
    { label: 'Sem atividade', value: 0 },
    { label: 'Baixa (neuropatia sensitiva axonal pura ou trigeminal)', value: 1 },
    { label: 'Moderada (neuropatia axonal sensitivo-motora; ganglionopatia leve; neuropatia desmielinizante inflamatória)', value: 2 },
    { label: 'Alta (vasculite com mononeurite múltipla, ataxia grave, PIDC com prejuízo grave)', value: 3 },
  ]},
  { id: 'cns', label: 'SNC — Sistema nervoso central', weight: 5, levels: [
    { label: 'Sem atividade', value: 0 },
    { label: 'Moderada (paralisia de nervo craniano de origem central; neurite óptica; EM-like)', value: 1 },
    { label: 'Alta (vasculite cerebral com AVC ou AIT; convulsão, mielite transversa, meningite linfocítica)', value: 2 },
  ]},
  { id: 'hematological', label: 'Hematológico', weight: 2, levels: [
    { label: 'Sem atividade', value: 0 },
    { label: 'Baixa (citopenia leve)', value: 1 },
    { label: 'Moderada (citopenia moderada)', value: 2 },
    { label: 'Alta (citopenia grave)', value: 3 },
  ]},
  { id: 'biological', label: 'Biológico', weight: 1, levels: [
    { label: 'Sem atividade', value: 0 },
    { label: 'Baixa (hipergamaglobulinemia 16–20 g/L OU hipocomplementemia OU IgG monoclonal recente)', value: 1 },
    { label: 'Moderada (hipergamaglobulinemia >20 g/L OU hipogamaglobulinemia recente)', value: 2 },
  ]},
];

function category(score: number) {
  if (score < 5) return { label: 'Baixa atividade', tone: 'success' as const };
  if (score < 14) return { label: 'Atividade moderada', tone: 'warning' as const };
  return { label: 'Atividade alta', tone: 'destructive' as const };
}

export function ESSDAICalculator() {
  const [values, setValues] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; cat: ReturnType<typeof category>; perDomain: Array<{ id: string; pts: number }> } | null>(null);

  const setVal = (id: string, v: number) => setValues({ ...values, [id]: v });

  const calculate = () => {
    let score = 0;
    const perDomain: Array<{ id: string; pts: number }> = [];
    for (const d of DOMAINS) {
      const v = values[d.id] || 0;
      const pts = v * d.weight;
      score += pts;
      perDomain.push({ id: d.id, pts });
    }
    setResult({ score, cat: category(score), perDomain });
    addToHistory({ calculatorId: 'essdai', score, inputs: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v])) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ESSDAI — EULAR Sjögren's Syndrome Disease Activity Index</CardTitle>
        <CardDescription>Atividade sistêmica em Sjögren primária — Seror R et al. Ann Rheum Dis 2010</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {DOMAINS.map(d => (
          <div key={d.id} className="space-y-2 p-3 rounded-lg bg-muted/20">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{d.label}</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">peso ×{d.weight}</span>
            </div>
            <RadioGroup value={String(values[d.id] || 0)} onValueChange={(v) => setVal(d.id, parseInt(v))} className="space-y-1">
              {d.levels.map(l => (
                <div key={l.value} className="flex items-start gap-2">
                  <RadioGroupItem value={String(l.value)} id={`${d.id}-${l.value}`} className="mt-0.5" />
                  <Label htmlFor={`${d.id}-${l.value}`} className="cursor-pointer text-sm flex-1">{l.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}

        <Button onClick={calculate} className="gap-2"><Calculator className="h-4 w-4" />Calcular ESSDAI</Button>

        {result && (
          <Alert className={
            result.cat.tone === 'success' ? 'border-success bg-success/10' :
            result.cat.tone === 'warning' ? 'border-warning bg-warning/10' :
            'border-destructive bg-destructive/10'
          }>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="text-2xl font-bold">{result.score} pts</p>
              <p className="font-medium">{result.cat.label}</p>
              <p className="text-xs text-muted-foreground mt-1">Bandas: &lt;5 baixa • 5–13 moderada • ≥14 alta</p>
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">Seror R et al. EULAR Sjögren's syndrome disease activity index (ESSDAI). Ann Rheum Dis 2010;69:1103-9.</p>
      </CardContent>
    </Card>
  );
}
