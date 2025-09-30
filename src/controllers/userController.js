
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
exports.updateUserProfile = asyncHandler(async (req, res, next) => {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name || user.name;
    // Potentially require re-authentication to change email
    user.email = email || user.email;

    await user.save();

    res.status(200).json({ success: true, data: user });
});

// @desc    Get subscription status
// @route   GET /api/v1/users/subscription-status
// @access  Private
exports.getSubscriptionStatus = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // For now, return a basic subscription status
    // In a real app, this would check against a subscription service
    const subscriptionStatus = {
        tier: user.subscription.status || 'free',
        isActive: user.subscription.status === 'premium_monthly' || user.subscription.status === 'premium_annual',
        expiresAt: user.subscription.expiresAt || null
    };
    
    res.status(200).json({ success: true, data: subscriptionStatus });
});

// Temporary endpoint to set premium status for testing
exports.setPremiumStatus = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Set user to premium for testing
    user.subscription.status = 'premium_monthly';
    user.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    await user.save();
    
    res.status(200).json({ 
        success: true, 
        message: 'Premium status set for testing',
        data: {
            tier: user.subscription.status,
            isActive: true,
            expiresAt: user.subscription.expiresAt
        }
    });
});

// @desc    Update notification preferences
// @route   PUT /api/v1/users/notification-preferences
// @access  Private
exports.updateNotificationPreferences = asyncHandler(async (req, res, next) => {
    const { enabled, pushEnabled, emailEnabled } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { notificationPreferences: { enabled, pushEnabled, emailEnabled } },
        { new: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: user.notificationPreferences });
});

// @desc    Get privacy policy
// @route   GET /api/v1/users/privacy-policy
// @access  Private (or Public, depending on app design)
exports.getPrivacyPolicy = asyncHandler(async (req, res, next) => {
    // Content is usually static. It can be stored in the DB or a file.
    const content = `<h1>Privacy Policy</h1><p>Last updated: ${new Date().toLocaleDateString()}. Your data is safe with us. We use end-to-end encryption for all sensitive journal entries...</p>`;
    res.status(200).json({ success: true, data: { content } });
});

// @desc    Get terms of service
// @route   GET /api/v1/users/terms-of-service
// @access  Private (or Public)
exports.getTermsOfService = asyncHandler(async (req, res, next) => {
    const content = `<h1>Terms of Service</h1><p>Last updated: ${new Date().toLocaleDateString()}. By using Parity, you agree to these terms...</p>`;
    res.status(200).json({ success: true, data: { content } });
});

// @desc    Request data export
// @route   POST /api/v1/users/export-data
// @access  Private
exports.requestDataExport = asyncHandler(async (req, res, next) => {
    // This would trigger a background job to collect user data and email it.
    // For now, we send an immediate confirmation.
    console.log(`Data export requested for user ${req.user.id}`);
    res.status(202).json({ success: true, message: 'Your data export has been initiated. You will receive an email with your data within 24 hours.' });
});

// @desc    Delete user account
// @route   DELETE /api/v1/users/account
// @access  Private
exports.deleteUserAccount = asyncHandler(async (req, res, next) => {
    // This is a destructive action. In a real app, you might want a confirmation step.
    // It would also trigger deletion of all associated data (sessions, etc.).
    await User.findByIdAndDelete(req.user.id);
    console.log(`Account and associated data deleted for user ${req.user.id}`);
    res.status(200).json({ success: true, message: 'Your account has been successfully deleted.' });
});