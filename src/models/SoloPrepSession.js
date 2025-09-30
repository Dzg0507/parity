
const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema({
    promptId: { type: mongoose.Schema.ObjectId, required: true },
    promptText: { type: String, required: true },
    // E2E encrypted content from the client
    encryptedResponse: { type: String, required: true }
});

const SoloPrepSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    relationshipType: { type: String, required: true },
    conversationTopic: { type: String, required: true },
    conversationData: { type: Object, default: {} }, // Store user responses from AI conversation
    journalEntries: [JournalEntrySchema],
    // E2E encrypted content from the client
    generatedBriefing: {
        encryptedContent: { type: String },
        isGenerated: { type: Boolean, default: false }
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'converted'],
        default: 'in-progress'
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('SoloPrepSession', SoloPrepSessionSchema);