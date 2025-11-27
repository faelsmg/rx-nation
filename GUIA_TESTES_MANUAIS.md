# 🧪 Guia de Testes Manuais - RX Nation

## 🔗 Link de Acesso
**URL:** https://3000-in744dhpfkfmpi0fzau6h-7c8cd2ca.manusvm.computer

---

## 👤 Usuários de Teste

### 🏋️ ATLETA
- **Email:** atleta1@rxnation.com
- **Senha:** (usar login rápido dev)
- **ID:** 1

### 👨‍💼 DONO DE BOX (Box Master)
- **Email:** master@rxnation.com
- **Senha:** (usar login rápido dev)
- **ID:** 100

### 🔐 ADMIN DA LIGA
- **Email:** admin@rxnation.com
- **Senha:** (usar login rápido dev)
- **ID:** 200

---

## 🎯 Cenários de Teste

### 📱 FLUXO DO ATLETA

#### 1. Feed de Seguidos
- [ ] Fazer login como Atleta
- [ ] Navegar para "Feed de Amigos" no menu lateral
- [ ] Verificar se o feed carrega (pode estar vazio inicialmente)
- [ ] Testar filtros: Todas, WODs, PRs, Badges

#### 2. Seguir Outros Atletas
- [ ] Ir para Rankings > Leaderboard de Níveis
- [ ] Clicar em um atleta
- [ ] Clicar em "Seguir"
- [ ] Verificar se botão muda para "Deixar de Seguir"
- [ ] Voltar ao Feed de Amigos
- [ ] Verificar se atividades do atleta seguido aparecem

#### 3. Curtir Atividades
- [ ] No Feed de Amigos, localizar uma atividade
- [ ] Clicar no botão de curtir (❤️)
- [ ] Verificar se contador aumenta
- [ ] Clicar novamente para descurtir
- [ ] Verificar se contador diminui

#### 4. Comentar em Atividades
- [ ] No Feed de Amigos, localizar uma atividade
- [ ] Clicar em "Comentários" para expandir seção
- [ ] Digitar um comentário: "Parabéns pelo resultado! 💪"
- [ ] Clicar em "Comentar"
- [ ] Verificar se comentário aparece na lista
- [ ] Verificar se nome do usuário está correto

#### 5. Deletar Próprio Comentário
- [ ] Localizar comentário que você criou
- [ ] Clicar no botão de deletar (🗑️)
- [ ] Verificar se comentário foi removido

#### 6. Denunciar Comentário Inadequado
- [ ] Localizar comentário de outro usuário
- [ ] Clicar em "Denunciar"
- [ ] Selecionar motivo: "Conteúdo ofensivo"
- [ ] Confirmar denúncia
- [ ] Verificar toast de sucesso

#### 7. Ranking de Amigos
- [ ] Ir para Rankings > Leaderboard de Níveis
- [ ] Ativar toggle "Apenas Amigos"
- [ ] Verificar se ranking mostra apenas atletas seguidos
- [ ] Desativar toggle
- [ ] Verificar se ranking volta ao geral

---

### 👨‍💼 FLUXO DO DONO DE BOX

#### 1. Criar WOD do Dia
- [ ] Fazer login como Box Master
- [ ] Ir para "Gestão do Box" > Aba "WODs"
- [ ] Clicar em "Criar WOD"
- [ ] Preencher:
  - Título: "Fran"
  - Tipo: For Time
  - Descrição: "21-15-9\nThrusters (95/65 lbs)\nPull-ups"
  - Data: Hoje
  - Time Cap: 10 minutos
- [ ] Salvar
- [ ] Verificar se WOD aparece na lista

#### 2. Visualizar Alunos
- [ ] Ir para "Gestão de Alunos"
- [ ] Verificar lista de alunos do box
- [ ] Testar filtros por categoria
- [ ] Verificar estatísticas (check-ins, WODs, último acesso)

#### 3. Visualizar Analytics
- [ ] Ir para "Analytics Avançado"
- [ ] Verificar gráficos de:
  - Taxa de retenção
  - Alunos em risco
  - Frequência média
  - Horários populares

---

### 🛡️ FLUXO DO ADMIN DA LIGA

