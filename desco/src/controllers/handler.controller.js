const axios = require('axios');

const KAIFA_HOST = process.env.KAIFA_HOST || 'localhost';
const KAIFA_PORT = process.env.KAIFA_PORT || 4000;
const KAIFA_URL = `http://${KAIFA_HOST}:${KAIFA_PORT}/`;
const KAIFA_HEALTH_URL = `http://${KAIFA_HOST}:${KAIFA_PORT}/health`;

const AMS_HOST = process.env.AMS_HOST || 'localhost';
const AMS_PORT = process.env.AMS_PORT || 3000;
const AMS_URL = `http://${AMS_HOST}:${AMS_PORT}/`;
const AMS_HEALTH_URL = `http://${AMS_HOST}:${AMS_PORT}/health`;

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

// const handlePost = async (req, res) => {
//   const input = req.body.input;
//   const axiosConfig = { headers: { 'Content-Type': 'application/json' } };

//   // Check health before each request
//   kaifaIsHealthy = await checkHealth(KAIFA_HEALTH_URL, 'Kaifa');
//   amsIsHealthy = await checkHealth(AMS_HEALTH_URL, 'AMS');

//   if (kaifaIsHealthy) {
//     try {
//       const kaifaResp = await axios.post(KAIFA_URL, { input }, axiosConfig);
//       if (kaifaResp.status === 200) {
//         return res.send(`Desco → ${kaifaResp.data}`);
//       }
//     } catch (kaifaErr) {
//       if (kaifaErr.response && kaifaErr.response.status === 503) {
//         console.log('Kaifa returned 503, checking AMS...');
//       } else {
//         return res.status(500).send('Desco → Error contacting Kaifa');
//       }
//     }
//   } else {
//     console.log('Skipping Kaifa POST; service unhealthy');
//   }

//   if (amsIsHealthy) {
//     try {
//       const amsResp = await axios.post(AMS_URL, { input }, axiosConfig);
//       if (amsResp.status === 200) {
//         return res.send(`Desco → ${amsResp.data}`);
//       }
//     } catch {
//       return res.status(503).send('Desco → Nobody can handle this request');
//     }
//   } else {
//     console.log('Skipping AMS POST; service unhealthy');
//     return res.status(503).send('Desco → Nobody can handle this request');
//   }
// };


const handlePost = async (req, res) => {
  const input = req.body.input;
  const axiosConfig = { headers: { 'Content-Type': 'application/json' } };

  try {
    const kaifaResp = await axios.post(KAIFA_URL, { input }, axiosConfig);
    if (kaifaResp.status === 200) {
      return res.send(`Desco → ${kaifaResp.data}`);
    }
  } catch (kaifaErr) {
    if (kaifaErr.response && kaifaErr.response.status === 503) {
      console.log('Kaifa returned 503, checking AMS...');
    } else {
      return res.status(500).send('Desco → Error contacting Kaifa');
    }
  }

  try {
    const amsResp = await axios.post(AMS_URL, { input }, axiosConfig);
    if (amsResp.status === 200) {
      return res.send(`Desco → ${amsResp.data}`);
    }
  } catch {
    return res.status(503).send('Desco → Nobody can handle this request');
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

  const unhealthyServices = results.filter(r => !r.healthy).map(r => r.name);

  if (unhealthyServices.length === 0) {
    return res.status(200).send('Desco is healthy');
  }

  if (unhealthyServices.length === services.length) {
    return res.status(503).send(`Desco is unhealthy: ${unhealthyServices.join(', ')} are down`);
  }

  return res
    .status(200)
    .send(`Desco is healthy but ${unhealthyServices.join(', ')} ${unhealthyServices.length > 1 ? 'are' : 'is'} not listening`);
};




const checkAllServicesHealth = async () => {
  const services = [
    { name: 'Kaifa', healthUrl: KAIFA_HEALTH_URL },
    { name: 'AMS', healthUrl: AMS_HEALTH_URL },
  ];

  const results = await Promise.all(
    services.map(svc => checkHealth(svc.healthUrl, svc.name))
  );

  const unhealthyServices = results.filter(r => !r.healthy).map(r => r.name);

  if (unhealthyServices.length === 0) {
    console.log('✅ Desco is healthy');
  } else if (unhealthyServices.length === services.length) {
    console.warn(`⚠️ Desco is unhealthy: ${unhealthyServices.join(', ')} are down`);
  } else {
    console.warn(`⚠️ Desco is partially healthy but ${unhealthyServices.join(', ')} ${unhealthyServices.length > 1 ? 'are' : 'is'} not listening`);
  }
};

module.exports = { handlePost, checkHealth, handleHealthCheck, checkAllServicesHealth };

