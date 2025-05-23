const Meter = require('../models/Meter');

// POST /
const handlePost = async (req, res) => {
  const meterNo = req.body.input; // expects { "input": 201 }
  const timestamp = new Date().toISOString();

  if (typeof meterNo !== 'number') {
    console.warn(`[${timestamp}] ⚠️ Invalid meterNo received: ${meterNo}`);
    return res.status(400).send('Invalid input: meter number must be a number');
  }

  try {
    const found = await Meter.exists({ meterNo });
    if (found) {
      console.log(`[${timestamp}] Meter no ${meterNo} found — Kaifa is available`);
      return res.status(200).send('I am Kaifa, and I am available. I can handle meter no ' + meterNo);
    } else {
      console.log(`[${timestamp}] Meter no ${meterNo} NOT found — Kaifa cannot handle it`);
      return res.status(503).send('Kaifa cannot handle meter no ' + meterNo);
    }
  } catch (err) {
    console.error(`[${timestamp}] DB error checking meterNo ${meterNo}:`, err);
    return res.status(500).send('Internal server error');
  }
};


// POST /insert
const insertMeter = async (req, res) => {
  const meterNo = req.body.input; // expects { "input": 201 }

  if (typeof meterNo !== 'number') {
    return res.status(400).send('Invalid input: meter number must be a number');
  }

  try {
    const newMeter = new Meter({ meterNo, ams: 'kaifa' });
    await newMeter.save();
    return res.status(201).send(`Meter number ${meterNo} inserted successfully`);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).send('Meter number already exists');
    }
    console.error('DB error on inserting meter:', err);
    return res.status(500).send('Internal server error');
  }
};

// POST /insert_multiple
const insertMultipleMeters = async (req, res) => {
  const meters = req.body.inputs; // expects { "inputs": [201, 202, 203] }

  if (!Array.isArray(meters) || !meters.every(m => typeof m === 'number')) {
    return res.status(400).send('Invalid input: inputs must be an array of numbers');
  }

  const docs = meters.map(meterNo => ({ meterNo, ams: 'kaifa' }));

  try {
    const result = await Meter.insertMany(docs, { ordered: false });
    return res.status(201).send(`Inserted ${result.length} meter numbers successfully`);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).send('Some meter numbers already exist');
    }
    console.error('DB error on inserting multiple meters:', err);
    return res.status(500).send('Internal server error');
  }
};

const healthCheck = (req, res) => {
  res.status(200).send('Kaifa is healthy');
};

module.exports = {
  handlePost,
  insertMeter,
  insertMultipleMeters,
  healthCheck,
};
