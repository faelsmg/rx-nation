import cron from 'node-cron';
import * as db from '../db';

/**
 * Configuração de jobs agendados
 */

// Lista de destinatários para relatórios (admins)
const DESTINATARIOS_RELATORIO = process.env.RELATORIO_EMAILS?.split(',') || [];

/**
 * Job: Envio de relatório semanal
 * Executa toda segunda-feira às 9h
 */
export function agendarRelatorioSemanal() {
  // Cron: "0 9 * * 1" = Segunda-feira às 9h
  // Para testes: "*/5 * * * *" = A cada 5 minutos
  const schedule = process.env.RELATORIO_CRON || '0 9 * * 1';
  
  const task = cron.schedule(schedule, async () => {
    console.log('[Job] Iniciando envio de relatório semanal...');
    
    try {
      const relatorio = await db.gerarRelatorioSemanal();
      
      if (!relatorio) {
        console.error('[Job] Erro ao gerar relatório');
        return;
      }

      // Enviar para cada destinatário
      for (const email of DESTINATARIOS_RELATORIO) {
        if (email && email.trim()) {
          console.log(`[Job] Enviando relatório para ${email}...`);
          const resultado = await db.enviarEmailRelatorio(email.trim(), relatorio);
          
          if (resultado.success) {
            console.log(`[Job] ✓ Relatório enviado para ${email}`);
          } else {
            console.error(`[Job] ✗ Erro ao enviar para ${email}:`, resultado.error);
          }
        }
      }
      
      console.log('[Job] Envio de relatórios concluído');
    } catch (error) {
      console.error('[Job] Erro ao processar relatório semanal:', error);
    }
  }, {
    timezone: 'America/Sao_Paulo',
  });

  return task;
}

/**
 * Job: Geração automática de desafios semanais
 * Executa toda segunda-feira às 00:00
 */
export function agendarDesafiosSemanais() {
  // Cron: "0 0 * * 1" = Segunda-feira às 00:00
  const schedule = process.env.DESAFIOS_CRON || '0 0 * * 1';
  
  const task = cron.schedule(schedule, async () => {
    console.log('[Job] Iniciando geração de desafios semanais...');
    
    try {
      // Gerar desafios para todos os boxes
      const resultado = await db.gerarDesafiosSemanaisAutomaticos();
      
      if (resultado) {
        console.log('[Job] ✓ Desafios semanais gerados com sucesso');
      } else {
        console.error('[Job] ✗ Erro ao gerar desafios semanais');
      }
    } catch (error) {
      console.error('[Job] Erro ao processar desafios semanais:', error);
    }
  }, {
    timezone: 'America/Sao_Paulo',
  });

  return task;
}

/**
 * Inicializa todos os jobs agendados
 */
export function inicializarJobs() {
  console.log('[Jobs] Inicializando jobs agendados...');
  
  // Relatório semanal
  const relatorioJob = agendarRelatorioSemanal();
  
  // Só ativar se houver destinatários configurados
  if (DESTINATARIOS_RELATORIO.length > 0) {
    relatorioJob.start();
    console.log('[Jobs] ✓ Relatório semanal agendado:', process.env.RELATORIO_CRON || '0 9 * * 1');
    console.log('[Jobs] ✓ Destinatários:', DESTINATARIOS_RELATORIO.join(', '));
  } else {
    console.log('[Jobs] ⚠ Relatório semanal não agendado (nenhum destinatário configurado)');
    console.log('[Jobs] Configure a variável RELATORIO_EMAILS para ativar');
  }
  
  // Desafios semanais (sempre ativo)
  const desafiosJob = agendarDesafiosSemanais();
  desafiosJob.start();
  console.log('[Jobs] ✓ Desafios semanais agendados:', process.env.DESAFIOS_CRON || '0 0 * * 1');
  
  return {
    relatorioSemanal: relatorioJob,
    desafiosSemanais: desafiosJob,
  };
}

/**
 * Para todos os jobs agendados
 */
export function pararJobs(jobs: ReturnType<typeof inicializarJobs>) {
  console.log('[Jobs] Parando jobs agendados...');
  jobs.relatorioSemanal.stop();
  jobs.desafiosSemanais.stop();
}
