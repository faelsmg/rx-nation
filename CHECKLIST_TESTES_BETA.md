# ✅ Checklist de Testes Beta - RX Nation

Este documento lista todas as funcionalidades que devem ser testadas durante a fase beta.

---

## 🔐 Autenticação e Perfil

- [ ] Login com OAuth (Google, GitHub, etc.)
- [ ] Logout funciona corretamente
- [ ] Perfil do usuário carrega dados corretos
- [ ] Edição de perfil (nome, categoria, faixa etária)
- [ ] Vinculação com box funciona
- [ ] Roles diferentes (atleta, box_master) têm acessos corretos

---

## 👤 Dashboard do Atleta

### Visualização Geral
- [ ] Dashboard carrega sem erros
- [ ] Pontos totais aparecem corretamente
- [ ] Badges conquistados são exibidos
- [ ] Streak atual está correto
- [ ] Nível do atleta (Bronze/Prata/Ouro/Platina) aparece
- [ ] WOD do dia é exibido
- [ ] Comunicados do box aparecem

### Tour de Onboarding
- [ ] Tour aparece no primeiro acesso
- [ ] Todos os 5 passos funcionam
- [ ] Botão "Pular" funciona
- [ ] Tour não aparece após completar

### Heatmap de Streaks
- [ ] Heatmap exibe últimos 90 dias
- [ ] Cores graduadas funcionam (0 check-ins = cinza, 1+ = verde)
- [ ] Tooltip mostra data e quantidade de check-ins
- [ ] Atualiza após novo check-in

### Desafios Personalizados com IA
- [ ] Botão "Gerar Novos Desafios" funciona
- [ ] IA gera 3 desafios customizados
- [ ] Desafios são baseados no histórico real
- [ ] Progresso é atualizado automaticamente
- [ ] Barra de progresso funciona
- [ ] Notificação ao completar desafio
- [ ] Pontos são creditados ao completar

---

## 🏋️ WOD do Dia

### Visualização
- [ ] WOD do dia carrega corretamente
- [ ] Título, tipo, descrição aparecem
- [ ] Time cap é exibido (se houver)
- [ ] Vídeo do YouTube carrega (se houver)
- [ ] Leaderboard mostra resultados de outros atletas

### Registro de Resultado
- [ ] Formulário de registro abre
- [ ] Campos corretos aparecem por tipo de WOD:
  * **For Time:** tempo, RX/Scaled
  * **AMRAP:** rounds + reps, RX/Scaled
  * **EMOM:** rounds completados, RX/Scaled
  * **Carga:** peso levantado
- [ ] Validação de campos funciona
- [ ] Resultado é salvo corretamente
- [ ] Leaderboard atualiza após salvar
- [ ] Pontos são creditados (+20)
- [ ] Notificação de sucesso aparece

### Comentários e Interações
- [ ] Comentários são exibidos
- [ ] Novo comentário é salvo
- [ ] Reações funcionam (👍 💪 🔥 ❤️)
- [ ] Menções com @ funcionam
- [ ] Notificação de menção é enviada
- [ ] Contador de reações atualiza

---

## 🏆 Personal Records (PRs)

### Visualização
- [ ] Lista de PRs carrega
- [ ] 15 movimentos padrão aparecem
- [ ] Histórico de cada PR é exibido
- [ ] Gráfico de evolução funciona
- [ ] Comparação com média do box aparece

### Registro de PR
- [ ] Formulário de novo PR abre
- [ ] Movimento, carga e data são salvos
- [ ] Validação de carga (deve ser maior que anterior)
- [ ] PR aparece no histórico
- [ ] Pontos são creditados (+30)
- [ ] Badge automático é concedido (se aplicável)
- [ ] Notificação de sucesso aparece

### Compartilhamento
- [ ] Card visual do PR é gerado
- [ ] Botão "Compartilhar no Instagram" funciona
- [ ] Card tem design atraente
- [ ] Dados corretos aparecem no card

---

## 📊 Rankings

