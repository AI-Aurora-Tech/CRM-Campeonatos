import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';

type Props = {
  session: Session | null;
  authReady: boolean;
  remoteLoading: boolean;
  remoteError: string | null;
  useRemote: boolean;
  onSignIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  onSignUp: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  onSignOut: () => Promise<void>;
  onReload: () => Promise<void>;
};

export function AuthPanel({
  session,
  authReady,
  remoteLoading,
  remoteError,
  useRemote,
  onSignIn,
  onSignUp,
  onSignOut,
  onReload,
}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!authReady) {
    return <p className="text-[10px] text-white/60 px-1">Carregando sessão…</p>;
  }

  if (session) {
    return (
      <div className="rounded-xl bg-white/10 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">Nuvem</span>
          {useRemote && (
            <span className="text-[9px] font-bold text-emerald-300 uppercase">Sincronizado</span>
          )}
        </div>
        {remoteLoading && <p className="text-[10px] text-white/60">Atualizando dados…</p>}
        {remoteError && <p className="text-[10px] text-red-200 break-words">{remoteError}</p>}
        <button
          type="button"
          onClick={() => void onReload()}
          className="w-full text-[10px] font-bold uppercase py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white"
        >
          Recarregar do servidor
        </button>
        <button
          type="button"
          onClick={() => void onSignOut()}
          className="w-full text-[10px] font-bold uppercase py-2 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-white"
        >
          Sair da conta
        </button>
      </div>
    );
  }

  const handle = async (mode: 'in' | 'up') => {
    setBusy(true);
    setMsg(null);
    try {
      const fn = mode === 'in' ? onSignIn : onSignUp;
      const { error } = await fn(email.trim(), password);
      if (error) {
        setMsg(error.message);
      } else if (mode === 'up') {
        setMsg('Verifique o e-mail para confirmar a conta (se exigido no projeto).');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl bg-white/10 p-3 space-y-2">
      <p className="text-[9px] font-bold uppercase tracking-wider text-white/70">Entrar (Supabase)</p>
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full text-[11px] rounded-lg px-2 py-1.5 bg-white/90 text-neutral-900 placeholder:text-neutral-400 border-0"
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full text-[11px] rounded-lg px-2 py-1.5 bg-white/90 text-neutral-900 placeholder:text-neutral-400 border-0"
      />
      {msg && <p className="text-[10px] text-amber-200 break-words">{msg}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void handle('in')}
          className="flex-1 text-[10px] font-bold uppercase py-2 rounded-lg bg-accent text-white disabled:opacity-50"
        >
          Login
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void handle('up')}
          className="flex-1 text-[10px] font-bold uppercase py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white disabled:opacity-50"
        >
          Registrar
        </button>
      </div>
    </div>
  );
}
