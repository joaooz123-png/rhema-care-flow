import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GitCompareArrows, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CALCULATORS, getHistoryByPatient, type HistoryEntry } from '@/lib/calculators';

interface Props {
  patientCode: string;
}

interface Stats {
  count: number;
  min: number;
  avg: number;
  max: number;
}

function statsOf(entries: HistoryEntry[]): Stats | null {
  if (entries.length === 0) return null;
  const scores = entries.map(e => e.score);
  const sum = scores.reduce((a, b) => a + b, 0);
  return {
    count: entries.length,
    min: Math.min(...scores),
    max: Math.max(...scores),
    avg: sum / entries.length,
  };
}

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfDay(s: string) {
  return new Date(`${s}T00:00:00`).getTime();
}
function endOfDay(s: string) {
  return new Date(`${s}T23:59:59.999`).getTime();
}

function fmt(n: number) {
  return Number.isFinite(n) ? n.toFixed(2) : '—';
}

function DeltaCell({ a, b }: { a?: number; b?: number }) {
  if (a == null || b == null) return <span className="text-muted-foreground">—</span>;
  const d = b - a;
  const flat = Math.abs(d) < 0.01;
  const Icon = flat ? Minus : d > 0 ? TrendingUp : TrendingDown;
  const color = flat ? 'text-muted-foreground' : d > 0 ? 'text-destructive' : 'text-success';
  return (
    <span className={`inline-flex items-center gap-1 font-medium ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {d > 0 ? '+' : ''}{d.toFixed(2)}
    </span>
  );
}

export function PeriodComparisonPanel({ patientCode }: Props) {
  const today = new Date();
  const past30 = new Date(today.getTime() - 30 * 86400000);
  const past60 = new Date(today.getTime() - 60 * 86400000);

  const [aStart, setAStart] = useState(toInputDate(past60));
  const [aEnd, setAEnd] = useState(toInputDate(past30));
  const [bStart, setBStart] = useState(toInputDate(past30));
  const [bEnd, setBEnd] = useState(toInputDate(today));

  const allEntries = useMemo(() => getHistoryByPatient(patientCode), [patientCode]);

  const rows = useMemo(() => {
    const aMin = startOfDay(aStart);
    const aMax = endOfDay(aEnd);
    const bMin = startOfDay(bStart);
    const bMax = endOfDay(bEnd);

    const byCalc = new Map<string, HistoryEntry[]>();
    for (const e of allEntries) {
      if (!byCalc.has(e.calculatorId)) byCalc.set(e.calculatorId, []);
      byCalc.get(e.calculatorId)!.push(e);
    }

    return Array.from(byCalc.entries())
      .map(([id, list]) => {
        const calc = CALCULATORS.find(c => c.id === id);
        const a = list.filter(e => e.timestamp >= aMin && e.timestamp <= aMax);
        const b = list.filter(e => e.timestamp >= bMin && e.timestamp <= bMax);
        return {
          id,
          name: calc?.name ?? id,
          shortName: calc?.shortName ?? id,
          a: statsOf(a),
          b: statsOf(b),
        };
      })
      .filter(r => r.a || r.b)
      .sort((x, y) => x.name.localeCompare(y.name));
  }, [allEntries, aStart, aEnd, bStart, bEnd]);

  const validRange = startOfDay(aStart) <= endOfDay(aEnd) && startOfDay(bStart) <= endOfDay(bEnd);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <GitCompareArrows className="h-5 w-5 text-primary" />
          Comparação de períodos
        </CardTitle>
        <CardDescription>
          Compare a evolução por instrumento entre dois intervalos de datas (mín / média / máx).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Badge variant="outline">A</Badge> Período de referência
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="a-start" className="text-xs">Início</Label>
                <Input id="a-start" type="date" value={aStart} onChange={e => setAStart(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="a-end" className="text-xs">Fim</Label>
                <Input id="a-end" type="date" value={aEnd} onChange={e => setAEnd(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Badge variant="outline">B</Badge> Período de comparação
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="b-start" className="text-xs">Início</Label>
                <Input id="b-start" type="date" value={bStart} onChange={e => setBStart(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="b-end" className="text-xs">Fim</Label>
                <Input id="b-end" type="date" value={bEnd} onChange={e => setBEnd(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const t = new Date();
              setAStart(toInputDate(new Date(t.getTime() - 60 * 86400000)));
              setAEnd(toInputDate(new Date(t.getTime() - 30 * 86400000)));
              setBStart(toInputDate(new Date(t.getTime() - 30 * 86400000)));
              setBEnd(toInputDate(t));
            }}
          >
            Últimos 30d vs 30d anteriores
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const t = new Date();
              setAStart(toInputDate(new Date(t.getTime() - 180 * 86400000)));
              setAEnd(toInputDate(new Date(t.getTime() - 90 * 86400000)));
              setBStart(toInputDate(new Date(t.getTime() - 90 * 86400000)));
              setBEnd(toInputDate(t));
            }}
          >
            Últimos 90d vs 90d anteriores
          </Button>
        </div>

        {!validRange && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>Intervalo inválido: a data de início deve preceder o fim.</AlertDescription>
          </Alert>
        )}

        {validRange && rows.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Nenhum cálculo encontrado nos períodos selecionados. Ajuste as datas para incluir registros existentes.
            </AlertDescription>
          </Alert>
        ) : validRange && (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs">
                <tr>
                  <th className="text-left p-2 font-semibold">Instrumento</th>
                  <th className="text-center p-2 font-semibold" colSpan={4}>
                    <Badge variant="outline" className="mr-1">A</Badge> Referência
                  </th>
                  <th className="text-center p-2 font-semibold" colSpan={4}>
                    <Badge variant="outline" className="mr-1">B</Badge> Comparação
                  </th>
                  <th className="text-center p-2 font-semibold" colSpan={3}>Δ (B − A)</th>
                </tr>
                <tr className="text-[11px] text-muted-foreground border-t">
                  <th></th>
                  <th className="p-1.5 font-medium">n</th>
                  <th className="p-1.5 font-medium">mín</th>
                  <th className="p-1.5 font-medium">méd</th>
                  <th className="p-1.5 font-medium">máx</th>
                  <th className="p-1.5 font-medium">n</th>
                  <th className="p-1.5 font-medium">mín</th>
                  <th className="p-1.5 font-medium">méd</th>
                  <th className="p-1.5 font-medium">máx</th>
                  <th className="p-1.5 font-medium">mín</th>
                  <th className="p-1.5 font-medium">méd</th>
                  <th className="p-1.5 font-medium">máx</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-t hover:bg-muted/30">
                    <td className="p-2 font-medium">{r.name}</td>
                    <td className="p-1.5 text-center text-muted-foreground">{r.a?.count ?? 0}</td>
                    <td className="p-1.5 text-center">{r.a ? fmt(r.a.min) : '—'}</td>
                    <td className="p-1.5 text-center font-semibold">{r.a ? fmt(r.a.avg) : '—'}</td>
                    <td className="p-1.5 text-center">{r.a ? fmt(r.a.max) : '—'}</td>
                    <td className="p-1.5 text-center text-muted-foreground">{r.b?.count ?? 0}</td>
                    <td className="p-1.5 text-center">{r.b ? fmt(r.b.min) : '—'}</td>
                    <td className="p-1.5 text-center font-semibold">{r.b ? fmt(r.b.avg) : '—'}</td>
                    <td className="p-1.5 text-center">{r.b ? fmt(r.b.max) : '—'}</td>
                    <td className="p-1.5 text-center"><DeltaCell a={r.a?.min} b={r.b?.min} /></td>
                    <td className="p-1.5 text-center"><DeltaCell a={r.a?.avg} b={r.b?.avg} /></td>
                    <td className="p-1.5 text-center"><DeltaCell a={r.a?.max} b={r.b?.max} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">
          Para escores de atividade (ex.: DAS28, BASDAI, SLEDAI), Δ positivo (vermelho) sugere piora; Δ negativo (verde) sugere melhora. Interprete sempre no contexto clínico.
        </p>
      </CardContent>
    </Card>
  );
}
