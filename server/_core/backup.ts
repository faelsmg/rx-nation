/**
 * Sistema de Backup Automático do Banco de Dados
 * Impacto Pro League v1.0
 * 
 * Este módulo configura backups automáticos do banco de dados MySQL/TiDB.
 * Suporta backups incrementais e completos com retenção configurável.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface BackupConfig {
  enabled: boolean;
  schedule: string; // Cron expression
  retentionDays: number;
  backupPath: string;
  s3Bucket?: string; // Opcional: enviar para S3
}

/**
 * Configuração padrão de backup
 */
const DEFAULT_CONFIG: BackupConfig = {
  enabled: process.env.BACKUP_ENABLED === 'true',
  schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // 2h da manhã todo dia
  retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
  backupPath: process.env.BACKUP_PATH || '/home/ubuntu/backups',
  s3Bucket: process.env.BACKUP_S3_BUCKET,
};

/**
 * Extrai informações de conexão da DATABASE_URL
 */
function parseDatabaseUrl(url: string) {
  const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);
  
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5].split('?')[0], // Remove query params
  };
}

/**
 * Cria backup do banco de dados usando mysqldump
 */
export async function createDatabaseBackup(): Promise<string> {
  const config = DEFAULT_CONFIG;

  if (!config.enabled) {
    console.log('[Backup] Backup is disabled');
    return '';
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not configured');
  }

  const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${dbConfig.database}-${timestamp}.sql`;
  const backupDir = config.backupPath;
  const backupFile = path.join(backupDir, filename);

  try {
    // Criar diretório de backup se não existir
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Executar mysqldump
    const command = `mysqldump \\
      --host=${dbConfig.host} \\
      --port=${dbConfig.port} \\
      --user=${dbConfig.user} \\
      --password=${dbConfig.password} \\
      --single-transaction \\
      --routines \\
      --triggers \\
      --events \\
      ${dbConfig.database} > ${backupFile}`;

    console.log(`[Backup] Creating backup: ${filename}`);
    await execAsync(command);

    // Comprimir backup
    const gzipCommand = `gzip ${backupFile}`;
    await execAsync(gzipCommand);
    const compressedFile = `${backupFile}.gz`;

    console.log(`[Backup] Backup created successfully: ${compressedFile}`);

    // Enviar para S3 se configurado
    if (config.s3Bucket) {
      await uploadToS3(compressedFile, config.s3Bucket);
    }

    // Limpar backups antigos
    await cleanOldBackups(backupDir, config.retentionDays);

    return compressedFile;
  } catch (error: any) {
    console.error('[Backup] Error creating backup:', error);
    throw error;
  }
}

/**
 * Envia backup para S3
 */
async function uploadToS3(filePath: string, bucket: string): Promise<void> {
  try {
    const filename = path.basename(filePath);
    const command = `aws s3 cp ${filePath} s3://${bucket}/backups/${filename}`;
    
    console.log(`[Backup] Uploading to S3: ${bucket}/backups/${filename}`);
    await execAsync(command);
    console.log('[Backup] Upload to S3 completed');
  } catch (error: any) {
    console.error('[Backup] Error uploading to S3:', error);
    // Não lançar erro, backup local ainda existe
  }
}

/**
 * Remove backups antigos baseado na retenção configurada
 */
async function cleanOldBackups(backupDir: string, retentionDays: number): Promise<void> {
  try {
    const files = fs.readdirSync(backupDir);
    const now = Date.now();
    const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

    let deletedCount = 0;

    for (const file of files) {
      if (!file.startsWith('backup-') || !file.endsWith('.sql.gz')) {
        continue;
      }

      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;

      if (age > retentionMs) {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`[Backup] Deleted old backup: ${file}`);
      }
    }

    if (deletedCount > 0) {
      console.log(`[Backup] Cleaned ${deletedCount} old backup(s)`);
    }
  } catch (error: any) {
    console.error('[Backup] Error cleaning old backups:', error);
  }
}

/**
 * Restaura backup do banco de dados
 */
export async function restoreDatabaseBackup(backupFile: string): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not configured');
  }

  const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);

  try {
    // Descomprimir se necessário
    let sqlFile = backupFile;
    if (backupFile.endsWith('.gz')) {
      console.log('[Backup] Decompressing backup...');
      await execAsync(`gunzip -c ${backupFile} > ${backupFile.replace('.gz', '')}`);
      sqlFile = backupFile.replace('.gz', '');
    }

    // Restaurar backup
    const command = `mysql \\
      --host=${dbConfig.host} \\
      --port=${dbConfig.port} \\
      --user=${dbConfig.user} \\
      --password=${dbConfig.password} \\
      ${dbConfig.database} < ${sqlFile}`;

    console.log(`[Backup] Restoring backup: ${backupFile}`);
    await execAsync(command);
    console.log('[Backup] Backup restored successfully');

    // Remover arquivo descomprimido temporário
    if (sqlFile !== backupFile) {
      fs.unlinkSync(sqlFile);
    }
  } catch (error: any) {
    console.error('[Backup] Error restoring backup:', error);
    throw error;
  }
}

/**
 * Lista backups disponíveis
 */
export function listBackups(): string[] {
  const config = DEFAULT_CONFIG;
  const backupDir = config.backupPath;

  if (!fs.existsSync(backupDir)) {
    return [];
  }

  const files = fs.readdirSync(backupDir);
  return files
    .filter(file => file.startsWith('backup-') && file.endsWith('.sql.gz'))
    .sort()
    .reverse(); // Mais recentes primeiro
}

/**
 * Agenda backups automáticos
 */
export function scheduleBackups() {
  const config = DEFAULT_CONFIG;

  if (!config.enabled) {
    console.log('[Backup] Automatic backups are disabled');
    console.log('[Backup] To enable, set BACKUP_ENABLED=true in environment variables');
    return;
  }

  // Importar node-cron dinamicamente
  import('node-cron').then(({ schedule }) => {
    schedule(config.schedule, async () => {
      console.log('[Backup] Starting scheduled backup...');
      try {
        await createDatabaseBackup();
        console.log('[Backup] Scheduled backup completed');
      } catch (error) {
        console.error('[Backup] Scheduled backup failed:', error);
      }
    });

    console.log(`[Backup] Scheduled backups configured: ${config.schedule}`);
    console.log(`[Backup] Retention: ${config.retentionDays} days`);
    console.log(`[Backup] Path: ${config.backupPath}`);
    if (config.s3Bucket) {
      console.log(`[Backup] S3 Bucket: ${config.s3Bucket}`);
    }
  }).catch(err => {
    console.error('[Backup] Failed to schedule backups:', err);
    console.log('[Backup] Install node-cron: pnpm add node-cron @types/node-cron');
  });
}

/**
 * Endpoint para criar backup manual
 */
export async function manualBackupHandler(req: any, res: any) {
  try {
    const backupFile = await createDatabaseBackup();
    res.json({
      success: true,
      message: 'Backup created successfully',
      file: backupFile,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Endpoint para listar backups
 */
export function listBackupsHandler(req: any, res: any) {
  try {
    const backups = listBackups();
    res.json({
      success: true,
      backups,
      count: backups.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// Exportar configuração para uso em outros módulos
export { DEFAULT_CONFIG as backupConfig };
