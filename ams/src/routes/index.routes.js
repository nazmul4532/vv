const express = require('express');
const { handlePost, healthCheck } = require('../controllers/handler.controller');

const router = express.Router();

router.post('/', handlePost);
router.get('/health', healthCheck);

module.exports = router;
