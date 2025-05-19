const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5050;

const KAIFA_HOST = process.env.KAIFA_HOST || 'localhost';
const KAIFA_PORT = process.env.KAIFA_PORT || 4000;
const KAIFA_URL = `http://${KAIFA_HOST}:${KAIFA_PORT}/`;

const AMS_HOST = process.env.AMS_HOST || 'localhost';
const AMS_PORT = process.env.AMS_PORT || 3000;
const AMS_URL = `http://${AMS_HOST}:${AMS_PORT}/`;

app.use(express.json());

app.post('/', async (req, res) => {
  const input = req.body.input;
  const axiosConfig = {
    headers: { 'Content-Type': 'application/json' }
  };

  try {
    // Attempt to process with Kaifa
    const kaifaResp = await axios.post(KAIFA_URL, { input }, axiosConfig);
    if (kaifaResp.status === 200) {
      return res.send(`Desco → ${kaifaResp.data}`);
    }
  } catch (kaifaErr) {
    if (kaifaErr.response && kaifaErr.response.status === 503) {
      console.log('Kaifa unavailable, checking AMS...');
    } else {
      return res.status(500).send('Desco → Error contacting Kaifa');
    }
  }

  try {
    // Attempt to process with AMS
    const amsResp = await axios.post(AMS_URL, { input }, axiosConfig);
    if (amsResp.status === 200) {
      return res.send(`Desco → ${amsResp.data}`);
    }
  } catch (amsErr) {
    return res.status(503).send('Desco → Nobody can handle this request');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Desco running on port ${PORT}`);
  console.log(`🔗 KAIFA_URL: ${KAIFA_URL}`);
  console.log(`🔗 AMS_URL: ${AMS_URL}`);
});
