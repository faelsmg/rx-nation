# 🎯 Credenciais de Teste - RX Nation (Impacto Pro League)

## ✅ Status da Limpeza

O banco de dados foi limpo com sucesso mantendo apenas o **Box Impacto** e criando usuários de teste prontos para uso.

---

## 🔑 DONO DO BOX (Box Master)

**Nome:** Rafael Souza  
**Email:** rafael@impacto.com  
**Role:** box_master  
**Categoria:** Avançado  
**Faixa Etária:** 30-39

### Permissões do Box Master:
- ✅ Criar e gerenciar WODs
- ✅ Gerenciar agenda de aulas
- ✅ Visualizar alunos e estatísticas
- ✅ Criar comunicados
- ✅ Atribuir badges
- ✅ Acessar dashboard analítico

---

## 👥 ALUNOS DE TESTE (10 Atletas)

### 1. João Silva
- **Email:** joao@teste.com
- **Categoria:** Iniciante
- **Faixa Etária:** 18-29

### 2. Maria Santos
- **Email:** maria@teste.com
- **Categoria:** Intermediário
- **Faixa Etária:** 30-39

### 3. Pedro Costa
- **Email:** pedro@teste.com
- **Categoria:** Avançado
- **Faixa Etária:** 30-39

### 4. Ana Oliveira
- **Email:** ana@teste.com
- **Categoria:** Elite
- **Faixa Etária:** 25-34

### 5. Lucas Ferreira
- **Email:** lucas@teste.com
- **Categoria:** Iniciante
- **Faixa Etária:** 18-29

### 6. Juliana Lima
- **Email:** juliana@teste.com
- **Categoria:** Intermediário
- **Faixa Etária:** 30-39

### 7. Carlos Alves
- **Email:** carlos@teste.com
- **Categoria:** Avançado
- **Faixa Etária:** 40-49

### 8. Fernanda Rocha
- **Email:** fernanda@teste.com
- **Categoria:** Intermediário
- **Faixa Etária:** 25-34

### 9. Ricardo Mendes
- **Email:** ricardo@teste.com
- **Categoria:** Elite
- **Faixa Etária:** 30-39

### 10. Beatriz Cardoso
- **Email:** beatriz@teste.com
- **Categoria:** Iniciante
- **Faixa Etária:** 18-29

---

## 🏋️ Box Mantido

**Nome:** Impacto Crossfit SJCampos  
**ID:** 660001  
**Status:** ✅ Ativo e pronto para testes

---

## 🚀 Como Fazer Login

1. Acesse a plataforma RX Nation
2. Use qualquer um dos emails acima
3. O sistema está configurado para aceitar login de desenvolvimento
4. Teste as funcionalidades conforme o perfil (Box Master ou Atleta)

---

## 📋 Funcionalidades Prontas para Teste

### Para Box Master (rafael@impacto.com):
- ✅ Dashboard com métricas
- ✅ Gestão de WODs
- ✅ Gestão de alunos
- ✅ Agenda de aulas
- ✅ Comunicados
- ✅ Atribuição de badges
- ✅ Analytics e relatórios

### Para Atletas:
- ✅ Visualizar WOD do dia
- ✅ Registrar resultados de treinos
- ✅ Visualizar e registrar PRs
- ✅ Reservar aulas
- ✅ Ver comunicados
- ✅ Visualizar badges conquistados
- ✅ Acompanhar rankings
- ✅ Feed social

---

## 🧹 Scripts Criados

### Limpeza do Banco
```bash
npx tsx scripts/clean-db.ts
```
Remove todos os dados exceto o Box Impacto

### Seed de Usuários
```bash
npx tsx scripts/seed-test-users.ts
```
Cria dono do box + 10 alunos de teste

---

## ⚠️ Observações Importantes

1. **Todos os dados anteriores foram limpos** - apenas o Box Impacto foi mantido
2. **Usuários criados com loginMethod: 'dev'** - facilitam acesso rápido para testes
3. **Categorias variadas** - permite testar rankings e filtros por categoria
4. **Faixas etárias diversas** - permite testar segmentação por idade
5. **Banco limpo** - sem WODs, comunicados ou atividades antigas

---

## 🎯 Próximos Passos Sugeridos

1. **Fazer login como Box Master** (rafael@impacto.com)
2. **Criar alguns WODs** para os alunos treinarem
3. **Configurar agenda de aulas** com horários
4. **Criar comunicados** para testar notificações
5. **Fazer login como atletas** e testar funcionalidades
6. **Registrar resultados** e verificar rankings
7. **Testar sistema de badges** e gamificação

---

## 📊 Distribuição de Categorias

- **Iniciante:** 3 alunos (João, Lucas, Beatriz)
- **Intermediário:** 3 alunos (Maria, Juliana, Fernanda)
- **Avançado:** 3 alunos (Pedro, Carlos, Rafael - Box Master)
- **Elite:** 2 alunos (Ana, Ricardo)

**Total:** 11 usuários (1 Box Master + 10 Atletas)

---

✅ **Sistema pronto para testes beta com 10 usuários!**
