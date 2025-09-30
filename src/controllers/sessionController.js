
const SoloPrepSession = require('../models/SoloPrepSession');
const JointUnpackSession = require('../models/JointUnpackSession');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { v4: uuidv4 } = require('uuid');
const AdvancedAICoach = require('../utils/aiCoach');

// Initialize AI Coach
const aiCoach = new AdvancedAICoach();

// --- Solo Prep Controllers ---

exports.createSoloPrepSession = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    // Check trial or premium status
    // Only block if user is on trial AND has used up their trial sessions
    // Premium users (premium_monthly, premium_annual) should have unlimited access
    if (user.subscription.status === 'trial' && user.soloPrepTrialCount <= 0) {
        return res.status(402).json({ success: false, message: 'Please upgrade to premium to create more sessions.' });
    }
    
    // Premium users have unlimited access - no restrictions
    if (user.subscription.status === 'premium_monthly' || user.subscription.status === 'premium_annual') {
        // Premium users can create unlimited sessions - no trial count check needed
    }

    const { relationshipType, conversationTopic, conversationData } = req.body;
    const session = await SoloPrepSession.create({
        user: req.user.id,
        relationshipType,
        conversationTopic,
        conversationData: conversationData || {}
    });

    // Decrement trial count only for trial users (not premium users)
    if (user.subscription.status === 'trial') {
        user.soloPrepTrialCount -= 1;
        await user.save();
    }
    // Premium users don't need trial count decremented - they have unlimited access

    res.status(201).json({ success: true, data: session });
});

exports.saveSoloPrepJournalEntry = asyncHandler(async (req, res) => {
    const { promptId, promptText, encryptedResponse } = req.body;
    const session = await SoloPrepSession.findById(req.params.id);

    if (!session || session.user.toString() !== req.user.id) {
        return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const existingEntryIndex = session.journalEntries.findIndex(entry => entry.promptId.toString() === promptId);

    if (existingEntryIndex > -1) {
        session.journalEntries[existingEntryIndex].encryptedResponse = encryptedResponse;
    } else {
        session.journalEntries.push({ promptId, promptText, encryptedResponse });
    }

    await session.save();
    res.status(200).json({ success: true, data: session });
});

exports.generateSoloPrepBriefing = asyncHandler(async (req, res) => {
    const session = await SoloPrepSession.findById(req.params.id);

    if (!session || session.user.toString() !== req.user.id) {
        return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Get user profile for personalization
    const user = await User.findById(req.user.id);
    const userProfile = {
        name: user.name,
        communicationStyle: user.communicationStyle || 'collaborative',
        experienceLevel: user.soloPrepTrialCount < 1 ? 'experienced' : 'new'
    };

    // Generate AI-powered strategy briefing
    const briefing = await aiCoach.generateStrategyBriefing(
        session.journalEntries,
        session.relationshipType,
        session.conversationTopic,
        userProfile
    );

    // Store the briefing (in production, this would be encrypted)
    session.generatedBriefing = {
        encryptedContent: JSON.stringify(briefing), // In production, encrypt this
        isGenerated: true,
        generatedAt: new Date(),
        aiVersion: 'qwen/qwen3-32b'
    };
    session.status = 'completed';
    await session.save();

    res.status(200).json({ 
        success: true, 
        data: {
            briefing: briefing,
            sessionId: session._id,
            generatedAt: session.generatedBriefing.generatedAt
        }
    });
});

exports.getSoloPrepBriefing = asyncHandler(async (req, res) => {
    const session = await SoloPrepSession.findById(req.params.id);
     if (!session || session.user.toString() !== req.user.id || !session.generatedBriefing.isGenerated) {
        return res.status(404).json({ success: false, message: 'Briefing not found or not generated' });
    }
    res.status(200).json({ success: true, data: session.generatedBriefing });
});

exports.getSoloPrepPrompts = asyncHandler(async (req, res) => {
    console.log('getSoloPrepPrompts - req.params.id:', req.params.id, 'type:', typeof req.params.id);
    
    // Check if sessionId is valid
    if (!req.params.id || typeof req.params.id !== 'string') {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid session ID provided' 
        });
    }
    
    const session = await SoloPrepSession.findById(req.params.id);

    if (!session || session.user.toString() !== req.user.id) {
        return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Get user's conversation history for personalization
    const userHistory = await SoloPrepSession.find({ 
        user: req.user.id, 
        _id: { $ne: session._id } 
    }).sort('-createdAt').limit(5);

    // Generate AI-powered personalized prompts using conversation data
    const prompts = await aiCoach.generatePrompts(
        session.relationshipType, 
        session.conversationTopic,
        JSON.stringify(session.conversationData), // Pass conversation data as context
        userHistory.map(s => ({
            relationshipType: s.relationshipType,
            topic: s.conversationTopic,
            entries: s.journalEntries.length
        }))
    );
    
    res.status(200).json({ 
        success: true, 
        data: {
            prompts,
            relationshipType: session.relationshipType,
            conversationTopic: session.conversationTopic,
            journalEntries: session.journalEntries,
            aiGenerated: true
        }
    });
});

// Helper function to generate prompts based on relationship and topic
function generatePromptsForSession(relationshipType, conversationTopic) {
    const basePrompts = {
        'romantic partner': [
            {
                id: '1',
                question: `What are your main concerns about ${conversationTopic} in your relationship?`,
                for: 'solo'
            },
            {
                id: '2', 
                question: `How do you think your partner feels about ${conversationTopic}?`,
                for: 'solo'
            },
            {
                id: '3',
                question: `What outcome are you hoping for from this conversation about ${conversationTopic}?`,
                for: 'solo'
            },
            {
                id: '4',
                question: `What's the best way to approach this topic with your partner?`,
                for: 'solo'
            }
        ],
        'family member': [
            {
                id: '1',
                question: `What are your main concerns about ${conversationTopic} with your family?`,
                for: 'solo'
            },
            {
                id: '2',
                question: `How do you think your family member feels about ${conversationTopic}?`,
                for: 'solo'
            },
            {
                id: '3',
                question: `What outcome are you hoping for from this conversation?`,
                for: 'solo'
            },
            {
                id: '4',
                question: `What's the best way to approach this topic with your family?`,
                for: 'solo'
            }
        ],
        'friend': [
            {
                id: '1',
                question: `What are your main concerns about ${conversationTopic} with your friend?`,
                for: 'solo'
            },
            {
                id: '2',
                question: `How do you think your friend feels about ${conversationTopic}?`,
                for: 'solo'
            },
            {
                id: '3',
                question: `What outcome are you hoping for from this conversation?`,
                for: 'solo'
            },
            {
                id: '4',
                question: `What's the best way to approach this topic with your friend?`,
                for: 'solo'
            }
        ]
    };

    return basePrompts[relationshipType] || basePrompts['friend'];
}

exports.getSoloPrepSessionHistory = asyncHandler(async (req, res) => {
    const sessions = await SoloPrepSession.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, data: sessions });
});

