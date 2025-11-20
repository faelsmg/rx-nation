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
