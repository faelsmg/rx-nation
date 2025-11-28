# 🧪 Guia Completo de Teste - Autenticação RX Nation

## 📋 Pré-requisitos

Antes de começar os testes, certifique-se de que você tem:

- ✅ MySQL instalado e rodando
- ✅ Node.js 22+ instalado
- ✅ pnpm instalado
- ✅ Credenciais do banco de dados

---

## 🚀 Passo 1: Configurar Banco de Dados

### 1.1 Criar banco de dados

```bash
mysql -u root -p
```

```sql
CREATE DATABASE rxnation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'rxnation'@'localhost' IDENTIFIED BY 'senha_segura_aqui';
GRANT ALL PRIVILEGES ON rxnation.* TO 'rxnation'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 1.2 Executar migração

```bash
cd /caminho/para/rx-nation
mysql -u rxnation -p rxnation < migration_auth.sql
```

**Verificar se funcionou:**
```bash
mysql -u rxnation -p rxnation -e "DESCRIBE users;"
```

Você deve ver as colunas:
- ✅ `passwordHash`
- ✅ `resetToken`
- ✅ `resetTokenExpiry`
- ✅ `emailVerified`
- ❌ `openId` (removida)

---

## ⚙️ Passo 2: Configurar Variáveis de Ambiente

### 2.1 Copiar arquivo de exemplo

```bash
cp .env.example .env
```

### 2.2 Editar `.env`

```bash
nano .env
```

**Configurações obrigatórias:**

```env
# Database (AJUSTE AQUI!)
DATABASE_URL=mysql://rxnation:senha_segura_aqui@localhost:3306/rxnation

# JWT Secret (GERE UM NOVO!)
JWT_SECRET=cole_aqui_o_resultado_do_comando_abaixo

# SMTP Gmail (já configurado)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=fael.smg@gmail.com
SMTP_PASS=sipwfpdjmpllmbry
SMTP_FROM="RX Nation" <fael.smg@gmail.com>

