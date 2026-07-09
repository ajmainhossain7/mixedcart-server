const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastMessage: {
        type: String,
        default: ''
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure a customer and seller can only have one active conversation
conversationSchema.index({ customer: 1, seller: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
