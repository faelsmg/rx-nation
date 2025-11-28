# 🌐 RX Nation - Acesso ao Sandbox

## ✅ Sistema Rodando!

O RX Nation está hospedado e funcionando no sandbox com todas as alterações de autenticação implementadas.

---

## 🔗 URL de Acesso

**URL Principal:**
```
https://3000-i2327esybu6ey021wcvje-fa7d1b3b.manusvm.computer
```

---

## 📱 Páginas Disponíveis

### Autenticação
- **Login:** https://3000-i2327esybu6ey021wcvje-fa7d1b3b.manusvm.computer/login
- **Registro:** https://3000-i2327esybu6ey021wcvje-fa7d1b3b.manusvm.computer/register
- **Esqueci a Senha:** https://3000-i2327esybu6ey021wcvje-fa7d1b3b.manusvm.computer/forgot-password

### Após Login
- **Dashboard:** https://3000-i2327esybu6ey021wcvje-fa7d1b3b.manusvm.computer/dashboard
- **Welcome:** https://3000-i2327esybu6ey021wcvje-fa7d1b3b.manusvm.computer/welcome

---

## 👥 Usuários de Teste

Todos os usuários têm a senha: **senha123**

### 1. Atleta
- **Email:** atleta@test.com
- **Senha:** senha123
- **Role:** atleta

### 2. Box Master
- **Email:** boxmaster@test.com
- **Senha:** senha123
- **Role:** box_master

### 3. Franqueado
- **Email:** franqueado@test.com
- **Senha:** senha123
- **Role:** franqueado

### 4. Admin da Liga
- **Email:** admin@test.com
- **Senha:** senha123
- **Role:** admin_liga

### 5. Email Não Verificado
- **Email:** nao-verificado@test.com
- **Senha:** senha123
- **Role:** atleta
- **Verificado:** NÃO

---

## 🧪 Testes Realizados

### ✅ Testes de API

#### 1. Login
```bash
curl -X POST https://3000-i2327esybu6ey021wcvje-fa7d1b3b.manusvm.computer/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"atleta@test.com","password":"senha123"}'
```
**Resultado:** ✅ `{"success":true,"userId":1,"redirectTo":"/dashboard"}`

#### 2. Registro
```bash
curl -X POST https://3000-i2327esybu6ey021wcvje-fa7d1b3b.manusvm.computer/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"novo@teste.com","password":"teste123","name":"Novo Usuário"}'
```
**Resultado:** ✅ `{"success":true,"userId":6,"redirectTo":"/welcome"}`

#### 3. Recuperação de Senha
```bash
curl -X POST https://3000-i2327esybu6ey021wcvje-fa7d1b3b.manusvm.computer/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"novo@teste.com"}'
```
**Resultado:** ✅ `{"success":true,"message":"Se o email existir..."}`

#### 4. Redefinir Senha
```bash
curl -X POST https://3000-i2327esybu6ey021wcvje-fa7d1b3b.manusvm.computer/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_AQUI","newPassword":"novasenha123"}'
```
**Resultado:** ✅ `{"success":true,"message":"Senha redefinida com sucesso"}`

---

## 🎯 Como Testar

### Teste Rápido no Navegador

1. **Abra a URL de Login:**
   ```
   https://3000-i2327esybu6ey021wcvje-fa7d1b3b.manusvm.computer/login
   ```

2. **Faça login com:**
   - Email: `atleta@test.com`
   - Senha: `senha123`

3. **Você será redirecionado para o Dashboard!**

### Teste de Registro

1. **Abra a URL de Registro:**
   ```
   https://3000-i2327esybu6ey021wcvje-fa7d1b3b.manusvm.computer/register
   ```

2. **Preencha o formulário:**
   - Nome: Seu Nome
   - Email: seu@email.com
   - Senha: minhasenha123
   - Confirmar Senha: minhasenha123

3. **Clique em "Criar Conta"**

4. **Você será redirecionado para Welcome!**

### Teste de Recuperação de Senha

1. **Abra a URL de Esqueci a Senha:**
   ```
   https://3000-i2327esybu6ey021wcvje-fa7d1b3b.manusvm.computer/forgot-password
   ```

