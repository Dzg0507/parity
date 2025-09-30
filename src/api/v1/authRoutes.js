
const express = require('express');
const {
    register,
    login,
    socialLogin,
    requestPasswordReset,
    confirmPasswordReset
} = require('../../controllers/authController');
const { protect } = require('../../middleware/authMiddleware');
const { body } = require('express-validator');

const router = express.Router();

router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ],
    register
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').exists().withMessage('Password is required')
    ],
    login
);

router.post(
    '/social-login',
    [
        body('token').notEmpty().withMessage('Social token is required'),
        body('provider').isIn(['google', 'apple']).withMessage('Invalid social provider'),
        body('email').isEmail().withMessage('Email is required'),
        body('name').notEmpty().withMessage('Name is required'),
    ],
    socialLogin
);

router.post('/request-password-reset', [body('email').isEmail()], requestPasswordReset);
router.post('/confirm-password-reset', [body('token').notEmpty(), body('newPassword').isLength({ min: 6 })], confirmPasswordReset);


module.exports = router;