const expreess = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

const Message = require('./model/Message');
const Conversation = require('./model/Conversation');

dotenv.config();
connectDB();

const app = expreess();

const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:3000'];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(expreess.json());
app.use(expreess.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/company', require('./routes/companyRoutes'));
app.use('/api/products', require('./routes/productRoutes.js'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Setup HTTP server and Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a chat conversation room
    socket.on('join_room', (conversationId) => {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined conversation room: ${conversationId}`);
    });

    // Handle incoming messages
    socket.on('send_message', async (data) => {
        try {
            const { conversationId, senderId, text } = data;
            
            if (!conversationId || !senderId || !text) {
                console.error('Invalid message payload:', data);
                return;
            }

            // Save message to database
            const message = new Message({
                conversation: conversationId,
                sender: senderId,
                text
            });
            await message.save();

            // Update conversation metadata
            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: text,
                lastMessageAt: Date.now()
            });

            // Broadcast message back to the room participants
            io.to(conversationId).emit('receive_message', message);
        } catch (error) {
            console.error('Error handling send_message socket event:', error.message);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});