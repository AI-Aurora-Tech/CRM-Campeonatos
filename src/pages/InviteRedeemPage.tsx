import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trophy, ShieldCheck } from 'lucide-react';
import { getSupabase } from '../lib/supabaseClient';

type InviteInfo = { valid: boolean; clubId: string | null; clubName: string | null; championshipName: string | null };

export function InviteRedeemPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const supabase = getSupabase();

  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void supabase.rpc('get_club_invite', { p_token: token }).then(({ data }) => {
      if (!cancelled) {
        setInfo((data as InviteInfo) ?? { valid: false, clubId: null, clubName: null, championshipName: null });
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [supabase, token]);

  const submit = async () => {
    setError(null);
    if (!supabase || !token) return;
    if (username.trim().length < 3) return setError('Escolha um usuário com pelo menos 3 caracteres.');
    if (password.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.');
    if (password !== confirm) return setError('As senhas não conferem.');

    setBusy(true);
    try {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { username: username.trim(), full_name: info?.clubName ?? username.trim(), must_change_password: false } },
      });
      if (signUpErr) {
        setError(signUpErr.message);
        return;
      }
      // Sem sessão = projeto exige confirmação de e-mail.
      if (!signUpData.session) {
        setDone('Conta criada! Confirme seu e-mail e depois faça login para concluir o vínculo com o clube.');
        return;
      }
      const { error: redeemErr } = await supabase.rpc('redeem_club_invite', { p_token: token });
      if (redeemErr) {
        setError(redeemErr.message);
        return;
      }
      navigate('/', { replace: true });
    } finally {
      setBusy(false);
    }
  };

  if (!supabase) {
    return <CenteredMsg title="Indisponível" text="Sistema não configurado para convites no momento." />;
  }
  if (loading) {
    return <CenteredMsg title="Carregando convite…" text="" />;
  }
  if (!info?.valid) {
    return <CenteredMsg title="Convite inválido" text="Este convite não existe, expirou ou já foi utilizado. Peça um novo link ao organizador." />;
  }
  if (done) {
    return <CenteredMsg title="Quase lá!" text={done} />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-7 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center text-white">
            <Trophy size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight leading-none">Inscrição do time</h1>
            <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest mt-1">
              {info.clubName}{info.championshipName ? ` • ${info.championshipName}` : ''}
            </p>
          </div>
        </div>

        <p className="text-sm text-text-muted">
          Crie o acesso do <strong>{info.clubName}</strong> para inscrever os atletas e acompanhar os jogos.
        </p>

        <div className="space-y-3">
          <input type="text" placeholder="Usuário (ex.: nome_do_time)" autoComplete="username" value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full text-sm rounded-xl px-4 py-3 bg-neutral-100 border border-neutral-200 focus:border-accent outline-none" />
          <input type="email" placeholder="E-mail (recuperação de senha)" autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-sm rounded-xl px-4 py-3 bg-neutral-100 border border-neutral-200 focus:border-accent outline-none" />
          <input type="password" placeholder="Senha" autoComplete="new-password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-sm rounded-xl px-4 py-3 bg-neutral-100 border border-neutral-200 focus:border-accent outline-none" />
          <input type="password" placeholder="Confirmar senha" autoComplete="new-password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full text-sm rounded-xl px-4 py-3 bg-neutral-100 border border-neutral-200 focus:border-accent outline-none" />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="button" disabled={busy} onClick={() => void submit()}
            className="w-full flex items-center justify-center gap-2 text-sm font-black uppercase py-3 rounded-xl bg-accent text-white disabled:opacity-50">
            <ShieldCheck size={16} /> {busy ? 'Criando acesso…' : 'Criar acesso do time'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CenteredMsg({ title, text }: { title: string; text: string }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center space-y-3">
        <h1 className="text-xl font-black uppercase tracking-tight">{title}</h1>
        {text && <p className="text-sm text-text-muted">{text}</p>}
        <a href="/" className="inline-block mt-2 text-xs font-black uppercase text-accent">Ir para a página inicial</a>
      </div>
    </div>
  );
}
