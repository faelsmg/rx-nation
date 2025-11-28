# 🔐 Instruções de Migração - Autenticação Email/Senha

## 📋 Resumo das Alterações

Este documento descreve as alterações realizadas para remover o Manus OAuth e implementar autenticação própria com email/senha no RX Nation.

---

## 🗄️ 1. Migração do Banco de Dados

### Executar SQL de Migração

Execute o arquivo `migration_auth.sql` no seu banco de dados MySQL:

```bash
mysql -u seu_usuario -p seu_banco < migration_auth.sql
```

**O que a migração faz:**
- Remove colunas `openId` e `loginMethod`
- Adiciona colunas `passwordHash`, `resetToken`, `resetTokenExpiry`, `emailVerified`
- Modifica coluna `email` para ser NOT NULL e UNIQUE
- Cria índices para performance

**⚠️ IMPORTANTE:** Após executar a migração, todos os usuários existentes serão removidos. Você precisará criar novos usuários com senhas.

---

## ⚙️ 2. Configuração de Variáveis de Ambiente

### Criar arquivo `.env`

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

### Configurações Obrigatórias

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/rxnation

# JWT Secret (IMPORTANTE: gere uma chave segura)
JWT_SECRET=sua-chave-secreta-super-segura-aqui

# SMTP Gmail (já configurado)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=fael.smg@gmail.com
SMTP_PASS=sipwfpdjmpllmbry
SMTP_FROM="RX Nation" <fael.smg@gmail.com>

# App URL
VITE_APP_URL=http://localhost:3000
```

**Gerar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚀 3. Instalação e Build

### Instalar Dependências

```bash
pnpm install
```

### Build do Projeto

```bash
pnpm build
```

### Iniciar Servidor

**Desenvolvimento:**
```bash
pnpm dev
```

**Produção:**
```bash
pnpm start
```

---

## 🧪 4. Testando a Implementação

### 4.1 Teste de Registro

1. Acesse `http://localhost:3000/register`
2. Preencha:
   - Nome: "Teste Atleta"
   - Email: "teste@email.com"
   - Senha: "senha123" (mínimo 8 caracteres, 1 letra e 1 número)
   - Confirmar Senha: "senha123"
3. Clique em "Criar Conta"
4. Você deve ser redirecionado para `/welcome`

### 4.2 Teste de Login

1. Acesse `http://localhost:3000/login`
2. Digite:
   - Email: "teste@email.com"
   - Senha: "senha123"
3. Clique em "Entrar"
4. Você deve ser redirecionado para `/dashboard`

### 4.3 Teste de Esqueci a Senha

1. Acesse `http://localhost:3000/forgot-password`
2. Digite seu email: "teste@email.com"
3. Clique em "Enviar instruções"
4. Verifique o email recebido (pode estar no spam)
5. Clique no link de recuperação
6. Digite nova senha
7. Faça login com a nova senha

### 4.4 Teste de Logout

1. Estando logado, acesse o menu de usuário
2. Clique em "Sair"
3. Você deve ser redirecionado para `/login`

---

## 📁 5. Arquivos Criados/Modificados

### Novos Arquivos Backend

- ✅ `server/_core/auth.ts` - Rotas de autenticação
- ✅ `server/db-auth.ts` - Funções de banco para autenticação
- ✅ `migration_auth.sql` - Script SQL de migração

### Novos Arquivos Frontend

- ✅ `client/src/pages/Login.tsx` - Página de login
- ✅ `client/src/pages/Register.tsx` - Página de registro
- ✅ `client/src/pages/ForgotPassword.tsx` - Página de esqueci a senha
- ✅ `client/src/pages/ResetPassword.tsx` - Página de redefinir senha

### Arquivos Modificados

- ✅ `drizzle/schema.ts` - Schema da tabela users atualizado
- ✅ `server/_core/index.ts` - Substituído OAuth por Auth
- ✅ `server/_core/email.ts` - Adicionada função de email de recuperação
- ✅ `client/src/App.tsx` - Adicionadas rotas de autenticação
- ✅ `client/src/const.ts` - Atualizado getLoginUrl()
- ✅ `.env.example` - Template de variáveis de ambiente
- ✅ `.env` - Configurações locais (não commitar!)

