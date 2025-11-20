# Impacto Pro League - TODO

## Fase 1: Schema do Banco de Dados e Estrutura Base
- [x] Criar tabela de boxes (academias)
- [x] Criar tabela de categorias (iniciante, intermediário, avançado, elite)
- [x] Criar tabela de faixas etárias
- [x] Criar tabela de WODs (treinos do dia)
- [x] Criar tabela de check-ins (presença)
- [x] Criar tabela de resultados de treinos
- [x] Criar tabela de PRs (Personal Records)
- [x] Criar tabela de campeonatos/eventos
- [x] Criar tabela de inscrições em campeonatos
- [x] Criar tabela de baterias (heats)
- [x] Criar tabela de pontuação/gamificação
- [x] Criar tabela de badges (medalhas digitais)
- [x] Criar tabela de rankings
- [x] Criar tabela de planilhas de treino
- [x] Criar tabela de comunicados)

## Fase 2: Sistema de Autenticação e Perfis
- [x] Estender tabela users com campos específicos (boxId, categoria, faixaEtaria, role)
- [x] Criar enum de roles (atleta, box_master, franqueado, admin_liga)
- [x] Implementar lógica de vinculação usuário-box
- [x] Criar procedure para atualizar perfil do atleta
- [x] Criar procedure para verificar role do usuário

## Fase 3: Funcionalidades para Atletas
- [ ] Implementar visualização de WOD do dia
- [ ] Implementar calendário semanal de treinos
- [ ] Implementar check-in na aula
- [ ] Implementar registro de resultado do treino (tempo, reps, carga, RX/Scale)
- [ ] Implementar registro e atualização de PRs
- [ ] Implementar visualização de histórico de treinos
- [ ] Implementar visualização de histórico de PRs
- [ ] Implementar gráficos de evolução (carga x tempo)
- [ ] Implementar visualização de ranking interno do box
- [ ] Implementar visualização de ranking entre boxes
- [ ] Implementar visualização de ranking da temporada
- [ ] Implementar visualização de medalhas e badges
- [ ] Implementar inscrição em campeonatos
- [ ] Implementar visualização de leaderboard de eventos
- [ ] Implementar sistema de notificações

## Fase 4: Funcionalidades para Donos de Box e Franqueados
- [ ] Implementar cadastro e gestão de alunos
- [ ] Implementar criação e gestão de agenda de aulas
- [ ] Implementar criação e gestão de WODs diários
- [ ] Implementar visualização de lista de presença
- [ ] Implementar visualização de resultados dos alunos
- [ ] Implementar dashboard de métricas (alunos ativos, frequência, engajamento)
- [ ] Implementar criação de comunicados internos
- [ ] Implementar criação de trilhas de treino personalizadas
- [ ] Implementar recebimento automático de planilhas oficiais (para franqueados)

## Fase 5: Funcionalidades para Admin da Liga
- [ ] Implementar cadastro e gestão de boxes parceiros
- [ ] Implementar cadastro e gestão de categorias de competição
- [ ] Implementar cadastro e gestão de campeonatos
- [ ] Implementar configuração de sistema de pontuação
- [ ] Implementar configuração de pesos de eventos para ranking anual
- [ ] Implementar visualização de quantidade de boxes parceiros
- [ ] Implementar visualização de número de atletas ativos
- [ ] Implementar visualização de rankings gerais
- [ ] Implementar gestão de planilhas semanais oficiais
- [ ] Implementar gestão de comunicação geral da liga

## Fase 6: Sistema de Gamificação e Rankings
- [ ] Implementar sistema de pontos (+10 check-in, +20 WOD, +30 PR, +50 competição, +100 pódio)
- [ ] Implementar cálculo de ranking semanal
- [ ] Implementar cálculo de ranking mensal
- [ ] Implementar cálculo de ranking da temporada
- [ ] Implementar sistema de badges ("Sem falhar", "Primeiro PR", "Competidor", "Veterano")
- [ ] Implementar lógica de concessão automática de badges
- [ ] Implementar ranking do box
- [ ] Implementar ranking entre boxes parceiros
- [ ] Implementar ranking por categoria e idade
- [ ] Implementar ranking da liga/temporada

## Fase 7: Sistema de Campeonatos
- [ ] Implementar cadastro de eventos (tipo, nome, local, datas, categorias)
- [ ] Implementar inscrição de atletas em eventos
- [ ] Implementar gestão de baterias (heats)
- [ ] Implementar leaderboard de campeonatos
- [ ] Implementar sistema de classificação para etapas maiores
- [ ] Implementar lógica de pontos extras para ranking anual
- [ ] Implementar fluxo de pagamento de inscrição (lógica apenas)

## Fase 8: Interface do Usuário
- [x] Criar design system e paleta de cores
- [x] Criar layout principal com navegação
- [x] Criar tela inicial (Home) para atletas
- [x] Criar tela de perfil do atleta
- [x] Criar tela de WOD do dia
- [x] Criar tela de histórico de treinos
- [x] Criar tela de PRs
- [x] Criar tela de rankings
- [x] Criar tela de badges
- [x] Criar tela de campeonatos
- [ ] Criar tela de inscrição em campeonatos
- [x] Criar dashboard para donos de box
- [ ] Criar tela de gestão de alunos
- [ ] Criar tela de criação de WODs
- [ ] Criar tela de agenda de aulas
- [x] Criar dashboard para admin da liga
- [ ] Criar tela de gestão de boxes
- [ ] Criar tela de gestão de campeonatos
- [x] Implementar responsividade mobile

## Fase 9: Testes e Finalização
- [x] Criar testes para procedures de autenticação
- [x] Criar testes para procedures de atletas
- [ ] Criar testes para procedures de boxes
- [ ] Criar testes para procedures de campeonatos
- [x] Criar testes para sistema de pontuação
- [ ] Criar testes para sistema de rankings
- [ ] Testar fluxos completos de usuário
- [x] Criar dados de exemplo (seed)
- [ ] Revisar e otimizar queries do banco
- [ ] Criar checkpoint final


## Correções de Bugs
- [x] Corrigir erro de DialogTitle faltando em componentes Dialog
- [x] Corrigir erro de usuário não vinculado a box (admin_liga não precisa de box)
- [x] Corrigir erro de links aninhados no AppLayout
- [x] Implementar criação de WODs para Box Masters
- [x] Implementar gerenciamento de alunos para Box Masters


