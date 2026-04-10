const twilio = require('twilio');
const supabase = require('../config/supabase');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid || 'AC...', authToken || '...');

const sendTurnNotification = async (phone, name) => {
  if (!accountSid || !authToken) {
    console.warn('Twilio credentials missing. Logging notification to DB instead.');
    await logSMS(phone, `Hello ${name}, your turn is coming soon! Please stay near the room.`);
    return;
  }

  try {
    const message = await client.messages.create({
      body: `Hello ${name}, your turn is coming soon (Position 3)! Please prepare to see the doctor.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    
    await logSMS(phone, message.body);
    return message.sid;
  } catch (err) {
    console.error('Twilio SMS Error:', err);
  }
};

const logSMS = async (phone, message) => {
  await supabase.from('sms_log').insert([{ phone, message }]);
};

module.exports = { sendTurnNotification };
