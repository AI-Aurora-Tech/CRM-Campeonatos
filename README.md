# GESTOR FC — CRM de campeonatos

Aplicação web para gestão de campeonatos de futebol amador: clubes, atletas, jogos, súmulas, finanças, árbitros, portal público e modo campo (PWA). O estado pode ser **local (mock)** ou **persistido no [Supabase](https://supabase.com/)** (PostgreSQL, Auth, Row Level Security, Storage e Edge Functions).

## Stack

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS 4**
- **Supabase** (`@supabase/supabase-js`): dados, autenticação e funções serverless
- **Recharts**, **Motion**, **Lucide**
- **vite-plugin-pwa** (service worker em produção)

## Pré-requisitos

- [Node.js](https://nodejs.org/) (LTS recomendado)
- Conta e projeto **Supabase** (opcional, para dados reais na nuvem)

## Configuração

1. Instalar dependências:

   ```bash
   npm install
   ```

2. Criar ficheiro de ambiente a partir do exemplo:

   ```bash
   cp .env.example .env.local
   ```

3. Preencher variáveis em `.env.local` (ver [.env.example](.env.example)):

   | Variável | Descrição |
   |----------|-----------|
   | `VITE_SUPABASE_URL` | URL do projeto Supabase |
   | `VITE_SUPABASE_ANON_KEY` | Chave anónima (segura no browser) |
   | `VITE_CHAMPIONSHIP_ID` | ID do campeonato padrão (ex.: `ch1`) |
   | `VITE_CHECKIN_DEV_SECRET` | Segredo demo para tokens de check-in (alinhado com a Edge `checkin-validate`) |
   | `GEMINI_API_KEY` | Opcional: insights no cliente / IA |

   **Nunca** commits com secrets reais. Use sempre `.env.local` (ignorado pelo Git).

## Executar em desenvolvimento

```bash
npm run dev
```

Por omissão o servidor escuta na porta **3000** (`0.0.0.0`). Sem Supabase configurado, a app usa dados de demonstração em memória.

## Supabase (base de dados e auth)

- Migrações SQL em [supabase/migrations/](supabase/migrations/).
- Configuração local da CLI: [supabase/config.toml](supabase/config.toml).

Fluxo típico com [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref <seu-project-ref>
supabase db push
```

Após aplicar migrações, crie um utilizador (Auth → e-mail/password). O trigger `handle_new_user` associa novos registos à organização demo `org-1` como `SUPER_ADMIN` (adequado a ambientes de desenvolvimento; ajuste políticas para produção).

No front, faça **login** no painel lateral para carregar e sincronizar dados com o Postgres (debounce de gravação após edições).

## Edge Functions

Código em [supabase/functions/](supabase/functions/). Deploy e secrets via CLI ou painel Supabase.

| Função | Função |
|--------|--------|
| `gemini-suggest` | Sugestões com Gemini; grava linhas em `ai_suggestions` (com service role) |
| `send-notification` | E-mail (ex.: Resend com `RESEND_API_KEY`) |
| `pix-webhook` | Webhook de pagamento; atualiza `payments` / `invoices` / `clubs` |
| `checkin-validate` | Valida token e regista check-in em `match_roster` |

Defina no projeto, conforme necessário: `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `PAYMENT_WEBHOOK_SECRET`, `CHECKIN_HMAC_SECRET`.

## Scripts npm

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (+ assets PWA) |
| `npm run preview` | Pré-visualizar o build |
| `npm run lint` | Verificação TypeScript (`tsc --noEmit`) |

## Rotas úteis

| Rota | Descrição |
|------|------------|
| `/` | CRM principal |
| `/p/:slug` | Portal público (dados via RPC `get_public_championship`) |
| `/field/:matchId` | Modo campo simplificado (placar; requer Supabase e sessão com permissões de escrita) |

## Estrutura do código (resumo)

- `src/App.tsx` — UI principal e vistas
- `src/hooks/useAppData.ts` — Estado global, auth e sync com Supabase
- `src/api/` — Mapeamentos, fetch do dashboard e snapshot para o servidor
- `src/lib/supabaseClient.ts` — Cliente Supabase singleton
- `src/pages/` — Rotas públicas e modo campo

## Build de produção

```bash
npm run build
```

O output fica em `dist/`, com manifest e service worker gerados pelo plugin PWA.

## Licença e origem

Parte do código segue licença **Apache-2.0** (cabeçalhos em ficheiros indicados). O projeto evoluiu a partir de um template exportado do ecossistema Google / AI Studio; a integração Supabase, migrações e documentação deste README são específicas deste repositório.
