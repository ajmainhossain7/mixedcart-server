const express = require('express');
const router = express.Router();
const { getOrCreateConversation, getConversations, getMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// Get or create conversation (Buyer clicks chat with seller)
router.post('/conversation', protect, getOrCreateConversation);

// Get conversations for the logged-in user (Customer or Seller)
router.get('/conversations', protect, getConversations);

// Get messages for a specific conversation
router.get('/messages/:conversationId', protect, getMessages);

module.exports = router;
