const KAIFA_HOST = process.env.KAIFA_HOST || 'localhost';
const KAIFA_PORT = process.env.KAIFA_PORT || 4000;
const KAIFA_BASE = `http://${KAIFA_HOST}:${KAIFA_PORT}`;

const AMS_HOST = process.env.AMS_HOST || 'localhost';
const AMS_PORT = process.env.AMS_PORT || 3000;
const AMS_BASE = `http://${AMS_HOST}:${AMS_PORT}`;

const DESCO_HOST = process.env.DESCO_HOST || 'localhost';
const DESCO_PORT = process.env.DESCO_PORT || 5050;
const DESCO_BASE = `http://${DESCO_HOST}:${DESCO_PORT}`;

module.exports = {
  // Kaifa
  KAIFA_BASE,
  KAIFA_URL: `${KAIFA_BASE}/`,
  KAIFA_HEALTH_URL: `${KAIFA_BASE}/health`,

  // AMS
  AMS_BASE,
  AMS_URL: `${AMS_BASE}/`,
  AMS_HEALTH_URL: `${AMS_BASE}/health`,

  // Desco
  DESCO_BASE,
  DESCO_URL: `${DESCO_BASE}/`,
  DESCO_HEALTH_URL: `${DESCO_BASE}/health`,
  DESCO_VALIDATE_URL: `${DESCO_BASE}/validate` // ✅ Added here
};
