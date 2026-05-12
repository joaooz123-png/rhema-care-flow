import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, AlertCircle } from 'lucide-react';
import { addToHistory } from '@/lib/calculators';

// HAQ-DI — Fries JF et al. Arthritis Rheum 1980;23:137-45.
// 8 categorias, 2-3 itens cada, escala 0–3. Pega o pior item por categoria.
// Aids/devices ou ajuda de pessoa elevam para mínimo 2.

interface Category { id: string; label: string; items: string[]; aidLabel: string; }

const CATEGORIES: Category[] = [
  { id: 'dressing', label: 'Vestir-se e arrumar-se', aidLabel: 'Dispositivos para vestir / cabide / abotoador',
    items: ['Vestir suas roupas, incluindo amarrar cadarços e abotoar', 'Lavar a cabeça/cabelo'] },
  { id: 'arising', label: 'Levantar-se', aidLabel: 'Cadeira alta / apoio',
    items: ['Levantar-se de uma cadeira sem braços', 'Deitar e levantar da cama'] },
  { id: 'eating', label: 'Alimentar-se', aidLabel: 'Utensílios adaptados',
    items: ['Cortar a carne', 'Levantar até a boca um copo cheio', 'Abrir uma caixa de leite nova'] },
  { id: 'walking', label: 'Caminhar', aidLabel: 'Bengala / muleta / andador / cadeira de rodas',
    items: ['Caminhar em terreno plano', 'Subir cinco degraus'] },
  { id: 'hygiene', label: 'Higiene', aidLabel: 'Assento sanitário elevado / barras de apoio na banheira',
    items: ['Lavar e secar todo o corpo', 'Tomar banho de banheira', 'Sentar e levantar do vaso sanitário'] },
  { id: 'reach', label: 'Alcançar', aidLabel: 'Pegador de objetos longo',
    items: ['Pegar um objeto de aprox. 2,3 kg acima da cabeça', 'Curvar-se para apanhar peças no chão'] },
  { id: 'grip', label: 'Apreensão', aidLabel: 'Utensílios para abrir potes',
    items: ['Abrir portas de carro', 'Abrir potes ou frascos previamente abertos', 'Abrir e fechar torneiras'] },
  { id: 'activities', label: 'Atividades', aidLabel: 'Carrinho / suportes',
    items: ['Fazer compras / tarefas no mercado', 'Entrar e sair de um carro', 'Realizar tarefas domésticas (varrer, aspirar)'] },
];

const SCALE = [
  { v: 0, l: 'Sem dificuldade' },
  { v: 1, l: 'Com alguma dificuldade' },
  { v: 2, l: 'Com muita dificuldade' },
  { v: 3, l: 'Incapaz de fazer' },
];

export function HAQDICalculator() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [aids, setAids] = useState<Set<string>>(new Set());
  const [help, setHelp] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ haqdi: number; perCat: Record<string, number> } | null>(null);

  const setScore = (key: string, v: number) => setScores({ ...scores, [key]: v });

  const toggleAids = (id: string) => {
    const s = new Set(aids);
    s.has(id) ? s.delete(id) : s.add(id);
    setAids(s);
  };
  const toggleHelp = (id: string) => {
    const s = new Set(help);
    s.has(id) ? s.delete(id) : s.add(id);
    setHelp(s);
  };

  const calculate = () => {
    const perCat: Record<string, number> = {};
    let answered = 0;
    let sum = 0;
    for (const c of CATEGORIES) {
      const itemScores = c.items.map((_, idx) => scores[`${c.id}-${idx}`]).filter(v => v !== undefined);
      if (itemScores.length === 0) {
        perCat[c.id] = 0;
        continue;
      }
      let max = Math.max(...itemScores);
      if ((aids.has(c.id) || help.has(c.id)) && max < 2) max = 2;
      perCat[c.id] = max;
      sum += max;
      answered++;
    }
    if (answered < 6) {
      setResult(null);
      return;
    }
    const haqdi = sum / answered;
    setResult({ haqdi, perCat });
    addToHistory({ calculatorId: 'haq-di', score: parseFloat(haqdi.toFixed(2)), inputs: perCat });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>HAQ-DI — Health Assessment Questionnaire Disability Index</CardTitle>
        <CardDescription>Capacidade funcional na última semana — Fries JF et al. 1980</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {CATEGORIES.map(c => (
          <div key={c.id} className="space-y-3 p-3 rounded-lg bg-muted/20">
            <p className="text-sm font-semibold">{c.label}</p>
            {c.items.map((item, idx) => {
              const key = `${c.id}-${idx}`;
              return (
                <div key={key} className="space-y-1.5">
                  <Label className="text-sm">{item}</Label>
                  <RadioGroup value={scores[key] !== undefined ? String(scores[key]) : ''} onValueChange={(v) => setScore(key, parseInt(v))} className="flex flex-wrap gap-3">
                    {SCALE.map(s => (
                      <div key={s.v} className="flex items-center gap-1.5">
                        <RadioGroupItem value={String(s.v)} id={`${key}-${s.v}`} />
                        <Label htmlFor={`${key}-${s.v}`} className="cursor-pointer text-xs">{s.v} — {s.l}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              );
            })}
            <div className="flex flex-wrap gap-3 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Checkbox id={`aid-${c.id}`} checked={aids.has(c.id)} onCheckedChange={() => toggleAids(c.id)} />
                <Label htmlFor={`aid-${c.id}`} className="cursor-pointer text-xs">Usa dispositivo: {c.aidLabel}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id={`help-${c.id}`} checked={help.has(c.id)} onCheckedChange={() => toggleHelp(c.id)} />
                <Label htmlFor={`help-${c.id}`} className="cursor-pointer text-xs">Necessita de ajuda de outra pessoa</Label>
              </div>
            </div>
          </div>
        ))}

        <Button onClick={calculate} className="gap-2"><Calculator className="h-4 w-4" />Calcular HAQ-DI</Button>

        {result && (
          <Alert className={
            result.haqdi <= 0.5 ? 'border-success bg-success/10' :
            result.haqdi <= 1.5 ? 'border-warning bg-warning/10' :
            'border-destructive bg-destructive/10'
          }>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="text-2xl font-bold">{result.haqdi.toFixed(2)} <span className="text-base font-normal text-muted-foreground">/ 3.00</span></p>
              <p className="font-medium">
                {result.haqdi <= 0.5 ? 'Incapacidade leve / sem incapacidade' :
                 result.haqdi <= 1.5 ? 'Incapacidade moderada' : 'Incapacidade grave'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">MCID ≈ 0,22 (mínima diferença clinicamente importante)</p>
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">
          Cada categoria recebe a maior pontuação dos itens. Uso de dispositivo ou ajuda eleva categoria para mínimo 2. HAQ-DI = média entre categorias respondidas.
          Fonte: Fries JF, Spitz P, Kraines RG, Holman HR. Arthritis Rheum 1980;23(2):137-45.
        </p>
      </CardContent>
    </Card>
  );
}
