# GESTOR FC — CRM de Campeonatos Amadores

Sistema completo de gestão de ligas e campeonatos de futebol amador. Cobre todo o ciclo de vida de uma competição: cadastro de times e atletas, aprovação de documentos, escalação, súmula digital ao vivo, financeiro, automações e portal público.

---

## Índice

1. [Stack](#stack)
2. [Configuração e Execução](#configuração-e-execução)
3. [Sistema Multi-Campeonato](#sistema-multi-campeonato)
4. [Módulos e Funcionalidades](#módulos-e-funcionalidades)
   - [Painel Geral](#painel-geral)
   - [Campeonatos](#campeonatos)
   - [Clubes & Atletas](#clubes--atletas)
   - [Atletas](#atletas)
   - [Árbitros](#árbitros)
   - [Súmulas Digitais](#súmulas-digitais)
   - [Campos & Sedes](#campos--sedes)
   - [Documentos & Elegibilidade](#documentos--elegibilidade)
   - [Financeiro](#financeiro)
   - [Súmula Pós-Jogo](#súmula-pós-jogo)
   - [Relatórios & Analytics](#relatórios--analytics)
   - [Automações & Alertas](#automações--alertas)
   - [Mídia & Galeria](#mídia--galeria)
   - [Portal Público](#portal-público)
5. [Fluxo Completo de uma Partida](#fluxo-completo-de-uma-partida)
6. [Modelo de Dados](#modelo-de-dados)
7. [Integração Supabase](#integração-supabase)
8. [Rotas](#rotas)
9. [Scripts npm](#scripts-npm)

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Vite 6 |
| Estilização | Tailwind CSS 4 |
| Animações | Framer Motion |
| Gráficos | Recharts |
| Ícones | Lucide React |
| Backend / Auth | Supabase (Postgres + Auth + Edge Functions + Storage) |
| PWA | vite-plugin-pwa (service worker em produção) |
| IA | Google Gemini (narrativa analítica) |

---

## Configuração e Execução

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env.local
# Preencher as variáveis conforme tabela abaixo

# Rodar em desenvolvimento
npm run dev   # porta 3000 por padrão
```

| Variável | Descrição |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima (segura no browser) |
| `VITE_CHAMPIONSHIP_ID` | ID do campeonato padrão |
| `VITE_CHECKIN_DEV_SECRET` | Segredo demo para tokens de check-in |
| `GEMINI_API_KEY` | Opcional — narrativa analítica com IA |

> Sem as variáveis Supabase o app roda em modo offline com dados mock. Auth, financeiro e automações ficam desabilitados.

**Banco de dados (Supabase CLI):**

```bash
supabase link --project-ref <project-ref>
supabase db push   # aplica migrações em supabase/migrations/
```

---

## Sistema Multi-Campeonato

O app suporta múltiplas edições de campeonatos simultaneamente. Cada uma tem seus próprios clubes, atletas, partidas, árbitros, financeiro e configurações — completamente isolados.

- Toda a navegação opera no contexto do campeonato **ativo** (destaque com ponto pulsante na tela de Campeonatos).
- Para trocar, acesse **Campeonatos** e clique em outro card.
- Ao criar uma nova edição é possível **clonar** clubes, atletas, árbitros e sedes da edição anterior.

---

## Módulos e Funcionalidades

### Painel Geral

Visão executiva do campeonato ativo.

- Métricas rápidas: partidas disputadas, atletas suspensos, pendências financeiras
- **Tabela de classificação** completa: posição, pontos, jogos, vitórias, saldo de gols e forma (últimos 3 jogos com V/E/D)
- **Partidas de hoje**: ao vivo ou agendadas com placar em tempo real
- **Alertas**: atletas suspensos por time

---

### Campeonatos

Gerenciamento de todas as edições.

- Grid de cards com status (PLANEJAMENTO / ATIVO / ENCERRADO), quantidade de times e partidas
- **Criar campeonato**: nome, temporada, formato (pontos corridos, grupos, mata-mata), regras de cartão e pontuação
- **Clonar edição anterior**: copia clubes, atletas, árbitros e sedes com um clique
- **Gerar tabela de jogos** (round-robin automático via RPC)
- **Detectar conflitos** de calendário (mesmo time ou árbitro em datas sobrepostas)
- **Gerar chaveamento** mata-mata a partir da classificação atual
- **Link do Portal Público** para compartilhar com torcedores

---

### Clubes & Atletas

- Cards com logo, nome abreviado, contato e badge de **pendência financeira**
- Criar / editar / excluir clubes (nome, logo, presidente, endereço, campo mandante, regras personalizadas)
- Clicar no card abre a **Ficha do Clube**:
  - Desempenho na competição (posição, pontos, forma)
  - **Elenco** filtrado por posição (Goleiros / Defesa / Meio / Ataque)
  - Cada atleta exibe status, média de avaliação e **minutagem acumulada** no campeonato (⏱ 67')
  - Alertas disciplinares: suspensos e em risco de suspensão
  - Últimos resultados e próximas partidas

---

### Atletas

Gestão detalhada de jogadores.

- Filtros por clube, status e situação documental
- Cadastro completo: RG, CPF, data de nascimento, nome dos pais/responsável (menores), número da camisa, posição, foto, contrato
- **Status**: ATIVO ou SUSPENSO
- **Documentação**: PENDENTE / APROVADO / REJEITADO
- **Estatísticas**: partidas, gols, assistências, amarelos, vermelhos, média de avaliação, contagem de prêmios MVP
- Tela de detalhe com histórico de partidas e minutagem por jogo

---

### Árbitros

- Três níveis: **PRATA**, **OURO** e **ELITE**
- Disponibilidade (disponível / indisponível) com indicador visual
- Estatísticas: partidas apitadas e média de avaliação (1–5)
- Avaliações por clube com nota e comentário por partida
- **Calendário**: visão de quais árbitros apitam quais jogos

---

### Súmulas Digitais

O módulo central de operação de jogos.

#### Lista de Partidas

- Filtros por status (Agendado / Ao Vivo / Encerrado) e por time
- Cada linha: data, hora, times com logos, local, status do laudo
- Ações por status:
  - **Agendado** → **Iniciar** (abre Match Center)
  - **Ao Vivo** → **No Ar** (volta ao Match Center)
  - **Encerrado** → **Aprovar** ou **Contestar** laudo

#### Match Center — Controle da Partida ao Vivo

**Escalação inline (antes do apito)**

- Painel exibido no topo da página sem bloquear a tela
- Jogadores de ambos os times com **número da camisa** em destaque + nome, ordenados por número
- Toque no jogador alterna entre **T** (Titular) e **—** (Fora)
- Botão **"Apitar! Iniciar Partida"** salva escalação e inicia o cronômetro

**Cabeçalho ao vivo**

- Placar em tempo real (home × away) com cronômetro
- Botões: **Pausar / Retomar Relógio** e **Finalizar Jogo**
- Link para **Modo Campo** (PWA, nova aba)

**Control Center**

| Ação | Comportamento |
|---|---|
| **Gol** | Picker de jogadores em campo → registra gol e incrementa placar |
| **Cartão Amarelo** | Picker → registra amarelo (acumula para suspensão automática) |
| **Cartão Vermelho** | Picker → registra vermelho |
| **Troca** | Modal 2 etapas (ver abaixo) |

**Fluxo de substituição**

1. Clicar "Troca" → **"Quem SAI?"**: lista jogadores em campo com número/nome
2. Selecionar quem sai → **"Quem ENTRA?"**: lista atletas do time fora de campo
3. Confirmar → minuto registrado automaticamente, lineups atualizados (jogador que entrou aparece nos pickers seguintes)

**Linha do Tempo**

Todos os eventos em ordem cronológica com o minuto. Substituições exibem:
```
45'  ↓ Saiu   #10 Carlos Silva
     ↑ Entrou  #7 João Pereira
```

**Finalizar Jogo → MVP**

- Modal **"Melhor Jogador da Partida"** com apenas os jogadores que efetivamente jogaram (titulares originais + entradas de substituição)
- Seleção opcional — botão **"Encerrar sem MVP"** disponível
- Ao confirmar:
  - Partida → FINISHED, laudo PENDING
  - `mvpCount` do jogador incrementado
  - **Minutagem calculada automaticamente**:
    - Titular que ficou: minuto final
    - Titular substituído: minuto da saída
    - Quem entrou: minuto final − minuto de entrada

---

### Campos & Sedes

- Cadastro de venues: endereço, capacidade, telefone, instalações
- Associação a partidas
- Ativar / desativar sedes

---

### Documentos & Elegibilidade

Fluxo de aprovação documental dos atletas.

- Lista de atletas com documentação pendente, link do contrato e data de envio
- Botões **Aprovar** / **Rejeitar** com atualização imediata
- Contadores por status (aprovado, pendente, rejeitado)
- Atletas reprovados ficam inelegíveis automaticamente

---

### Financeiro

> Requer autenticação Supabase.

- **Faturas**: clube, descrição, valor (R$), vencimento, status (ABERTA / PAGA / CANCELADA / VENCIDA)
- **Pagamentos**: ID externo (correlação com Pix), método e status (PENDENTE / CONFIRMADO / FALHOU / REEMBOLSADO)
- **Webhook Pix** (`pix-webhook` Edge Function): atualiza status de pagamento automaticamente
- Badge de pendência financeira visível no card do clube em todo o sistema

---

### Súmula Pós-Jogo

- Selecione uma partida encerrada para ver o resumo completo
- Placar final, linha de eventos e escalações confirmadas
- **Aprovar** → `reportStatus = APPROVED`
- **Contestar** → campo de justificativa → `reportStatus = CONTESTED`
- Partidas contestadas ficam marcadas para revisão

---

### Relatórios & Analytics

**Aba Visão Geral**

| Gráfico | O que mostra |
|---|---|
| Ranking de Eficiência | Gols por partida — top 8 times mais eficientes |
| Fair Play | Pontuação disciplinar (amarelo=1pt, vermelho=3pt) |
| Ataque vs Defesa | Gols marcados × sofridos por time (linhas) |
| Distribuição de Gols | Em qual faixa de minutos os gols acontecem |
| Resultados | Proporção vitórias em casa / fora / empates (pizza) |

**Aba Hall da Fama**

| Prêmio | Critério |
|---|---|
| 🥇 Chuteira de Ouro | Artilheiro do campeonato |
| 🧤 Luva de Ouro | Goleiro com menor média de gols sofridos |
| 🏅 Fair Play | Time com menor pontuação disciplinar |
| ⭐ MVP | Atleta com maior média de avaliação |

**Narrativa IA (Gemini)**

Botão "Gerar Análise" produz um parágrafo em português descrevendo os destaques da competição com tom profissional, baseado nos dados reais.

---

### Automações & Alertas

Motor de notificações automáticas por e-mail/SMS/push.

| Tipo | Quando dispara |
|---|---|
| `MATCH_TOMORROW` | Partida no dia seguinte |
| `MATCH_7_DAYS` | Partida em 7 dias |
| `MISSING_LINEUP` | Escalação não enviada 24h antes |
| `PLAYER_SUSPENDED` | Atleta atingiu o limite de amarelos |
| `NEW_ROUND` | Nova rodada gerada |

**Fluxo:**
1. **"Escanear Triggers"** → sistema detecta todas as notificações pendentes
2. Painel exibe contadores: ENFILEIRADA / ENVIADA / FALHA
3. **"Disparar Pendentes"** → envia via Edge Function `send-notification`

---

### Mídia & Galeria

- Upload de fotos de jogo, banners e logos
- Categorias: PARTIDA / CLUBE / CAMPEONATO / GERAL
- Grid responsivo com zoom ao hover e overlay de categoria/data
- Exclusão direta pelo ícone de lixeira

---

### Portal Público

Página sem autenticação para divulgação de resultados. Link gerado na tela de Campeonatos.

| Aba | Conteúdo |
|---|---|
| Classificação | Tabela completa, top 4 verde / zona de risco vermelha, forma recente |
| Resultados | Jogos com badge AO VIVO pulsante, placar e data |
| Artilharia | Top 5 artilheiros com foto e gols |
| Clubes | Grid de todos os times com logos |
| Hall da Fama | Chuteira de Ouro, Luva de Ouro, Fair Play e MVP |

---

## Fluxo Completo de uma Partida

```
1. Cadastro
   Clube A e Clube B registrados com atletas com documentação aprovada

2. Agendamento
   Partida criada: data, hora, local, árbitro

3. Iniciar (dia do jogo)
   Clicar "Iniciar" → Match Center abre imediatamente

4. Escalação
   Coordenador seleciona titulares (T / —) pelo número/nome de cada time
   Clicar "Apitar! Iniciar Partida" → cronômetro inicia

5. Ao Vivo
   Registrar gols, cartões, substituições com minuto e jogadores
   Linha do tempo atualizada em tempo real

6. Substituição
   "Quem SAI?" → "Quem ENTRA?" → minuto registrado automaticamente
   Lineups atualizados para pickers subsequentes

7. Encerrar
   Clicar "Finalizar Jogo" → selecionar MVP (opcional)
   Minutagem de cada jogador calculada e salva no match

8. Pós-Jogo
   Laudo PENDENTE aguarda aprovação
   Admin aprova ou contesta com justificativa

9. Analytics & Portal
   Estatísticas, gráficos e Hall da Fama atualizados automaticamente
   Portal público reflete os novos resultados
```

---

## Modelo de Dados

```
Championship         — edição do campeonato (regras, formato, status)
  └── Club           — clube filiado (logo, contato, financeiro)
        └── Player   — atleta (docs, estatísticas, minutagem acumulada)
  └── Match          — partida (status, placar, escalação, eventos, MVP, minutesPlayed)
        └── MatchEvent — gol / cartão / substituição (minuto, jogadores envolvidos)
  └── Referee        — árbitro escalado para a partida
  └── Venue          — campo/sede
  └── Standing       — classificação calculada
  └── Invoice        — fatura financeira do clube
  └── Notification   — alerta gerado e enviado
  └── MediaAsset     — foto ou banner
```

**Campos notáveis em `Match`**

| Campo | Descrição |
|---|---|
| `lineups` | Titulares confirmados antes do apito (home/away) |
| `events` | Lista de MatchEvent (gols, cartões, substituições) |
| `score` | Placar `{ home, away }` |
| `currentMinute` | Minuto atual / final da partida |
| `mvpPlayerId` | ID do jogador eleito MVP |
| `minutesPlayed` | Mapa `{ playerId: minutos }` calculado ao encerrar |
| `reportStatus` | PENDING / APPROVED / CONTESTED |

**Campos notáveis em `Player.stats`**

| Campo | Descrição |
|---|---|
| `goals` | Total de gols no campeonato |
| `assists` | Total de assistências |
| `yellowCards` | Amarelos acumulados |
| `redCards` | Vermelhos |
| `rating` | Média de avaliação (0–10) |
| `mvpCount` | Vezes eleito MVP |

---

## Integração Supabase

### Tabelas principais

| Tabela | Descrição |
|---|---|
| `championships` | Edições |
| `clubs` | Clubes |
| `players` | Atletas |
| `matches` | Partidas |
| `match_events` | Eventos de jogo |
| `venues` | Campos / sedes |
| `referees` | Árbitros |
| `referee_ratings` | Avaliações por clube |
| `invoices` | Faturas |
| `payments` | Pagamentos |
| `notification_queue` | Fila de notificações |

### Edge Functions

| Função | Propósito |
|---|---|
| `send-notification` | Envio de e-mail/SMS/push para clubes |
| `pix-webhook` | Confirmações de pagamento Pix |
| `gemini-suggest` | Sugestões e narrativa analítica com Gemini |
| `checkin-validate` | Valida token e registra check-in em `match_roster` |

### Storage Buckets

| Bucket | Conteúdo |
|---|---|
| `documents` | Contratos e documentos dos atletas |
| `media` | Fotos, banners e logos |

### RPCs (funções Postgres)

| RPC | Propósito |
|---|---|
| `generate_round_robin` | Gera rodadas de pontos corridos |
| `detect_schedule_conflicts` | Detecta conflitos de calendário |
| `generate_knockout_from_standings` | Gera chaveamento mata-mata |

**Sincronização:** ao fazer login, o hook `useAppData` carrega todos os dados do campeonato ativo. Alterações são salvas automaticamente com debounce de 1,8 segundos.

---

## Rotas

| Rota | Descrição |
|---|---|
| `/` | CRM principal (requer login para sync remoto) |
| `/p/:slug` | Portal público (sem login) |
| `/field/:matchId` | Modo campo simplificado — PWA para controle de placar em campo |

---

## Scripts npm

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (porta 3000) |
| `npm run build` | Build de produção com assets PWA |
| `npm run preview` | Pré-visualizar o build |
| `npm run lint` | Verificação TypeScript (`tsc --noEmit`) |
