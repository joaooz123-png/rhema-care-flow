import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, AlertCircle } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

interface Crit { id: string; label: string; points: number; }

const DVT_CRITS: Crit[] = [
  { id: 'cancer', label: 'Câncer ativo (em tratamento ou nos últimos 6 meses)', points: 1 },
  { id: 'paralysis', label: 'Paralisia, paresia ou imobilização recente de MMII', points: 1 },
  { id: 'bedrest', label: 'Acamado >3 dias ou cirurgia nas últimas 4 semanas', points: 1 },
  { id: 'tenderness', label: 'Dor localizada ao longo do trajeto venoso profundo', points: 1 },
  { id: 'leg_swell', label: 'Edema de toda a perna', points: 1 },
  { id: 'calf_swell', label: 'Edema de panturrilha >3 cm vs contralateral', points: 1 },
  { id: 'pitting', label: 'Edema depressível na perna sintomática', points: 1 },
  { id: 'collateral', label: 'Veias colaterais superficiais (não varicosas)', points: 1 },
  { id: 'previous_dvt', label: 'TVP prévia documentada', points: 1 },
  { id: 'alternative', label: 'Diagnóstico alternativo tão ou mais provável que TVP', points: -2 },
];

const PE_CRITS: Crit[] = [
  { id: 'signs_dvt', label: 'Sinais clínicos de TVP', points: 3 },
  { id: 'pe_likely', label: 'Diagnóstico alternativo menos provável que EP', points: 3 },
  { id: 'hr', label: 'FC > 100 bpm', points: 1.5 },
  { id: 'immob', label: 'Imobilização ≥3 dias ou cirurgia nas últimas 4 semanas', points: 1.5 },
  { id: 'prev_pe', label: 'TVP/EP prévia', points: 1.5 },
  { id: 'hemo', label: 'Hemoptise', points: 1 },
  { id: 'cancer', label: 'Câncer ativo', points: 1 },
];

function dvtCategory(s: number) {
  if (s >= 3) return { label: 'Alta probabilidade de TVP', tone: 'destructive' as const };
  if (s >= 1) return { label: 'Probabilidade moderada — solicite D-dímero / USG', tone: 'warning' as const };
  return { label: 'Baixa probabilidade — D-dímero pode excluir', tone: 'success' as const };
}

function peCategory(s: number) {
  // 3-tier: <2 baixa, 2-6 moderada, >6 alta
  if (s > 6) return { label: 'Alta probabilidade de EP — angio-TC', tone: 'destructive' as const };
  if (s >= 2) return { label: 'Probabilidade moderada — D-dímero / angio-TC', tone: 'warning' as const };
  return { label: 'Baixa probabilidade — considerar PERC + D-dímero', tone: 'success' as const };
}

function ScoreList({ crits, prefix, onResult }: { crits: Crit[]; prefix: string; onResult: (s: number) => void }) {
  const [sel, setSel] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    const s = new Set(sel);
    s.has(id) ? s.delete(id) : s.add(id);
    setSel(s);
  };
  const score = crits.filter(c => sel.has(c.id)).reduce((sum, c) => sum + c.points, 0);
  return (
    <div className="space-y-2">
      {crits.map(c => (
        <div key={c.id} className="flex items-start gap-2 p-2 rounded hover:bg-muted/50">
          <Checkbox checked={sel.has(c.id)} onCheckedChange={() => toggle(c.id)} id={`${prefix}-${c.id}`} />
          <Label htmlFor={`${prefix}-${c.id}`} className="cursor-pointer flex-1">{c.label}</Label>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${c.points < 0 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            {c.points > 0 ? '+' : ''}{c.points}
          </span>
        </div>
      ))}
      <Button onClick={() => onResult(score)} className="gap-2 mt-2"><Calculator className="h-4 w-4" />Calcular ({score} pts)</Button>
    </div>
  );
}

export function WellsCalculator() {
  const [dvtResult, setDvtResult] = useState<number | null>(null);
  const [peResult, setPeResult] = useState<number | null>(null);

  const dvtSubmit = (s: number) => {
    setDvtResult(s);
    addToHistory({ calculatorId: 'wells', score: s, inputs: { type: 'dvt' } });
  };
  const peSubmit = (s: number) => {
    setPeResult(s);
    addToHistory({ calculatorId: 'wells', score: s, inputs: { type: 'pe' } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Critérios de Wells (TVP / EP)</CardTitle>
        <CardDescription>Probabilidade pré-teste para Trombose Venosa Profunda e Embolia Pulmonar — Wells PS et al.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="dvt">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dvt">Wells TVP</TabsTrigger>
            <TabsTrigger value="pe">Wells EP</TabsTrigger>
          </TabsList>
          <TabsContent value="dvt" className="space-y-4 pt-4">
            <ScoreList crits={DVT_CRITS} prefix="dvt" onResult={dvtSubmit} />
            {dvtResult !== null && (() => {
              const cat = dvtCategory(dvtResult);
              return (
                <Alert className={
                  cat.tone === 'success' ? 'border-success bg-success/10' :
                  cat.tone === 'warning' ? 'border-warning bg-warning/10' :
                  'border-destructive bg-destructive/10'
                }>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="text-2xl font-bold">{dvtResult} pts</p>
                    <p className="font-medium">{cat.label}</p>
                  </AlertDescription>
                </Alert>
              );
            })()}
            <p className="text-xs text-muted-foreground">Wells PS et al. Lancet 1997;350:1795-8 (modificado 2003).</p>
          </TabsContent>
          <TabsContent value="pe" className="space-y-4 pt-4">
            <ScoreList crits={PE_CRITS} prefix="pe" onResult={peSubmit} />
            {peResult !== null && (() => {
              const cat = peCategory(peResult);
              return (
                <Alert className={
                  cat.tone === 'success' ? 'border-success bg-success/10' :
                  cat.tone === 'warning' ? 'border-warning bg-warning/10' :
                  'border-destructive bg-destructive/10'
                }>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="text-2xl font-bold">{peResult} pts</p>
                    <p className="font-medium">{cat.label}</p>
                  </AlertDescription>
                </Alert>
              );
            })()}
            <p className="text-xs text-muted-foreground">Wells PS et al. Ann Intern Med 2001;135:98-107.</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
