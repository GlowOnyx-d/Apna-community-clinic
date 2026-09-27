/**
 * Apna Community Health Clinic - Twilio SMS Gateway Service
 * Connects directly to the Firebase Cloud Function backend to dispatch
 * genuine SMS messages via Twilio Telephony API.
 */

const DEFAULT_CLOUD_FUNCTION_URL = 'https://us-central1-community-service-142b2.cloudfunctions.net/sendTwilioSMS';

/**
 * Send real SMS via Firebase Cloud Function + Twilio SDK
 * @param {Object} options
 * @param {string} options.recipientPhone - Patient's or staff's mobile number
 * @param {string} options.message - Formatted SMS message text
 * @param {string} [options.tokenNumber] - Queue token
 * @param {string} [options.patientName] - Patient full name
 * @param {string} [options.doctorName] - Healthcare specialist name
 * @param {string} [options.type] - 'token_booking' | 'pharmacy_pickup' | 'staff_credentials'
 * @returns {Promise<{ success: boolean, messageId: string, status: string, timestamp: string, recipientPhone: string, carrier: string }>}
 */
export async function sendDirectSMS({
  recipientPhone,
  message,
  tokenNumber = '',
  patientName = '',
  doctorName = '',
  type = 'token_booking'
}) {
  const cleanPhone = (recipientPhone || '').trim();
  if (!cleanPhone || cleanPhone.replace(/[^0-9]/g, '').length < 8) {
    throw new Error('Please enter a valid recipient mobile number (e.g. +91 98765 43210).');
  }

  if (!message || !message.trim()) {
    throw new Error('SMS message text cannot be empty.');
  }

  const endpointUrl =
    import.meta.env.VITE_TWILIO_SMS_FUNCTION_URL ||
    (import.meta.env.DEV ? '/api/sendTwilioSMS' : DEFAULT_CLOUD_FUNCTION_URL);

  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipientPhone: cleanPhone,
        message: message.trim(),
        tokenNumber,
        patientName,
        doctorName,
        type
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
      const errorMsg =
        data?.error ||
        data?.message ||
        `SMS dispatch failed with status ${response.status} (${response.statusText})`;
      
      const err = new Error(errorMsg);
      err.code = data?.code || 'TWILIO_ERROR';
      err.details = data;
      throw err;
    }

    return {
      success: true,
      messageId: data.messageId,
      status: data.status || 'queued',
      timestamp: data.dateCreated || new Date().toISOString(),
      recipientPhone: data.to || cleanPhone,
      carrier: data.carrier || 'Twilio Telephony Gateway'
    };
  } catch (networkOrApiError) {
    console.error('[SMS Service] Twilio dispatch failure:', networkOrApiError);
    // If it's already our custom Error, rethrow it directly
    if (networkOrApiError.message) {
      throw networkOrApiError;
    }
    throw new Error('Unable to connect to SMS Gateway. Please ensure the Cloud Function is deployed and accessible.');
  }
}

/**
 * Format Standard Clinic Appointment SMS
 */
export function formatAppointmentSMS(appointment) {
  return (
    `🏥 APNA CLINIC TOKEN: ${appointment.tokenNumber || 'TK-01'}\n` +
    `Dear ${appointment.patientName || 'Patient'},\n` +
    `Your clinic consultation appointment is confirmed.\n` +
    `Doctor: ${appointment.doctorName} (${appointment.cabin || 'Cabin 101'})\n` +
    `Date & Time: ${appointment.date} at ${appointment.time}\n` +
    `Free Primary Care (UN SDG 3). Please show this SMS at reception.`
  );
}

/**
 * Format Pharmacy Medication Pickup SMS
 */
export function formatPharmacyPickupSMS(appointment) {
  return (
    `🏥 APNA PHARMACY DISPENSARY\n` +
    `Dear ${appointment.patientName},\n` +
    `Your prescribed medicines for Token ${appointment.tokenNumber || 'TK'} are packed and ready for collection at Counter 2.\n` +
    `Prescribed by: ${appointment.doctorName}\n` +
    `100% Free under Community Essential Drug Scheme.`
  );
}

/**
 * Format Official Staff & Admin Login Credentials SMS
 */
export function formatStaffCredentialsSMS({ name, email, password, designation }) {
  return (
    `🏥 APNA CLINIC STAFF AUTHORIZATION\n` +
    `Dear ${name},\n` +
    `Your official clinic management credentials have been authorized.\n` +
    `Role / Designation: ${designation || 'Clinic Operations'}\n` +
    `Login Email: ${email}\n` +
    `Temporary Password: ${password}\n` +
    `Sign in at: https://communityclinic.org/login\n` +
    `Confidential: Do not share these credentials.`
  );
}