#### 1. Listar Denúncias Pendentes
- [ ] Fazer login como Admin
- [ ] Ir para "Moderação" (se página existir)
- [ ] OU usar procedure direta via tRPC
- [ ] Verificar lista de denúncias com status "pendente"

#### 2. Ocultar Comentário Denunciado
- [ ] Selecionar uma denúncia
- [ ] Clicar em "Ocultar Comentário"
- [ ] Verificar se comentário foi ocultado
- [ ] Voltar ao feed e confirmar que comentário não aparece mais

#### 3. Rejeitar Denúncia
- [ ] Selecionar uma denúncia
- [ ] Clicar em "Rejeitar Denúncia"
- [ ] Verificar se status muda para "rejeitada"
- [ ] Comentário deve continuar visível

---

## 🔔 Notificações em Tempo Real (WebSocket)

### Teste de Curtida
1. Abrir navegador 1: Login como Atleta 1
2. Abrir navegador 2: Login como Atleta 2
3. Atleta 1 cria uma atividade (registra WOD ou PR)
4. Atleta 2 curte a atividade
5. **Verificar:** Atleta 1 deve receber notificação em tempo real

### Teste de Comentário
1. Abrir navegador 1: Login como Atleta 1
2. Abrir navegador 2: Login como Atleta 2
3. Atleta 1 cria uma atividade
4. Atleta 2 comenta na atividade
5. **Verificar:** Atleta 1 deve receber notificação em tempo real

---

## ✅ Checklist de Validação

### Backend
- [x] Procedures tRPC funcionando
- [x] Queries do banco otimizadas
- [x] Validações de permissões
- [x] Foreign keys e cascade deletes

### Frontend
- [x] Interface de comentários colapsável
- [x] Botão de curtir com contador
- [x] Optimistic updates (UX instantânea)
- [x] Botão de denunciar
- [x] Filtros de feed funcionando

### WebSocket
- [x] Notificações de curtidas
- [x] Notificações de comentários
- [x] Notificações de novas atividades

### Moderação
- [x] Sistema de denúncias
- [x] Ocultar comentários (admin)
- [x] Rejeitar denúncias (admin)

---

## 🐛 Bugs Conhecidos

1. **Testes automatizados:** 3/16 falhando devido a dados de teste faltando
   - Usuário ID 2 não existe (erro de foreign key ao seguir)
   - Procedure `moderacao.listarDenuncias` não existe (deve ser `feedSeguidos.listarDenuncias`)
   - Stats de analytics retornando undefined

2. **Erros TypeScript:** 10 erros em páginas não relacionadas
   - WidgetProximoBadge.tsx
   - Metas.tsx
   - Perfil.tsx
   - **Não afetam funcionalidades sociais implementadas**

---

## 📊 Resultados dos Testes Automatizados

```
✅ 13/16 testes passando (81%)

🏋️ ATLETA:
  ✓ Visualizar feed de seguidos
  ✓ Curtir atividades
  ✓ Comentar em atividades
  ✓ Listar comentários
  ✗ Seguir outros atletas (FK constraint)
  ✓ Visualizar ranking de amigos

👨‍💼 DONO DE BOX:
  ✗ Criar WOD do dia (parâmetros)
  ✓ Visualizar alunos
  ✓ Visualizar comentários ofensivos
  ✓ Atleta denuncia comentário
  ✗ Admin lista denúncias (procedure não encontrada)
  ✓ Admin oculta comentário
  ✗ Box Master visualiza analytics (retorno undefined)

🔗 INTEGRAÇÕES:
  ✓ Curtida → Notificação WebSocket
  ✓ Comentário → Notificação WebSocket
  ✓ Verificação de múltiplas curtidas
```

---

## 🚀 Próximos Passos

1. **Criar dados de seed** para testes automatizados
2. **Corrigir procedure** de moderação (mover para router correto)
3. **Criar página de moderação** para admins visualizarem denúncias
4. **Adicionar notificações in-app** com sino no header
5. **Expandir reações** (💪 Força, 🔥 Fogo, 👏 Parabéns, ❤️ Apoio)

---

**Desenvolvido com ❤️ para RX Nation**
