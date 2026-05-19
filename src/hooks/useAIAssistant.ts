import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-config-assistant`;

type AssistantPayload = {
  content?: string;
  response?: string;
  answer?: string;
  message?: string | { content?: string };
  choices?: Array<{ message?: { content?: string }; delta?: { content?: string } }>;
};

function extractAssistantText(payload: AssistantPayload): string {
  if (typeof payload.content === 'string') return payload.content;
  if (typeof payload.response === 'string') return payload.response;
  if (typeof payload.answer === 'string') return payload.answer;
  if (typeof payload.message === 'string') return payload.message;
  if (typeof payload.message?.content === 'string') return payload.message.content;

  const choice = payload.choices?.[0];
  return choice?.message?.content || choice?.delta?.content || '';
}

export function useAIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isLoading) return;

    if (!user) {
      toast.error('Faça login para usar o assistente.');
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    let assistantContent = '';

    const updateAssistant = (chunk: string) => {
      if (!chunk) return;
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date(),
          },
        ];
      });
    };

    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
        throw new Error('Configuração do Supabase ausente no ambiente.');
      }

      const conversationHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        toast.error('Sessão expirada. Faça login novamente.');
        setIsLoading(false);
        return;
      }

      const response = await fetch(AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream, application/json, text/plain',
          Authorization: `Bearer ${accessToken}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          'x-idempotency-key': userMessage.id,
        },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        let errorData: { error?: string; message?: string } = {};
        try {
          errorData = errorText ? JSON.parse(errorText) : {};
        } catch {
          errorData = { message: errorText };
        }

        if (response.status === 429) {
          toast.error('Limite de requisições. Aguarde um momento.');
        } else if (response.status === 402) {
          setPaywallOpen(true);
          toast.error(errorData.error || errorData.message || 'Cota grátis esgotada. Compre créditos via PIX.');
        } else if (response.status === 401) {
          toast.error('Faça login para usar o assistente.');
        } else {
          toast.error(errorData.error || errorData.message || 'Falha ao obter resposta da IA');
        }
        setIsLoading(false);
        return;
      }

      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('text/event-stream')) {
        const raw = await response.text();
        if (!raw.trim()) throw new Error('Resposta vazia da IA.');

        try {
          const parsed = JSON.parse(raw) as AssistantPayload;
          const content = extractAssistantText(parsed);
          updateAssistant(content || raw);
        } catch {
          updateAssistant(raw);
        }

        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Resposta da IA sem corpo de streaming.');

      const decoder = new TextDecoder();
      let buffer = '';
      let doneSignal = false;

      const consumeSseLine = (line: string) => {
        const cleaned = line.endsWith('\r') ? line.slice(0, -1) : line;
        if (cleaned.startsWith(':') || cleaned.trim() === '') return;
        if (!cleaned.startsWith('data:')) return;

        const jsonStr = cleaned.slice(5).trim();
        if (jsonStr === '[DONE]') {
          doneSignal = true;
          return;
        }

        try {
          const parsed = JSON.parse(jsonStr) as AssistantPayload;
          updateAssistant(extractAssistantText(parsed));
        } catch {
          // Ignore malformed partial chunks instead of killing the full answer.
        }
      };

      while (!doneSignal) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          consumeSseLine(line);
          if (doneSignal) break;
        }
      }

      if (buffer.trim() && !doneSignal) {
        buffer.split('\n').forEach(consumeSseLine);
      }

      if (!assistantContent.trim()) {
        throw new Error('A IA respondeu, mas nenhum texto foi recebido pelo frontend.');
      }
    } catch (error) {
      console.error('AI assistant error:', error);
      toast.error(error instanceof Error ? error.message : 'Falha ao comunicar com o assistente de IA');
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, user]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    paywallOpen,
    setPaywallOpen,
  };
}
