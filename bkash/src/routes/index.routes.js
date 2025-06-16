const express = require('express');
const { handlePost, handleHealthCheck } = require('../controllers/handler.controller');

const router = express.Router();

router.post('/', handlePost);
router.get('/health', handleHealthCheck);

module.exports = router;