# App URL
VITE_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development
PORT=3000
```

### 2.3 Gerar JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado e cole no `.env` no campo `JWT_SECRET`.

---

## 📦 Passo 3: Instalar Dependências

```bash
cd /caminho/para/rx-nation
pnpm install
```

**Aguarde a instalação completa...**

---

## 🏃 Passo 4: Iniciar o Servidor

### 4.1 Modo desenvolvimento

```bash
pnpm dev
```

**Aguarde até ver:**
```
Server running on http://localhost:3000/
```

### 4.2 Verificar se está rodando

Abra o navegador em: http://localhost:3000

---

## 🧪 Passo 5: Testes Automatizados

### 5.1 Executar script de teste

Em outro terminal:

```bash
cd /caminho/para/rx-nation
./test-auth.sh
```

**O que o script testa:**
1. ✅ Registro de novo usuário
2. ✅ Login com credenciais válidas
3. ✅ Solicitação de recuperação de senha
4. ✅ Validação de senha fraca (deve falhar)
5. ✅ Validação de email duplicado (deve falhar)
6. ✅ Login com senha errada (deve falhar)
7. ✅ Logout

### 5.2 Interpretar resultados

- **✓ OK (HTTP 200)** = Teste passou ✅
- **✓ Validação funcionando (HTTP 400)** = Erro esperado ✅
- **✗ FALHOU** = Algo está errado ❌

---

## 🌐 Passo 6: Testes Manuais no Navegador

### 6.1 Teste de Registro

1. Acesse: http://localhost:3000/register
2. Preencha:
   - **Nome:** Seu Nome
   - **Email:** seu@email.com
   - **Senha:** senha123
   - **Confirmar Senha:** senha123
3. Clique em **"Criar Conta"**

**Resultado esperado:**
- ✅ Redirecionado para `/welcome`
- ✅ Email de boas-vindas recebido
- ✅ Mensagem de sucesso

**Validações visuais:**
- ✅ Indicadores verdes quando senha válida
- ✅ Indicadores vermelhos quando senha inválida
- ✅ Botão desabilitado se senha não atender requisitos

### 6.2 Teste de Login

1. Acesse: http://localhost:3000/login
2. Digite:
   - **Email:** seu@email.com
   - **Senha:** senha123
3. Clique em **"Entrar"**

**Resultado esperado:**
- ✅ Redirecionado para `/dashboard`
- ✅ Usuário logado (ver nome no header)
- ✅ Acesso às páginas protegidas

**Teste de erro:**
- Digite senha errada → Deve mostrar erro
- Digite email inexistente → Deve mostrar erro

### 6.3 Teste de Esqueci a Senha

1. Acesse: http://localhost:3000/forgot-password
2. Digite: seu@email.com
3. Clique em **"Enviar instruções"**

**Resultado esperado:**
- ✅ Mensagem de sucesso
- ✅ Email de recuperação recebido

4. Abra o email recebido
5. Clique no link de recuperação
6. Digite nova senha: novasenha123
7. Confirme a senha
8. Clique em **"Redefinir Senha"**

**Resultado esperado:**
- ✅ Mensagem de sucesso
- ✅ Redirecionado para `/login` após 3 segundos
- ✅ Login funciona com nova senha

### 6.4 Teste de Logout

1. Estando logado, procure o menu de usuário
2. Clique em **"Sair"** ou acesse `/api/auth/logout`

**Resultado esperado:**
- ✅ Redirecionado para `/login`
- ✅ Não consegue acessar páginas protegidas

---

## 📧 Passo 7: Verificar Emails

### 7.1 Verificar caixa de entrada

Acesse o email configurado (fael.smg@gmail.com ou seu email de teste).

**Emails esperados:**

#### Email de Boas-vindas
- **Assunto:** Bem-vindo à RX Nation!
- **Conteúdo:**
  - Saudação personalizada
  - Informações sobre funcionalidades
  - Design com gradiente azul

#### Email de Recuperação de Senha
- **Assunto:** 🔐 Recuperação de Senha - RX Nation
- **Conteúdo:**
  - Link de redefinição
  - Aviso de expiração (1 hora)
  - Alerta de segurança

### 7.2 Se emails não chegarem

**Verificar logs do servidor:**
```bash
# No terminal onde o servidor está rodando, procure por:
[Email] Email de recuperação enviado: <message-id>
```

**Verificar pasta de spam**

**Testar conexão SMTP:**
```bash
telnet smtp.gmail.com 587
```

---

## 🔍 Passo 8: Testes de Integração

### 8.1 Testar com tRPC

Abra o console do navegador (F12) e execute:

```javascript
// Verificar se usuário está logado
const user = await window.trpcClient.auth.me.query();
console.log('Usuário:', user);
```

**Resultado esperado:**
```json
{
  "id": 1,
  "email": "seu@email.com",
  "name": "Seu Nome",
  "role": "atleta",
  "boxId": null
}
```

### 8.2 Testar proteção de rotas

**Sem estar logado:**
1. Acesse: http://localhost:3000/dashboard
2. **Deve redirecionar para:** `/login`

**Estando logado:**
1. Acesse: http://localhost:3000/dashboard
2. **Deve mostrar:** Dashboard do usuário

### 8.3 Testar hook useAuth

Em qualquer componente React:

```typescript
const { user, isAuthenticated, loading, logout } = useAuth();

