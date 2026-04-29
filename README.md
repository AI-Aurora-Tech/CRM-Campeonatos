# CRM Campeonatos — LigaAmadora

Sistema de gestão completo para campeonatos de futebol amador. Desenvolvido em React + TypeScript + Tailwind CSS, roda inteiramente no browser (sem backend obrigatório).

---

## Sumário

- [Stack](#stack)
- [Como rodar](#como-rodar)
- [Seções do sistema](#seções-do-sistema)
  - [Dashboard](#1-dashboard--painel-geral)
  - [Campeonatos](#2-campeonatos)
  - [Clubes & Atletas](#3-clubes--atletas)
  - [Atletas](#4-atletas)
  - [Árbitros](#5-árbitros)
  - [Súmulas Digitais](#6-súmulas-digitais--partidas)
  - [Campos & Sedes](#7-campos--sedes)
  - [Documentos & Elegibilidade](#8-documentos--elegibilidade)
  - [Financeiro](#9-financeiro)
  - [Relatórios & Analytics](#10-relatórios--analytics)
  - [Automações & Alertas](#11-automações--alertas)
  - [Mídia & Galeria](#12-mídia--galeria)
  - [Portal Público](#13-portal-público)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| UI | React 19 + TypeScript |
| Estilos | Tailwind CSS v4 |
| Gráficos | Recharts |
| Animações | Motion (Framer Motion) |
| Ícones | Lucide React |
| Build | Vite 6 |

---

## Como rodar

```bash
npm install
npm run dev
```

Acesse em `http://localhost:3000`.

---

## Seções do sistema

### 1. Dashboard — Painel Geral

Visão executiva do campeonato em andamento.

**Cards de métricas:**
- Campeonato ativo (nome e temporada)
- Partidas realizadas vs. total programado
- Atletas suspensos (com alerta visual, clicável para ir à tela de atletas)
- Pendências financeiras em aberto

**Classificação geral:** tabela compacta com posição, escudo, pontos, jogos, vitórias, saldo de gols e série de forma dos últimos resultados (V/E/D).

**Próximas partidas:** lista das partidas agendadas com data, hora, local e confronto.

---

### 2. Campeonatos

Configuração do campeonato em andamento.

**Dados gerais:**
- Nome e temporada
- Tipo de disputa: Pontos Corridos, Grupos ou Mata-Mata
- Status: Planejamento, Ativo ou Encerrado

**Regras da competição:**
- Limite de cartões amarelos para suspensão automática
- Pontuação por vitória e empate
- Faixa etária mínima e máxima (opcional)

---

### 3. Clubes & Atletas

Diretório de todos os clubes inscritos.

**Listagem:** cards com escudo, nome, abreviação, presidente, e indicador de pendência financeira.

**Detalhe do clube:** ao clicar em um clube, abre uma tela dedicada com:
- Informações completas (endereço, telefone, e-mail, ano de fundação, títulos)
- Elenco completo do clube com posição, camisa e status
- Histórico de partidas (resultados e próximos jogos)
- Estatísticas coletivas (gols, clean sheets, posse média, pontos de disciplina)

---

### 4. Atletas

Gestão completa do elenco de todos os clubes.

**Filtros:** busca por nome e filtro por equipe.

**Card do atleta:** foto, posição, nome, camisa, clube, status (Pronto p/ Jogo / Suspenso) e total de gols. O artilheiro recebe badge especial.

**Cadastro / Edição — campos do formulário:**

| Seção | Campos |
|-------|--------|
| Foto | Upload de arquivo (JPG/PNG/WEBP) com preview |
| Identificação | Nome completo, RG, CPF |
| Filiação | Nome do pai, Nome da mãe |
| Responsável | Nome do responsável, Número do responsável |
| Dados esportivos | Nº da camisa, Posição, Clube / Equipe |

**Detalhe do atleta:** estatísticas individuais de partidas, gols, assistências, cartões, nota média e MVP.

---

### 5. Árbitros

Cadastro e gestão do quadro de árbitros da liga.

**Níveis:** Prata, Ouro e Elite — com badge visual diferenciado.

**Card do árbitro:** foto, nome, nível, total de partidas apitadas, nota média e status de disponibilidade.

**Detalhe do árbitro:**
- Histórico de partidas apitadas
- Avaliações recebidas por clube (nota 1–5 com comentários)
- Histórico de cartões distribuídos

**Calendário de árbitros:** agenda semanal mostrando quais árbitros estão escalados em quais partidas, permitindo visualizar sobreposições.

---

### 6. Súmulas Digitais — Partidas

Ciclo completo de uma partida, do agendamento ao encerramento.

**Listagem de partidas:** cards com confronto, data, hora, local, status (Agendada / Ao Vivo / Encerrada) e placar quando disponível.

**Escalação (pré-jogo):**
- Seleção de titulares e reservas de cada equipe
- Validação contra o elenco cadastrado
- Salvamento da escalação antes da partida

**Centro da Partida (ao vivo):**
- Cronômetro em tempo real
- Registro de eventos por minuto: Gol, Assistência, Cartão Amarelo, Cartão Vermelho, Substituição
- Placar atualizado instantaneamente
- Seleção do jogador responsável por cada evento

**Encerramento:** ao finalizar, a súmula é gerada com todos os eventos, placar final e status da partida.

---

### 7. Campos & Sedes

Gestão dos locais onde as partidas acontecem.

**Card do campo:** nome, endereço, capacidade, instalações disponíveis (ex.: Estacionamento, Refletores, Vestiário), status Ativo/Inativo, e o time mandante vinculado (com logo).

**Time mandante:** cada campo pode ser opcionalmente atrelado a um clube como seu campo principal. Times que jogam apenas fora de casa ficam sem vínculo.

**Detecção de conflitos:** o sistema detecta automaticamente dois jogos agendados no mesmo campo, no mesmo dia e horário, exibindo alerta visual em vermelho.

**Agenda semanal:** visualização em calendário (7 dias) mostrando todos os jogos por campo e dia, com destaque para conflitos de horário.

---

### 8. Documentos & Elegibilidade

Central de validação de documentos dos atletas.

**Fila de pendências:** lista de atletas com documentação pendente, mostrando nome, clube e data de envio.

**Ações disponíveis:**
- **Aprovar:** atleta fica elegível para ser escalado
- **Rejeitar:** atleta bloqueado com motivo registrado

Atletas com documentação reprovada ou pendente não podem ser incluídos em escalações.

---

### 9. Financeiro

Gestão financeira pós-partida e súmula oficial.

**Súmula pós-jogo:** revisão dos eventos registrados durante a partida ao vivo (gols, cartões, substituições).

**Status da súmula:**
- **Pendente:** aguardando aprovação dos clubes
- **Aprovada:** resultado homologado
- **Contestada:** clube registrou contestação com justificativa

**Pendências financeiras:** taxas de inscrição e multas por infrações disciplinares são rastreadas por clube.

---

### 10. Relatórios & Analytics

Análises estatísticas visuais da competição.

**Aba Overview — gráficos:**

| Gráfico | O que mostra |
|---------|-------------|
| Eficiência Ofensiva | Gols por jogo por equipe (ranking) |
| Fair Play | Pontuação disciplinar (amarelos + vermelhos × 3) |
| Poder Ofensivo vs. Defensivo | Scatter: gols pró vs. gols contra |
| Intervalos de Gol | Em que minuto os gols são marcados (0–15, 15–30, ...) |
| Artilharia Individual | Top marcadores com barra de progresso |

**Aba Prêmios:**
- Artilheiro da competição
- Rei das Assistências
- Goleiro Menos Vazado
- Jogador com mais MVPs

---

### 11. Automações & Alertas

Motor de notificações automáticas por e-mail.

**Scanner automático:** ao acionar, o sistema varre todos os dados e gera alertas para:

| Tipo de alerta | Gatilho |
|---------------|---------|
| Partida Amanhã | Jogo agendado para o dia seguinte |
| Partida em 7 Dias | Jogo agendado para daqui a uma semana |
| Escalação Pendente | Partida amanhã sem escalação enviada |
| Atleta Suspenso | Jogador atingiu limite de cartões |
| Nova Rodada | Geração de novos confrontos |

**Fila de envio:** cada notificação tem status (Na Fila / Enviado / Falhou), destinatário, assunto e conteúdo. Envio simulado com atualização de status em tempo real.

---

### 12. Mídia & Galeria

Repositório centralizado de imagens da liga.

**Categorias:**
- Banners de campeonato
- Logos de clubes
- Fotos de partidas
- Imagens gerais

**Ações:** upload de novos arquivos, visualização em grid, e associação de cada imagem a uma entidade (campeonato, clube, partida).

---

### 13. Portal Público

Visão pública da competição, pensada para ser compartilhada com torcedores.

**Conteúdo exibido:**
- Classificação geral com pontuação completa
- Próximas partidas (data, hora, local, confronto)
- Artilharia — top marcadores com clube e foto
- Informações do campeonato (nome, temporada, tipo de disputa)

Não exibe dados administrativos (documentos, financeiro, contatos internos).

---

## Tipos de dados principais

```
Championship  — dados e regras do campeonato
Club          — clubes inscritos
Player        — atletas (com RG, CPF, filiação, responsável)
Referee       — árbitros e suas avaliações
Match         — partidas (escalação, eventos, placar, status)
Venue         — campos e sedes (com time mandante opcional)
Standing      — classificação calculada
Notification  — fila de alertas automáticos
MediaAsset    — imagens e arquivos de mídia
```