### Visualização
- [ ] Rankings carregam corretamente
- [ ] Top 50 atletas aparecem
- [ ] Posição do usuário é destacada
- [ ] Filtros funcionam:
  * Por movimento (Snatch, Clean, etc.)
  * Por categoria (Iniciante, Intermediário, etc.)
  * Por faixa etária (18-29, 30-39, etc.)
- [ ] Dados são atualizados em tempo real

---

## 🎖️ Badges e Conquistas

### Visualização
- [ ] Página de badges carrega
- [ ] Badges conquistados aparecem destacados
- [ ] Badges bloqueados aparecem em cinza
- [ ] Progresso para próximo badge é exibido
- [ ] Descrição e critério de cada badge aparecem

### Desbloqueio Automático
- [ ] Badge de "Primeiro Check-in" é concedido
- [ ] Badge de "Primeiro WOD" é concedido
- [ ] Badge de "Primeiro PR" é concedido
- [ ] Badge de "Streak 7 dias" é concedido
- [ ] Badge de "100 WODs" é concedido (se aplicável)
- [ ] Notificação de novo badge aparece

### Certificado em PDF
- [ ] Botão "Baixar Certificado" funciona
- [ ] PDF é gerado corretamente
- [ ] Dados do atleta aparecem no PDF
- [ ] Design do certificado está bonito

---

## 🔥 Sistema de Streaks

- [ ] Streak atual é calculado corretamente
- [ ] Melhor streak é exibido
- [ ] Streak aumenta após check-in diário
- [ ] Streak quebra se passar 1 dia sem check-in
- [ ] Notificação de streak quebrado é enviada (se >= 7 dias)
- [ ] Badges de streak são concedidos automaticamente

---

## 🎯 Metas Pessoais

### Criação
- [ ] Formulário de nova meta abre
- [ ] Tipos de meta funcionam (PR, Frequência, WODs, Custom)
- [ ] Meta é salva corretamente
- [ ] Aparece na lista de metas ativas

### Tracking
- [ ] Progresso é atualizado automaticamente
- [ ] Barra de progresso funciona
- [ ] Notificações de marcos (25%, 50%, 75%, 100%) são enviadas
- [ ] Meta é marcada como completada ao atingir 100%
- [ ] Pontos são creditados ao completar

---

## 📱 Feed Social

### Visualização
- [ ] Feed carrega atividades recentes
- [ ] PRs recentes aparecem
- [ ] Comentários populares aparecem
- [ ] Menções recebidas aparecem
- [ ] Ordenação por data funciona

### Interações
- [ ] Curtir atividade funciona
- [ ] Comentar atividade funciona
- [ ] Mencionar atleta com @ funciona
- [ ] Notificação de interação é enviada

---

## 📆 Agenda de Aulas

### Visualização
- [ ] Horários dos próximos 7 dias aparecem
- [ ] Capacidade máxima é exibida
- [ ] Vagas disponíveis são calculadas corretamente
- [ ] Aulas do usuário aparecem destacadas

### Reservas
- [ ] Reservar vaga funciona
- [ ] Validação de capacidade máxima funciona
- [ ] Não permite reservas duplicadas
- [ ] Cancelar reserva funciona
- [ ] Notificação de reserva confirmada é enviada
- [ ] Lembrete 1h antes da aula é enviado

### Integração com Calendário
- [ ] Botão "Adicionar ao Calendário" funciona
- [ ] Arquivo .ics é baixado
- [ ] Importação no Google Calendar funciona
- [ ] Importação no iOS Calendar funciona
- [ ] Dados corretos aparecem no calendário

---

## 💬 Sistema de Notificações

### Tipos de Notificação
- [ ] Novo WOD criado
- [ ] Novo comunicado publicado
- [ ] Badge desbloqueado
- [ ] Lembrete de aula (1h antes)
- [ ] Menção recebida
- [ ] Meta atingida (25%, 50%, 75%, 100%)
- [ ] Streak quebrado

