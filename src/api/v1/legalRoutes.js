const express = require('express');
const {
    getPrivacyPolicy,
    getTermsOfService
} = require('../../controllers/userController');

const router = express.Router();

// Legal content routes (can be public)
router.get('/privacy-policy', getPrivacyPolicy);
router.get('/terms-of-service', getTermsOfService);

module.exports = router;
