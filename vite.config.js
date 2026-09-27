import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

/**
 * Local development middleware for Gmail Email Gateway
 * Allows instant testing of Gmail emails directly through Vite dev server
 * without requiring Cloud Function deployment or emulator setup.
 */
function clinicApiDevPlugin() {
  return {
    name: 'clinic-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // --- EMAIL DISPATCH API ENDPOINT ---
        if (req.url === '/api/sendEmail' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });

          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');

            try {
              const baseDir = import.meta.dirname || process.cwd();
              const envLocalPath = path.resolve(baseDir, 'functions', '.env.local');
              const envPath = path.resolve(baseDir, 'functions', '.env');
              const envConfig = fs.existsSync(envLocalPath)
                ? dotenv.parse(fs.readFileSync(envLocalPath))
                : fs.existsSync(envPath)
                  ? dotenv.parse(fs.readFileSync(envPath))
                  : {};

              const emailUser = envConfig.EMAIL_USER || process.env.EMAIL_USER;
              const emailPass =
                envConfig.EMAIL_APP_PASSWORD ||
                envConfig.EMAIL_PASS ||
                process.env.EMAIL_APP_PASSWORD ||
                process.env.EMAIL_PASS;

              if (!emailUser || !emailPass) {
                res.statusCode = 400;
                res.end(
                  JSON.stringify({
                    success: false,
                    error:
                      'Gmail credentials not configured: Please set EMAIL_USER (your Gmail) and EMAIL_APP_PASSWORD (16-character Google App Password) in functions/.env.local.'
                  })
                );
                return;
              }

              const { recipientEmail, subject, html, text } = JSON.parse(body || '{}');
              if (!recipientEmail) {
                res.statusCode = 400;
                res.end(
                  JSON.stringify({
                    success: false,
                    error: 'Please enter a valid recipient email address.'
                  })
                );
                return;
              }

              const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: emailUser.trim(),
                  pass: emailPass.trim().replace(/\s+/g, '')
                }
              });

              const info = await transporter.sendMail({
                from: `"Apna Community Clinic" <${emailUser.trim()}>`,
                to: recipientEmail.trim(),
                subject: subject || 'Apna Community Clinic - Appointment Token Receipt',
                html: html,
                text: text || subject
              });

              console.log(`[Email Dev API] Email sent to ${recipientEmail}. MessageId: ${info.messageId}`);

              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: true,
                  messageId: info.messageId,
                  recipientEmail
                })
              );
            } catch (err) {
              console.error('[Email Dev API] Dispatch error:', err);
              let friendlyMessage = err.message || 'Failed to dispatch email via Gmail.';

              if (
                err.code === 'EAUTH' ||
                err.message?.includes('Invalid login') ||
                err.message?.includes('Username and Password not accepted')
              ) {
                friendlyMessage =
                  'Gmail Authentication Error: Invalid login or App Password. In your Google Account (myaccount.google.com/apppasswords), generate a 16-character App Password and paste it as EMAIL_APP_PASSWORD in functions/.env.local.';
              }

              res.statusCode = 400;
              res.end(
                JSON.stringify({
                  success: false,
                  error: friendlyMessage,
                  code: err.code || 'EMAIL_ERROR',
                  rawMessage: err.message
                })
              );
            }
          });
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), clinicApiDevPlugin()],
  server: {
    host: true, // Listen on all network addresses (0.0.0.0) so smartphones on same Wi-Fi can connect
    port: 5173
  }
});
