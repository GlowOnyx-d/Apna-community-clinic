/**
 * Apna Community Health Clinic - Email Gateway Service
 * Connects to the local development server or Firebase Cloud Function
 * to dispatch rich HTML emails via Gmail SMTP (Nodemailer).
 */

import { auth } from '../firebase';

/**
 * Send an email directly via the backend Nodemailer gateway
 * @param {Object} options
 * @param {string} options.recipientEmail - Recipient's email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - Full HTML body
 * @param {string} [options.text] - Plain text fallback
 * @param {string} [options.type] - 'token_booking' | 'pharmacy_pickup' | 'staff_credentials'
 * @returns {Promise<{ success: boolean, messageId: string, timestamp: string, recipientEmail: string }>}
 */
export async function sendDirectEmail({
  recipientEmail,
  subject,
  html,
  text = '',
  type = 'token_booking'
}) {
  const cleanEmail = (recipientEmail || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    throw new Error('Please enter a valid email address (e.g. patient@gmail.com).');
  }

  if (!subject || !subject.trim()) {
    throw new Error('Email subject line cannot be empty.');
  }

  const endpointUrl =
    import.meta.env.VITE_CLINIC_EMAIL_FUNCTION_URL || '/api/sendEmail';

  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Please sign in to send email.');
    const idToken = await user.getIdToken();

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({
        recipientEmail: cleanEmail,
        subject: subject.trim(),
        html,
        text: text || subject,
        type
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
      const errorMsg =
        data?.error ||
        data?.message ||
        `Email dispatch failed (${response.status}: ${response.statusText})`;
      
      const err = new Error(errorMsg);
      err.code = data?.code || 'EMAIL_SEND_FAILED';
      err.details = data;
      throw err;
    }

    return {
      success: true,
      messageId: data.messageId,
      timestamp: new Date().toISOString(),
      recipientEmail: cleanEmail
    };
  } catch (err) {
    console.error('[Email Service] Dispatch error:', err);
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to the Email Gateway. Please ensure the local server or Cloud Function is active.');
    }
    throw err;
  }
}

/**
 * Generates an official, beautifully styled HTML receipt for Clinic Token Appointments
 */