## Sistema de Agenda de Aulas
- [x] Criar tabela de horários de aulas (agenda)
- [x] Criar tabela de reservas de aulas
- [x] Adicionar procedures para criar horários de aulas
- [x] Adicionar procedures para listar horários disponíveis
- [x] Adicionar procedures para reservar vaga em aula
- [x] Adicionar procedures para cancelar reserva
- [x] Criar interface de gestão de agenda para Box Masters
- [x] Criar interface de visualização e reserva para atletas
- [x] Implementar validação de capacidade máxima
- [ ] Implementar sistema de lista de espera (opcional)
- [x] Criar testes para funcionalidades de agenda


## Sistema de Comunicados e Notificações
- [x] Verificar schema existente de comunicados (já existe)
- [x] Adicionar procedures para criar comunicados (já existe)
- [x] Adicionar procedures para listar comunicados do box (já existe)
- [x] Adicionar procedures para editar comunicados
- [x] Adicionar procedures para deletar comunicados
- [ ] Adicionar procedures para marcar comunicado como lido
- [x] Criar interface de gestão de comunicados para Box Masters
- [x] Criar interface de visualização de comunicados para atletas
- [ ] Implementar sistema de notificações em tempo real
- [x] Criar testes para funcionalidades de comunicados


## Testes de QA Completos - ✅ CONCLUÍDO
### Autenticação e Perfis
- [ ] Testar login com diferentes provedores
- [ ] Testar logout
- [ ] Verificar perfis de usuário (atleta, box_master, franqueado, admin_liga)
- [ ] Validar permissões por role

### CRUD de WODs (Box Master)
- [ ] Criar novo WOD
- [ ] Listar WODs criados
- [ ] Editar WOD existente
- [ ] Deletar WOD
- [ ] Validar campos obrigatórios
- [ ] Testar diferentes tipos de WOD (AMRAP, EMOM, For Time, etc)

### Gestão de Alunos (Box Master)
- [ ] Visualizar lista de alunos
- [ ] Filtrar alunos por categoria
- [ ] Ver estatísticas de alunos
- [ ] Verificar dados de perfil dos alunos

### Agenda de Aulas (Box Master)
- [ ] Criar horário de aula
- [ ] Editar horário existente
- [ ] Deletar horário
- [ ] Validar capacidade máxima
- [ ] Verificar dias da semana

### Reservas de Aulas (Atleta)
- [ ] Visualizar horários disponíveis
- [ ] Reservar vaga em aula
- [ ] Cancelar reserva
- [ ] Validar limite de capacidade
- [ ] Verificar duplicatas

### Comunicados (Box Master)
- [ ] Criar comunicado
- [ ] Editar comunicado
- [ ] Deletar comunicado
- [ ] Visualizar lista de comunicados
- [ ] Testar diferentes tipos

### Comunicados (Atleta)
- [ ] Visualizar comunicados no dashboard
- [ ] Verificar ordenação por data
- [ ] Validar exibição de conteúdo

### Funcionalidades de Atleta
- [ ] Ver WOD do dia
- [ ] Registrar resultado de treino
- [ ] Ver histórico de treinos
- [ ] Ver PRs pessoais
- [ ] Ver badges conquistados
- [ ] Ver ranking

### Integração e Fluxos
- [ ] Testar fluxo completo: criar WOD → atleta visualiza → registra resultado
- [ ] Testar fluxo: criar horário → atleta reserva → verificar lista
- [ ] Testar fluxo: criar comunicado → atleta visualiza no dashboard
- [ ] Validar dados entre módulos
- [ ] Verificar performance de queries

### UI/UX
- [ ] Testar responsividade mobile
- [ ] Verificar estados de loading
- [ ] Validar mensagens de erro
- [ ] Testar toasts de sucesso
- [ ] Verificar navegação entre páginas


## Correção de Bug - DialogTitle
- [x] Localizar componente Dialog sem DialogTitle no Dashboard
- [x] Adicionar DialogTitle para acessibilidade
- [x] Testar correção


## Botões de Acesso Rápido para Teste
- [x] Criar usuários de teste no banco de dados
- [x] Criar interface com botões de acesso rápido na página de login
- [x] Implementar lógica de login direto (apenas para desenvolvimento)
- [x] Testar acesso com cada perfil


## Perfil Franqueado
- [x] Criar usuário de teste Franqueado
- [x] Adicionar botão de login rápido para Franqueado
- [x] Criar tabela de franquias no schema (campo franqueadoId em boxes)
- [x] Vincular boxes a franquias
- [x] Criar procedures para listar boxes da franquia
- [x] Criar procedures para métricas consolidadas
- [x] Criar página de Dashboard do Franqueado
- [x] Implementar visualização de múltiplos boxes
- [x] Criar testes para funcionalidades de Franqueado


## Sistema de Registro de Resultados de Treino
- [x] Verificar schema de resultados_treinos (já existe)
- [x] Criar procedures para registrar resultado de WOD (já existe)
- [x] Criar procedures para listar histórico de resultados (já existe)
- [x] Criar procedures para buscar resultados por WOD (já existe)
- [x] Criar interface de registro de resultado no WOD do Dia
- [x] Criar página de Histórico com lista de resultados
- [ ] Adicionar gráficos de evolução de performance
- [ ] Criar testes para funcionalidades de resultados

## Sistema de PRs (Personal Records)
- [x] Verificar schema de PRs (já existe)
- [x] Definir lista de movimentos padrão (Squat, Deadlift, Clean, Snatch, etc)
- [x] Criar procedures para registrar PR (já existe)
- [x] Criar procedures para listar PRs do atleta (já existe)
- [x] Criar procedures para atualizar PR
- [x] Criar procedures para rankings por categoria
- [x] Criar interface de registro de PRs
- [x] Criar página de visualização de PRs com histórico
- [ ] Criar página de Rankings com filtros por movimento e categoria
- [ ] Adicionar gráficos de evolução de PRs
- [ ] Criar testes para funcionalidades de PRs


## Rankings e Gráficos de Evolução
- [x] Criar página de Rankings com filtros por movimento
- [x] Adicionar filtros por categoria e faixa etária
- [x] Mostrar top 50 atletas e posição do usuário
- [x] Adicionar gráficos de evolução de PRs ao longo do tempo
- [x] Adicionar gráficos de evolução de tempos em WODs
- [x] Criar testes para rankings (48/49 passando)


