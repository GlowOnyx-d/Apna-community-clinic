/**
 * Apna Community Health Clinic - Cloud Functions Backend
 * Zero-Cost Gmail SMTP Email Gateway (Nodemailer)
 */

const fs = require("fs");
const path = require("path");

// Load local environment variables from .env.local or .env for local testing/emulators
const envLocalPath = path.resolve(__dirname, ".env.local");
const envPath = path.resolve(__dirname, ".env");

if (fs.existsSync(envLocalPath)) {
  require("dotenv").config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
}

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { logger } = require("firebase-functions");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true });

// Define secrets for production deployment via Secret Manager (`firebase functions:secrets:set`)
const emailUser = defineSecret("EMAIL_USER");
const emailAppPassword = defineSecret("EMAIL_APP_PASSWORD");

/**
 * Apna Community Health Clinic - Gmail Email Gateway Cloud Function (2nd Gen)
 * Dispatches consultation token slips, pharmacy notices, and staff credentials via Gmail SMTP
 */
exports.sendClinicEmail = onRequest(
  {
    region: "us-central1",
    cors: true,
    secrets: [emailUser, emailAppPassword]
  },
  (req, res) => {
    return cors(req, res, async () => {
      // 1. Only allow POST requests
      if (req.method !== "POST") {
        return res.status(405).json({
          success: false,
          error: "Method Not Allowed. Please send a POST request with { recipientEmail, subject, html }."
        });
      }

      try {
        const user =
          process.env.EMAIL_USER ||
          (typeof emailUser.value === "function" ? emailUser.value() : "");
        const pass =
          process.env.EMAIL_APP_PASSWORD ||
          (typeof emailAppPassword.value === "function" ? emailAppPassword.value() : "");

        if (!user || !pass) {
          logger.error("Missing Gmail credentials in environment/secrets");
          return res.status(500).json({
            success: false,
            error:
              "Gmail credentials are not configured. Please set EMAIL_USER and EMAIL_APP_PASSWORD in functions/.env.local or via Firebase Secret Manager."
          });
        }

        const { recipientEmail, subject, html, text } = req.body || {};

        if (!recipientEmail || typeof recipientEmail !== "string") {
          return res.status(400).json({
            success: false,
            error: "Recipient email address is required."
          });
        }

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: user.trim(),
            pass: pass.trim().replace(/\s+/g, "")
          }
        });

        const info = await transporter.sendMail({
          from: `"Apna Community Clinic" <${user.trim()}>`,
          to: recipientEmail.trim(),
          subject: subject || "Apna Community Clinic - Consultation Token Receipt",
          html: html,
          text: text || subject
        });

        logger.info(`Email successfully dispatched to ${recipientEmail}. MessageId: ${info.messageId}`);

        return res.status(200).json({
          success: true,
          messageId: info.messageId,
          recipientEmail: recipientEmail.trim()
        });
      } catch (emailErr) {
        logger.error("Email dispatch failure:", emailErr);

        let friendlyMsg = emailErr.message || "Failed to dispatch email.";
        if (
          emailErr.code === "EAUTH" ||
          emailErr.message?.includes("Invalid login") ||
          emailErr.message?.includes("Username and Password not accepted")
        ) {
          friendlyMsg =
            "Gmail Authentication Error: Invalid login or App Password. In your Google Account (myaccount.google.com/apppasswords), generate a 16-character App Password and paste it as EMAIL_APP_PASSWORD.";
        }

        return res.status(400).json({
          success: false,
          error: friendlyMsg,
          code: emailErr.code || "EMAIL_ERROR",
          rawMessage: emailErr.message
        });
      }
    });
  }
);
