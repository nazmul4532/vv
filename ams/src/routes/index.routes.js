const express = require('express');
const {
  handlePost,
  insertMeter,
  insertMultipleMeters,
  healthCheck
} = require('../controllers/handler.controller');

const router = express.Router();

router.post('/', handlePost);
router.post('/insert', insertMeter);
router.post('/insert_multiple', insertMultipleMeters);
router.get('/health', healthCheck);

module.exports = router;