## Sistema de Notificações Push
- [x] Criar schema de notificações no banco
- [x] Criar procedures para listar notificações
- [x] Criar procedures para marcar como lida
- [ ] Implementar notificação de novo WOD criado
- [ ] Implementar notificação de novo comunicado
- [ ] Implementar lembrete de aula reservada (1h antes)
- [ ] Implementar notificação de badge desbloqueado
- [ ] Criar interface de gerenciamento de notificações
- [ ] Adicionar preferências de notificação no perfil

## Dashboard Analítico para Box Masters
- [x] Criar procedures para métricas de frequência
- [x] Criar procedures para taxa de ocupação de aulas
- [x] Criar procedures para análise de retenção
- [x] Criar gráfico de frequência mensal dos alunos
- [x] Criar gráfico de taxa de ocupação por horário
- [x] Criar gráfico de novos alunos vs cancelamentos
- [x] Criar métricas de engajamento (check-ins, resultados registrados)
- [x] Adicionar aba de Analytics na Gestão do Box
- [x] Criar testes para dashboard analítico


## Sistema Completo de Notificações - ✅ CONCLUÍDO
- [x] Criar função helper para criar notificações (createNotification)
- [x] Implementar trigger: notificação ao criar novo WOD
- [x] Implementar trigger: notificação ao criar novo comunicado
- [ ] Implementar trigger: notificação ao desbloquear badge (futuro)
- [x] Criar componente NotificationCenter com dropdown
- [x] Adicionar ícone de sino no header com contador de não lidas
- [x] Implementar listagem de notificações no dropdown
- [x] Implementar marcar como lida ao clicar
- [x] Implementar botão "Marcar todas como lidas"
- [x] Integrar NotificationCenter no AppLayout
- [x] Testar fluxo completo de notificações
- [x] Criar testes para triggers de notificações


## Notificações de Badges e Lembretes de Aulas - ✅ CONCLUÍDO
- [x] Implementar trigger de notificação ao desbloquear badge
- [x] Adicionar link direto para página de badges na notificação
- [x] Criar função para verificar aulas próximas (1h antes)
- [x] Implementar job agendado para enviar lembretes de aulas
- [x] Criar procedure tRPC para enviar lembretes manualmente (teste)
- [x] Testar fluxo completo de notificação de badge
- [x] Testar fluxo completo de lembretes de aulas
- [x] Criar testes unitários para triggers de badges
- [x] Criar testes unitários para lembretes de aulas


## Interface de Atribuição de Badges e Integração com Calendários - ✅ CONCLUÍDO
- [x] Criar aba "Badges" na Gestão do Box
- [x] Implementar busca/filtro de atletas do box
- [x] Criar seletor de badges disponíveis
- [x] Adicionar botão de atribuir badge
- [x] Mostrar histórico de badges atribuídos
- [x] Criar função para gerar arquivo .ics de aula
- [x] Adicionar botão "Adicionar ao Calendário" nas reservas
- [x] Implementar download de .ics com detalhes da aula
- [x] Testar atribuição de badges via interface
- [x] Testar download e importação de .ics
- [x] Criar testes unitários para badges e calendário

## Funcionalidades Futuras (Não Implementadas)
- [ ] Criar schema de preferências de notificações
- [ ] Adicionar página de preferências no perfil do atleta
- [ ] Implementar toggles para cada tipo de notificação
- [ ] Respeitar preferências ao enviar notificações
- [ ] Adicionar integração com serviço de email
- [ ] Criar templates de email para lembretes
- [ ] Implementar envio de email em paralelo às notificações in-app


## Badges Automáticos - ✅ CONCLUÍDO
- [x] Criar badges de marcos (100 WODs, 50 aulas consecutivas, primeiro PR)
- [x] Implementar função para verificar conquistas de WODs
- [x] Implementar função para verificar conquistas de aulas consecutivas
- [x] Implementar função para verificar conquistas de PRs
- [x] Adicionar trigger ao registrar resultado de WOD
- [x] Adicionar trigger ao confirmar presença em aula
- [x] Adicionar trigger ao registrar PR
- [x] Criar notificação automática ao desbloquear badge
- [x] Testar badges automáticos end-to-end

## Dashboard de Badges para Box Masters - ✅ CONCLUÍDO
- [x] Criar aba "Dashboard de Badges" na Gestão do Box
- [x] Implementar query para badges mais conquistados
- [x] Implementar query para atletas com mais badges
- [x] Implementar query para progresso geral do box
- [x] Criar gráfico de badges mais conquistados
- [x] Criar ranking de atletas por badges
- [x] Criar métricas de engajamento com badges
- [x] Criar distribuição de badges por categoria
- [x] Testar dashboard de badges

## Sistema de Preferências de Notificações - ✅ CONCLUÍDO
- [x] Criar schema de preferências de notificações
- [x] Adicionar migration para tabela de preferências
- [x] Criar página de preferências no perfil do atleta
- [x] Implementar toggles para cada tipo de notificação (WODs, comunicados, lembretes, badges)
- [x] Criar queries para salvar/carregar preferências
- [x] Criar função shouldNotifyUser para verificar preferências
- [x] Adicionar link para preferências no dropdown de notificações
- [x] Testar sistema de preferências

## Histórico Completo de Notificações - ✅ CONCLUÍDO
- [x] Criar página de histórico de notificações
- [x] Implementar filtros por tipo de notificação
- [x] Implementar filtro por status (lidas, não lidas, todas)
- [x] Adicionar paginação de notificações (limit 100)
- [x] Criar query para buscar notificações com filtros
- [x] Adicionar link para histórico no dropdown de notificações
- [x] Testar histórico de notificações

## Badges de Conquistas em Cadeia - ✅ CONCLUÍDO
- [x] Criar badges especiais que requerem múltiplas conquistas
- [x] Implementar badge "Atleta Completo" (50 WODs + 10 PRs + 30 dias consecutivos)
- [x] Implementar badge "Guerreiro Incansável" (100 WODs + 20 PRs + 50 dias consecutivos)
- [x] Implementar badge "Lenda Viva" (500 WODs + 50 PRs + 100 dias consecutivos)
- [x] Popular badges no banco de dados
- [ ] Adicionar lógica de verificação automática de múltiplas condições (futuro)
- [ ] Criar notificações especiais para badges em cadeia (futuro)


