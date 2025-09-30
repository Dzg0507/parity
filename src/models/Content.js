
const mongoose = require('mongoose');

// Schema for Uplift Content
const UpliftCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
});

const UpliftMessageSchema = new mongoose.Schema({
    category: { type: mongoose.Schema.ObjectId, ref: 'UpliftCategory', required: true },
    message: { type: String, required: true },
    tags: [String]
});


// Schema for Unpack Content
const RelationshipTypeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
});

const ConversationTopicSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
});

// Prompts can be for Solo Prep or for Joint Unpack (Initiator/Invitee)
const PromptSchema = new mongoose.Schema({
    relationshipType: { type: String, required: true },
    conversationTopic: { type: String, required: true },
    prompts: [
        {
            promptId: { type: mongoose.Schema.ObjectId, auto: true },
            text: { type: String, required: true },
            // Specifies which part of the process this prompt is for
            for: { type: String, enum: ['solo', 'invitee'], default: 'solo' }
        }
    ],
    version: { type: Number, default: 1 }
});

module.exports = {
    UpliftCategory: mongoose.model('UpliftCategory', UpliftCategorySchema),
    UpliftMessage: mongoose.model('UpliftMessage', UpliftMessageSchema),
    RelationshipType: mongoose.model('RelationshipType', RelationshipTypeSchema),
    ConversationTopic: mongoose.model('ConversationTopic', ConversationTopicSchema),
    Prompt: mongoose.model('Prompt', PromptSchema),
};