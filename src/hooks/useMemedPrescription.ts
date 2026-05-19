import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Estrutura do paciente conforme documentação oficial Memed
 * https://doc.memed.com.br/docs/frontend/comandos-mdhub/set-patient
 *
 * Campos obrigatórios pela API: idExterno, nome, cpf, sexo
 * (No nosso uso clínico, o `nome` é sempre o patient_code — nunca PII real.)
 */
export interface MemedPatient {
  /** Identificador único interno (UUID/hash). NÃO usar PII. */
  idExterno?: string;
  /** Nome OU código do paciente (no nosso fluxo: patient_code). */
  nome: string;
  /** CPF apenas dígitos (obrigatório pela Memed; usar passaporte se ausente). */
  cpf?: string;
  passaporte?: string;
  /** Aceita: "Masculino" | "Feminino" | "M" | "F" */
  sexo?: 'Masculino' | 'Feminino' | 'M' | 'F' | 'Não informado';
  /** dd/mm/YYYY */
  data_nascimento?: string;
  nome_social?: string;
  telefone?: string;
  email?: string;
  /** "branca" | "preta" | "parda" | "amarela" | "indígena" */
  raca?: 'branca' | 'preta' | 'parda' | 'amarela' | 'indígena';
  /** Em quilogramas */
  peso?: number;
  /** Em metros */
  altura?: number;
  endereco?: string;
  cidade?: string;
  nome_mae?: string;
  dificuldade_locomocao?: boolean;
}

export interface MemedHookReturn {
  ready: boolean;
  loading: boolean;
  error: string | null;
  tokenAuto: boolean;
  setPatient: (patient: MemedPatient) => Promise<boolean>;
  showPrescription: () => void;
  hidePrescription: () => void;
  setDoctorTokenManual: (token: string) => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MdHub?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MdSinapsePrescricao?: any;
  }
}

const MEMED_SCRIPT_ID = 'memed-sdk-script';

// URL oficial homologação (doc.memed.com.br/docs/primeiros-passos)
const MEMED_SCRIPT_DEFAULT =
  'https://integrations.memed.com.br/modulos/plataforma.sinapse-prescricao/build/sinapse-prescricao.min.js';

function loadMemedScript(src: string, token?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(MEMED_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing && existing.src === src && existing.getAttribute('data-token') === (token ?? null)) {
      resolve();
      return;
    }
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = MEMED_SCRIPT_ID;
    script.type = 'text/javascript';
    script.src = src;
    script.setAttribute('data-color', '#0ea5e9');
    if (token) script.setAttribute('data-token', token);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar SDK Memed'));
    document.head.appendChild(script);
  });
}

/**
 * Aguarda o módulo `plataforma.prescricao` ficar disponível usando o
 * evento oficial `core:moduleInit` (doc.memed.com.br/docs/primeiros-passos).
 */
function waitForPrescricaoModule(timeoutMs = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (err?: Error) => {
      if (done) return;
      done = true;
      err ? reject(err) : resolve();
    };

    const timer = setTimeout(
      () => finish(new Error('Timeout aguardando módulo Memed (core:moduleInit)')),
      timeoutMs,
    );

    const tryRegister = () => {
      if (window.MdSinapsePrescricao?.event?.add) {
        window.MdSinapsePrescricao.event.add('core:moduleInit', (mod: { name?: string }) => {
          if (mod?.name === 'plataforma.prescricao') {
            clearTimeout(timer);
            finish();
          }
        });
        // Caso o módulo já esteja inicializado quando entramos aqui:
        if (window.MdHub?.module) {
          clearTimeout(timer);
          finish();
        }
        return true;
      }
      return false;
    };

    if (tryRegister()) return;

    // Polling até MdSinapsePrescricao existir (script ainda baixando)
    const iv = setInterval(() => {
      if (tryRegister()) clearInterval(iv);
    }, 150);
    setTimeout(() => clearInterval(iv), timeoutMs);
  });
}

export function useMemedPrescription(): MemedHookReturn {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenAuto, setTokenAuto] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    setLoading(true);
    setError(null);

    async function init() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        // 1) Tenta token automático via edge function
        if (accessToken) {
          const res = await supabase.functions.invoke('memed-token', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!res.error && res.data?.token) {
            const { token, scriptUrl } = res.data as { token: string; scriptUrl: string };
            await loadMemedScript(scriptUrl ?? MEMED_SCRIPT_DEFAULT, token);
            await waitForPrescricaoModule();
            setTokenAuto(true);
            setReady(true);
            return;
          }

          // configured:false → fallback manual sem erro
          const scriptUrl =
            (res.data && (res.data as { scriptUrl?: string }).scriptUrl) ?? MEMED_SCRIPT_DEFAULT;
          await loadMemedScript(scriptUrl);
          await waitForPrescricaoModule();
          setReady(true);
          return;
        }

        // 2) Sem sessão: carrega o script puro
        await loadMemedScript(MEMED_SCRIPT_DEFAULT);
        await waitForPrescricaoModule();
        setReady(true);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[Memed] init error:', msg);
        setError(msg);
        setReady(false);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  const setDoctorTokenManual = useCallback((token: string) => {
    if (!window.MdHub) {
      console.warn('[Memed] MdHub não inicializado');
      return;
    }
    // Comando oficial de autenticação
    window.MdHub.command.send('plataforma.autenticacao', 'setToken', token);
    setTokenAuto(true);
  }, []);

  const setPatient = useCallback(async (patient: MemedPatient) => {
    if (!window.MdHub) {
      console.warn('[Memed] MdHub não inicializado');
      return false;
    }
    const payload = Object.fromEntries(Object.entries({
      idExterno: patient.idExterno,
      nome: patient.nome,
      cpf: patient.cpf,
      passaporte: patient.passaporte,
      sexo: patient.sexo ?? 'Não informado',
      data_nascimento: patient.data_nascimento,
      nome_social: patient.nome_social,
      telefone: patient.telefone,
      email: patient.email,
      raca: patient.raca,
      peso: patient.peso,
      altura: patient.altura,
      endereco: patient.endereco,
      cidade: patient.cidade,
      nome_mae: patient.nome_mae,
      dificuldade_locomocao: patient.dificuldade_locomocao ?? false,
    }).filter(([, value]) => value !== undefined && value !== ''));

    // Comando oficial: setPaciente (PT-BR) com nomes de campos exatos da doc
    try {
      await window.MdHub.command.send('plataforma.prescricao', 'setPaciente', payload);
      return true;
    } catch (e) {
      console.error('[Memed] setPaciente:', e);
      setError('Falha ao configurar paciente na Memed');
      return false;
    }
  }, []);

  const showPrescription = useCallback(() => {
    if (!window.MdHub) {
      console.warn('[Memed] MdHub não inicializado');
      return;
    }
    window.MdHub.module.show('plataforma.prescricao');
  }, []);

  const hidePrescription = useCallback(() => {
    if (!window.MdHub) return;
    window.MdHub.module.hide('plataforma.prescricao');
  }, []);

  return {
    ready,
    loading,
    error,
    tokenAuto,
    setPatient,
    showPrescription,
    hidePrescription,
    setDoctorTokenManual,
  };
}
