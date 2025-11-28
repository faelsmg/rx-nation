# 🚀 Início Rápido - Teste de Autenticação

## ⚡ Setup em 5 Minutos

### 1️⃣ Configurar Banco de Dados (2 min)

```bash
# Criar banco
mysql -u root -p -e "CREATE DATABASE rxnation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Executar migração
mysql -u root -p rxnation < migration_auth.sql

# Popular dados de teste (OPCIONAL)
mysql -u root -p rxnation < seed-test-data.sql
```

### 2️⃣ Configurar Ambiente (1 min)

```bash
# Copiar .env
cp .env.example .env

# Editar DATABASE_URL e JWT_SECRET
nano .env
```

**Mínimo necessário no `.env`:**
```env
DATABASE_URL=mysql://root:sua_senha@localhost:3306/rxnation
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### 3️⃣ Instalar e Iniciar (2 min)

```bash
# Instalar
pnpm install

# Iniciar servidor
pnpm dev
```

---

## 🧪 Teste Rápido (30 segundos)

### Opção A: Script Automatizado

```bash
./test-auth.sh
```

### Opção B: Navegador

1. Abra: http://localhost:3000/register
2. Crie uma conta
3. Faça login em: http://localhost:3000/login

### Opção C: Usar Dados de Teste

Se você executou `seed-test-data.sql`:

**Login rápido:**
- Email: `atleta@test.com`
- Senha: `senha123`

**Outros usuários disponíveis:**
- `boxmaster@test.com` (Box Master)
- `franqueado@test.com` (Franqueado)
- `admin@test.com` (Admin da Liga)

---

## ✅ Verificação Rápida

### Servidor está rodando?
```bash
curl http://localhost:3000
# Deve retornar HTML
```

### API está funcionando?
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"atleta@test.com","password":"senha123"}'
# Deve retornar JSON com redirectTo
```

### Banco está OK?
```bash
mysql -u root -p rxnation -e "SELECT COUNT(*) as total FROM users;"
# Deve retornar número de usuários
```

---

## 🐛 Problemas Comuns

### "Database not available"
→ Verifique `DATABASE_URL` no `.env`

### "Port 3000 already in use"
→ Mude `PORT=3001` no `.env`

### "Email já cadastrado"
→ Use outro email ou delete:
```bash
mysql -u root -p rxnation -e "DELETE FROM users WHERE email='seu@email.com';"
```

---

## 📚 Documentação Completa

- **Guia Detalhado:** `GUIA_TESTE_COMPLETO.md`
- **Instruções de Migração:** `INSTRUCOES_MIGRACAO_AUTH.md`
- **Resumo de Alterações:** `RESUMO_ALTERACOES.md`

---

## 🎯 Próximos Passos

Após testes bem-sucedidos:

1. ✅ Remover dados de teste (se usou seed)
2. ✅ Configurar email SMTP real
3. ✅ Gerar JWT_SECRET de produção
4. ✅ Deploy!

---

**Dúvidas? Consulte `GUIA_TESTE_COMPLETO.md` para instruções detalhadas.**
