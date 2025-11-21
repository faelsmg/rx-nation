import nodemailer from 'nodemailer';

/**
 * Configuração do transporter de email
 * Suporta SendGrid e AWS SES via SMTP
 */
function createEmailTransporter() {
  // Se houver credenciais SMTP configuradas, usar
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true para porta 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: modo de desenvolvimento (logs apenas)
  console.warn('[Email] Credenciais SMTP não configuradas. Usando modo de desenvolvimento (sem envio real).');
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
}

const transporter = createEmailTransporter();

/**
 * Gera HTML do relatório semanal
 */
export function gerarHTMLRelatorio(relatorio: any): string {
  const { periodo, inscricoes, receita, campeonatos, engajamento } = relatorio;
  
  const dataInicio = new Date(periodo.inicio).toLocaleDateString('pt-BR');
  const dataFim = new Date(periodo.fim).toLocaleDateString('pt-BR');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Semanal - Impacto Pro League</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #2563eb;
      margin-bottom: 10px;
      font-size: 24px;
    }
    .periodo {
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .secao {
      margin-bottom: 25px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 6px;
      border-left: 4px solid #2563eb;
    }
    .secao h2 {
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 18px;
      color: #1f2937;
    }
    .metrica {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .metrica:last-child {
      border-bottom: none;
    }
    .metrica-label {
      color: #6b7280;
      font-size: 14px;
    }
    .metrica-valor {
      font-weight: 600;
      color: #111827;
      font-size: 16px;
    }
    .destaque {
      background: #dbeafe;
      padding: 15px;
      border-radius: 6px;
      margin-top: 20px;
      text-align: center;
    }
    .destaque-valor {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
      margin: 10px 0;
    }
    .destaque-label {
      color: #1e40af;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Relatório Semanal</h1>
    <p class="periodo">Período: ${dataInicio} - ${dataFim}</p>

    <div class="destaque">
      <div class="destaque-label">Receita Total</div>
      <div class="destaque-valor">R$ ${receita.total.toLocaleString('pt-BR')}</div>
    </div>

    <div class="secao">
      <h2>💰 Inscrições</h2>
      <div class="metrica">
        <span class="metrica-label">Total de Inscrições</span>
        <span class="metrica-valor">${inscricoes.total}</span>
      </div>
      <div class="metrica">
        <span class="metrica-label">Inscrições Pagas</span>
        <span class="metrica-valor">${inscricoes.pagas}</span>
      </div>
      <div class="metrica">
        <span class="metrica-label">Inscrições Pendentes</span>
        <span class="metrica-valor">${inscricoes.pendentes}</span>
      </div>
      <div class="metrica">
        <span class="metrica-label">Ticket Médio</span>
        <span class="metrica-valor">R$ ${receita.media.toLocaleString('pt-BR')}</span>
      </div>
    </div>

    <div class="secao">
      <h2>🏆 Campeonatos</h2>
      <div class="metrica">
        <span class="metrica-label">Novos Campeonatos</span>
        <span class="metrica-valor">${campeonatos.novos}</span>
      </div>
      <div class="metrica">
        <span class="metrica-label">Campeonatos Ativos</span>
        <span class="metrica-valor">${campeonatos.ativos}</span>
      </div>
    </div>

    <div class="secao">
      <h2>📈 Engajamento</h2>
      <div class="metrica">
        <span class="metrica-label">Resultados Registrados</span>
        <span class="metrica-valor">${engajamento.resultadosRegistrados}</span>
      </div>
      <div class="metrica">
        <span class="metrica-label">Novos Usuários</span>
        <span class="metrica-valor">${engajamento.novosUsuarios}</span>
      </div>
    </div>

    <div class="footer">
      <p>Impacto Pro League - Sistema de Gestão de Campeonatos</p>
      <p>Este é um relatório automático. Não responda este email.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Envia email com relatório semanal
 */
export async function enviarEmailRelatorio(
  destinatario: string,
  relatorio: any
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const htmlContent = gerarHTMLRelatorio(relatorio);
    
    const dataInicio = new Date(relatorio.periodo.inicio).toLocaleDateString('pt-BR');
    const dataFim = new Date(relatorio.periodo.fim).toLocaleDateString('pt-BR');

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Impacto Pro League" <noreply@impactoproleague.com>',
      to: destinatario,
      subject: `📊 Relatório Semanal - ${dataInicio} a ${dataFim}`,
      html: htmlContent,
      text: `Relatório Semanal - Impacto Pro League\n\nPeríodo: ${dataInicio} - ${dataFim}\n\nReceita Total: R$ ${relatorio.receita.total}\nInscrições: ${relatorio.inscricoes.total}\nCampeonatos Novos: ${relatorio.campeonatos.novos}\nNovos Usuários: ${relatorio.engajamento.novosUsuarios}`,
    });

    console.log('[Email] Relatório enviado:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('[Email] Erro ao enviar relatório:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Testa a configuração de email
 */
export async function testarConfiguracao(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('[Email] Configuração válida');
    return true;
  } catch (error) {
    console.error('[Email] Configuração inválida:', error);
    return false;
  }
}