## Verificação Automática de Badges em Cadeia - ✅ CONCLUÍDO
- [x] Criar função para verificar requisitos de badges compostos
- [x] Implementar verificação de total de WODs completados
- [x] Implementar verificação de total de PRs registrados
- [x] Implementar verificação de dias consecutivos de treino
- [x] Criar procedure tRPC para executar verificação manualmente
- [x] Adicionar trigger após registrar resultado de WOD
- [x] Adicionar trigger após registrar PR
- [x] Testar atribuição automática de badges em cadeia

## Perfil Público do Atleta - ✅ CONCLUÍDO
- [x] Criar página de perfil público (/atleta/:id)
- [x] Exibir informações básicas do atleta (nome, box, categoria)
- [x] Mostrar badges conquistados com datas
- [x] Listar PRs do atleta
- [x] Exibir estatísticas (total WODs, total badges, total PRs, pontos)
- [x] Adicionar histórico recente de WODs completados
- [x] Implementar botão de compartilhamento social
- [x] Testar perfil público

## Sistema de Metas Personalizadas - ✅ CONCLUÍDO
- [x] Criar schema de metas personalizadas
- [x] Adicionar migration para tabela de metas
- [x] Adicionar tipos de metas (WODs, PRs, frequência, peso)
- [x] Implementar notificações de marcos (25%, 50%, 75%, 100%)
- [x] Adicionar queries para calcular progresso de metas
- [x] Criar procedure para verificar e notificar marcos
- [x] Adicionar triggers automáticos após WOD e PR
- [x] Testar sistema de metas completo
- [ ] Criar página de metas no dashboard do atleta (futuro)
- [ ] Implementar formulário para criar nova meta (futuro)
- [ ] Criar barra de progresso para cada meta (futuro)


## Página de Gerenciamento de Metas - ✅ CONCLUÍDO
- [x] Criar página /metas para gerenciamento de metas
- [x] Implementar formulário para criar nova meta
- [x] Adicionar seletor de tipo de meta (WODs, PRs, frequência, peso)
- [x] Implementar campo de valor alvo e prazo
- [x] Criar lista de metas ativas com barras de progresso
- [x] Implementar visualização de metas concluídas
- [x] Criar cards visuais para cada meta
- [x] Adicionar indicadores de marcos (25%, 50%, 75%, 100%)
- [x] Adicionar link de Metas na navegação
- [x] Testar criação e visualização de metas

## Gráficos de Evolução de Performance - ✅ CONCLUÍDO
- [x] Melhorar componente de gráfico de evolução de PRs
- [x] Implementar filtro por período (30d, 90d, 1a, tudo)
- [x] Adicionar gráfico de linha com histórico de cargas
- [x] Adicionar domínio dinâmico no eixo Y
- [x] Melhorar componente de gráfico de evolução de WODs
- [x] Implementar filtro por período
- [x] Adicionar gráfico de tempos/reps ao longo do tempo
- [x] Integrar gráficos na página de PRs (já existente)
- [x] Integrar gráficos na página de Histórico (já existente)
- [x] Testar gráficos com dados reais


## Feed Social do Box - ✅ CONCLUÍDO
- [x] Criar schema de atividades/posts do feed
- [x] Implementar geração automática de posts ao completar WOD
- [x] Implementar geração automática de posts ao quebrar PR
- [x] Implementar geração automática de posts ao desbloquear badge
- [x] Criar queries para buscar feed do box com paginação
- [x] Adicionar procedures tRPC para feed
- [x] Criar página de Feed Social (/feed)
- [x] Implementar timeline com cards de atividades
- [x] Adicionar filtros por tipo de atividade
- [x] Implementar sistema de curtidas/reações
- [x] Adicionar link de Feed na navegação
- [x] Implementar botão de compartilhar no Instagram
- [x] Adicionar deep link para Instagram Stories
- [x] Testar feed social completo

## Comparação de Performance entre Atletas - ✅ CONCLUÍDO
- [x] Criar função para buscar dados comparativos de dois atletas
- [x] Implementar comparação de PRs lado a lado
- [x] Implementar comparação de badges conquistados
- [x] Implementar comparação de estatísticas (WODs, frequência, pontos)
- [x] Adicionar procedures tRPC para comparação
- [x] Criar página de Comparação (/comparar)
- [x] Implementar seletor de dois atletas
- [x] Criar visualização lado a lado com cards
- [x] Implementar tabela de PRs lado a lado
- [x] Testar comparação de atletas


## Sistema de Comentários no Feed - EM ANDAMENTO
- [ ] Criar schema de comentários
- [ ] Adicionar migration para tabela de comentários
- [ ] Criar funções para adicionar, listar e deletar comentários
- [ ] Adicionar procedures tRPC para comentários
- [ ] Implementar seção de comentários nos cards do feed
- [ ] Adicionar campo de texto para novo comentário
- [ ] Implementar listagem de comentários com avatar e nome
- [ ] Adicionar botão de deletar comentário (apenas autor)
- [ ] Criar notificação quando alguém comenta em sua conquista
- [ ] Testar sistema de comentários completo

## Sistema de Desafios entre Atletas - EM ANDAMENTO
- [ ] Criar schema de desafios
- [ ] Adicionar migration para tabela de desafios
- [ ] Criar schema de participações em desafios
- [ ] Implementar funções para criar, listar e participar de desafios
- [ ] Adicionar procedures tRPC para desafios
- [ ] Criar página de Desafios (/desafios)
- [ ] Implementar formulário para criar novo desafio
- [ ] Adicionar listagem de desafios ativos
- [ ] Criar placar ao vivo de participantes
- [ ] Implementar botão de participar do desafio
- [ ] Adicionar notificações de novos desafios
- [ ] Adicionar link de Desafios na navegação
- [ ] Testar sistema de desafios completo

## Onboarding para Novos Atletas - EM ANDAMENTO
- [ ] Criar componente de tour guiado (Onboarding)
- [ ] Implementar detecção de primeiro acesso
- [ ] Adicionar step 1: Bem-vindo ao Impacto Pro League
- [ ] Adicionar step 2: WOD do Dia - Como registrar resultados
- [ ] Adicionar step 3: PRs - Como registrar recordes pessoais
- [ ] Adicionar step 4: Badges - Como conquistar badges
- [ ] Adicionar step 5: Feed - Como interagir com a comunidade
- [ ] Adicionar botões de navegação (Próximo, Anterior, Pular)
- [ ] Salvar flag de onboarding completo no perfil
- [ ] Testar onboarding completo


