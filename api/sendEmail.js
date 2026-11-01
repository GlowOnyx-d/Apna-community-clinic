import nodemailer from 'nodemailer';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });

const hits = new Map();
function rateLimited(uid) {
  const now = Date.now();
  const recent = (hits.get(uid) || []).filter(t => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(uid, recent);
  return recent.length > 15;
}

async function getRole(uid, idToken) {
  const url = `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${uid}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` } });
  if (!r.ok) return null;
  const d = await r.json();
  return d.fields?.role?.stringValue || null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed.' });
  }
  const idToken = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!idToken) return res.status(401).json({ success: false, error: 'Sign in required.' });
  let decoded;
  try {
    decoded = await getAuth().verifyIdToken(idToken);
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired session.' });
  }
  if (rateLimited(decoded.uid)) {
    return res.status(429).json({ success: false, error: 'Too many emails. Try again later.' });
  }
  const { recipientEmail, subject, html, text } = req.body || {};
  if (!recipientEmail || typeof recipientEmail !== 'string') {
    return res.status(400).json({ success: false, error: 'Valid recipient email required.' });
  }
  if ((subject || '').length > 200 || (html || '').length > 200000) {
    return res.status(400).json({ success: false, error: 'Email too large.' });
  }
  const role = await getRole(decoded.uid, idToken);
  const to = recipientEmail.trim().toLowerCase();
  const isStaff = role === 'admin' || role === 'doctor';
  if (!isStaff && to !== (decoded.email || '').toLowerCase()) {
    return res.status(403).json({ success: false, error: 'Not allowed to email this address.' });
  }
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS;
    if (!emailUser || !emailPass) {
      return res.status(500).json({ success: false, error: 'Email not configured.' });
    }
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: { user: emailUser.trim(), pass: emailPass.trim().replace(/\s+/g, '') }
    });
    const info = await transporter.sendMail({
      from: `"Apna Community Clinic" <${emailUser.trim()}>`,
      to,
      subject: subject || 'Apna Community Clinic - Consultation Token Receipt',
      html,
      text: text || subject
    });
    return res.status(200).json({ success: true, messageId: info.messageId, recipientEmail: to });
  } catch (err) {
    console.error('Email send error:', err);
    let friendlyError = 'Failed to send email.';
    if (
      err.code === 'ETIMEDOUT' ||
      err.code === 'ESOCKET' ||
      err.code === 'ECONNECTION'
    ) {
      friendlyError =
        'Cannot reach the Gmail mail server. Your network may be blocking SMTP. Try another network or check your firewall.';
    }
    return res.status(400).json({ success: false, error: friendlyError, code: err.code || 'EMAIL_ERROR' });
  }
}
