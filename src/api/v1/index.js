
const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/content', require('./contentRoutes'));
router.use('/sessions', require('./sessionRoutes'));
router.use('/subscriptions', require('./subscriptionRoutes'));
router.use('/legal', require('./legalRoutes'));

module.exports = router;