### Arquivos Removidos/Obsoletos

- ❌ `server/_core/oauth.ts` - Não é mais usado (pode deletar)
- ❌ `server/_core/sdk.ts` - Não é mais usado (pode deletar)

---

## 🔒 6. Validações de Senha

### Regras Implementadas

- ✅ Mínimo 8 caracteres
- ✅ Pelo menos 1 letra (a-z ou A-Z)
- ✅ Pelo menos 1 número (0-9)
- ✅ Confirmação de senha obrigatória

### Feedback Visual

Os componentes de registro e redefinição de senha mostram indicadores visuais em tempo real:
- ✅ Verde com ✓ quando válido
- ❌ Vermelho com ✗ quando inválido

---

## 📧 7. Sistema de Email

### Configuração Gmail

O sistema está configurado para usar Gmail SMTP com senha de app:

- **Host:** smtp.gmail.com
- **Porta:** 587
- **Email:** fael.smg@gmail.com
- **Senha de App:** sipwfpdjmpllmbry

### Emails Enviados

1. **Email de Boas-vindas** - Enviado após registro
2. **Email de Recuperação de Senha** - Enviado ao solicitar reset

### Testar Envio de Email

```bash
# No console do servidor, você verá logs como:
[Email] Email de recuperação enviado: <message-id>
```

---

## 🔐 8. Segurança

### Hash de Senha

- Utiliza SHA-256 via Web Crypto API
- Senhas nunca são armazenadas em texto plano

### Token de Recuperação

- Gerado com `nanoid(32)` (32 caracteres aleatórios)
- Expira em 1 hora
- Único por usuário
- Limpo após uso

### JWT Session

- Expira em 365 dias
- Armazenado em cookie HTTP-only
- Assinado com JWT_SECRET

---

## 🐛 9. Troubleshooting

### Erro: "Database not available"

**Solução:** Verifique se `DATABASE_URL` está correta no `.env`

### Erro: "Email já cadastrado"

**Solução:** Use outro email ou faça login com o existente

### Erro: "Token inválido ou expirado"

**Solução:** Solicite novo link de recuperação (tokens expiram em 1h)

### Email não chega

**Soluções:**
1. Verifique pasta de spam
2. Verifique logs do servidor
3. Confirme credenciais SMTP no `.env`
4. Teste conexão SMTP:
   ```bash
   telnet smtp.gmail.com 587
   ```

### Erro: "Cannot find module"

**Solução:** Execute `pnpm install` novamente

---

## 📝 10. Próximos Passos

### Funcionalidades Adicionais (Opcional)

- [ ] Verificação de email (enviar link de confirmação)
- [ ] Autenticação de dois fatores (2FA)
- [ ] Login com Google/GitHub (OAuth social)
- [ ] Limite de tentativas de login
- [ ] Histórico de logins
- [ ] Sessões ativas (visualizar e revogar)

### Melhorias de Segurança

- [ ] Rate limiting nas rotas de auth
- [ ] CAPTCHA no registro
- [ ] Política de senha mais forte
- [ ] Auditoria de acessos

---

## ✅ 11. Checklist de Deploy

Antes de fazer deploy em produção:

- [ ] Executar migração SQL no banco de produção
- [ ] Configurar variáveis de ambiente no servidor
- [ ] Gerar JWT_SECRET seguro e único
- [ ] Configurar SMTP com credenciais de produção
- [ ] Atualizar VITE_APP_URL para domínio real
- [ ] Testar fluxo completo de autenticação
- [ ] Testar recuperação de senha
- [ ] Verificar recebimento de emails
- [ ] Configurar HTTPS (obrigatório para cookies seguros)
- [ ] Backup do banco de dados

---

## 📞 12. Suporte

Se encontrar problemas:

1. Verifique os logs do servidor
2. Verifique o console do navegador
3. Consulte este documento
4. Verifique as variáveis de ambiente

---

**Versão:** 1.0  
**Data:** 28 de Novembro de 2025  
**Autor:** Manus AI
