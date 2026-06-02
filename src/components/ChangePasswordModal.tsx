import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

type Props = {
  /** Quando true, o modal bloqueia a tela até a senha ser trocada. */
  forced: boolean;
  onChangePassword: (newPassword: string) => Promise<{ error: { message: string } | null }>;
  onClose?: () => void;
};

export function ChangePasswordModal({ forced, onChangePassword, onClose }: Props) {
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (pwd.length < 6) {
      setError('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (pwd !== confirm) {
      setError('As senhas não conferem.');
      return;
    }
    setBusy(true);
    try {
      const { error: err } = await onChangePassword(pwd);
      if (err) {
        setError(err.message);
        return;
      }
      onClose?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-accent/10 p-2 text-accent">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              {forced ? 'Defina uma nova senha' : 'Alterar senha'}
            </h2>
            {forced && (
              <p className="text-[11px] text-neutral-500">
                Você está usando uma senha temporária. Crie uma senha pessoal para continuar.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Nova senha"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 bg-neutral-100 text-neutral-900 placeholder:text-neutral-400 border border-neutral-200 focus:border-accent outline-none"
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Confirmar nova senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full text-sm rounded-lg px-3 py-2 bg-neutral-100 text-neutral-900 placeholder:text-neutral-400 border border-neutral-200 focus:border-accent outline-none"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex gap-2">
          {!forced && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-xs font-bold uppercase py-2.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            className="flex-1 text-xs font-bold uppercase py-2.5 rounded-lg bg-accent text-white disabled:opacity-50"
          >
            {busy ? 'Salvando…' : 'Salvar senha'}
          </button>
        </div>
      </div>
    </div>
  );
}
