// Load local environment variables from .env.local or .env for local testing/emulators
const fs = require("fs");
const path = require("path");
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
const twilio = require("twilio");
const cors = require("cors")({ origin: true });

// Define secrets for production deployment via Secret Manager (`firebase functions:secrets:set`)
const twilioAccountSid = defineSecret("TWILIO_ACCOUNT_SID");
const twilioApiKeySid = defineSecret("TWILIO_API_KEY_SID");
const twilioApiKeySecret = defineSecret("TWILIO_API_KEY_SECRET");
const twilioPhoneNumber = defineSecret("TWILIO_PHONE_NUMBER");

/**
 * Apna Community Health Clinic - Twilio SMS Gateway Cloud Function (2nd Gen)
 * 
 * Authenticates with Twilio via API Key SID & Secret + Account SID.
 * Dispatches real SMS and returns genuine Twilio Message SID or detailed diagnostic errors.
 */
exports.sendTwilioSMS = onRequest(
  {
    region: "us-central1",
    cors: true,
    secrets: [twilioAccountSid, twilioApiKeySid, twilioApiKeySecret, twilioPhoneNumber]
  },
  (req, res) => {
    return cors(req, res, async () => {
      // 1. Only allow POST requests
      if (req.method !== "POST") {
        return res.status(405).json({
          success: false,
          error: "Method Not Allowed. Please send a POST request with { recipientPhone, message }."
        });
      }

      try {
        const { recipientPhone, message, type = "token_booking" } = req.body || {};

        // 2. Validate request parameters
        if (!recipientPhone || typeof recipientPhone !== "string") {
          return res.status(400).json({
            success: false,
            error: "Please enter a valid recipient mobile number."
          });
        }

        if (!message || typeof message !== "string" || !message.trim()) {
          return res.status(400).json({
            success: false,
            error: "SMS message text cannot be empty."
          });
        }

        // 3. Format and clean phone number (E.164 compliance)
        let cleanPhone = recipientPhone.trim().replace(/[\s\-()]/g, "");
        if (!cleanPhone.startsWith("+")) {
          // Standard 10-digit Indian mobile number default
          if (/^\d{10}$/.test(cleanPhone)) {
            cleanPhone = `+91${cleanPhone}`;
          } else {
            cleanPhone = `+${cleanPhone}`;
          }
        }

        // 4. Resolve credentials from Cloud Secrets or local process.env
        const accountSid =
          process.env.TWILIO_ACCOUNT_SID ||
          (typeof twilioAccountSid.value === "function" ? twilioAccountSid.value() : "");
        const apiKeySid =
          process.env.TWILIO_API_KEY_SID ||
          (typeof twilioApiKeySid.value === "function" ? twilioApiKeySid.value() : "");
        const apiKeySecret =
          process.env.TWILIO_API_KEY_SECRET ||
          (typeof twilioApiKeySecret.value === "function" ? twilioApiKeySecret.value() : "");
        const authToken =
          process.env.TWILIO_AUTH_TOKEN || "";
        const fromPhone =
          process.env.TWILIO_PHONE_NUMBER ||
          (typeof twilioPhoneNumber.value === "function" ? twilioPhoneNumber.value() : "");

        if (!accountSid || (!authToken && (!apiKeySid || !apiKeySecret))) {
          logger.error("Missing Twilio credentials in environment/secrets", {
            hasAccountSid: Boolean(accountSid),
            hasApiKeySid: Boolean(apiKeySid),
            hasApiKeySecret: Boolean(apiKeySecret),
            hasAuthToken: Boolean(authToken)
          });
          return res.status(500).json({
            success: false,
            error: "Twilio credentials are not configured. Please set TWILIO_ACCOUNT_SID and either TWILIO_AUTH_TOKEN or (TWILIO_API_KEY_SID + TWILIO_API_KEY_SECRET) in functions/.env.local or via Firebase Secret Manager."
          });
        }

        if (!fromPhone || !fromPhone.trim()) {
          return res.status(400).json({
            success: false,
            error: "Missing TWILIO_PHONE_NUMBER: In Twilio Console (https://console.twilio.com), click 'Get a phone number' on the dashboard, copy the assigned Twilio number (e.g. +1...), and paste it as TWILIO_PHONE_NUMBER in functions/.env.local."
          });
        }

        if (!accountSid.startsWith('AC') || accountSid.length !== 34) {
          return res.status(400).json({
            success: false,
            error: `Twilio Account SID format error: Your TWILIO_ACCOUNT_SID ("${accountSid}") must be strictly 34 characters starting with "AC". Please copy your Account SID from the Twilio Console dashboard.`
          });
        }

        let client;
        if (authToken) {
          client = twilio(accountSid, authToken);
        } else {
          // Upfront format diagnostics to prevent typos
          if (!apiKeySid.startsWith('SK') || apiKeySid.length !== 34) {
            return res.status(400).json({
              success: false,
              error: `Twilio API Key SID format error: Your TWILIO_API_KEY_SID is ${apiKeySid.length} characters long ("${apiKeySid}"). Twilio API Key SIDs are always strictly 34 characters (starting with "SK" followed by 32 hex characters). Please re-copy the API Key SID from Twilio Console (Account > API Keys & Tokens).`
            });
          }
          client = twilio(apiKeySid, apiKeySecret, { accountSid });
        }

        logger.info(`Attempting to dispatch Twilio SMS to ${cleanPhone} (Type: ${type})`);

        // 6. Dispatch real SMS via Twilio API
        const twilioResult = await client.messages.create({
          body: message.trim(),
          from: fromPhone.trim(),
          to: cleanPhone
        });

        logger.info(`Twilio SMS dispatched successfully! SID: ${twilioResult.sid}, Status: ${twilioResult.status}`);

        // 7. Return genuine Twilio response
        return res.status(200).json({
          success: true,
          messageId: twilioResult.sid,
          status: twilioResult.status,
          to: twilioResult.to,
          from: twilioResult.from,
          dateCreated: twilioResult.dateCreated,
          carrier: "Twilio Telephony Gateway"
        });
      } catch (err) {
        logger.error("Twilio SMS send error caught:", err);

        // Friendly diagnostics for known Twilio error codes
        let friendlyMessage = err.message || "Failed to dispatch SMS via Twilio.";

        if (err.code === 21608) {
          friendlyMessage = "Twilio Trial Restriction: This phone number is unverified. In Twilio trial mode, you can only send SMS to numbers verified under Twilio Console > Phone Numbers > Manage > Verified Caller IDs.";
        } else if (err.code === 21211) {
          friendlyMessage = "Invalid phone number format. Please ensure your number includes the country code (e.g. +91 for India).";
        } else if (err.code === 21614) {
          friendlyMessage = "The destination phone number is a landline or does not support incoming SMS messages.";
        } else if (err.code === 20003) {
          friendlyMessage = "Twilio Authentication Error: Your Account SID or API Key credentials are invalid. Please check your Firebase secrets.";
        } else if (err.code === 21606) {
          friendlyMessage = "The configured Twilio 'From' phone number is not a valid SMS-capable number on your Twilio account.";
        } else if (err.code === 21408) {
          friendlyMessage = "Twilio Geo-Permissions error: SMS delivery to this country is disabled. Enable destination permissions in Twilio Console > Messaging > Settings > Geo-Permissions.";
        } else if (err.code === 20429) {
          friendlyMessage = "Twilio rate limit exceeded. Please wait a moment and try again.";
        }

        return res.status(400).json({
          success: false,
          error: friendlyMessage,
          code: err.code || "TWILIO_ERROR",
          rawMessage: err.message
        });
      }
    });
  }
);

/**
 * Apna Community Health Clinic - Gmail Email Gateway Cloud Function (2nd Gen)
 * Dispatches consultation token slips and notices via Gmail SMTP
 */
const nodemailer = require("nodemailer");
const emailUser = defineSecret("EMAIL_USER");
const emailAppPassword = defineSecret("EMAIL_APP_PASSWORD");

exports.sendClinicEmail = onRequest(
  {
    region: "us-central1",
    cors: true,
    secrets: [emailUser, emailAppPassword]
  },
  (req, res) => {
    return cors(req, res, async () => {
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