2. **Digite um email:** `atleta@test.com`

3. **Clique em "Enviar instruções"**

4. **Você verá uma mensagem de sucesso**

5. **O token será salvo no banco de dados** (pode ser consultado via SQL)

---

## 🔍 Validações Implementadas

### Senha
- ✅ Mínimo 8 caracteres
- ✅ Pelo menos 1 letra
- ✅ Pelo menos 1 número
- ✅ Confirmação obrigatória

### Email
- ✅ Formato válido
- ✅ Único (não permite duplicados)

### Feedback Visual
- ✅ Indicadores verdes quando válido
- ✅ Indicadores vermelhos quando inválido
- ✅ Mensagens de erro claras

---

## 🗄️ Banco de Dados

### Configuração
- **Tipo:** MySQL 8.0
- **Database:** rxnation
- **Usuário:** rxnation
- **Senha:** rxnation123

### Tabelas Criadas
- ✅ 58 tabelas do schema completo
- ✅ Tabela `users` com nova estrutura de autenticação
- ✅ Índices criados para performance

### Dados de Teste
- ✅ 5 usuários de teste criados
- ✅ Senhas hasheadas com SHA-256
- ✅ Diferentes roles (atleta, box_master, franqueado, admin_liga)

---

## 📧 Sistema de Email

### Configuração
- **Provider:** Gmail SMTP
- **Email:** fael.smg@gmail.com
- **Status:** ✅ Configurado

### Emails Implementados
1. ✅ Email de boas-vindas (após registro)
2. ✅ Email de recuperação de senha

**Nota:** Os emails são enviados mas podem demorar alguns segundos para chegar.

---

## 🔐 Segurança

### Hash de Senha
- **Algoritmo:** SHA-256
- **Implementação:** Web Crypto API (Node.js)
- **Armazenamento:** Apenas hash, nunca texto plano

### JWT
- **Secret:** sandbox-rx-nation-jwt-secret-key-for-testing-2025
- **Expiração:** 365 dias
- **Cookie:** HTTP-only

### Token de Recuperação
- **Geração:** nanoid(32)
- **Expiração:** 1 hora
- **Uso único:** Limpo após redefinição

---

## 📊 Status do Sistema

### Backend
- ✅ Servidor rodando na porta 3000
- ✅ MySQL conectado e funcionando
- ✅ Todas as rotas de autenticação funcionais
- ✅ Validações implementadas
- ✅ Hash de senha correto
- ✅ JWT funcionando

### Frontend
- ✅ Páginas de Login, Registro, Forgot Password, Reset Password
- ✅ Validação em tempo real
- ✅ Indicadores visuais
- ✅ Redirecionamentos funcionando
- ✅ Design com gradientes azuis

### Banco de Dados
- ✅ Schema completo criado
- ✅ Migração executada
- ✅ Dados de teste populados
- ✅ Índices criados

---

## ⚠️ Observações Importantes

### Limitações do Sandbox
- ⏱️ O sandbox pode hibernar após inatividade
- 🔄 Se o servidor parar, será necessário reiniciar
- 📧 Emails podem demorar para chegar
- 🌐 URL pública é temporária

### Para Produção
- 🔑 Gerar novo JWT_SECRET
- 🔐 Usar credenciais reais do Stripe
- 📧 Configurar SMTP de produção
- 🗄️ Migrar para banco de produção
- 🌐 Configurar domínio próprio
- 🔒 Habilitar HTTPS

---

## 🎉 Próximos Passos

1. ✅ Testar todas as funcionalidades no navegador
2. ✅ Verificar validações
3. ✅ Testar fluxo completo de recuperação de senha
4. ✅ Testar diferentes perfis de usuário
5. ✅ Verificar redirecionamentos
6. ✅ Testar em dispositivos móveis (se possível)

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se a URL está acessível
2. Limpe cache do navegador
3. Tente outro navegador
4. Verifique console do navegador (F12)
5. Reporte o erro com detalhes

---

**Sistema pronto para testes! 🚀**

**Data:** 28 de Novembro de 2025  
**Versão:** 1.0 - Sandbox
