import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, supabaseEnvError } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function DeployConfigError({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <section className="w-full max-w-2xl rounded-2xl border border-red-400/40 bg-red-950/30 p-6 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-300">Erro de configuracao do deploy</p>
        <h1 className="mt-2 text-2xl font-bold">O app carregou, mas falta configurar o Supabase no Vercel</h1>
        <p className="mt-4 text-slate-200">{message}</p>
        <div className="mt-5 rounded-xl bg-slate-900 p-4 font-mono text-sm text-slate-200">
          <p>VITE_SUPABASE_URL=https://seu-project-id.supabase.co</p>
          <p>VITE_SUPABASE_PUBLISHABLE_KEY=sua_anon_public_key</p>
        </div>
      </section>
    </main>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabaseEnvError) {
      setLoading(false);
      return;
    }

    let mounted = true;
    let initialized = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        initialized = true;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted || initialized) return;
        initialized = true;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load initial session:', err);
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (supabaseEnvError) return { error: new Error(supabaseEnvError) };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (supabaseEnvError) return { error: new Error(supabaseEnvError) };
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    if (supabaseEnvError) return;
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (supabaseEnvError) return { error: new Error(supabaseEnvError) };
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    if (supabaseEnvError) return { error: new Error(supabaseEnvError) };
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  if (supabaseEnvError) {
    return <DeployConfigError message={supabaseEnvError} />;
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
