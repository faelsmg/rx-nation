# 📖 Documentação de Fluxos Principais - Impacto Pro League v1.0

Este documento descreve os fluxos principais do sistema para suporte técnico e operacional.

---

## 📑 Índice

1. [Autenticação e Onboarding](#1-autenticação-e-onboarding)
2. [Fluxo do Atleta](#2-fluxo-do-atleta)
3. [Fluxo do Box Master](#3-fluxo-do-box-master)
4. [Fluxo do Franqueado](#4-fluxo-do-franqueado)
5. [Fluxo do Admin da Liga](#5-fluxo-do-admin-da-liga)
6. [Sistema de Gamificação](#6-sistema-de-gamificação)
7. [Marketplace](#7-marketplace)
8. [Sistema de Mentoria](#8-sistema-de-mentoria)
9. [Análise com IA](#9-análise-com-ia)
10. [Troubleshooting Comum](#10-troubleshooting-comum)

---

## 1. Autenticação e Onboarding

### 1.1 Login

**Fluxo Normal:**
1. Usuário acessa a plataforma
2. Clica em "Entrar" ou é redirecionado automaticamente
3. Sistema redireciona para OAuth Manus
4. Usuário faz login com provedor (Google, GitHub, etc)
5. Sistema recebe callback com dados do usuário
6. Sistema cria/atualiza registro no banco
7. Sistema cria sessão (cookie JWT)
8. Usuário é redirecionado para dashboard apropriado

**Endpoints:**
- `GET /api/oauth/login` - Inicia fluxo OAuth
- `GET /api/oauth/callback` - Recebe callback do OAuth
- `POST /api/trpc/auth.logout` - Faz logout

**Troubleshooting:**
- **Erro "Unauthorized"**: Verificar se OAUTH_SERVER_URL está configurado
- **Loop de redirecionamento**: Limpar cookies do navegador
- **Sessão expira rapidamente**: Verificar JWT_SECRET

### 1.2 Onboarding (Primeira Vez)

**Fluxo:**
1. Após primeiro login, usuário vê modal de boas-vindas
2. Sistema apresenta tour de 6 passos
3. Usuário pode pular ou completar o tour
4. Sistema registra progresso no localStorage

**Componente:** `client/src/components/OnboardingTour.tsx`

---

## 2. Fluxo do Atleta

### 2.1 Ver WOD do Dia

**Fluxo:**
1. Atleta acessa página "WOD do Dia"
2. Sistema busca WOD mais recente do box do atleta
3. Exibe detalhes: tipo, movimentos, tempo/reps, RX/Scale
4. Atleta pode registrar resultado

**Procedure:** `trpc.wods.getWodDoDia.useQuery()`

**Troubleshooting:**
- **"Nenhum WOD disponível"**: Box Master precisa criar WOD
- **WOD de outro box**: Verificar vinculação do atleta ao box

### 2.2 Registrar Resultado de Treino

**Fluxo:**
1. Atleta clica em "Registrar Resultado" no WOD
2. Preenche formulário (tempo/reps, carga, RX/Scale, observações)
3. Sistema valida dados
4. Sistema salva resultado no banco
5. Sistema credita pontos (+20)
6. Sistema atualiza histórico
7. Exibe confirmação

**Procedure:** `trpc.resultados.registrar.useMutation()`

**Pontos Creditados:** +20 pontos

**Troubleshooting:**
- **Erro ao salvar**: Verificar se wodId é válido
- **Pontos não creditados**: Verificar procedure de pontuação

### 2.3 Registrar/Atualizar PR

**Fluxo:**
1. Atleta acessa página "PRs"
2. Clica em "Adicionar PR"
3. Seleciona movimento (Snatch, Clean, Back Squat, etc)
4. Informa carga (kg) e data
5. Sistema valida se é novo recorde
6. Sistema salva PR
7. Sistema credita pontos (+30)
8. Sistema verifica badges automáticos
9. Exibe confirmação

**Procedure:** `trpc.prs.registrar.useMutation()`

**Pontos Creditados:** +30 pontos

**Badges Automáticos:**
- "Primeiro PR" - Ao registrar primeiro PR
- "PR Master" - Ao ter 10+ PRs

### 2.4 Reservar Aula

**Fluxo:**
1. Atleta acessa página "Agenda"
2. Visualiza horários disponíveis
3. Clica em "Reservar" em um horário
4. Sistema valida capacidade máxima
5. Sistema verifica duplicatas
6. Sistema cria reserva
7. Sistema envia notificação de confirmação
8. Exibe confirmação

**Procedure:** `trpc.agenda.reservar.useMutation()`

**Notificações:**
- Confirmação de reserva (imediata)
- Lembrete 1h antes da aula

**Troubleshooting:**
- **"Aula lotada"**: Capacidade máxima atingida
- **"Você já tem reserva"**: Não pode reservar 2x no mesmo horário

### 2.5 Check-in na Aula

**Fluxo:**
1. Atleta chega no box
2. Escaneia QR Code na recepção
3. Sistema valida reserva
4. Sistema registra check-in
5. Sistema credita pontos (+10)
6. Sistema atualiza métricas de frequência
7. Exibe confirmação

**Procedure:** `trpc.checkins.registrar.useMutation()`

**Pontos Creditados:** +10 pontos

**Badges Automáticos:**
- "Frequência 100%" - 30 dias sem faltar
- "Veterano" - 100+ check-ins

### 2.6 Comprar no Marketplace

**Fluxo:**
1. Atleta acessa "Marketplace"
2. Navega por produtos
3. Adiciona produtos ao carrinho
4. Clica em "Finalizar Compra"
5. Sistema calcula total em pontos
6. **Se tem pontos suficientes:**
   - Sistema cria pedidos
   - Debita pontos
   - Exibe confirmação
7. **Se falta pontos:**
   - Sistema oferece pagar diferença (1 ponto = R$0,10)
   - Redireciona para Stripe Checkout
   - Após pagamento, webhook cria pedido
8. Atleta pode ver pedidos em "Meus Pedidos"

**Procedures:**
- `trpc.marketplace.getPontosTotais.useQuery()` - Ver pontos
- `trpc.marketplace.criarPedido.useMutation()` - Compra com pontos
- `trpc.marketplace.criarCheckoutStripe.useMutation()` - Pagamento Stripe

**Webhook:** `POST /api/stripe/webhook` (evento: `checkout.session.completed`)

---

## 3. Fluxo do Box Master

### 3.1 Criar WOD

**Fluxo:**
1. Box Master acessa "Gestão de WODs"
2. Clica em "Criar WOD"
3. Preenche formulário:
   - Nome do WOD
   - Tipo (AMRAP, EMOM, For Time, etc)
   - Movimentos e repetições
   - Tempo limite
   - Observações
   - Data
4. Sistema valida dados
5. Sistema salva WOD
6. Sistema notifica todos os atletas do box
7. Exibe confirmação

**Procedure:** `trpc.wods.criar.useMutation()`

**Notificações:** Todos os atletas do box recebem notificação de novo WOD

**Troubleshooting:**
- **Atletas não veem WOD**: Verificar se boxId está correto
- **Data no passado**: Sistema permite, mas alerta

### 3.2 Gerenciar Alunos

**Fluxo:**
1. Box Master acessa "Alunos"
2. Visualiza lista de todos os alunos do box
3. Pode filtrar por categoria
4. Pode ver estatísticas de cada aluno:
   - Frequência
   - Último check-in
   - Total de WODs
   - PRs registrados
5. Pode editar informações (categoria, faixa etária)

**Procedure:** `trpc.users.listarAlunosDoBox.useQuery()`

### 3.3 Criar Horário de Aula

**Fluxo:**
1. Box Master acessa "Agenda"
2. Clica em "Criar Horário"
3. Preenche formulário:
   - Dias da semana
   - Horário
   - Capacidade máxima
   - Tipo de aula (opcional)
4. Sistema valida dados
5. Sistema cria horário
6. Horário fica disponível para reservas
7. Exibe confirmação

**Procedure:** `trpc.agenda.criarHorario.useMutation()`

**Troubleshooting:**
- **Horários conflitantes**: Sistema não valida, permite sobreposição
- **Capacidade 0**: Não permitido, mínimo 1

### 3.4 Criar Comunicado

**Fluxo:**
1. Box Master acessa "Comunicados"
2. Clica em "Novo Comunicado"
3. Preenche formulário:
   - Título
   - Conteúdo
   - Tipo (informativo, urgente, evento)
4. Sistema valida dados
5. Sistema salva comunicado
6. Sistema notifica todos os atletas do box
7. Exibe confirmação

**Procedure:** `trpc.comunicados.criar.useMutation()`

**Notificações:** Todos os atletas do box recebem notificação

### 3.5 Atribuir Badge Manual

**Fluxo:**
1. Box Master acessa "Gestão de Badges"
2. Seleciona atleta
3. Seleciona badge
4. Adiciona motivo (opcional)
5. Sistema valida se atleta já tem o badge
6. Sistema atribui badge
7. Sistema notifica atleta
8. Exibe confirmação

**Procedure:** `trpc.badges.atribuirManual.useMutation()`

**Notificações:** Atleta recebe notificação de novo badge

---

## 4. Fluxo do Franqueado

### 4.1 Dashboard Consolidado

**Fluxo:**
1. Franqueado faz login
2. Sistema busca todos os boxes vinculados ao franqueado
3. Dashboard exibe métricas agregadas:
   - Total de alunos (todos os boxes)
   - Total de check-ins (todos os boxes)
   - Frequência média
   - Comparação entre boxes
4. Franqueado pode filtrar por box específico

**Procedure:** `trpc.franqueados.getMetricasConsolidadas.useQuery()`

### 4.2 Comparar Performance entre Boxes

**Fluxo:**
1. Franqueado acessa "Analytics"
2. Visualiza gráficos comparativos:
   - Frequência por box
   - Retenção por box
   - Novos alunos vs cancelamentos
3. Pode exportar relatórios

**Procedure:** `trpc.franqueados.compararBoxes.useQuery()`

---

## 5. Fluxo do Admin da Liga

### 5.1 Cadastrar Novo Box

**Fluxo:**
1. Admin acessa "Gestão de Boxes"
2. Clica em "Cadastrar Box"
3. Preenche formulário:
   - Nome do box
   - Endereço
   - Franqueado (se aplicável)
   - Contato
4. Sistema valida dados
5. Sistema cria box
6. Sistema gera código de vinculação
7. Exibe confirmação com código

**Procedure:** `trpc.boxes.criar.useMutation()`

### 5.2 Criar Campeonato

**Fluxo:**
1. Admin acessa "Campeonatos"
2. Clica em "Criar Campeonato"
3. Preenche formulário:
   - Nome
   - Data início/fim
   - Categorias permitidas
   - Tipo de pontuação
4. Sistema valida dados
5. Sistema cria campeonato
6. Sistema notifica todos os boxes
7. Exibe confirmação

**Procedure:** `trpc.campeonatos.criar.useMutation()`

### 5.3 Configurar Sistema de Pontuação

**Fluxo:**
1. Admin acessa "Configurações"
2. Acessa seção "Pontuação"
3. Define valores:
   - Check-in: 10 pontos
   - WOD completo: 20 pontos
   - Novo PR: 30 pontos
   - Participação campeonato: 50 pontos
   - Pódio: 100 pontos
4. Sistema valida dados
5. Sistema salva configuração
6. Exibe confirmação

**Procedure:** `trpc.config.atualizarPontuacao.useMutation()`

---

## 6. Sistema de Gamificação

### 6.1 Cálculo de Pontos

**Eventos que Geram Pontos:**

| Ação | Pontos | Procedure |
|------|--------|-----------|
| Check-in na aula | +10 | `pontuar.checkin` |
| Completar WOD | +20 | `pontuar.wod` |
| Registrar PR | +30 | `pontuar.pr` |
| Participar de campeonato | +50 | `pontuar.campeonato` |
| Pódio em campeonato | +100 | `pontuar.podio` |
| Completar desafio | +25 | `pontuar.desafio` |
| Desbloquear badge | +15 | `pontuar.badge` |

**Procedure Geral:** `trpc.pontuacao.creditar.useMutation()`

### 6.2 Badges Automáticos

**Triggers:**

| Badge | Condição | Verificação |
|-------|----------|-------------|
| Primeiro PR | 1º PR registrado | Ao registrar PR |
| PR Master | 10+ PRs | Ao registrar PR |
| Frequência 100% | 30 dias sem faltar | Diário (job) |
| Veterano | 100+ check-ins | Ao fazer check-in |
| Competidor | 1ª participação em campeonato | Ao se inscrever |
| Campeão | 1º lugar em campeonato | Ao finalizar campeonato |
| 100 WODs | 100 WODs completados | Ao registrar resultado |
| Sem Falhar | 50 aulas consecutivas | Diário (job) |

**Job Agendado:** `server/_core/jobs.ts` - Roda diariamente às 00:00

### 6.3 Rankings

**Tipos de Ranking:**

1. **Ranking do Box** - Atletas do mesmo box
2. **Ranking da Liga** - Todos os atletas da liga
3. **Ranking por Categoria** - Filtrado por categoria (RX, Scaled, etc)
4. **Ranking por Faixa Etária** - Filtrado por idade

**Cálculo:** Soma total de pontos no período (semanal, mensal, anual)

**Procedure:** `trpc.rankings.getRanking.useQuery({ tipo, periodo })`

---

## 7. Marketplace

### 7.1 Fluxo de Compra com Pontos

**Quando:** Atleta tem pontos suficientes

**Fluxo:**
1. Atleta finaliza compra
2. Sistema calcula total em pontos
3. Sistema valida saldo
4. Sistema cria pedido(s)
5. Sistema debita pontos
6. Sistema atualiza estoque
7. Status do pedido: "pendente"
8. Notificação para atleta e box

**Procedure:** `trpc.marketplace.criarPedido.useMutation()`

### 7.2 Fluxo de Compra com Stripe

**Quando:** Atleta não tem pontos suficientes

**Fluxo:**
1. Atleta finaliza compra
2. Sistema calcula diferença (total - pontos disponíveis)
3. Sistema cria sessão Stripe Checkout
4. Atleta é redirecionado para Stripe
5. Atleta paga com cartão
6. Stripe envia webhook `checkout.session.completed`
7. Sistema cria pedido
8. Sistema debita pontos disponíveis
9. Status do pedido: "processando"
10. Notificação para atleta e box

**Procedures:**
- `trpc.marketplace.criarCheckoutStripe.useMutation()`
- Webhook: `POST /api/stripe/webhook`

**Conversão:** 1 ponto = R$ 0,10

---

## 8. Sistema de Mentoria

### 8.1 Encontrar Mentor

**Fluxo:**
1. Atleta acessa "Mentoria"
2. Sistema sugere mentor baseado em:
   - Mesmo box
   - Categoria superior
   - Experiência (mais check-ins, PRs)
3. Atleta clica em "Solicitar Mentoria"
4. Sistema cria mentoria com status "ativa"
5. Sistema notifica mentor
6. Chat é liberado

**Procedure:** `trpc.mentoria.sugerirMentor.useQuery()`

### 8.2 Chat de Mentoria

**Fluxo:**
1. Atleta/Mentor acessa chat
2. Sistema carrega mensagens (polling a cada 3s)
3. Usuário digita mensagem
4. Sistema salva mensagem
5. Sistema marca como não lida para destinatário
6. Destinatário recebe notificação
7. Ao abrir chat, mensagens são marcadas como lidas

**Procedures:**
- `trpc.mentoria.enviarMensagem.useMutation()`
- `trpc.mentoria.getMensagens.useQuery()`
- `trpc.mentoria.marcarComoLida.useMutation()`

**Nota:** Atualmente usa polling. Para real-time, implementar WebSocket.

---

## 9. Análise com IA

### 9.1 Gerar Insights de Performance

**Fluxo:**
1. Atleta acessa "Insights IA"
2. Clica em "Gerar Insights"
3. Sistema busca dados do atleta:
   - Últimos 30 resultados
   - PRs
   - Frequência
4. Sistema envia para LLM com prompt estruturado
5. LLM analisa e gera insights personalizados
6. Sistema exibe insights em markdown
7. Atleta pode salvar/compartilhar

**Procedure:** `trpc.ia.gerarInsights.useMutation()`

**Tempo de Resposta:** 5-10 segundos

### 9.2 Sugerir Treinos Complementares

**Fluxo:**
1. Atleta acessa "Sugestões IA"
2. Sistema analisa histórico de treinos
3. Sistema identifica movimentos menos praticados
4. Sistema envia para LLM
5. LLM sugere treinos complementares
6. Sistema exibe sugestões
7. Atleta pode salvar sugestões

**Procedure:** `trpc.ia.sugerirTreinos.useMutation()`

### 9.3 Prevenção de Lesões

**Fluxo:**
1. Atleta acessa "Prevenção IA"
2. Sistema analisa:
   - Frequência de treinos
   - Volume de carga
   - Tempo de recuperação
   - Histórico de lesões (se houver)
3. Sistema envia para LLM
4. LLM calcula nível de risco (baixo/médio/alto)
5. LLM gera recomendações
6. Sistema exibe análise
7. Atleta pode compartilhar com coach

**Procedure:** `trpc.ia.preverRiscoLesoes.useMutation()`

---

## 10. Troubleshooting Comum

### 10.1 Usuário Não Consegue Fazer Login

**Possíveis Causas:**
1. OAuth não configurado
2. Cookies bloqueados
3. Sessão expirada
4. Problema de rede

**Solução:**
1. Verificar variáveis de ambiente (OAUTH_SERVER_URL, JWT_SECRET)
2. Limpar cookies do navegador
3. Tentar em modo anônimo
4. Verificar logs do servidor

### 10.2 Pontos Não Creditados

**Possíveis Causas:**
1. Procedure de pontuação falhou
2. UserId inválido
3. Tipo de pontuação não reconhecido

**Solução:**
1. Verificar logs do servidor
2. Verificar tabela `pontuacoes` no banco
3. Executar procedure manualmente via tRPC

### 10.3 Notificações Não Chegam

**Possíveis Causas:**
1. Preferências desativadas
2. Sistema de notificações com erro
3. Polling não funcionando

**Solução:**
1. Verificar `preferencias_notificacoes` no banco
2. Verificar logs do servidor
3. Testar endpoint `/api/trpc/notificacoes.listar`

### 10.4 Backup Não Executado

**Possíveis Causas:**
1. `BACKUP_ENABLED=false`
2. `mysqldump` não instalado
3. Permissões de diretório
4. Cron não configurado

**Solução:**
1. Verificar variáveis de ambiente
2. Instalar `mysql-client`
3. Criar diretório com permissões corretas
4. Verificar logs do servidor

### 10.5 Webhook Stripe Falha

**Possíveis Causas:**
1. `STRIPE_WEBHOOK_SECRET` incorreto
2. Signature inválida
3. Evento não tratado

**Solução:**
1. Verificar secret no Stripe Dashboard
2. Verificar logs do webhook
3. Testar com evento de teste do Stripe

---

## 📞 Contato de Suporte

Para problemas não cobertos nesta documentação:

1. **Verificar logs do servidor:** `tail -f /var/log/impacto-pro-league.log`
2. **Verificar health check:** `curl http://localhost:3000/api/health`
3. **Consultar documentação técnica:** README.md, BACKUP.md
4. **Abrir issue no repositório**
5. **Contatar equipe de desenvolvimento**

---

**Última atualização:** 21/11/2025  
**Versão:** 1.0  
**Responsável:** Sistema Impacto Pro League
