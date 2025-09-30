const express = require('express');
const {
    getUpliftCategories,
    getUpliftMessages,
} = require('../../controllers/contentController');

const router = express.Router();

// Direct uplift routes for frontend compatibility
router.get('/categories', getUpliftCategories);
router.get('/messages', getUpliftMessages); // Also handles search and category filtering

module.exports = router;
