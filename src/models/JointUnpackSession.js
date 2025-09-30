
const mongoose = require('mongoose');

const ResponseEntrySchema = new mongoose.Schema({
    promptId: { type: mongoose.Schema.ObjectId, required: true },
    promptText: { type: String, required: true },
    encryptedResponse: { type: String, required: true }
});

const JointUnpackSessionSchema = new mongoose.Schema({
    soloPrepSession: {
        type: mongoose.Schema.ObjectId,
        ref: 'SoloPrepSession',
        required: true,
        unique: true
    },
    initiator: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    invitation: {
        token: { type: String, required: true, unique: true },
        expiresAt: { type: Date, required: true },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'completed', 'expired'],
            default: 'pending'
        }
    },
    inviteeResponses: [ResponseEntrySchema],
    revealStatus: {
        initiatorReady: { type: Boolean, default: false },
        inviteeReady: { type: Boolean, default: false }
    },
    generatedAgenda: {
        encryptedContent: { type: String },
        isGenerated: { type: Boolean, default: false }
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('JointUnpackSession', JointUnpackSessionSchema);