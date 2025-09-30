
const express = require('express');
const {
    getSubscriptionStatus,
    processSubscriptionPurchase,
    restorePurchases
} = require('../../controllers/subscriptionController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/status', getSubscriptionStatus);
router.post('/purchase', processSubscriptionPurchase);
router.post('/restore', restorePurchases);

module.exports = router;