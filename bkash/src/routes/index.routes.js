const express = require('express');
const { handlePost, handleHealthCheck } = require('../controllers/handler.controller');
const { sendDummyMail } = require('../controllers/logMonitor.controller');

const router = express.Router();

router.post('/', handlePost);
router.get('/health', handleHealthCheck);
router.get('/test-mail', sendDummyMail); 

module.exports = router;