console.log('Autenticado:', isAuthenticated);
console.log('Usuário:', user);
```

---

## 🗄️ Passo 9: Verificar Banco de Dados

### 9.1 Verificar usuários criados

```bash
mysql -u rxnation -p rxnation -e "SELECT id, email, name, role, emailVerified, lastSignedIn FROM users;"
```

**Resultado esperado:**
```
+----+------------------+-----------+--------+---------------+---------------------+
| id | email            | name      | role   | emailVerified | lastSignedIn        |
+----+------------------+-----------+--------+---------------+---------------------+
|  1 | seu@email.com    | Seu Nome  | atleta |             0 | 2025-11-28 12:34:56 |
+----+------------------+-----------+--------+---------------+---------------------+
```

### 9.2 Verificar hash de senha

```bash
mysql -u rxnation -p rxnation -e "SELECT email, LEFT(passwordHash, 20) as hash_preview FROM users;"
```

**Resultado esperado:**
- Hash deve começar com caracteres hexadecimais
- Nunca deve mostrar senha em texto plano

### 9.3 Verificar token de recuperação

Após solicitar recuperação:

```bash
mysql -u rxnation -p rxnation -e "SELECT email, resetToken, resetTokenExpiry FROM users WHERE resetToken IS NOT NULL;"
```

**Resultado esperado:**
- Token deve ter 32 caracteres
- Expiry deve ser 1 hora no futuro

---

## 🐛 Passo 10: Troubleshooting

### Problema: "Database not available"

**Solução:**
1. Verificar se MySQL está rodando:
   ```bash
   sudo systemctl status mysql
   ```
2. Verificar `DATABASE_URL` no `.env`
3. Testar conexão:
   ```bash
   mysql -u rxnation -p rxnation -e "SELECT 1;"
   ```

### Problema: "Email já cadastrado"

**Solução:**
1. Usar outro email, OU
2. Deletar usuário de teste:
   ```bash
   mysql -u rxnation -p rxnation -e "DELETE FROM users WHERE email='teste@rxnation.com';"
   ```

### Problema: "Token inválido ou expirado"

**Solução:**
1. Solicitar novo link de recuperação
2. Usar o link em até 1 hora
3. Verificar se token existe no banco:
   ```bash
   mysql -u rxnation -p rxnation -e "SELECT email, resetToken, resetTokenExpiry FROM users;"
   ```

### Problema: Emails não chegam

**Soluções:**
1. Verificar logs do servidor
2. Verificar credenciais SMTP no `.env`
3. Verificar pasta de spam
4. Testar SMTP:
   ```bash
   telnet smtp.gmail.com 587
   ```

### Problema: Erro de compilação TypeScript

**Solução:**
```bash
pnpm install
rm -rf node_modules/.cache
pnpm dev
```

### Problema: Porta 3000 ocupada

**Solução:**
1. Mudar porta no `.env`:
   ```env
   PORT=3001
   ```
2. OU matar processo na porta 3000:
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

---

## ✅ Checklist de Validação

Marque cada item após testar:

### Backend
- [ ] Servidor inicia sem erros
- [ ] Rota `/api/auth/register` funciona
- [ ] Rota `/api/auth/login` funciona
- [ ] Rota `/api/auth/logout` funciona
- [ ] Rota `/api/auth/forgot-password` funciona
- [ ] Rota `/api/auth/reset-password` funciona
- [ ] Validação de senha funciona
- [ ] Hash de senha está correto
- [ ] JWT é gerado corretamente
- [ ] Cookies são definidos

### Frontend
- [ ] Página `/register` carrega
- [ ] Página `/login` carrega
- [ ] Página `/forgot-password` carrega
- [ ] Página `/reset-password` carrega
- [ ] Validação em tempo real funciona
- [ ] Indicadores visuais aparecem
- [ ] Redirecionamentos funcionam
- [ ] Mensagens de erro aparecem
- [ ] Design está correto

### Email
- [ ] Email de boas-vindas é enviado
- [ ] Email de recuperação é enviado
- [ ] Links de recuperação funcionam
- [ ] Emails têm design correto
- [ ] Emails não vão para spam

### Banco de Dados
- [ ] Migração executou sem erros
- [ ] Colunas novas existem
- [ ] Colunas antigas foram removidas
- [ ] Índices foram criados
- [ ] Usuários são salvos corretamente
- [ ] Senhas são hasheadas
- [ ] Tokens são salvos

### Integração
- [ ] tRPC funciona
- [ ] Hook `useAuth` funciona
- [ ] Proteção de rotas funciona
- [ ] Logout limpa sessão
- [ ] Redirecionamentos funcionam

---

## 📊 Resultados Esperados

### Testes Automatizados
- **Total de testes:** 7
- **Sucesso esperado:** 7/7 ✅
- **Tempo de execução:** < 5 segundos

### Testes Manuais
- **Registro:** ✅ Funciona
- **Login:** ✅ Funciona
- **Recuperação:** ✅ Funciona
- **Logout:** ✅ Funciona
- **Validações:** ✅ Funcionam
- **Emails:** ✅ Enviados

### Performance
- **Tempo de registro:** < 1 segundo
- **Tempo de login:** < 500ms
- **Tempo de envio de email:** < 2 segundos

---

## 📝 Próximos Passos Após Testes

Se todos os testes passarem:

1. ✅ Commitar código
2. ✅ Fazer backup do banco
3. ✅ Preparar deploy para produção
4. ✅ Configurar variáveis de ambiente de produção
5. ✅ Testar em produção

Se algum teste falhar:

1. ❌ Verificar logs de erro
2. ❌ Consultar seção de Troubleshooting
3. ❌ Corrigir problema
4. ❌ Re-executar testes

---

## 🆘 Suporte

Se encontrar problemas não listados aqui:

1. Verificar logs do servidor
2. Verificar console do navegador (F12)
3. Verificar logs do MySQL
4. Consultar documentação em `INSTRUCOES_MIGRACAO_AUTH.md`

---

**Boa sorte com os testes! 🚀**