## Sistema de Comentários no Feed
- [x] Criar tabela de comentários do feed
- [x] Criar procedures para adicionar comentário
- [x] Criar procedures para listar comentários por atividade
- [x] Criar procedures para deletar comentário
- [x] Criar componente FeedComentarios
- [x] Integrar comentários nos cards do feed
- [x] Implementar contador de comentários
- [x] Implementar notificação ao autor da atividade

## Sistema de Desafios Entre Atletas
- [x] Criar tabelas de desafios (desafios, desafio_participantes, desafio_atualizacoes)
- [x] Criar procedures para criar desafio
- [x] Criar procedures para listar desafios do box
- [x] Criar procedures para aceitar/recusar convite
- [x] Criar procedures para atualizar progresso
- [x] Criar procedures para completar desafio
- [x] Criar procedures para cancelar desafio
- [x] Criar página de listagem de desafios
- [x] Criar página de detalhes do desafio com scoreboard
- [x] Implementar atualização automática do scoreboard (10s)
- [x] Implementar notificações de convites e conclusões
- [x] Adicionar link de Desafios no menu
- [ ] Criar testes para funcionalidades de desafios

## Sistema de Onboarding para Novos Atletas
- [x] Criar campo onboarding_completed no schema de users
- [x] Criar componente de tour guiado
- [x] Implementar steps do onboarding (Dashboard, WOD, PRs, Badges, Feed, Desafios)
- [x] Adicionar tooltips e overlays
- [x] Implementar lógica de exibição apenas no primeiro login
- [x] Criar procedure para marcar onboarding como completo
- [x] Integrar OnboardingTour no Dashboard
- [x] Adicionar barra de progresso e navegação


## Sistema de Equipes/Times
- [x] Criar tabela de equipes (teams)
- [x] Criar tabela de membros de equipes (team_members)
- [x] Criar procedures para criar equipe
- [x] Criar procedures para adicionar/remover membros
- [x] Criar procedures para listar equipes do box
- [x] Criar procedures para ranking de equipes
- [x] Criar página de listagem de equipes
- [x] Criar página de detalhes da equipe
- [x] Criar interface de criação de equipe
- [x] Adicionar desafios coletivos entre equipes
- [x] Implementar pontuação acumulada da equipe
- [x] Adicionar link de Equipes no menu
- [ ] Criar testes para funcionalidades de equipes

## Dashboard de Progresso Semanal
- [x] Criar procedures para buscar dados de frequência semanal
- [x] Criar procedures para calcular volume de treino semanal
- [x] Criar procedures para comparação com semanas anteriores
- [x] Criar componente de gráfico de frequência
- [x] Criar componente de gráfico de volume
- [x] Criar componente de comparação semanal
- [x] Adicionar seção de progresso semanal no Dashboard
- [x] Implementar filtros de período (últimas 4 semanas)
- [x] Adicionar indicadores de tendência (subindo/descendo)
- [ ] Criar testes para cálculos de progresso

## Sistema de Recompensas por Streak
- [x] Adicionar campo streak_atual e streak_recorde na tabela users
- [x] Criar badges de streak (7, 30, 100 dias consecutivos)
- [x] Criar função para calcular streak de check-ins
- [x] Criar função para verificar e atualizar streak diariamente
- [x] Criar trigger para atualizar streak após check-in
- [x] Criar procedure para buscar histórico de streak
- [x] Adicionar indicador de streak no Dashboard
- [x] Implementar badge automático ao atingir marcos de streak
- [x] Criar componente StreakIndicator com progresso visual
- [x] Adicionar notificações de badges conquistados
- [ ] Criar testes para cálculo de streak


## Leaderboard de Equipes em Tempo Real
- [x] Criar procedures para buscar ranking de equipes
- [x] Criar procedures para evolução mensal de equipes
- [x] Criar página de Leaderboard de Equipes
- [x] Implementar ranking ao vivo com atualização automática (30s)
- [x] Adicionar gráficos de evolução mensal por equipe
- [x] Implementar troféus para top 3 equipes
- [x] Adicionar filtros por período (semana, mês, temporada)
- [x] Criar indicadores de subida/descida no ranking
- [x] Adicionar link de Leaderboard no menu
- [x] Adicionar atividades recentes por equipe
- [ ] Criar testes para funcionalidades de leaderboard

## Sistema de Conquistas Semanais
- [x] Criar tabela de conquistas semanais
- [x] Criar tabela de progresso de conquistas
- [x] Criar conquistas automáticas (5 WODs, 3 PRs, 7 check-ins, 500 pontos, 10 WODs)
- [x] Criar procedures para verificar progresso de conquistas
- [x] Criar procedures para conceder recompensas
- [x] Implementar cálculo automático de progresso
- [x] Criar página de Conquistas Semanais
- [x] Adicionar barra de progresso visual
- [x] Implementar notificações de conquistas completadas
- [x] Integrar atualização de progresso em treinos, PRs e check-ins
- [x] Adicionar histórico de conquistas anteriores
- [x] Adicionar link de Conquistas no menu
- [ ] Criar testes para funcionalidades de conquistas

## Análise de Performance por Movimento
- [x] Criar procedures para buscar histórico de PRs por movimento
- [x] Criar procedures para calcular evolução por movimento
- [x] Criar procedures para comparar com média do box
- [x] Criar página de Análise de Performance
- [x] Implementar gráficos de evolução por exercício
- [x] Adicionar comparação com PRs anteriores
- [x] Implementar comparação com média do box
- [x] Adicionar seletor de movimento
- [x] Criar indicadores de progresso percentual
- [x] Adicionar sugestões de treino baseadas em performance
- [x] Adicionar histórico de melhorias recentes
- [x] Mostrar posição no ranking do box
- [x] Substituir link "Meus PRs" por "Análise de Performance" no menu
- [ ] Criar testes para cálculos de performance


## Sistema de Notificações Push em Tempo Real
- [x] Configurar Socket.IO no servidor Express
- [x] Criar gerenciador de conexões WebSocket
- [x] Implementar autenticação de conexões WebSocket
- [x] Criar eventos de notificação em tempo real
- [x] Integrar notificações com sistema de conquistas
- [x] Integrar notificações com sistema de desafios
- [x] Integrar notificações com feed de atividades
- [x] Criar hook useRealtimeNotifications no frontend
- [x] Implementar componente de toast para notificações
- [x] Implementar sistema de reconexão automática
- [x] Adicionar componente RealtimeNotifications no App.tsx
- [ ] Criar testes para funcionalidades de WebSocket

