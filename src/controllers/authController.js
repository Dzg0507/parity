
const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { validationResult } = require('express-validator');

// @desc    Register user with email/password
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.socialProvider) {
        return res.status(401).json({ success: false, message: `Please log in with ${user.socialProvider}` });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
});

// @desc    Login/Register with social provider
// @route   POST /api/v1/auth/social
// @access  Public
exports.socialLogin = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token, provider, email, name, socialId } = req.body;

    // In a real app, you would verify the token with Google/Apple's servers here.
    // e.g., using google-auth-library or similar for Apple.
    // For this example, we'll trust the client-provided details.

    let user = await User.findOne({ email });

    if (user) {
        // User exists, log them in
        if (user.socialProvider !== provider) {
            return res.status(400).json({ success: false, message: `Account exists. Please log in with ${user.socialProvider || 'your password'}.` });
        }
    } else {
        // New user, register them
        user = await User.create({
            name,
            email,
            socialProvider: provider,
            socialProviderId: socialId, // The verified ID from the token
        });
    }

    sendTokenResponse(user, user.isNew ? 201 : 200, res);
});

// @desc    Request password reset
// @route   POST /api/v1/auth/request-password-reset
// @access  Public
exports.requestPasswordReset = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        // To prevent user enumeration, send a success response even if user doesn't exist
        return res.status(200).json({ success: true, data: 'If an account with that email exists, a reset link has been sent.' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // In a real app, you would send an email with the reset token here.
    console.log(`Password reset token for ${user.email}: ${resetToken}`);

    res.status(200).json({ success: true, data: 'Password reset link sent.' });
});

// @desc    Confirm password reset
// @route   PUT /api/v1/auth/confirm-password-reset/:resettoken
// @access  Public
exports.confirmPasswordReset = asyncHandler(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
});


// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token });
};