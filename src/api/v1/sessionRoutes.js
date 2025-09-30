
const express = require('express');
const {
    createSoloPrepSession,
    saveSoloPrepJournalEntry,
    generateSoloPrepBriefing,
    getSoloPrepBriefing,
    getSoloPrepPrompts,
    getSoloPrepSessionHistory,
    getSoloPrepSessionDetails,
    deleteSoloPrepSession,
    getSoloPrepTrialStatus,
    convertSoloPrepToJointUnpack,
    generateJointUnpackInvitation,
    getJointUnpackInviteeStatus,
    accessJointUnpackSessionAsGuest,
    getJointUnpackGuestPrompts,
    saveJointUnpackInviteeResponse,
    confirmReadyToReveal,
    getJointUnpackMutualResponses,
    generateConversationAgenda,
    getConversationAgenda,
    deleteJointUnpackSession,
    // NEW: Advanced AI Features
    getRealTimeCoaching,
    getUserPatterns,
    getContentRecommendations,
    getSessionAnalytics,
} = require('../../controllers/sessionController');
const { protect, isPremium } = require('../../middleware/authMiddleware');

const router = express.Router();

// --- Solo Prep Routes ---
router.post('/sessions', protect, createSoloPrepSession);
router.get('/sessions/history', protect, getSoloPrepSessionHistory);
router.get('/sessions/:id', protect, getSoloPrepSessionDetails);
router.get('/sessions/:id/prompts', protect, getSoloPrepPrompts);
router.put('/sessions/:id/journal', protect, saveSoloPrepJournalEntry);
router.post('/sessions/:id/generate-briefing', protect, generateSoloPrepBriefing);
router.get('/sessions/:id/briefing', protect, getSoloPrepBriefing);
router.delete('/sessions/:id', protect, deleteSoloPrepSession);
router.get('/trial-status', protect, getSoloPrepTrialStatus);

// --- NEW: Advanced AI Features ---
router.post('/real-time-coaching', protect, getRealTimeCoaching);
router.get('/user-patterns', protect, getUserPatterns);
router.post('/content-recommendations', protect, getContentRecommendations);
router.get('/analytics', protect, getSessionAnalytics);

// --- Joint Unpack Routes ---
router.post('/from-solo-prep/:soloPrepId', protect, isPremium, convertSoloPrepToJointUnpack);

// The following routes could be nested under /joint-unpack/:id, but flattened for clarity
router.post('/sessions/:id/invite', protect, isPremium, generateJointUnpackInvitation);
router.get('/sessions/:id/invitee-status', protect, getJointUnpackInviteeStatus);
router.post('/sessions/:id/ready-to-reveal', protect, confirmReadyToReveal);
router.get('/sessions/:id/mutual-responses', protect, getJointUnpackMutualResponses);
router.post('/sessions/:id/agenda', protect, generateConversationAgenda);
router.get('/sessions/:id/agenda', protect, getConversationAgenda);
router.delete('/sessions/:id', protect, deleteJointUnpackSession);


// --- Guest Routes (Public but token-based) ---
router.post('/guest/access', accessJointUnpackSessionAsGuest);
router.get('/guest/sessions/:id/prompts', getJointUnpackGuestPrompts);
router.post('/guest/sessions/:id/response', saveJointUnpackInviteeResponse);


module.exports = router;