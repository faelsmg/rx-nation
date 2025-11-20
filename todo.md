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
