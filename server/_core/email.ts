import nodemailer from 'nodemailer';
import { generateEmailTrackingToken, generateTrackingPixel } from './emailTracking';

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

interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  boxName: string;
  profileUrl: string;
  welcomeUrl: string;
}

/**
 * Envia email de boas-vindas para novo usuário
 */
export async function sendWelcomeEmail(data: WelcomeEmailData & { userId?: number; baseUrl?: string }): Promise<{ success: boolean; trackingToken?: string }> {
  try {
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo à RX Nation!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #1a1a1a; border-radius: 12px; overflow: hidden;">
          
          <!-- Header com logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff;">
                🏋️ RX NATION
              </h1>
              <p style="margin: 10px 0 0; font-size: 14px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 2px;">
                Impacto Pro League
              </p>
            </td>
          </tr>
          
          <!-- Conteúdo principal -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #ffffff;">
                Bem-vindo, ${data.userName}! 💪
              </h2>
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #a3a3a3;">
                É um prazer ter você na <strong style="color: #3b82f6;">RX Nation</strong>, a plataforma que vai revolucionar sua jornada no CrossFit!
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #a3a3a3;">
                Você agora faz parte do <strong style="color: #ffffff;">${data.boxName}</strong> e tem acesso a todas as funcionalidades da plataforma.
              </p>
              
              <!-- Funcionalidades principais -->
              <div style="background-color: #262626; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 20px; font-size: 18px; font-weight: 600; color: #ffffff;">
                  🎯 O que você pode fazer agora:
                </h3>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #333333;">
                      <div style="display: flex; align-items: start;">
                        <span style="font-size: 24px; margin-right: 12px;">📅</span>
                        <div>
                          <strong style="color: #ffffff; font-size: 15px;">WOD do Dia</strong>
                          <p style="margin: 5px 0 0; font-size: 14px; color: #a3a3a3;">Acesse treinos diários e registre seus resultados</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #333333;">
                      <div style="display: flex; align-items: start;">
                        <span style="font-size: 24px; margin-right: 12px;">🏆</span>
                        <div>
                          <strong style="color: #ffffff; font-size: 15px;">Rankings & PRs</strong>
                          <p style="margin: 5px 0 0; font-size: 14px; color: #a3a3a3;">Acompanhe sua evolução e compare com outros atletas</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #333333;">
                      <div style="display: flex; align-items: start;">
                        <span style="font-size: 24px; margin-right: 12px;">🎖️</span>
                        <div>
                          <strong style="color: #ffffff; font-size: 15px;">Badges & Gamificação</strong>
                          <p style="margin: 5px 0 0; font-size: 14px; color: #a3a3a3;">Desbloqueie conquistas e ganhe pontos</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #333333;">
                      <div style="display: flex; align-items: start;">
                        <span style="font-size: 24px; margin-right: 12px;">📊</span>
                        <div>
                          <strong style="color: #ffffff; font-size: 15px;">Estatísticas Detalhadas</strong>
                          <p style="margin: 5px 0 0; font-size: 14px; color: #a3a3a3;">Visualize gráficos de progresso e análises</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 12px 0;">
                      <div style="display: flex; align-items: start;">
                        <span style="font-size: 24px; margin-right: 12px;">🔥</span>
                        <div>
                          <strong style="color: #ffffff; font-size: 15px;">Campeonatos</strong>
                          <p style="margin: 5px 0 0; font-size: 14px; color: #a3a3a3;">Participe de eventos e competições oficiais</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- CTAs -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td align="center" style="padding: 10px;">
                    <a href="${data.welcomeUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      🎉 Começar Tour Guiado
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 10px;">
                    <a href="${data.profileUrl}" style="display: inline-block; padding: 14px 32px; background-color: #262626; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; border: 1px solid #404040;">
                      ⚙️ Completar Perfil
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #737373; text-align: center;">
                Qualquer dúvida, entre em contato com o seu box ou com nossa equipe de suporte.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 30px; text-align: center; border-top: 1px solid #262626;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #737373;">
                <strong style="color: #ffffff;">RX Nation</strong> - Impacto Pro League
              </p>
              <p style="margin: 0; font-size: 12px; color: #525252;">
                © ${new Date().getFullYear()} Todos os direitos reservados
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
  
  <!-- Tracking Pixel -->
  ${data.userId && data.baseUrl ? generateTrackingPixel(data.baseUrl, generateEmailTrackingToken(data.userId)) : ''}
</body>
</html>
    `;

    const trackingToken = data.userId ? generateEmailTrackingToken(data.userId) : undefined;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"RX Nation" <noreply@rxnation.com>',
      to: data.userEmail,
      subject: `🏋️ Bem-vindo à RX Nation, ${data.userName}!`,
      html: htmlContent,
      text: `
Bem-vindo à RX Nation, ${data.userName}!

É um prazer ter você na RX Nation, a plataforma que vai revolucionar sua jornada no CrossFit!

Você agora faz parte do ${data.boxName} e tem acesso a todas as funcionalidades da plataforma.

O que você pode fazer agora:
- 📅 WOD do Dia: Acesse treinos diários e registre seus resultados
- 🏆 Rankings & PRs: Acompanhe sua evolução e compare com outros atletas
- 🎖️ Badges & Gamificação: Desbloqueie conquistas e ganhe pontos
- 📊 Estatísticas Detalhadas: Visualize gráficos de progresso e análises
- 🔥 Campeonatos: Participe de eventos e competições oficiais

Acesse agora: ${data.welcomeUrl}

Complete seu perfil: ${data.profileUrl}

Qualquer dúvida, entre em contato com o seu box ou com nossa equipe de suporte.

RX Nation - Impacto Pro League
© ${new Date().getFullYear()} Todos os direitos reservados
      `,
    });

    console.log('[Email] Email de boas-vindas enviado:', info.messageId);
    return { success: true, trackingToken };
  } catch (error) {
    console.error('[Email] Erro ao enviar email de boas-vindas:', error);
    return { success: false };
  }
}
