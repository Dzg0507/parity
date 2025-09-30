
const express = require('express');
const {
    updateUserProfile,
    updateNotificationPreferences,
    getPrivacyPolicy,
    getTermsOfService,
    requestDataExport,
    deleteUserAccount,
    getSubscriptionStatus,
    setPremiumStatus
} = require('../../controllers/userController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

// All routes in this file are protected
router.use(protect);

router.put('/profile', updateUserProfile);
router.get('/subscription-status', getSubscriptionStatus);
router.post('/set-premium', setPremiumStatus); // Temporary endpoint for testing
router.put('/notification-preferences', updateNotificationPreferences);
router.get('/privacy-policy', getPrivacyPolicy);
router.get('/terms-of-service', getTermsOfService);
router.post('/data-export-request', requestDataExport);
router.delete('/account', deleteUserAccount);

module.exports = router;