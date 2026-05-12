import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, History, ArrowLeft, TrendingUp, TrendingDown, Minus, Info, Pencil, Check, X, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CALCULATORS, getHistoryByPatient, clearPatientHistory, updateHistoryNote, sanitizeNote, type HistoryEntry } from '@/lib/calculators';
import { toast } from 'sonner';

interface Props {
  patientCode: string;
  onBack: () => void;
}

interface CalculatorGroup {
  calculatorId: string;
  name: string;
  shortName: string;
  entries: HistoryEntry[]; // sorted ascending
  trend: 'up' | 'down' | 'flat';
  delta: number;
  latest: HistoryEntry;
  earliest: HistoryEntry;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function PatientHistoryPanel({ patientCode, onBack }: Props) {
  const [version, setVersion] = useState(0);
  const groups: CalculatorGroup[] = useMemo(() => {
    const entries = getHistoryByPatient(patientCode);
    const byCalc = new Map<string, HistoryEntry[]>();
    for (const e of entries) {
      if (!byCalc.has(e.calculatorId)) byCalc.set(e.calculatorId, []);
      byCalc.get(e.calculatorId)!.push(e);
    }
    return Array.from(byCalc.entries()).map(([id, list]) => {
      const sorted = [...list].sort((a, b) => a.timestamp - b.timestamp);
      const latest = sorted[sorted.length - 1];
      const earliest = sorted[0];
      const calc = CALCULATORS.find(c => c.id === id);
      const delta = latest.score - earliest.score;
      const trend: 'up' | 'down' | 'flat' = Math.abs(delta) < 0.01 ? 'flat' : delta > 0 ? 'up' : 'down';
      return {
        calculatorId: id,
        name: calc?.name ?? id,
        shortName: calc?.shortName ?? id,
        entries: sorted,
        trend,
        delta,
        latest,
        earliest,
      };
    }).sort((a, b) => b.latest.timestamp - a.latest.timestamp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientCode, version]);

  const handleClear = () => {
    if (!confirm(`Apagar todo o histórico do paciente ${patientCode}? Esta ação não pode ser desfeita.`)) return;
    clearPatientHistory(patientCode);
    toast.success('Histórico do paciente apagado');
    onBack();
  };

  const totalCalculations = groups.reduce((s, g) => s + g.entries.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-1" />Voltar
          </Button>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Histórico — <span className="font-mono text-primary">{patientCode}</span>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {totalCalculations} cálculo(s) em {groups.length} instrumento(s) • somente código opaco, sem identificadores
          </p>
        </div>
        {totalCalculations > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4 mr-1" />Apagar tudo
          </Button>
        )}
      </div>

      {totalCalculations === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Nenhum cálculo registrado para este paciente. Selecione uma calculadora e os resultados serão automaticamente vinculados a <strong className="font-mono">{patientCode}</strong>.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {groups.map(g => (
            <Card key={g.calculatorId}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {g.name}
                      <Badge variant="outline">{g.entries.length}×</Badge>
                    </CardTitle>
                    <CardDescription>
                      Primeiro: {formatTime(g.earliest.timestamp)} • Último: {formatTime(g.latest.timestamp)}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{g.latest.score}</p>
                    {g.entries.length > 1 && (
                      <p className={`text-sm flex items-center gap-1 justify-end ${
                        g.trend === 'up' ? 'text-destructive' : g.trend === 'down' ? 'text-success' : 'text-muted-foreground'
                      }`}>
                        {g.trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
                         g.trend === 'down' ? <TrendingDown className="h-4 w-4" /> :
                         <Minus className="h-4 w-4" />}
                        Δ {g.delta > 0 ? '+' : ''}{g.delta.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {g.entries.length >= 2 && (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={g.entries.map(e => ({ date: formatDate(e.timestamp), score: e.score, ts: e.timestamp }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                          }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {[...g.entries].reverse().map((e, i) => (
                    <EntryRow
                      key={`${e.timestamp}-${i}`}
                      entry={e}
                      isLatest={i === 0}
                      onSaved={() => setVersion(v => v + 1)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