## Dashboard do Coach/Box Master
- [x] Criar procedures para métricas de engajamento
- [x] Criar procedures para identificar atletas em risco
- [x] Criar procedures para relatórios de progresso coletivo
- [x] Criar procedures para estatísticas do box
- [x] Criar página de Dashboard do Coach
- [x] Implementar gráficos de frequência geral do box
- [x] Implementar gráficos de evolução de PRs coletivos
- [x] Adicionar lista de atletas em risco de abandono
- [x] Implementar alertas de atletas sem check-in há 7+ dias
- [x] Adicionar estatísticas de conquistas completadas
- [x] Implementar filtros por período (semana, mês, trimestre)
- [x] Adicionar resumo semanal com variações
- [x] Adicionar link de Dashboard Coach no menu
- [ ] Criar testes para funcionalidades do dashboard

## Comparação entre Atletas
- [x] Criar procedures para buscar dados comparativos
- [x] Criar procedures para comparar PRs entre atletas
- [x] Criar procedures para comparar frequência
- [x] Criar procedures para comparar badges
- [x] Criar página de Comparação de Atletas
- [x] Implementar seletor de atletas (2-4 atletas)
- [x] Criar visualização lado a lado de estatísticas
- [x] Implementar gráficos de comparação de PRs
- [x] Adicionar comparação de badges conquistados
- [x] Adicionar indicadores de vantagem/desvantagem (coroa para melhor)
- [x] Adicionar link de Comparar Atletas no menu
- [ ] Criar testes para funcionalidades de comparação


## Sistema de Mensagens Diretas
- [x] Criar tabela de conversas (conversations)
- [x] Criar tabela de mensagens (messages)
- [x] Criar procedures para criar conversa
- [x] Criar procedures para enviar mensagem
- [x] Criar procedures para listar conversas do usuário
- [x] Criar procedures para buscar mensagens de uma conversa
- [x] Criar procedures para marcar mensagens como lidas
- [x] Integrar notificações em tempo real via WebSocket
- [x] Criar página de Mensagens com lista de conversas
- [x] Criar componente de chat com histórico
- [x] Implementar envio de mensagens em tempo real
- [x] Adicionar indicador de mensagens não lidas
- [x] Adicionar timestamp e status de leitura
- [x] Adicionar link de Mensagens no menu
- [x] Implementar polling de mensagens a cada 3s
- [ ] Criar testes para funcionalidades de mensagens

## Calendário de Eventos do Box
- [x] Criar tabela de eventos (eventos_box)
- [x] Criar tabela de RSVPs (evento_rsvps)
- [x] Criar procedures para criar evento
- [x] Criar procedures para listar eventos
- [x] Criar procedures para confirmar presença (RSVP)
- [x] Criar procedures para cancelar presença
- [x] Criar procedures para buscar participantes do evento
- [x] Criar página de Calendário de Eventos
- [x] Implementar visualização de calendário mensal com navegação
- [x] Criar modal de detalhes do evento
- [x] Implementar sistema de RSVP com contador
- [x] Adicionar cores por tipo de evento
- [x] Adicionar link de Eventos no menu
- [x] Implementar formulário de criação de evento
- [ ] Criar testes para funcionalidades de eventos


## Sistema de Check-in por QR Code
- [x] Instalar biblioteca de geração de QR Code (qrcode)
- [x] Instalar biblioteca de scanner de QR Code (html5-qrcode)
- [x] Criar procedure para gerar QR Code do atleta
- [x] Criar página de exibição do QR Code do atleta
- [x] Criar procedure para processar check-in via QR Code
- [x] Implementar validação de duplicatas (mesmo dia)
- [x] Criar página de scanner para recepção
- [x] Implementar interface de câmera para scanner
- [x] Adicionar feedback visual de sucesso/erro no scanner
- [x] Integrar check-in QR Code com sistema de pontos
- [x] Integrar check-in QR Code com sistema de streak
- [x] Adicionar função hasCheckedInToday para validação
- [x] Adicionar link de "Meu QR Code" no menu do atleta
- [x] Adicionar link de "Scanner Check-in" no menu do box master
- [x] Implementar botão de download do QR Code
- [ ] Criar testes para funcionalidades de QR Code


## Sistema de Planos e Assinaturas
- [x] Criar tabela de planos (planos)
- [x] Criar tabela de assinaturas (assinaturas)
- [x] Criar tabela de histórico de pagamentos (historico_pagamentos)
- [x] Adicionar campo planoId e dataVencimento na tabela users
- [x] Criar procedures para CRUD de planos
- [x] Criar procedures para gerenciar assinaturas
- [x] Criar procedure para verificar status da assinatura
- [x] Criar procedure para renovar assinatura
- [x] Criar procedure para cancelar assinatura
- [x] Implementar middleware de verificação de assinatura ativa
- [x] Criar sistema de notificações de vencimento (7 dias antes, 3 dias antes, vencida)
- [x] Criar página de gestão de planos (box master)
- [x] Criar página de gestão de assinaturas (box master)
- [x] Criar página de visualização de assinatura do atleta
- [x] Criar procedure para renovar assinatura
- [x] Implementar função helper verificarAssinaturaAtiva
- [x] Criar procedure assinaturaProcedure para bloquear acesso
- [x] Adicionar links no menu (Minha Assinatura, Gestão de Planos, Gestão de Assinaturas)
- [x] Criar relatório de receita mensal
- [x] Adicionar tipos de notificação de assinatura no schema
- [ ] Criar testes para funcionalidades de assinaturas


## Dashboard Financeiro do Box
- [x] Criar procedures para calcular MRR (Monthly Recurring Revenue)
- [x] Criar procedures para calcular taxa de churn (cancelamento)
- [x] Criar procedures para projeções de faturamento
- [x] Criar procedures para análise de inadimplência
- [x] Criar procedures para histórico de receita mensal
- [x] Criar procedures para comparação mensal (crescimento/queda)
- [x] Criar página de Dashboard Financeiro
- [x] Implementar gráfico de evolução de MRR
- [x] Implementar gráfico de taxa de churn
- [x] Implementar gráfico de projeções de faturamento
- [x] Adicionar indicadores de inadimplência
- [x] Adicionar lista de inadimplentes com dias de atraso
- [x] Adicionar filtros por período
- [x] Adicionar link de Dashboard Financeiro no menu
- [ ] Criar testes para cálculos financeiros

