const express = require('express');
const { handlePost, handleHealthCheck, sendDummyMail } = require('../controllers/handler.controller');

const router = express.Router();

router.post('/', handlePost);
router.get('/health', handleHealthCheck);
router.get('/test-mail', sendDummyMail); 

module.exports = router;