### Centro de Notificações
- [ ] Ícone de sino aparece no header
- [ ] Contador de não lidas funciona
- [ ] Dropdown abre ao clicar
- [ ] Notificações são exibidas
- [ ] Marcar como lida funciona
- [ ] Botão "Marcar todas como lidas" funciona
- [ ] Link da notificação redireciona corretamente

### Preferências
- [ ] Página de preferências carrega
- [ ] Toggles para cada tipo funcionam
- [ ] Preferências são salvas
- [ ] Notificações respeitam preferências

---

## 🏢 Gestão do Box (Box Master)

### Dashboard
- [ ] Dashboard de gestão carrega
- [ ] Métricas gerais aparecem (total de alunos, ativos, etc.)
- [ ] Navegação entre abas funciona

### Gestão de Alunos
- [ ] Lista de alunos carrega
- [ ] Filtros por categoria funcionam
- [ ] Busca por nome funciona
- [ ] Estatísticas de cada aluno aparecem
- [ ] Atribuir badge manualmente funciona

### Criação de WODs
- [ ] Formulário de novo WOD abre
- [ ] Todos os campos são salvos corretamente
- [ ] Templates clássicos funcionam
- [ ] Salvar como template funciona
- [ ] Duplicar WOD funciona
- [ ] Copiar semana inteira funciona
- [ ] Favoritar WOD funciona
- [ ] Notificação aos atletas é enviada

### Agenda de Aulas
- [ ] Criar horário de aula funciona
- [ ] Editar horário funciona
- [ ] Deletar horário funciona
- [ ] Validação de capacidade funciona
- [ ] Lista de reservas aparece

### Comunicados
- [ ] Criar comunicado funciona
- [ ] Editar comunicado funciona
- [ ] Deletar comunicado funciona
- [ ] Tipos de comunicado funcionam
- [ ] Notificação aos atletas é enviada

### Analytics
- [ ] Gráfico de frequência mensal carrega
- [ ] Gráfico de ocupação por horário carrega
- [ ] Gráfico de novos alunos vs cancelamentos carrega
- [ ] Métricas de engajamento aparecem
- [ ] Filtros de período funcionam

### Dashboard de Badges
- [ ] Gráfico de badges mais conquistados carrega
- [ ] Ranking de atletas por badges aparece
- [ ] Métricas de engajamento aparecem
- [ ] Distribuição por categoria funciona

---

## 📈 Análise de Performance

- [ ] Gráficos de evolução de PRs funcionam
- [ ] Comparação com média do box aparece
- [ ] Sugestões de movimentos para melhorar aparecem
- [ ] Histórico de melhorias recentes é exibido

---

## 🏅 Leaderboard de Engajamento

- [ ] Ranking mensal carrega
- [ ] Pontuação é calculada corretamente:
  * Comentário: 10 pontos
  * Reação Recebida: 5 pontos
  * Menção: 8 pontos
  * Reação Dada: 2 pontos
- [ ] Posição do usuário é destacada
- [ ] Estatísticas individuais aparecem

---

## 🐛 Bugs Conhecidos

Liste aqui qualquer bug encontrado durante os testes:

1. 
2. 
3. 

---

## 💡 Sugestões de Melhorias

Liste aqui sugestões de melhorias ou novas funcionalidades:

1. 
2. 
3. 

---

## 📝 Observações Gerais

- **Performance:** A plataforma está rápida?
- **Usabilidade:** A navegação é intuitiva?
- **Design:** O visual está agradável?
- **Mobile:** Funciona bem em dispositivos móveis?
- **Bugs:** Encontrou algum erro crítico?

---

**Data do Teste:** ___/___/______  
**Testador:** _______________________  
**Perfil Testado:** [ ] Atleta [ ] Box Master  
**Dispositivo:** [ ] Desktop [ ] Mobile [ ] Tablet  
**Navegador:** [ ] Chrome [ ] Firefox [ ] Safari [ ] Edge  

---

**Obrigado por ajudar a melhorar a RX Nation! 🙏💪**
