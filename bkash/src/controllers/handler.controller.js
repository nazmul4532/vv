const axios = require('axios');

const {
  KAIFA_URL,
  KAIFA_HEALTH_URL,
  AMS_URL,
  AMS_HEALTH_URL,
  DESCO_HEALTH_URL,
  DESCO_VALIDATE_URL
} = require('../config/services');

// --- Utility: Health Check ---
const checkHealth = async (healthUrl, name) => {
  try {
    await axios.get(healthUrl);
    console.log(`🔗 Successfully connected to ${name} at ${healthUrl}`);
    return { name, healthy: true };
  } catch {
    console.warn(`⚠️ Could not connect to ${name} at ${healthUrl}`);
    return { name, healthy: false };
  }
};

// --- POST / ---
const handlePost = async (req, res) => {
  const input = req.body.input;
  const timestamp = new Date().toISOString();
  const axiosConfig = { headers: { 'Content-Type': 'application/json' } };

  if (typeof input !== 'number') {
    return res.status(400).send('Invalid input: meter number must be a number');
  }

  // Step 1: Validate with Desco
  let descoValidationFailed = false;
  try {
    const descoResp = await axios.post(DESCO_VALIDATE_URL, { input }, axiosConfig);
    if (descoResp.status !== 200) {
      console.warn(`[${timestamp}] ⚠️ Desco responded: meter ${input} is INVALID`);
      return res.status(404).send('Bkash → Invalid meter number');
    }
  } catch (descoErr) {
    if (descoErr.response && descoErr.response.status === 404) {
      console.warn(`[${timestamp}] ❌ Desco explicitly said meter ${input} is invalid`);
      return res.status(404).send('Bkash → Invalid meter number');
    } else {
      console.warn(`[${timestamp}] ⚠️ Desco is unreachable: ${descoErr.message}`);
      descoValidationFailed = true;
    }
  }

  if (descoValidationFailed) {
    console.warn(`[${timestamp}] ⚠️ Continuing without Desco validation`);
  }

  // Step 2: Try Kaifa
  try {
    const kaifaResp = await axios.post(KAIFA_URL, { input }, axiosConfig);
    if (kaifaResp.status === 200) {
      return res.send(`Bkash → ${kaifaResp.data}`);
    } else if (kaifaResp.status === 503) {
      console.log(`[${timestamp}] ℹ️ Kaifa cannot handle meter ${input}`);
    } else {
      console.warn(`[${timestamp}] ❌ Unexpected Kaifa response: ${kaifaResp.status}`);
    }
  } catch (kaifaErr) {
    if (kaifaErr.response && kaifaErr.response.status === 503) {
      console.log(`[${timestamp}] ℹ️ Kaifa cannot handle meter ${input}`);
    } else {
      console.warn(`[${timestamp}] ⚠️ Kaifa is unreachable: ${kaifaErr.message}`);
    }
  }

  // Step 3: Try AMS
  try {
    const amsResp = await axios.post(AMS_URL, { input }, axiosConfig);
    if (amsResp.status === 200) {
      return res.send(`Bkash → ${amsResp.data}`);
    } else if (amsResp.status === 503) {
      console.log(`[${timestamp}] ℹ️ AMS cannot handle meter ${input}`);
    } else {
      console.warn(`[${timestamp}] ❌ Unexpected AMS response: ${amsResp.status}`);
    }
  } catch (amsErr) {
    if (amsErr.response && amsErr.response.status === 503) {
      console.log(`[${timestamp}] ℹ️ AMS cannot handle meter ${input}`);
    } else {
      console.warn(`[${timestamp}] ⚠️ AMS is unreachable: ${amsErr.message}`);
    }
  }

  // Final failure
  console.error(`[${timestamp}] ❌ No available services could handle meter ${input}`);
  return res.status(503).send('Bkash → No available service can handle this meter number');
};

// --- GET /health ---
const handleHealthCheck = async (req, res) => {
  const services = [
    { name: 'Kaifa', healthUrl: KAIFA_HEALTH_URL },
    { name: 'AMS', healthUrl: AMS_HEALTH_URL },
    { name: 'Desco', healthUrl: DESCO_HEALTH_URL }
  ];

  const results = await Promise.all(
    services.map(svc => checkHealth(svc.healthUrl, svc.name))
  );

  const unhealthy = results.filter(r => !r.healthy).map(r => r.name);

  if (unhealthy.length === 0) {
    return res.status(200).send('Bkash is healthy');
  }

  if (unhealthy.length === services.length) {
    return res.status(503).send(`Bkash is unhealthy: ${unhealthy.join(', ')} are down`);
  }

  return res
    .status(200)
    .send(`Bkash is healthy but ${unhealthy.join(', ')} ${unhealthy.length > 1 ? 'are' : 'is'} not listening`);
};

// --- Background health log ---
const checkAllServicesHealth = async () => {
  const services = [
    { name: 'Kaifa', healthUrl: KAIFA_HEALTH_URL },
    { name: 'AMS', healthUrl: AMS_HEALTH_URL },
    { name: 'Desco', healthUrl: DESCO_HEALTH_URL }
  ];

  const results = await Promise.all(
    services.map(svc => checkHealth(svc.healthUrl, svc.name))
  );

  const unhealthy = results.filter(r => !r.healthy).map(r => r.name);

  if (unhealthy.length === 0) {
    console.log('✅ Bkash is healthy');
  } else if (unhealthy.length === services.length) {
    console.warn(`⚠️ Bkash is unhealthy: ${unhealthy.join(', ')} are down`);
  } else {
    console.warn(`⚠️ Bkash is partially healthy but ${unhealthy.join(', ')} ${unhealthy.length > 1 ? 'are' : 'is'} not listening`);
  }
};

// --- Export ---
module.exports = {
  handlePost,
  checkHealth,
  handleHealthCheck,
  checkAllServicesHealth
};
