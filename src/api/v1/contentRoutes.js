
const express = require('express');
const {
    getUpliftCategories,
    getUpliftMessages,
    getRelationshipTypes,
    getConversationTopics,
    getSoloPrepPrompts
} = require('../../controllers/contentController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

// Uplift content can be public
router.get('/uplift/categories', getUpliftCategories);
router.get('/uplift/messages', getUpliftMessages); // Also handles search and category filtering

// Unpack setup content requires authentication
router.get('/relationship-types', protect, getRelationshipTypes);
router.get('/conversation-topics', protect, getConversationTopics);
router.get('/prompts', protect, getSoloPrepPrompts);

// Analytics endpoint
router.get('/solo-prep/analytics', protect, (req, res) => {
  try {
    // Mock analytics data for now
    const analytics = {
      totalSessions: 12,
      averageSessionDuration: 15,
      mostUsedPrompts: ['Active Listening', 'I Statements', 'Emotional Validation'],
      weeklyProgress: [
        { week: 'Week 1', sessions: 3 },
        { week: 'Week 2', sessions: 4 },
        { week: 'Week 3', sessions: 5 }
      ],
      moodTrends: {
        confident: 8,
        nervous: 3,
        excited: 6,
        calm: 7
      }
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
});

module.exports = router;