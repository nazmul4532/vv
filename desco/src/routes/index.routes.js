const express = require('express');
const {
  handleInsert,
  handleInsertMultiple,
  handleHealthCheck,
  validateMeter
} = require('../controllers/handler.controller');

const router = express.Router();

// Route format: /kaifa/insert, /ams/insert
router.post('/:service/insert', handleInsert);

// Route format: /kaifa/insert_multiple, /ams/insert_multiple
router.post('/:service/insert_multiple', handleInsertMultiple);

// Health check for Desco itself and downstream services
router.get('/health', handleHealthCheck);

// Validate meter data for Bkash
router.post('/validate', validateMeter);

module.exports = router;