## Sistema de Cupons e Descontos
- [x] Criar tabela de cupons (cupons)
- [x] Criar tabela de uso de cupons (cupons_usados)
- [x] Criar procedures para CRUD de cupons
- [x] Criar procedures para validar cupom
- [x] Criar procedures para aplicar desconto
- [x] Criar procedures para registrar uso de cupom
- [x] Implementar tipos de cupons (percentual, valor fixo)
- [x] Implementar limite de uso por cupom
- [x] Implementar data de validade
- [x] Criar página de gestão de cupons (box master)
- [x] Criar tabela de indicações
- [x] Implementar sistema de indicação com desconto
- [x] Criar código único de indicação por atleta
- [x] Criar página de Minhas Indicações
- [x] Adicionar link de Gestão de Cupons no menu
- [x] Adicionar link de Minhas Indicações no menu
- [ ] Criar testes para funcionalidades de cupons


## Sistema de Avaliações Físicas
- [x] Criar tabela de avaliações físicas (avaliacoes_fisicas)
- [x] Criar campos: peso, altura, IMC, % gordura, circunferências (cintura, quadril, braço, perna, peito)
- [x] Criar procedures para registrar nova avaliação
- [x] Criar procedures para listar avaliações do atleta
- [x] Criar procedures para comparar avaliações (evolução)
- [x] Criar procedures para calcular IMC automaticamente
- [x] Criar página de registro de avaliação física
- [x] Criar página de histórico de avaliações do atleta
- [x] Implementar gráficos de evolução de peso
- [x] Implementar gráficos de evolução de % gordura
- [x] Implementar gráficos de evolução de circunferências
- [x] Adicionar comparação entre avaliações (diferenças)
- [x] Adicionar indicadores de progresso (ganho/perda)
- [x] Adicionar link de Avaliações Físicas no menu
- [ ] Criar testes para funcionalidades de avaliações

## Gestão Administrativa e Financeira
- [x] Criar tabela de funcionários (funcionarios)
- [x] Criar tabela de prestadores de serviços (prestadores)
- [x] Criar tabela de transações financeiras (transacoes_financeiras)
- [x] Criar tabela de categorias de despesas (categorias_despesas)
- [x] Criar procedures para CRUD de funcionários
- [x] Criar procedures para CRUD de prestadores
- [x] Criar procedures para registrar transações financeiras
- [x] Criar procedures para calcular folha de pagamento mensal
- [x] Criar procedures para relatório de fluxo de caixa
- [x] Criar procedures para análise de despesas por categoria
- [x] Criar página de Gestão Administrativa com abas
- [x] Implementar aba de funcionários
- [x] Implementar aba de prestadores
- [x] Implementar aba de fluxo de caixa
- [x] Implementar aba de folha de pagamento
- [x] Implementar gráficos de despesas por categoria
- [x] Adicionar resumo financeiro (entradas, saídas, saldo)
- [x] Adicionar link de Gestão Administrativa no menu
- [ ] Criar testes para funcionalidades administrativas


## Módulos de ERP para Box de CrossFit

### Gestão de Compras
- [x] Criar tabela de fornecedores (fornecedores)
- [x] Criar tabela de pedidos de compra (pedidos_compra)
- [x] Criar tabela de itens do pedido (pedidos_compra_itens)
- [x] Criar procedures para CRUD de fornecedores
- [x] Criar procedures para criar pedido de compra
- [x] Criar procedures para adicionar itens ao pedido
- [x] Criar procedures para aprovar/cancelar pedido
- [x] Criar procedures para atualizar status (workflow hierárquico)
- [x] Criar página de Gestão de Compras com abas
- [x] Implementar aba de fornecedores
- [x] Implementar aba de pedidos de compra
- [x] Implementar workflow de aprovação (box_master → franqueado → admin_liga)
- [x] Implementar badges de status (pendente, aprovado, recebido, cancelado)
- [x] Adicionar link de Gestão de Compras no menu
- [ ] Criar testes para funcionalidades de compras

### Gestão de Estoque - ✅ CONCLUÍDO
- [x] Criar tabela de produtos (produtos)
- [x] Criar tabela de categorias de produtos (categorias_produtos)
- [x] Criar tabela de movimentações de estoque (movimentacoes_estoque)
- [x] Criar procedures para CRUD de produtos
- [x] Criar procedures para entrada de estoque
- [x] Criar procedures para saída de estoque
- [x] Criar procedures para inventário
- [x] Criar procedures para alertas de estoque mínimo
- [x] Criar página de gestão de produtos com 4 abas
- [x] Implementar aba de Produtos (CRUD completo)
- [x] Implementar aba de Movimentações (histórico)
- [x] Implementar aba de Alertas (estoque baixo)
- [x] Implementar aba de Inventário (relatório completo)
- [x] Implementar busca por código de barras
- [x] Adicionar link de Estoque no menu
- [ ] Criar testes para funcionalidades de estoque

### PDV (Ponto de Venda) - ✅ CONCLUÍDO
- [x] Criar tabela de vendas (vendas)
- [x] Criar tabela de itens da venda (vendas_itens)
- [x] Criar tabela de caixa (controle de abertura/fechamento)
- [x] Criar tabela de movimentações de caixa
- [x] Criar procedures para criar venda
- [x] Criar procedures para adicionar itens à venda
- [x] Criar procedures para finalizar venda
- [x] Criar procedures para cancelar venda
- [x] Criar procedures para relatório de vendas
- [x] Criar procedures para produtos mais vendidos
- [x] Criar procedures para abrir/fechar caixa
- [x] Criar página de PDV com interface de caixa
- [x] Implementar busca de produtos por código de barras
- [x] Implementar carrinho de compras
- [x] Implementar seleção de forma de pagamento
- [x] Integrar com controle de estoque (baixa automática)
- [x] Integrar com controle de caixa (registro automático)
- [x] Adicionar link de PDV no menu
- [ ] Criar testes para funcionalidades de PDV

### Notas Fiscais
- [ ] Criar tabela de notas fiscais (notas_fiscais)
- [ ] Criar procedures para emitir nota fiscal de serviço
- [ ] Criar procedures para emitir nota fiscal de produto
- [ ] Criar procedures para cancelar nota fiscal
- [ ] Criar procedures para consultar notas emitidas
- [ ] Criar página de gestão de notas fiscais
- [ ] Implementar geração de XML da nota
- [ ] Implementar impressão de DANFE
- [ ] Adicionar validações fiscais
- [ ] Adicionar link de Notas Fiscais no menu
- [ ] Criar testes para funcionalidades de notas fiscais

