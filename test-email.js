// Script de teste de envio de email SMTP
import nodemailer from 'nodemailer';
const { createTransport } = nodemailer;

const transporter = createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'fael.smg@gmail.com',
    pass: 'sipwfpdjmpllmbry',
  },
});

async function testEmail() {
  try {
    console.log('🔄 Testando configuração SMTP...');
    
    const info = await transporter.sendMail({
      from: '"RX Nation" <fael.smg@gmail.com>',
      to: 'fael.smg@gmail.com', // Enviando para o próprio email de teste
      subject: 'Teste de Configuração SMTP - RX Nation',
      html: `
        <h1>Teste de Email</h1>
        <p>Se você recebeu este email, a configuração SMTP está funcionando corretamente!</p>
        <p>Data/Hora: ${new Date().toLocaleString('pt-BR')}</p>
      `,
    });

    console.log('✅ Email enviado com sucesso!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Response:', info.response);
  } catch (error) {
    console.error('❌ Erro ao enviar email:');
    console.error(error);
  }
}

testEmail();
