const axios = require('axios');
const Meter = require('../models/Meter');

// ENV URLs
const KAIFA_HOST = process.env.KAIFA_HOST || 'localhost';
const KAIFA_PORT = process.env.KAIFA_PORT || 4000;
const KAIFA_URL = `http://${KAIFA_HOST}:${KAIFA_PORT}`;
const KAIFA_HEALTH_URL = `${KAIFA_URL}/health`;

const AMS_HOST = process.env.AMS_HOST || 'localhost';
const AMS_PORT = process.env.AMS_PORT || 3000;
const AMS_URL = `http://${AMS_HOST}:${AMS_PORT}`;
const AMS_HEALTH_URL = `${AMS_URL}/health`;

const SERVICE_URLS = {
  kaifa: {
    insert: `${KAIFA_URL}/insert`,
    insertMultiple: `${KAIFA_URL}/insert_multiple`,
    health: KAIFA_HEALTH_URL
  },
  ams: {
    insert: `${AMS_URL}/insert`,
    insertMultiple: `${AMS_URL}/insert_multiple`,
    health: AMS_HEALTH_URL
  }
};

// ========== HEALTH CHECK UTILITIES ==========

const checkHealth = async (healthUrl, name) => {
  try {
    await axios.get(healthUrl);
    console.log(`🔗 Successfully connected to ${name} at ${healthUrl}`);
    return { name, healthy: true };
  } catch {
    console.warn(`⚠️  Could not connect to ${name} at ${healthUrl}`);
    return { name, healthy: false };
  }
};

const handleHealthCheck = async (req, res) => {
  const services = [
    { name: 'Kaifa', healthUrl: KAIFA_HEALTH_URL },
    { name: 'AMS', healthUrl: AMS_HEALTH_URL },
  ];

  const results = await Promise.all(
    services.map(svc => checkHealth(svc.healthUrl, svc.name))
  );

  const unhealthy = results.filter(r => !r.healthy).map(r => r.name);

  if (unhealthy.length === 0) {
    return res.status(200).send('Desco is healthy');
  }

  if (unhealthy.length === services.length) {
    return res.status(503).send(`Desco is unhealthy: ${unhealthy.join(', ')} are down`);
  }

  return res.status(200).send(`Desco is healthy but ${unhealthy.join(', ')} ${unhealthy.length > 1 ? 'are' : 'is'} not listening`);
};

const checkAllServicesHealth = async () => {
  const services = [
    { name: 'Kaifa', healthUrl: KAIFA_HEALTH_URL },
    { name: 'AMS', healthUrl: AMS_HEALTH_URL },
  ];

  const results = await Promise.all(
    services.map(svc => checkHealth(svc.healthUrl, svc.name))
  );

  const unhealthy = results.filter(r => !r.healthy).map(r => r.name);

  if (unhealthy.length === 0) {
    console.log('✅ Desco is healthy');
  } else if (unhealthy.length === services.length) {
    console.warn(`⚠️ Desco is unhealthy: ${unhealthy.join(', ')} are down`);
  } else {
    console.warn(`⚠️ Desco is partially healthy but ${unhealthy.join(', ')} ${unhealthy.length > 1 ? 'are' : 'is'} not listening`);
  }
};

// ========== INSERT HELPERS ==========

const filterUnique = async (meters) => {
  const existing = await Meter.find({ meterNo: { $in: meters } }).select('meterNo -_id');
  const existingSet = new Set(existing.map(e => e.meterNo));
  return meters.filter(m => !existingSet.has(m));
};

const insertToService = async (url, data) => {
  try {
    await axios.post(url, data);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data || err.message
    };
  }
};

// ========== CONTROLLER ACTIONS ==========

// POST /:service/insert
const handleInsert = async (req, res) => {
  const { service } = req.params;
  const meterNo = req.body.input;
  const timestamp = new Date().toISOString();

  if (!['kaifa', 'ams'].includes(service)) {
    return res.status(400).send('Invalid service specified');
  }

  if (typeof meterNo !== 'number') {
    return res.status(400).send('Input must be a number');
  }

  try {
    const unique = await filterUnique([meterNo]);
    if (unique.length === 0) {
      return res.status(409).send(`Meter number ${meterNo} already exists`);
    }

    const { success, error } = await insertToService(SERVICE_URLS[service].insert, { input: meterNo });

    if (!success) {
      console.warn(`[${timestamp}] ❌ ${service.toUpperCase()} insert failed: ${error}`);
      return res.status(503).send(`Downstream ${service} failed`);
    }

    await Meter.create({ meterNo });
    return res.status(201).send(`Inserted into ${service} and recorded in Desco`);
  } catch (err) {
    console.error(`[${timestamp}] ❌ Internal error:`, err);
    return res.status(500).send('Internal server error');
  }
};

// POST /:service/insert_multiple
const handleInsertMultiple = async (req, res) => {
  const { service } = req.params;
  const meters = req.body.inputs;
  const timestamp = new Date().toISOString();

  if (!['kaifa', 'ams'].includes(service)) {
    return res.status(400).send('Invalid service specified');
  }

  if (!Array.isArray(meters) || !meters.every(m => typeof m === 'number')) {
    return res.status(400).send('Inputs must be an array of numbers');
  }

  try {
    const unique = await filterUnique(meters);
    if (unique.length === 0) {
      return res.status(409).send('All meter numbers already exist');
    }

    const { success, error } = await insertToService(SERVICE_URLS[service].insertMultiple, { inputs: unique });

    if (!success) {
      console.warn(`[${timestamp}] ❌ ${service.toUpperCase()} bulk insert failed: ${error}`);
      return res.status(503).send(`Downstream ${service} failed`);
    }

    await Meter.insertMany(unique.map(meterNo => ({ meterNo })));
    return res.status(201).send(`Inserted ${unique.length} meters into ${service} and recorded in Desco`);
  } catch (err) {
    console.error(`[${timestamp}] ❌ Error inserting multiple meters:`, err);
    return res.status(500).send('Internal server error');
  }
};

// ========== CONTROLLER ACTIONS ==========

// POST /validate
const validateMeter = async (req, res) => {
  const meterNo = req.body.input;

  if (typeof meterNo !== 'number') {
    return res.status(400).send('Invalid input: meter number must be a number');
  }

  try {
    const exists = await Meter.exists({ meterNo });
    if (exists) {
      return res.status(200).send('Valid');
    } else {
      return res.status(404).send('Invalid');
    }
  } catch (err) {
    console.error('❌ Error validating meter number:', err);
    return res.status(500).send('Internal server error');
  }
};




module.exports = {
  handleInsert,
  handleInsertMultiple,
  checkHealth,
  handleHealthCheck,
  checkAllServicesHealth,
  validateMeter
};
