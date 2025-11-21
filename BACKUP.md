# 💾 Sistema de Backup Automático - Impacto Pro League

Este documento descreve como configurar e usar o sistema de backup automático do banco de dados.

---

## 📋 Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env` ou nas configurações do servidor:

```bash
# Ativar backups automáticos
BACKUP_ENABLED=true

# Agendamento (formato cron)
# Padrão: 2h da manhã todo dia
BACKUP_SCHEDULE="0 2 * * *"

# Retenção de backups (em dias)
# Backups mais antigos serão deletados automaticamente
BACKUP_RETENTION_DAYS=30

# Diretório local para armazenar backups
BACKUP_PATH=/home/ubuntu/backups

# (Opcional) Bucket S3 para backup remoto
BACKUP_S3_BUCKET=meu-bucket-backups
```

### Exemplos de Agendamento (Cron)

```bash
# Todo dia às 2h da manhã
BACKUP_SCHEDULE="0 2 * * *"

# A cada 6 horas
BACKUP_SCHEDULE="0 */6 * * *"

# Todo domingo às 3h da manhã
BACKUP_SCHEDULE="0 3 * * 0"

# Duas vezes por dia (2h e 14h)
BACKUP_SCHEDULE="0 2,14 * * *"
```

---

## 🚀 Uso

### Backup Automático

O sistema cria backups automaticamente conforme o agendamento configurado. Não é necessária nenhuma ação manual.

Os backups são:
- ✅ Comprimidos com gzip (economia de espaço)
- ✅ Armazenados localmente
- ✅ Enviados para S3 (se configurado)
- ✅ Limpos automaticamente após o período de retenção

### Backup Manual

Para criar um backup manualmente via API:

```bash
# Criar backup
curl -X POST http://localhost:3000/api/backup/create

# Listar backups disponíveis
curl http://localhost:3000/api/backup/list
```

### Restaurar Backup

Para restaurar um backup:

```bash
# Via linha de comando
cd /home/ubuntu/impacto-pro-league
node -e "require('./server/_core/backup').restoreDatabaseBackup('/path/to/backup.sql.gz')"
```

Ou use o script SQL diretamente:

```bash
# Descomprimir backup
gunzip backup-impacto-2025-11-21.sql.gz

# Restaurar no banco
mysql -h HOST -u USER -p DATABASE < backup-impacto-2025-11-21.sql
```

---

## 📁 Estrutura de Arquivos

```
/home/ubuntu/backups/
├── backup-impacto-2025-11-21-02-00-00.sql.gz
├── backup-impacto-2025-11-20-02-00-00.sql.gz
├── backup-impacto-2025-11-19-02-00-00.sql.gz
└── ...
```

Formato do nome: `backup-{database}-{timestamp}.sql.gz`

---

## ☁️ Backup Remoto (S3)

Para ativar backup automático no S3:

1. **Instalar AWS CLI:**
```bash
sudo apt-get install awscli
```

2. **Configurar credenciais AWS:**
```bash
aws configure
```

3. **Adicionar variável de ambiente:**
```bash
BACKUP_S3_BUCKET=meu-bucket-backups
```

Os backups serão enviados automaticamente para `s3://meu-bucket-backups/backups/`

---

## 🔒 Segurança

### Recomendações

1. **Criptografia:** Use buckets S3 com criptografia ativada
2. **Acesso Restrito:** Configure IAM policies para acesso limitado ao bucket
3. **Senha do Banco:** Nunca exponha a senha em logs ou código
4. **Retenção:** Mantenha pelo menos 30 dias de backups
5. **Testes:** Teste a restauração periodicamente

### Permissões Necessárias

O usuário do sistema precisa de:
- Acesso de leitura ao banco de dados
- Permissão de escrita no diretório de backup
- (Opcional) Credenciais AWS com permissão `s3:PutObject`

---

## 🧪 Testando o Sistema

### 1. Criar Backup de Teste

```bash
# Via API
curl -X POST http://localhost:3000/api/backup/create

# Verificar se o arquivo foi criado
ls -lh /home/ubuntu/backups/
```

### 2. Verificar Agendamento

```bash
# Verificar logs do servidor
tail -f /var/log/impacto-pro-league.log | grep Backup
```

### 3. Testar Restauração

```bash
# Criar backup de teste
curl -X POST http://localhost:3000/api/backup/create

# Restaurar em banco de teste
mysql -h HOST -u USER -p test_database < backup.sql
```

---

## 📊 Monitoramento

### Logs

Todos os eventos de backup são registrados:

```
[Backup] Scheduled backups configured: 0 2 * * *
[Backup] Creating backup: backup-impacto-2025-11-21.sql
[Backup] Backup created successfully
[Backup] Uploading to S3: meu-bucket/backups/backup.sql.gz
[Backup] Upload to S3 completed
[Backup] Cleaned 5 old backup(s)
```

### Alertas

Configure alertas para:
- ❌ Falha na criação de backup
- ❌ Falha no upload para S3
- ⚠️ Espaço em disco baixo
- ⚠️ Backup não executado no horário esperado

---

## 🛠️ Troubleshooting

### Problema: Backup não está sendo criado

**Solução:**
1. Verificar se `BACKUP_ENABLED=true`
2. Verificar logs do servidor
3. Verificar permissões do diretório de backup
4. Verificar se `mysqldump` está instalado

### Problema: Erro "command not found: mysqldump"

**Solução:**
```bash
# Ubuntu/Debian
sudo apt-get install mysql-client

# CentOS/RHEL
sudo yum install mysql
```

### Problema: Erro de permissão ao escrever backup

**Solução:**
```bash
# Criar diretório com permissões corretas
sudo mkdir -p /home/ubuntu/backups
sudo chown ubuntu:ubuntu /home/ubuntu/backups
sudo chmod 755 /home/ubuntu/backups
```

### Problema: Upload para S3 falha

**Solução:**
1. Verificar credenciais AWS: `aws s3 ls`
2. Verificar permissões do bucket
3. Verificar nome do bucket (sem `s3://`)

---

## 📈 Melhores Práticas

### Estratégia 3-2-1

Recomendamos seguir a estratégia 3-2-1 de backup:

- **3 cópias:** Original + 2 backups
- **2 mídias:** Local + S3
- **1 offsite:** S3 em região diferente

### Retenção Recomendada

- **Diário:** 7 dias
- **Semanal:** 4 semanas
- **Mensal:** 12 meses
- **Anual:** 7 anos (para compliance)

### Testes de Restauração

Execute testes de restauração:
- **Mensalmente:** Restaurar backup completo em ambiente de teste
- **Trimestralmente:** Simular disaster recovery completo
- **Anualmente:** Auditoria completa do processo de backup

---

## 🔄 Rotação de Backups

O sistema implementa rotação automática:

1. Backups mais antigos que `BACKUP_RETENTION_DAYS` são deletados
2. Limpeza executada após cada backup
3. Logs indicam quantos backups foram removidos

---

## 📞 Suporte

Para problemas relacionados a backup:

1. Verificar logs do servidor
2. Consultar este documento
3. Abrir issue no repositório do projeto
4. Contatar suporte técnico

---

**Última atualização:** 21/11/2025  
**Versão:** 1.0  
**Responsável:** Sistema Impacto Pro League