exports.getSoloPrepSessionDetails = asyncHandler(async (req, res) => {
    const session = await SoloPrepSession.findById(req.params.id);
    if (!session || session.user.toString() !== req.user.id) {
        return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.status(200).json({ success: true, data: session });
});

exports.deleteSoloPrepSession = asyncHandler(async (req, res) => {
    const session = await SoloPrepSession.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
    }
    await session.deleteOne();
    res.status(200).json({ success: true, message: 'Session deleted' });
});


// --- Joint Unpack Controllers ---

exports.convertSoloPrepToJointUnpack = asyncHandler(async (req, res) => {
    const soloSession = await SoloPrepSession.findOne({ _id: req.params.soloPrepId, user: req.user.id });
    if (!soloSession || soloSession.status !== 'completed') {
        return res.status(400).json({ success: false, message: 'Solo Prep session must be completed first.' });
    }
    if (soloSession.status === 'converted') {
        const existingJointSession = await JointUnpackSession.findOne({ soloPrepSession: soloSession._id });
        return res.status(200).json({ success: true, data: existingJointSession });
    }

    const token = uuidv4();
    const expires = new Date(Date.now() + process.env.INVITE_TOKEN_EXPIRES_IN_HOURS * 60 * 60 * 1000);

    const jointSession = await JointUnpackSession.create({
        soloPrepSession: soloSession._id,
        initiator: req.user.id,
        invitation: { token, expiresAt: expires }
    });

    soloSession.status = 'converted';
    await soloSession.save();

    res.status(201).json({ success: true, data: jointSession });
});

exports.generateJointUnpackInvitation = asyncHandler(async (req, res) => {
    // This endpoint is conceptually similar to convert, but can be used to re-generate a link or get details
    const jointSession = await JointUnpackSession.findOne({ _id: req.params.id, initiator: req.user.id });
     if (!jointSession) {
        return res.status(404).json({ success: false, message: 'Joint Unpack session not found' });
    }
    // Logic to regenerate token could be added here if needed.
    const invitationLink = `https://app.parity.com/join/${jointSession.invitation.token}`;
    res.status(200).json({ success: true, data: { invitationLink, token: jointSession.invitation.token } });
});


exports.getJointUnpackInviteeStatus = asyncHandler(async (req, res) => {
    const session = await JointUnpackSession.findOne({ _id: req.params.id, initiator: req.user.id });
     if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.status(200).json({ success: true, data: { status: session.invitation.status } });
});

