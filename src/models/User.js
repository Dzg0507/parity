
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,

        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },
    password: {
        type: String,
        minlength: 6,
        select: false, // Do not return password by default
    },
    socialProvider: {
        type: String,
        enum: ['google', 'apple', null],
        default: null,
    },
    socialProviderId: {
        type: String,
        default: null,
    },
    subscription: {
        status: {
            type: String,
            enum: ['free', 'premium_monthly', 'premium_annual', 'trial'],
            default: 'trial',
        },
        expiresAt: {
            type: Date,
            default: null,
        },
        iapReceipt: {
            type: String, // Store the latest receipt for verification
            default: null,
        }
    },
    soloPrepTrialCount: {
        type: Number,
        default: 1, // As per freemium model
    },
    notificationPreferences: {
        pushEnabled: { type: Boolean, default: true },
        emailEnabled: { type: Boolean, default: true },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true,
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire time (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};


module.exports = mongoose.model('User', UserSchema);