const Conversation = require('../model/Conversation');
const Message = require('../model/Message');
const User = require('../model/User');
const CompanyProfile = require('../model/CompanyProfile');

// Get or create conversation between buyer (customer) and seller (company)
const getOrCreateConversation = async (req, res) => {
    try {
        const { sellerId } = req.body;
        const customerId = req.user._id;

        if (!sellerId) {
            return res.status(400).json({ message: 'Seller ID is required' });
        }

        if (customerId.toString() === sellerId.toString()) {
            return res.status(400).json({ message: 'You cannot start a chat with yourself' });
        }

        // Find existing conversation
        let conversation = await Conversation.findOne({
            customer: customerId,
            seller: sellerId
        }).populate('customer', 'name email role')
          .populate('seller', 'name email role');

        if (!conversation) {
            // Check if seller user exists and is a company or admin
            const seller = await User.findById(sellerId);
            if (!seller) {
                return res.status(404).json({ message: 'Seller not found' });
            }

            conversation = new Conversation({
                customer: customerId,
                seller: sellerId
            });

            await conversation.save();
            
            // Populate details
            conversation = await Conversation.findById(conversation._id)
                .populate('customer', 'name email role')
                .populate('seller', 'name email role');
        }

        // Fetch company logo and store name if seller role is company
        let companyProfile = null;
        if (conversation.seller.role === 'company') {
            companyProfile = await CompanyProfile.findOne({ user: sellerId }).select('companyName logoUrl');
        }

        res.status(200).json({
            conversation,
            companyProfile
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving conversation', error: error.message });
    }
};

// Get all conversations for a user (Customer or Seller)
const getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find conversations where user is customer OR seller
        const conversations = await Conversation.find({
            $or: [
                { customer: userId },
                { seller: userId }
            ]
        })
        .populate('customer', 'name email role')
        .populate('seller', 'name email role')
        .sort({ lastMessageAt: -1 });

        // For each conversation, attach company profile details if participant is a seller
        const conversationData = await Promise.all(conversations.map(async (conv) => {
            let companyProfile = null;
            if (conv.seller && conv.seller.role === 'company') {
                companyProfile = await CompanyProfile.findOne({ user: conv.seller._id }).select('companyName logoUrl');
            }
            return {
                ...conv.toObject(),
                companyProfile
            };
        }));

        res.status(200).json(conversationData);
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving conversations', error: error.message });
    }
};

// Get messages for a specific conversation
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

        // Verify conversation exists and user is a participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        if (conversation.customer.toString() !== userId.toString() && conversation.seller.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to view messages in this conversation' });
        }

        const messages = await Message.find({ conversation: conversationId })
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving messages', error: error.message });
    }
};

module.exports = {
    getOrCreateConversation,
    getConversations,
    getMessages
};
