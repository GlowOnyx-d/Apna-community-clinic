import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

/**
 * Local development middleware for Twilio SMS & Gmail Email Gateway
 * Allows instant testing of real Twilio SMS and Gmail emails directly through Vite dev server
 * without requiring Firebase Cloud Function deployment or emulator setup.
 */
function clinicApiDevPlugin() {
  return {
    name: 'clinic-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // --- 1. EMAIL DISPATCH API ENDPOINT ---
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

        // --- 2. TWILIO SMS DISPATCH API ENDPOINT ---
        if (req.url === '/api/sendTwilioSMS' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });

          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');

            let fromPhone = '';
            try {
              const baseDir = import.meta.dirname || process.cwd();
              const envLocalPath = path.resolve(baseDir, 'functions', '.env.local');
              const envPath = path.resolve(baseDir, 'functions', '.env');
              const envConfig = fs.existsSync(envLocalPath)
                ? dotenv.parse(fs.readFileSync(envLocalPath))
                : fs.existsSync(envPath)
                  ? dotenv.parse(fs.readFileSync(envPath))
                  : {};

              const accountSid = envConfig.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID;
              const apiKeySid = envConfig.TWILIO_API_KEY_SID || process.env.TWILIO_API_KEY_SID;
              const apiKeySecret = envConfig.TWILIO_API_KEY_SECRET || process.env.TWILIO_API_KEY_SECRET;
              const authToken = envConfig.TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN;
              fromPhone = envConfig.TWILIO_PHONE_NUMBER || process.env.TWILIO_PHONE_NUMBER || '';

              if (!accountSid || (!authToken && (!apiKeySid || !apiKeySecret))) {
                res.statusCode = 500;
                res.end(
                  JSON.stringify({
                    success: false,
                    error:
                      'Twilio credentials are missing in functions/.env.local. Please ensure TWILIO_ACCOUNT_SID and either TWILIO_AUTH_TOKEN or (TWILIO_API_KEY_SID + TWILIO_API_KEY_SECRET) are present.'
                  })
                );
                return;
              }

              if (!fromPhone || !fromPhone.trim()) {
                res.statusCode = 400;
                res.end(
                  JSON.stringify({
                    success: false,
                    error:
                      "Missing TWILIO_PHONE_NUMBER: In Twilio Console (https://console.twilio.com), click 'Get a phone number' on the dashboard, copy the assigned Twilio number (e.g. +1...), and paste it as TWILIO_PHONE_NUMBER in functions/.env.local."
                  })
                );
                return;
              }

              if (!accountSid.startsWith('AC') || accountSid.length !== 34) {
                res.statusCode = 400;
                res.end(
                  JSON.stringify({
                    success: false,
                    error: `Twilio Account SID format error: Your TWILIO_ACCOUNT_SID ("${accountSid}") must be strictly 34 characters starting with "AC". Please copy your Account SID from the Twilio Console dashboard.`
                  })
                );
                return;
              }

              let client;
              if (authToken) {
                client = twilio(accountSid, authToken);
              } else {
                if (!apiKeySid.startsWith('SK') || apiKeySid.length !== 34) {
                  res.statusCode = 400;
                  res.end(
                    JSON.stringify({
                      success: false,
                      error: `Twilio API Key SID format error: Your TWILIO_API_KEY_SID is ${apiKeySid.length} characters long ("${apiKeySid}"). Twilio API Key SIDs are always strictly 34 characters (starting with "SK" followed by 32 hex characters). Please re-copy the API Key SID from Twilio Console (Account > API Keys & Tokens).`
                    })
                  );
                  return;
                }
                client = twilio(apiKeySid, apiKeySecret, { accountSid });
              }

              const { recipientPhone, message } = JSON.parse(body || '{}');
              if (!recipientPhone) {
                res.statusCode = 400;
                res.end(
                  JSON.stringify({
                    success: false,
                    error: 'Please enter a valid recipient mobile number.'
                  })
                );
                return;
              }

              let cleanPhone = recipientPhone.trim().replace(/[\s\-()]/g, '');
              if (!cleanPhone.startsWith('+')) {
                cleanPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;
              }

              let cleanFrom = fromPhone.trim().replace(/[\s\-()]/g, '');
              if (!cleanFrom.startsWith('+')) {
                cleanFrom = cleanFrom.length === 10 ? `+91${cleanFrom}` : `+${cleanFrom}`;
              }

              const result = await client.messages.create({
                body: (message || '').trim(),
                from: cleanFrom,
                to: cleanPhone
              });

              console.log(`[Twilio Dev API] SMS sent successfully to ${cleanPhone}. SID: ${result.sid}`);

              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: true,
                  messageId: result.sid,
                  status: result.status,
                  to: result.to,
                  from: result.from,
                  carrier: 'Twilio Telephony Gateway'
                })
              );
            } catch (err) {
              console.error('[Twilio Dev API] Dispatch error:', err);

              let friendlyMessage = err.message || 'Twilio SMS dispatch failed.';

              if (err.code === 21608) {
                friendlyMessage =
                  'Twilio Free Trial restriction: The recipient number is unverified. While using a Twilio trial account, you can only send SMS to numbers you have verified. Please verify this number in Twilio Console > Phone Numbers > Manage > Verified Caller IDs.';
              } else if (err.code === 21606) {
                friendlyMessage = `Twilio 'From' number error: "${fromPhone}" is not an active, purchased Twilio phone number on your account. In your Twilio Console (Phone Numbers > Manage > Active Numbers), copy your assigned Twilio phone number (usually starts with +1...) and paste it as TWILIO_PHONE_NUMBER in functions/.env.local.`;
              } else if (err.code === 21211) {
                friendlyMessage =
                  'Invalid phone number format. Please ensure the recipient number includes the country code (e.g. +91 98765 43210).';
              } else if (err.code === 20003) {
                friendlyMessage =
                  'Twilio Authentication Error: Your Account SID or API Key credentials in functions/.env.local are invalid.';
              } else if (err.code === 21408) {
                friendlyMessage =
                  'Twilio Geo-Permissions error: SMS delivery to this country is disabled. Enable destination permissions in Twilio Console > Messaging > Settings > Geo-Permissions.';
              }

              res.statusCode = 400;
              res.end(
                JSON.stringify({
                  success: false,
                  error: friendlyMessage,
                  code: err.code || 'TWILIO_ERROR',
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
