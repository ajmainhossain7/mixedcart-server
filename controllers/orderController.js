const Order = require('../models/orderModel');

const sendEmail = require('../utils/sendEmail');

// Create a new order
const createOrder = async (req, res) => {
    try {
        const { items, totalPrice, address, paymentId } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }
        else {
            const order = new Order({
                user: req.user._id,
                items,
                totalPrice,
                address,
                paymentId,
            });
            await order.save();
            // Send email notification to the user
            const message = `Dear ${req.user.name},\n\nYour order has been successfully placed. Here are the details:\n\nOrder ID: ${order._id}\nTotal Price: $${totalPrice}\n\nThank you for shopping with us!`;
            
            await sendEmail(req.user.email, 'Order Confirmation', emailContent);
            res.status(201).json(order);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const myOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate(`userId`, `id name`);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, myOrders };