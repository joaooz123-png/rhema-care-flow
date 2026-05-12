import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { UserRound, X, ShieldCheck, History } from 'lucide-react';
import { getActivePatientCode, setActivePatientCode, sanitizePatientCode, getPatientCodes } from '@/lib/calculators';
import { toast } from 'sonner';

interface Props {
  onShowHistory: () => void;
}

export function PatientContextBar({ onShowHistory }: Props) {
  const [code, setCode] = useState('');
  const [active, setActive] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setActive(getActivePatientCode());
    setRecent(getPatientCodes());
  }, []);

  const apply = (raw: string) => {
    const s = sanitizePatientCode(raw);
    if (!s) {
      toast.error('Código inválido. Use 2–32 caracteres A-Z, 0-9 ou hífen.');
      return;
    }
    setActivePatientCode(s);
    setActive(s);
    setCode('');
    setRecent(getPatientCodes());
    toast.success(`Contexto do paciente: ${s}`);
  };

  const clear = () => {
    setActivePatientCode(null);
    setActive('');
    toast.info('Contexto do paciente limpo.');
  };

  return (
    <Card className="p-3 mb-4 border-primary/20 bg-primary/5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <UserRound className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium">Paciente ativo:</span>
          {active ? (
            <>
              <Badge variant="default" className="font-mono">{active}</Badge>
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={clear}>
                <X className="h-3.5 w-3.5 mr-1" />Limpar
              </Button>
              <Button size="sm" variant="outline" className="h-7" onClick={onShowHistory}>
                <History className="h-3.5 w-3.5 mr-1" />Histórico
              </Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">nenhum — cálculos não serão vinculados</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter') apply(code); }}
            placeholder="Patient Code (ex: PT-A4F2)"
            className="h-8 w-48 font-mono text-sm"
            maxLength={32}
          />
          <Button size="sm" className="h-8" onClick={() => apply(code)}>Definir</Button>
        </div>
      </div>

      <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0 text-success" />
        <p>
          Use apenas <strong>códigos opacos</strong> (ex.: PT-001, MRN últimos 4 dígitos). Não digite nome, CPF, e-mail ou data de nascimento.
          Os cálculos são salvos localmente neste navegador, sem envio para o servidor.
        </p>
      </div>

      {recent.length > 0 && !active && (
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground">Recentes:</span>
          {recent.slice(0, 8).map(c => (
            <Badge
              key={c}
              variant="outline"
              className="cursor-pointer font-mono hover:bg-primary/10"
              onClick={() => apply(c)}
            >
              {c}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}