exports.accessJointUnpackSessionAsGuest = asyncHandler(async (req, res) => {
    const { invitationToken } = req.body;
    
    if (!invitationToken) {
        return res.status(400).json({ success: false, message: 'Invitation token is required.' });
    }

    const session = await JointUnpackSession.findOne({
        'invitation.token': invitationToken,
        'invitation.expiresAt': { $gt: new Date() }
    }).populate({ path: 'soloPrepSession', select: 'relationshipType conversationTopic' });

    if (!session) {
        return res.status(404).json({ success: false, message: 'Invitation is invalid or has expired.' });
    }

    session.invitation.status = 'accepted';
    await session.save();

    // Only return non-sensitive data
    const guestView = {
        sessionId: session._id,
        relationshipType: session.soloPrepSession.relationshipType,
        conversationTopic: session.soloPrepSession.conversationTopic,
        // We do not send back any initiator or invitee responses here
    };

    res.status(200).json({ success: true, data: guestView });
});

exports.getJointUnpackGuestPrompts = asyncHandler(async (req, res) => {
    const session = await JointUnpackSession.findById(req.params.id)
        .populate({ path: 'soloPrepSession', select: 'relationshipType conversationTopic' });

    if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    // Get prompts for invitee (similar to solo prep but for invitee perspective)
    const { relationshipType, conversationTopic } = session.soloPrepSession;
    
    // In a real app, this would query the Prompt model based on these filters
    // For now, return mock prompts for invitee
    const prompts = [
        { promptId: 'p1', text: 'What is the core issue from your perspective?', for: 'invitee' },
        { promptId: 'p2', text: 'How does this situation make you feel?', for: 'invitee' },
        { promptId: 'p3', text: 'What outcome are you hoping for?', for: 'invitee' },
        { promptId: 'p4', text: 'How do you believe the other person sees this situation?', for: 'invitee' },
    ];

    res.status(200).json({ success: true, data: prompts });
});

exports.saveJointUnpackInviteeResponse = asyncHandler(async (req, res) => {
    const { promptId, response } = req.body; // Expecting individual prompt response
    const session = await JointUnpackSession.findById(req.params.id);

    if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    // Initialize inviteeResponses if it doesn't exist
    if (!session.inviteeResponses) {
        session.inviteeResponses = [];
    }

    // Update or add the response
    const existingResponseIndex = session.inviteeResponses.findIndex(r => r.promptId === promptId);
    if (existingResponseIndex > -1) {
        session.inviteeResponses[existingResponseIndex].response = response;
    } else {
        session.inviteeResponses.push({ promptId, response });
    }

    session.invitation.status = 'completed'; // Invitee has submitted their side
    await session.save();

    res.status(200).json({ success: true, message: 'Response saved.' });
});

exports.confirmReadyToReveal = asyncHandler(async (req, res) => {
    // This needs to handle both initiator and guest confirmation
    const { token } = req.body; // guest provides token, initiator is authenticated
    let session;
    let isInitiator = false;

    if (req.user) { // Initiator's request
        session = await JointUnpackSession.findOne({ _id: req.params.id, initiator: req.user.id });
        if (session) {
            session.revealStatus.initiatorReady = true;
            isInitiator = true;
        }
    } else if (token) { // Invitee's request
        session = await JointUnpackSession.findOne({ 'invitation.token': token });
        if (session) session.revealStatus.inviteeReady = true;
    }

    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    await session.save();

    res.status(200).json({ success: true, message: `Your readiness is confirmed. Waiting for the other person.` });
});


exports.getJointUnpackMutualResponses = asyncHandler(async (req, res) => {
    const session = await JointUnpackSession.findOne({ _id: req.params.id, initiator: req.user.id })
        .populate({ path: 'soloPrepSession', select: 'journalEntries' });

    if (!session) {
         return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (!session.revealStatus.initiatorReady || !session.revealStatus.inviteeReady) {
        return res.status(403).json({ success: false, message: 'Both parties must be ready to reveal.' });
    }

    const responseData = {
        initiatorResponses: session.soloPrepSession.journalEntries,
        inviteeResponses: session.inviteeResponses,
    };

    res.status(200).json({ success: true, data: responseData });
});

exports.generateConversationAgenda = asyncHandler(async (req, res) => {
    const session = await JointUnpackSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    if (!session.revealStatus.initiatorReady || !session.revealStatus.inviteeReady) {
        return res.status(403).json({ success: false, message: 'Cannot generate agenda before mutual reveal.' });
    }

    session.generatedAgenda = {
        encryptedContent: `ENCRYPTED_AGENDA_FOR_${session._id}`,
        isGenerated: true,
    };
    await session.save();

    res.status(200).json({ success: true, data: session.generatedAgenda });
});

exports.getConversationAgenda = asyncHandler(async (req, res) => {
    const session = await JointUnpackSession.findById(req.params.id);
     if (!session || !session.generatedAgenda.isGenerated) {
        return res.status(404).json({ success: false, message: 'Agenda not found or not generated' });
    }
    res.status(200).json({ success: true, data: session.generatedAgenda });
});

exports.deleteJointUnpackSession = asyncHandler(async (req, res) => {
    // More complex logic needed here for multi-party confirmation in a real app
    const session = await JointUnpackSession.findOne({ _id: req.params.id, initiator: req.user.id });
     if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
    }
    await session.deleteOne();
    res.status(200).json({ success: true, message: 'Session deleted' });
});

