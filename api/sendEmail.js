import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed. Please send a POST request.'
    });
  }

  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      return res.status(500).json({
        success: false,
        error: 'Gmail credentials not configured: Please set EMAIL_USER and EMAIL_APP_PASSWORD in environment variables.'
      });
    }

    const { recipientEmail, subject, html, text } = req.body || {};

    if (!recipientEmail || typeof recipientEmail !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid recipient email address.'
      });
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
      subject: subject || 'Apna Community Clinic - Consultation Token Receipt',
      html,
      text: text || subject
    });

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      recipientEmail: recipientEmail.trim()
    });
  } catch (err) {
    console.error('Email send error:', err);
    let friendlyMessage = err.message || 'Failed to dispatch email via Gmail.';

    if (
      err.code === 'EAUTH' ||
      err.message?.includes('Invalid login') ||
      err.message?.includes('Username and Password not accepted')
    ) {
      friendlyMessage =
        'Gmail Authentication Error: Invalid login or App Password. In your Google Account (myaccount.google.com/apppasswords), generate a 16-character App Password and paste it as EMAIL_APP_PASSWORD.';
    }

    return res.status(400).json({
      success: false,
      error: friendlyMessage,
      code: err.code || 'EMAIL_ERROR'
    });
  }
}