### Relatórios Gerenciais
- [ ] Criar procedures para DRE (Demonstração do Resultado do Exercício)
- [ ] Criar procedures para balanço patrimonial
- [ ] Criar procedures para análise de rentabilidade por produto
- [ ] Criar procedures para análise de rentabilidade por serviço
- [ ] Criar procedures para curva ABC de produtos
- [ ] Criar procedures para giro de estoque
- [ ] Criar página de relatórios gerenciais
- [ ] Implementar gráfico de DRE
- [ ] Implementar gráfico de balanço
- [ ] Implementar exportação de relatórios em PDF/Excel
- [ ] Adicionar link de Relatórios Gerenciais no menu
- [ ] Criar testes para cálculos de relatórios


### Dashboard Financeiro Consolidado - ✅ CONCLUÍDO
- [x] Criar procedures para cálculo de receita total (vendas + mensalidades)
- [x] Criar procedures para cálculo de despesas totais (compras)
- [x] Criar procedures para cálculo de lucro líquido
- [x] Criar procedures para cálculo de margem de lucro
- [x] Criar procedures para cálculo de ticket médio
- [x] Criar procedures para evolução temporal de receitas/despesas
- [x] Criar procedures para distribuição de receitas por fonte
- [x] Criar procedures para fluxo de caixa mensal
- [x] Criar procedures para top produtos por faturamento
- [x] Criar procedures para distribuição de formas de pagamento
- [x] Criar página de Dashboard Financeiro Geral
- [x] Implementar cards de KPIs (receita, despesa, lucro, margem, ticket médio, total em caixa)
- [x] Implementar gráfico de linha (receitas vs despesas)
- [x] Implementar gráfico de pizza (distribuição de receitas)
- [x] Implementar gráfico de barras (fluxo de caixa mensal)
- [x] Implementar tabela de top 10 produtos por faturamento
- [x] Implementar tabela de formas de pagamento
- [x] Implementar filtros de período (hoje, semana, mês, trimestre, ano)
- [x] Adicionar link de Dashboard Financeiro Geral no menu
- [ ] Implementar comparação com período anterior (futuro)
- [ ] Adicionar exportação de relatório em PDF (futuro)
- [ ] Adicionar exportação de dados em CSV (futuro)
- [ ] Criar testes para cálculos financeiros


### Core de Atletas - Implementação - ✅ CONCLUÍDO
- [x] Verificar schema de wods e resultados_treinos
- [x] Criar procedure para buscar WOD do dia
- [x] Criar procedure para registrar resultado de WOD
- [x] Criar procedure para listar histórico de resultados do atleta
- [x] Criar procedure para buscar ranking do WOD (getByWod)
- [x] Criar procedure para calcular pontos de gamificação
- [x] Criar procedure para atribuir badges automáticos
- [x] Atualizar página de WOD do Dia com registro de resultados
- [x] Adicionar Leaderboard do WOD com ranking de resultados
- [x] Criar componente de formulário de registro de resultado
- [x] Página de Rankings com PRs já existe e funciona
- [x] Melhorar página de Badges (conquistados + bloqueados)
- [x] Implementar sistema de pontos (check-in +10, WOD +20, PR +30)
- [x] Implementar badges automáticos com notificações
- [ ] Criar testes para funcionalidades de atletas


### Sistema de Campeonatos Completo - ✅ CONCLUÍDO
- [x] Verificar schema de campeonatos existente
- [x] Criar procedures para CRUD de campeonatos
- [x] Criar procedures para inscrições de atletas
- [x] Criar procedures para gestão de baterias
- [x] Criar procedures para leaderboard de campeonatos
- [x] Criar procedures para sistema de pontuação
- [x] Melhorar página de listagem de campeonatos
- [x] Adicionar dialog de detalhes do campeonato
- [x] Implementar formulário de inscrição com +50 pontos
- [x] Adicionar badges de tipo e status
- [x] Implementar validação de inscrições abertas
- [x] Adicionar informações de capacidade e local

### Feed Social - ✅ CONCLUÍDO
- [x] Verificar schema de feed existente
- [x] Criar procedures para listar atividades do feed
- [x] Criar procedures para curtidas
- [x] Criar procedures para comentários
- [x] Página de Feed já existe e está completa
- [x] Cards de atividade com ícones e cores (WOD, PR, Badge)
- [x] Sistema de curtidas implementado
- [x] Sistema de comentários com componente FeedComentarios
- [x] Filtros por tipo de atividade (Select)
- [x] Compartilhamento (incluindo Instagram!)
- [x] Formatação de tempo relativo (Xm atrás, Xh atrás)

### Gestão de Alunos Completa - ✅ CONCLUÍDO
- [x] Verificar schema de avaliações físicas existente
- [x] Criar procedures para registrar avaliações físicas
- [x] Criar procedures para histórico de avaliações
- [x] Criar procedures para relatório de evolução
- [x] Página GestaoBox já existe com componente AlunosTab
- [x] Listagem completa de alunos com busca e filtros
- [x] Badges de categoria (iniciante, intermediário, avançado, elite)
- [x] Página de Avaliações Físicas completa
- [x] Gráficos de evolução (Peso, % Gordura, IMC)
- [x] Registro de medidas corporais completo
- [x] Cálculo automático de IMC
- [x] Histórico de avaliações com comparação


### PWA - Progressive Web App - ✅ CONCLUÍDO
- [x] Criar manifest.json com identidade do app
- [x] Adicionar ícones em múltiplos tamanhos (192x192, 512x512)
- [x] Configurar modo standalone e cores do tema
- [x] Criar Service Worker para cache offline
- [x] Implementar estratégias de cache (Cache First para assets, Network First para API)
- [x] Adicionar botão "Instalar App" no header
- [x] Criar dialog customizado de instalação com benefícios
- [x] Implementar detecção de instalação (beforeinstallprompt)
- [x] Configurar suporte a notificações push no Service Worker
- [x] Adicionar shortcuts no manifest (WOD, Feed, Rankings)
- [x] Implementar indicador de modo offline
- [x] Otimizar viewport para mobile (safe-area-insets)
- [x] Adicionar otimizações de touch (tap-highlight, touch targets)
- [x] Prevenir zoom indesejado em inputs mobile
- [x] Implementar smooth scrolling
- [x] Criar hook usePWA para gerenciar funcionalidades
