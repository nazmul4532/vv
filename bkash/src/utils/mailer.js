const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const recipients = process.env.EMAIL_RECIPIENTS
  ? process.env.EMAIL_RECIPIENTS.split(',').map(email => email.trim())
  : [];

const sendMail = async (subject, text, attempt = 1) => {
  if (recipients.length === 0) {
    console.warn('⚠️ No email recipients configured');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipients,
    subject,
    text
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${recipients.join(', ')}`);
  } catch (err) {
    console.error(`❌ Email send failed (attempt ${attempt}):`, err.message);

    // Retry only once, after short delay, if it's a retryable issue
    if (attempt < 2 && isRetryable(err)) {
      console.warn('🔁 Retrying email after 2 seconds...');
      await new Promise(r => setTimeout(r, 2000));
      return sendMail(subject, text, attempt + 1);
    } else {
      console.error('📛 Giving up on sending email.');
    }
  }
};

// Basic check for retry-worthy errors
const isRetryable = (err) => {
  if (!err) return false;
  const retryCodes = ['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN'];
  const retryStatus = [421, 429, 450, 451, 452];

  return retryCodes.includes(err.code) || retryStatus.includes(err.responseCode);
};

module.exports = sendMail;
