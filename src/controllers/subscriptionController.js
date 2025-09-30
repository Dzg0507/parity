
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get user's subscription status
// @route   GET /api/v1/subscriptions/status
// @access  Private
exports.getSubscriptionStatus = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('subscription');
    res.status(200).json({ success: true, data: user.subscription });
});


// @desc    Process an in-app purchase receipt
// @route   POST /api/v1/subscriptions/purchase
// @access  Private
exports.processSubscriptionPurchase = asyncHandler(async (req, res, next) => {
    const { receipt, productId } = req.body; // e.g., 'parity.premium.monthly'

    // 1. Validate receipt with Apple/Google servers. This is a complex process.
    // For this example, we will assume the receipt is valid.
    const isValid = true; // Mock validation

    if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid purchase receipt.' });
    }

    // 2. Update user subscription status
    const user = await User.findById(req.user.id);
    user.subscription.status = productId.includes('annual') ? 'premium_annual' : 'premium_monthly';
    user.subscription.iapReceipt = receipt;

    // Set expiry date based on product ID
    const expiry = new Date();
    if (productId.includes('monthly')) {
        expiry.setMonth(expiry.getMonth() + 1);
    } else {
        expiry.setFullYear(expiry.getFullYear() + 1);
    }
    user.subscription.expiresAt = expiry;

    await user.save();

    res.status(200).json({ success: true, data: user.subscription });
});
// @desc    Restore user purchases
// @route   POST /api/v1/subscriptions/restore
// @access  Private
exports.restorePurchases = asyncHandler(async (req, res, next) => {
    const { receipt } = req.body;

    // 1. Re-validate the receipt to get the latest subscription status.
    const isValid = true; // Mock validation

    if (!isValid) {
        return res.status(400).json({ success: false, message: 'Could not restore purchases with this receipt.' });
    }

    // 2. Update the user's subscription based on the validated receipt data
    const user = await User.findById(req.user.id);

    // Mocking update, in reality you'd parse the validated receipt for product ID and expiry
    user.subscription.status = 'premium_monthly';
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);
    user.subscription.expiresAt = expiry;
    user.subscription.iapReceipt = receipt;

    await user.save();

    res.status(200).json({ success: true, data: user.subscription });
});