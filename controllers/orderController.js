const Order = require('../model/Order');

const sendEmail = require('../utils/sendEmail');

// Create a new order
const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, address, paymentId } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }
        else {
            const order = new Order({
                user: req.user._id,
                items,
                totalAmount,
                address,
                paymentId,
            });
            await order.save();
            // Send email notification to the user
            const message = `Dear ${req.user.name},\n\nYour order has been successfully placed. Here are the details:\n\nOrder ID: ${order._id}\nTotal Price: $${totalAmount}\n\nThank you for shopping with us!`;
            
            await sendEmail(req.user.email, 'Order Confirmation', message);
            res.status(201).json(order);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const myOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate(`items.product`, 'name price');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'id name');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Product = require('../model/Product');

const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        const { status } = req.body;
        if (order) {
            order.status = status || order.status;
            await order.save();
            res.json({ message: 'Order status updated', order });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get orders containing products for the logged-in seller/company
const getSellerOrders = async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user._id });
        const productIds = products.map(p => p._id.toString());

        const orders = await Order.find({
            'items.product': { $in: productIds }
        }).populate('user', 'name email').populate('items.product', 'name price imageUrl seller');

        const formattedOrders = orders.map(order => {
            const sellerItems = order.items.filter(item => 
                item.product && item.product.seller.toString() === req.user._id.toString()
            );

            const sellerTotal = sellerItems.reduce((acc, item) => acc + (item.price * item.qty), 0);

            return {
                _id: order._id,
                user: order.user,
                address: order.address,
                createdAt: order.createdAt,
                items: sellerItems,
                sellerTotal
            };
        });

        res.json(formattedOrders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update fulfillment status for a specific item in the seller's order
const updateSellerOrderItemStatus = async (req, res) => {
    try {
        const { orderId, productId } = req.params;
        const { status } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const item = order.items.find(it => it.product.toString() === productId);
        if (!item) {
            return res.status(404).json({ message: 'Product item not found in this order' });
        }

        const product = await Product.findById(productId);
        if (!product || product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to fulfill this product' });
        }

        item.status = status;
        await order.save();

        res.json({ message: 'Item status updated successfully', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    createOrder, 
    getOrders, 
    myOrders, 
    updateOrderStatus,
    getSellerOrders,
    updateSellerOrderItemStatus
};