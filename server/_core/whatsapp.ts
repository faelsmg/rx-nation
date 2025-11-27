import twilio from "twilio";

/**
 * Cliente Twilio para envio de mensagens WhatsApp
 */
function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Credenciais Twilio não configuradas. Configure TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN.");
  }

  return twilio(accountSid, authToken);
}

export interface WhatsAppMessage {
  to: string; // Número no formato +5511999999999
  message: string;
  mediaUrl?: string; // URL de imagem/vídeo (opcional)
}

/**
 * Envia mensagem via WhatsApp usando Twilio
 */
export async function sendWhatsAppMessage(data: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const client = getTwilioClient();
    const from = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!from) {
      throw new Error("Número WhatsApp Twilio não configurado. Configure TWILIO_WHATSAPP_NUMBER.");
    }

    // Garantir formato correto do número
    const toNumber = data.to.startsWith("whatsapp:") ? data.to : `whatsapp:${data.to}`;
    const fromNumber = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`;

    const messageOptions: any = {
      from: fromNumber,
      to: toNumber,
      body: data.message,
    };

    // Adicionar mídia se fornecida
    if (data.mediaUrl) {
      messageOptions.mediaUrl = [data.mediaUrl];
    }

    const message = await client.messages.create(messageOptions);

    console.log("[WhatsApp] Mensagem enviada com sucesso:", message.sid);
    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: any) {
    console.error("[WhatsApp] Erro ao enviar mensagem:", error);
    return {
      success: false,
      error: error.message || "Erro desconhecido ao enviar mensagem WhatsApp",
    };
  }
}

/**
 * Templates de mensagens WhatsApp
 */
export const whatsappTemplates = {
  lembreteWOD: (nomeAtleta: string, wodTitulo: string, horario: string) => `
🏋️ *Olá, ${nomeAtleta}!*

Não esqueça do treino de hoje:

📅 *WOD:* ${wodTitulo}
⏰ *Horário:* ${horario}

Nos vemos no box! 💪

_RX Nation - Impacto Pro League_
  `.trim(),

  comunicadoBox: (titulo: string, mensagem: string) => `
📢 *${titulo}*

${mensagem}

_RX Nation - Impacto Pro League_
  `.trim(),

  novoRecordePessoal: (nomeAtleta: string, movimento: string, valor: string) => `
🎉 *Parabéns, ${nomeAtleta}!*

Você bateu um novo recorde pessoal:

🏆 *${movimento}:* ${valor}

Continue assim! 💪🔥

_RX Nation - Impacto Pro League_
  `.trim(),

  lembreteCheckIn: (nomeAtleta: string, horaTreino: string) => `
⏰ *Lembrete de Check-in*

Olá, ${nomeAtleta}!

Seu treino começa em 30 minutos (${horaTreino}).

Não esqueça de fazer o check-in! 📲

_RX Nation - Impacto Pro League_
  `.trim(),

  conviteCampeonato: (nomeAtleta: string, nomeCampeonato: string, dataInicio: string) => `
🏆 *Novo Campeonato Disponível!*

Olá, ${nomeAtleta}!

Você foi convidado para participar do:

*${nomeCampeonato}*
📅 Início: ${dataInicio}

Acesse a plataforma para se inscrever! 🚀

_RX Nation - Impacto Pro League_
  `.trim(),
};

/**
 * Valida formato de número de telefone WhatsApp
 */
export function validarNumeroWhatsApp(numero: string): boolean {
  // Formato esperado: +5511999999999 (código do país + DDD + número)
  const regex = /^\+\d{12,15}$/;
  return regex.test(numero);
}

/**
 * Formata número de telefone para WhatsApp
 * Entrada: (11) 99999-9999 ou 11999999999
 * Saída: +5511999999999
 */
export function formatarNumeroWhatsApp(numero: string, codigoPais: string = "+55"): string {
  // Remover caracteres não numéricos
  const apenasNumeros = numero.replace(/\D/g, "");

  // Adicionar código do país se não tiver
  if (!numero.startsWith("+")) {
    return `${codigoPais}${apenasNumeros}`;
  }

  return `+${apenasNumeros}`;
}
