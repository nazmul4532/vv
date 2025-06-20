const axios = require('axios');
const sendMail = require('../utils/mailer');
const Log = require('../models/Log');

// --- Utility: Dummy email tester ---
const sendDummyMail = async (req, res) => {
  try {
    await sendMail(
      '📧 Test Email from Bkash System',
      'This is a dummy email to confirm that SMTP and recipient configuration are working correctly.'
    );

    res.status(200).send('✅ Dummy email sent successfully');
  } catch (err) {
    console.error('❌ Failed to send dummy email:', err);
    res.status(500).send('❌ Failed to send dummy email');
  }
};

// --- Main Log Monitoring and Alert Logic ---
const checkLogFailuresAndAlert = async () => {
  const recentLogs = await Log.find({
    $expr: {
      $gte: ["$timestamp", { $subtract: ["$$NOW", 1000 * 60 * 2] }]
    }
  });

  const total = recentLogs.length;

  if (total === 0) {
    console.log('🟡 No logs in last 10 minutes.');
    return;
  }

  const counts = {
    descoUnreachable: 0,
    kaifaUnreachable: 0,
    amsUnreachable: 0,
    noAvailableService: 0
  };

  for (const log of recentLogs) {
    const msg = log.message;

    if (msg.includes('Desco is unreachable')) counts.descoUnreachable++;
    if (msg.includes('Kaifa is unreachable')) counts.kaifaUnreachable++;
    if (msg.includes('AMS is unreachable')) counts.amsUnreachable++;
    if (msg.includes('No available services could handle meter')) counts.noAvailableService++;
  }

  const alertLines = [];
  const getRate = (count) => ((count / total) * 100).toFixed(2);

  if ((counts.kaifaUnreachable / total) > 0.1) {
    alertLines.push(`⚠️ Kaifa unreachable rate is high: ${getRate(counts.kaifaUnreachable)}%`);
  }

  if ((counts.amsUnreachable / total) > 0.05) {
    alertLines.push(`⚠️ AMS unreachable rate is high: ${getRate(counts.amsUnreachable)}%`);
  }

  if ((counts.descoUnreachable / total) > 0.2) {
    alertLines.push(`🟡 Desco unreachable rate is high: ${getRate(counts.descoUnreachable)}%`);
  }

  if ((counts.noAvailableService / total) > 0.025 && (counts.descoUnreachable / total) < 0.1) {
    alertLines.push(`❌ FATAL: 'No available services could handle meter' rate is high: ${getRate(counts.noAvailableService)}%`);
  }

  if (alertLines.length > 0) {
    const subject = 'Bkash Alert: Degraded Service Health (10-min window)';
    const body = alertLines.join('\n');

    try {
      await sendMail(subject, body);
      console.log('📨 Alert email sent');
    } catch (e) {
      console.error('❌ Failed to send alert email:', e.message);
    }
  } else {
    console.log('✅ All services are operating normally in last 10 minutes.');
  }
};

// --- Export ---
module.exports = {
  checkLogFailuresAndAlert,
  sendDummyMail
};