// @desc    Get solo prep trial status
// @route   GET /api/v1/solo-prep/trial-status
// @access  Private
exports.getSoloPrepTrialStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const trialStatus = {
        usedSessions: Math.max(0, 1 - user.soloPrepTrialCount), // Calculate used sessions
        remainingTrials: Math.max(0, user.soloPrepTrialCount),
        isPremium: user.subscription.status === 'premium_monthly' || user.subscription.status === 'premium_annual'
    };
    
    res.status(200).json({ success: true, data: trialStatus });
});

// NEW: Real-time AI Coaching
exports.getRealTimeCoaching = asyncHandler(async (req, res) => {
    const { conversationContext, currentMood, relationshipType } = req.body;
    
    const coaching = await aiCoach.provideRealTimeCoaching(
        conversationContext,
        currentMood,
        relationshipType
    );
    
    res.status(200).json({ 
        success: true, 
        data: { 
            coaching,
            timestamp: new Date(),
            aiVersion: 'qwen/qwen3-32b'
        }
    });
});

// NEW: User Pattern Analysis
exports.getUserPatterns = asyncHandler(async (req, res) => {
    const userHistory = await SoloPrepSession.find({ user: req.user.id })
        .sort('-createdAt')
        .limit(20);
    
    const patterns = await aiCoach.analyzeUserPatterns(req.user.id, userHistory);
    
    res.status(200).json({ 
        success: true, 
        data: patterns || { message: 'Not enough data for pattern analysis yet' }
    });
});

// NEW: Smart Content Recommendations
exports.getContentRecommendations = asyncHandler(async (req, res) => {
    const { currentMood, relationshipType } = req.body;
    const user = await User.findById(req.user.id);
    
    const userProfile = {
        name: user.name,
        communicationStyle: user.communicationStyle || 'collaborative',
        experienceLevel: user.soloPrepTrialCount < 1 ? 'experienced' : 'new'
    };
    
    const recommendations = await aiCoach.generateContentRecommendations(
        userProfile,
        currentMood,
        relationshipType
    );
    
    res.status(200).json({ 
        success: true, 
        data: recommendations
    });
});

// NEW: Advanced Analytics
exports.getSessionAnalytics = asyncHandler(async (req, res) => {
    const sessions = await SoloPrepSession.find({ user: req.user.id })
        .sort('-createdAt')
        .limit(50);
    
    const analytics = {
        totalSessions: sessions.length,
        completedSessions: sessions.filter(s => s.status === 'completed').length,
        relationshipTypes: [...new Set(sessions.map(s => s.relationshipType))],
        topics: [...new Set(sessions.map(s => s.conversationTopic))],
        averageEntriesPerSession: sessions.reduce((acc, s) => acc + s.journalEntries.length, 0) / sessions.length,
        mostActiveDay: this.getMostActiveDay(sessions),
        improvementTrend: this.calculateImprovementTrend(sessions)
    };
    
    res.status(200).json({ success: true, data: analytics });
});

// Helper methods for analytics
function getMostActiveDay(sessions) {
    const dayCounts = {};
    sessions.forEach(session => {
        const day = new Date(session.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
        dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    return Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b);
}

function calculateImprovementTrend(sessions) {
    if (sessions.length < 2) return 'insufficient_data';
    
    const recentSessions = sessions.slice(0, 5);
    const olderSessions = sessions.slice(5, 10);
    
    if (olderSessions.length === 0) return 'insufficient_data';
    
    const recentAvg = recentSessions.reduce((acc, s) => acc + s.journalEntries.length, 0) / recentSessions.length;
    const olderAvg = olderSessions.reduce((acc, s) => acc + s.journalEntries.length, 0) / olderSessions.length;
    
    if (recentAvg > olderAvg * 1.2) return 'improving';
    if (recentAvg < olderAvg * 0.8) return 'declining';
    return 'stable';
}