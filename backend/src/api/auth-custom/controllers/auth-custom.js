'use strict';

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const admin = require('../../../../config/firebase-admin');

// Configure your SMTP transporter here or use environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USERNAME || 'test@ethereal.email',
    pass: process.env.SMTP_PASSWORD || 'password123'
  }
});

module.exports = {
  async forgotPassword(ctx) {
    const { email } = ctx.request.body;

    if (!email) {
      return ctx.badRequest('O email é obrigatório.');
    }

    try {
      // Create a unique token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store in Strapi Database
      await strapi.entityService.create('api::password-reset-token.password-reset-token', {
        data: {
          token,
          email,
          expiresAt,
          used: false,
          publishedAt: new Date()
        }
      });

      // Send the email
      // We will assume the frontend is running on localhost:5175 or appropriate URL from Origin
      const origin = ctx.request.headers.origin || 'http://localhost:5175';
      const resetLink = `${origin}/reset-password?token=${token}`;

      await transporter.sendMail({
        from: '"Party2Go" <noreply@party2go.com>',
        to: email,
        subject: 'Recuperação de Palavra-Passe',
        html: `
          <h3>Recuperação de Palavra-Passe</h3>
          <p>Recebemos um pedido para repor a palavra-passe da tua conta.</p>
          <p>Clica no link abaixo para criar uma nova palavra-passe (válido por 15 minutos):</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>Se não pediste para repor a palavra-passe, podes ignorar este email.</p>
        `
      }).catch(err => {
        strapi.log.error('Erro ao enviar email de reset:', err);
      });

      // Se o email não estiver configurado corretamente (como é o caso por omissão), mostramos o link no terminal para testares:
      if (!process.env.SMTP_HOST) {
        strapi.log.info('========================================================================');
        strapi.log.info('🔔 SMTP não configurado. Aqui está o link de recuperação para testar:');
        strapi.log.info(resetLink);
        strapi.log.info('========================================================================');
      }

      // Always return 200 OK to prevent email enumeration
      ctx.send({ message: 'Se o email existir, o link de recuperação foi enviado.' });
    } catch (error) {
      strapi.log.error('Erro em forgotPassword:', error);
      ctx.internalServerError('Erro ao processar o pedido.');
    }
  },

  async resetPassword(ctx) {
    const { token, newPassword } = ctx.request.body;

    if (!token || !newPassword) {
      return ctx.badRequest('Token e nova palavra-passe são obrigatórios.');
    }

    if (newPassword.length < 6) {
      return ctx.badRequest('A palavra-passe deve ter pelo menos 6 caracteres.');
    }

    try {
      // Find the token
      const tokenEntries = await strapi.entityService.findMany('api::password-reset-token.password-reset-token', {
        filters: { token: token, used: false },
        limit: 1
      });

      if (!tokenEntries || tokenEntries.length === 0) {
        return ctx.badRequest('O token é inválido ou já foi utilizado.');
      }

      const tokenRecord = tokenEntries[0];

      if (new Date(tokenRecord.expiresAt) < new Date()) {
        return ctx.badRequest('O token expirou.');
      }

      const email = tokenRecord.email;

      // Update password in Firebase
      if (admin.apps.length) {
        try {
          // Get user by email to get UID
          const userRecord = await admin.auth().getUserByEmail(email);
          await admin.auth().updateUser(userRecord.uid, {
            password: newPassword
          });
        } catch (firebaseErr) {
          strapi.log.error('Erro ao atualizar password no Firebase:', firebaseErr);
          if (firebaseErr.code === 'auth/user-not-found') {
            return ctx.badRequest('Utilizador não encontrado no sistema de autenticação.');
          }
          return ctx.internalServerError('Erro ao atualizar a palavra-passe.');
        }
      } else {
        return ctx.internalServerError('O serviço de autenticação não está disponível no momento.');
      }

      // Mark token as used
      await strapi.entityService.update('api::password-reset-token.password-reset-token', tokenRecord.id, {
        data: {
          used: true
        }
      });

      // Send confirmation email
      await transporter.sendMail({
        from: '"Party2Go" <noreply@party2go.com>',
        to: email,
        subject: 'Palavra-Passe Atualizada',
        html: `
          <h3>A tua Palavra-Passe foi Atualizada</h3>
          <p>A palavra-passe da tua conta foi alterada com sucesso.</p>
          <p>Se não fizeste esta alteração, por favor contacta-nos imediatamente.</p>
        `
      }).catch(err => {
        strapi.log.error('Erro ao enviar email de confirmação:', err);
      });

      ctx.send({ message: 'Palavra-passe atualizada com sucesso.' });
    } catch (error) {
      strapi.log.error('Erro em resetPassword:', error);
      ctx.internalServerError('Erro ao processar o pedido.');
    }
  }
};