export function generateAppointmentEmailHtml(appointment) {
  const token = appointment.tokenNumber || 'TK-01';
  const patient = appointment.patientName || 'Patient';
  const doctor = appointment.doctorName || 'General Physician';
  const specialization = appointment.specialization || 'General Medicine & Primary Care';
  const cabin = appointment.cabin || 'Cabin 101, Main Clinic Block';
  const date = appointment.date || 'Today';
  const time = appointment.time || 'Walk-In Queue';
  const tokenRecordId = appointment.id || 'N/A';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clinic Token Receipt</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F4F7F6; color: #132226;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #E0E7E5; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
    
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #0F766E 0%, #134E4A 100%); padding: 28px 24px; text-align: center; color: #F4F7F6;">
      <div style="display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 10px;">
        Universal Primary Healthcare • UN SDG 3
      </div>
      <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 800; letter-spacing: -0.3px;">
        APNA COMMUNITY HEALTH CLINIC
      </h1>
      <p style="margin: 0; font-size: 12px; opacity: 0.9;">
        Official Digital Consultation &amp; Queue Token Slip
      </p>
    </div>

    <!-- Token Badge Card -->
    <div style="padding: 24px; text-align: center; background: #ECFDF5; border-bottom: 1px dashed #CCFBF1;">
      <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0F766E; letter-spacing: 1px;">
        Allocated Queue Token
      </p>
      <div style="display: inline-block; font-size: 38px; font-weight: 900; color: #134E4A; line-height: 1; margin: 4px 0 8px 0; font-family: monospace;">
        ${token}
      </div>
      <div style="font-size: 12px; font-weight: 600; color: #0F766E;">
        ✓ CONFIRMED &bull; ACTIVE CLINIC QUEUE
      </div>
    </div>

    <!-- Appointment Information Table -->
    <div style="padding: 24px;">
      <h3 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #132226; border-bottom: 1px solid #E0E7E5; padding-bottom: 8px;">
        Consultation Particulars
      </h3>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 8px 0; color: #5A7178; width: 40%;">Patient Name:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #132226;">${patient}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #5A7178;">Consulting Doctor:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #132226;">${doctor}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #5A7178;">Specialty:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #0F766E;">${specialization}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #5A7178;">Consultation Date:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #132226;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #5A7178;">Allocated Time Slot:</td>
          <td style="padding: 8px 0; font-weight: 700; color: #132226;">${time}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #5A7178;">Clinic Cabin:</td>
          <td style="padding: 8px 0; font-weight: 600; color: #132226;">${cabin}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #5A7178;">Token Record ID:</td>
          <td style="padding: 8px 0; font-family: monospace; font-size: 11px; color: #758D94;">${tokenRecordId}</td>
        </tr>
      </table>

      <!-- Instructions Box -->
      <div style="margin-top: 20px; padding: 14px; background: #F4F7F6; border: 1px solid #E0E7E5; border-radius: 12px; font-size: 12px; color: #5A7178; line-height: 1.5;">
        <strong style="color: #132226;">Arrival Instructions:</strong>
        <ul style="margin: 6px 0 0 0; padding-left: 18px;">
          <li>Please arrive 10 minutes prior to your allocated slot.</li>
          <li>Show this digital token email on your phone at reception or triage.</li>
          <li>100% Free Consultation under Apna Community Health Mission.</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #F4F7F6; padding: 16px 24px; text-align: center; font-size: 11px; color: #758D94; border-top: 1px solid #E0E7E5;">
      <p style="margin: 0 0 4px 0;">Apna Community Health Clinic &bull; Dedicated to UN Sustainable Development Goal 3</p>
      <p style="margin: 0;">This is an automated clinic receipt. Please do not reply directly to this email.</p>
    </div>

  </div>
</body>
</html>
  `.trim();
}

/**
 * Generates an HTML notification for Pharmacy Medication Pickup
 */
export function generatePharmacyPickupEmailHtml(appointment) {
  const token = appointment.tokenNumber || 'TK';
  const patient = appointment.patientName || 'Patient';
  const doctor = appointment.doctorName || 'Doctor';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Medication Ready for Pickup</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F4F7F6;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #E0E7E5;">
    <div style="background: #0F766E; padding: 24px; text-align: center; color: #F4F7F6;">
      <h2 style="margin: 0 0 4px 0; font-size: 18px;">APNA CLINIC PHARMACY DISPENSARY</h2>
      <p style="margin: 0; font-size: 12px; opacity: 0.9;">Essential Medicines Packed &amp; Ready for Collection</p>
    </div>
    <div style="padding: 24px; text-align: center;">
      <div style="font-size: 32px; font-weight: 800; color: #0F766E; font-family: monospace; margin-bottom: 8px;">
        ${token}
      </div>
      <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #132226;">Dear ${patient},</h3>
      <p style="font-size: 13px; color: #5A7178; line-height: 1.5; margin: 0 0 16px 0;">
        Your prescribed medications from <strong>${doctor}</strong> have been verified, packaged, and are ready for pickup at <strong>Pharmacy Counter 2</strong>.
      </p>
      <div style="padding: 12px; background: #ECFDF5; border-radius: 12px; font-size: 12px; color: #0F766E; font-weight: 600;">
        ✓ 100% Free under Community Essential Drug Scheme &bull; UN SDG 3
      </div>
    </div>
    <div style="background: #F4F7F6; padding: 14px; text-align: center; font-size: 11px; color: #758D94; border-top: 1px solid #E0E7E5;">
      Please show this email receipt at Pharmacy Counter 2 to claim your medications.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generates an HTML notification for Staff Credentials
 */
export function generateStaffCredentialsEmailHtml({ name, email, password, designation }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Staff Authorization Credentials</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F4F7F6;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #E0E7E5;">
    <div style="background: #F97316; padding: 24px; text-align: center; color: #F4F7F6;">
      <h2 style="margin: 0 0 4px 0; font-size: 18px;">APNA CLINIC STAFF AUTHORIZATION</h2>
      <p style="margin: 0; font-size: 12px; opacity: 0.9;">Official Operations Portal Access</p>
    </div>
    <div style="padding: 24px;">
      <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #132226;">Dear ${name},</h3>
      <p style="font-size: 13px; color: #5A7178; line-height: 1.5; margin: 0 0 16px 0;">
        Your official management account for Apna Community Health Platform has been provisioned.
      </p>
      <div style="padding: 16px; background: #F4F7F6; border-radius: 12px; border: 1px solid #E0E7E5; font-size: 13px; line-height: 1.8;">
        <div><strong>Role / Designation:</strong> ${designation || 'Staff'}</div>
        <div><strong>Official Email:</strong> ${email}</div>
        <div><strong>Temporary Password:</strong> <code style="background: #E1ECE9; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${password}</code></div>
      </div>
      <p style="font-size: 12px; color: #758D94; margin-top: 16px;">
        Please sign in and change your password upon first login. Do not share these credentials with unauthorized personnel.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
