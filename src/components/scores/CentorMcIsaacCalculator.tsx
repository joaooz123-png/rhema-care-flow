import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, AlertCircle } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

interface Crit { id: string; label: string; }

const CRITS: Crit[] = [
  { id: 'exudate', label: 'Exsudato amigdaliano' },
  { id: 'nodes', label: 'Linfadenopatia cervical anterior dolorosa' },
  { id: 'fever', label: 'Febre > 38°C (história)' },
  { id: 'no_cough', label: 'Ausência de tosse' },
];

type AgeBand = 'under15' | '15to44' | 'over44';

const AGE_MOD: Record<AgeBand, number> = { under15: 1, '15to44': 0, over44: -1 };

function classify(score: number, mcisaac: boolean) {
  if (mcisaac) {
    if (score <= 0) return { label: 'Risco muito baixo (~1–2%)', conduct: 'Sem antibiótico nem teste', tone: 'success' as const };
    if (score === 1) return { label: 'Risco baixo (~5–10%)', conduct: 'Sem antibiótico nem teste', tone: 'success' as const };
    if (score === 2) return { label: 'Risco intermediário (~11–17%)', conduct: 'Considerar teste rápido / cultura', tone: 'warning' as const };
    if (score === 3) return { label: 'Risco moderado (~28–35%)', conduct: 'Teste rápido; tratar se positivo', tone: 'warning' as const };
    return { label: 'Risco alto (~51–53%)', conduct: 'Tratamento empírico ou teste com tratamento', tone: 'destructive' as const };
  }
  if (score <= 1) return { label: 'Risco baixo', conduct: 'Sem antibiótico', tone: 'success' as const };
  if (score <= 3) return { label: 'Risco intermediário', conduct: 'Teste rápido para Strep A', tone: 'warning' as const };
  return { label: 'Risco alto', conduct: 'Considerar tratamento empírico', tone: 'destructive' as const };
}

export function CentorMcIsaacCalculator() {
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [mcisaac, setMcisaac] = useState(true);
  const [age, setAge] = useState<AgeBand>('15to44');
  const [result, setResult] = useState<{ score: number; cls: ReturnType<typeof classify> } | null>(null);

  const toggle = (id: string) => {
    const s = new Set(sel);
    s.has(id) ? s.delete(id) : s.add(id);
    setSel(s);
  };

  const calculate = () => {
    const base = sel.size;
    const score = mcisaac ? base + AGE_MOD[age] : base;
    const cls = classify(score, mcisaac);
    setResult({ score, cls });
    addToHistory({ calculatorId: 'centor-mcisaac', score, inputs: { mcisaac: mcisaac ? 'yes' : 'no', age, criteria: Array.from(sel).join(',') } });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Centor / McIsaac (Faringite Estreptocócica)</CardTitle>
        <CardDescription>Probabilidade de Streptococcus β-hemolítico do grupo A em faringoamigdalite</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
          <Checkbox id="mcisaac" checked={mcisaac} onCheckedChange={(v) => setMcisaac(v === true)} />
          <Label htmlFor="mcisaac" className="cursor-pointer">Usar modificação de McIsaac (ajuste por idade)</Label>
        </div>

        {mcisaac && (
          <div className="space-y-2">
            <Label>Faixa etária</Label>
            <RadioGroup value={age} onValueChange={(v) => setAge(v as AgeBand)} className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2"><RadioGroupItem value="under15" id="cm-u15" /><Label htmlFor="cm-u15" className="cursor-pointer">3–14 anos (+1)</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="15to44" id="cm-15" /><Label htmlFor="cm-15" className="cursor-pointer">15–44 anos (0)</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="over44" id="cm-o45" /><Label htmlFor="cm-o45" className="cursor-pointer">≥45 anos (−1)</Label></div>
            </RadioGroup>
          </div>
        )}

        <div className="space-y-2">
          {CRITS.map(c => (
            <div key={c.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
              <Checkbox checked={sel.has(c.id)} onCheckedChange={() => toggle(c.id)} id={c.id} />
              <Label htmlFor={c.id} className="cursor-pointer flex-1">{c.label}</Label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">+1</span>
            </div>
          ))}
        </div>

        <Button onClick={calculate} className="gap-2"><Calculator className="h-4 w-4" />Calcular</Button>

        {result && (
          <Alert className={
            result.cls.tone === 'success' ? 'border-success bg-success/10' :
            result.cls.tone === 'warning' ? 'border-warning bg-warning/10' :
            'border-destructive bg-destructive/10'
          }>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="text-2xl font-bold">{result.score} pts</p>
              <p className="font-medium">{result.cls.label}</p>
              <p className="text-sm mt-1">{result.cls.conduct}</p>
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">Centor RM. Med Decis Making 1981;1:239-46. McIsaac WJ. CMAJ 1998;158:75-83.</p>
      </CardContent>
    </Card>
  );
}
