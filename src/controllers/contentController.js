
const { UpliftCategory, UpliftMessage, RelationshipType, ConversationTopic, Prompt } = require('../models/Content');
const asyncHandler = require('../middleware/asyncHandler');

// MOCK DATA (In a real app, this would be in the database)
const mockUpliftCategories = [{ _id: '6333b5b6b3e3e4b4b8b8b8b8', name: 'Gratitude' }, { _id: '6333b5b6b3e3e4b4b8b8b8b9', name: 'Encouragement' }];
const mockUpliftMessages = [
    { category: '6333b5b6b3e3e4b4b8b8b8b8', message: 'Thank you for being you.', tags: ['gratitude', 'appreciation'] },
    { category: '6333b5b6b3e3e4b4b8b8b8b9', message: 'You can do this!', tags: ['encouragement', 'motivation'] }
];
const mockRelationshipTypes = [{ name: 'Partner' }, { name: 'Friend' }, { name: 'Coworker' }];
const mockConversationTopics = [{ name: 'Resolving a Misunderstanding' }, { name: 'Setting a Boundary' }];
const mockPrompts = [
    { promptId: 'p1', text: 'What is the core issue from your perspective?', for: 'solo' },
    { promptId: 'p2', text: 'How does this situation make you feel?', for: 'solo' },
    { promptId: 'p3', text: 'What outcome are you hoping for?', for: 'solo' },
    { promptId: 'p4', text: 'How do you believe the other person sees this situation?', for: 'invitee' },
];

// @desc    Get Uplift categories
// @route   GET /api/v1/content/uplift/categories
// @access  Public
exports.getUpliftCategories = asyncHandler(async (req, res, next) => {
    // const categories = await UpliftCategory.find();
    res.status(200).json({ success: true, data: mockUpliftCategories });
});

// @desc    Get/Search Uplift messages
// @route   GET /api/v1/content/uplift/messages
// @access  Public
exports.getUpliftMessages = asyncHandler(async (req, res, next) => {
    const { categoryId, keyword } = req.query;
    let messages = mockUpliftMessages;

    if (categoryId) {
        messages = messages.filter(m => m.category === categoryId);
    }

    if (keyword) {
        messages = messages.filter(m =>
            m.message.toLowerCase().includes(keyword.toLowerCase()) ||
            m.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
        );
    }

    res.status(200).json({ success: true, data: messages });
});

// @desc    Get relationship types for Unpack
// @route   GET /api/v1/content/unpack/relationship-types
// @access  Private
exports.getRelationshipTypes = asyncHandler(async (req, res, next) => {
    // const types = await RelationshipType.find();
    res.status(200).json({ success: true, data: mockRelationshipTypes });
});

// @desc    Get conversation topics for Unpack
// @route   GET /api/v1/content/unpack/conversation-topics
// @access  Private
exports.getConversationTopics = asyncHandler(async (req, res, next) => {
    // const topics = await ConversationTopic.find();
    res.status(200).json({ success: true, data: mockConversationTopics });
});

// @desc    Get prompts for a Solo Prep session
// @route   GET /api/v1/content/unpack/prompts
// @access  Private
exports.getSoloPrepPrompts = asyncHandler(async (req, res, next) => {
    const { relationshipType, conversationTopic, type } = req.query; // type can be 'solo' or 'invitee'

    if (!relationshipType || !conversationTopic || !type) {
        return res.status(400).json({ success: false, message: 'Relationship type, topic, and prompt type are required' });
    }

    // In a real system, you'd query the Prompt model based on these filters
    // const promptSet = await Prompt.findOne({ relationshipType, conversationTopic });
    const prompts = mockPrompts.filter(p => p.for === type);

    res.status(200).json({ success: true, data: prompts });
});