import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Use App Password for Gmail
    }
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string, 
  resetToken: string, 
  userName: string
) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Restablecer contraseña - Raffler',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Restablecer Contraseña</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #2563eb;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border: 1px solid #e5e7eb;
            }
            .button {
              display: inline-block;
              background-color: #2563eb;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              background-color: #374151;
              color: #d1d5db;
              padding: 20px;
              text-align: center;
              border-radius: 0 0 8px 8px;
              font-size: 14px;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎲 Rifala</h1>
            <h2>Restablecer Contraseña</h2>
          </div>
          
          <div class="content">
            <h3>Hola ${userName},</h3>
            
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Raffler.</p>
            
            <p>Si solicitaste este cambio, haz clic en el botón de abajo para crear una nueva contraseña:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            </div>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 4px;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Importante:</strong>
              <ul>
                <li>Este enlace expirará en 1 hora</li>
                <li>Solo puede ser usado una vez</li>
                <li>Si no solicitaste este cambio, ignora este email</li>
              </ul>
            </div>
            
            <p>Si tienes problemas, puedes contactarnos respondiendo a este email.</p>
            
            <p>Gracias,<br>El equipo de Raffler</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Raffler. Todos los derechos reservados.</p>
            <p>Este es un email automático, por favor no respondas directamente.</p>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', result.messageId);
    return result;

  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email: string, userName: string) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '¡Bienvenido a Rifala! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenido a Rifala</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #2563eb;
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border: 1px solid #e5e7eb;
            }
            .button {
              display: inline-block;
              background-color: #2563eb;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              background-color: #374151;
              color: #d1d5db;
              padding: 20px;
              text-align: center;
              border-radius: 0 0 8px 8px;
              font-size: 14px;
            }
            .feature-list {
              background-color: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎲 ¡Bienvenido a Raffler!</h1>
            <p>Tu plataforma para crear y gestionar rifas</p>
          </div>
          
          <div class="content">
            <h3>¡Hola ${userName}! 👋</h3>
            
            <p>¡Gracias por unirte a Raffler! Estamos emocionados de tenerte en nuestra comunidad.</p>
            
            <div class="feature-list">
              <h4>¿Qué puedes hacer con Raffler?</h4>
              <ul>
                <li>🎯 Crear rifas personalizadas</li>
                <li>💰 Gestionar ventas de boletos</li>
                <li>📊 Seguir estadísticas en tiempo real</li>
                <li>🏆 Realizar sorteos automáticos</li>
                <li>📧 Notificar ganadores por email</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">
                Comenzar Ahora
              </a>
            </div>
            
            <p>Si tienes alguna pregunta, no dudes en contactarnos. ¡Estamos aquí para ayudarte!</p>
            
            <p>¡Que tengas mucha suerte con tus rifas!</p>
            
            <p>Saludos,<br>El equipo de Raffler</p>
          </div>
          
          <div class="footer">
            <p>© 2024 Raffler. Todos los derechos reservados.</p>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', result.messageId);
    return result;

  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email - it's not critical
  }
};