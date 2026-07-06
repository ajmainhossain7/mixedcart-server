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
            
            // Populate product details for invoice rendering
            const populatedOrder = await Order.findById(order._id).populate('items.product');

            // Send email notification to the user
            const textMessage = `Dear ${req.user.name},\n\nYour order has been successfully placed. Here are the details:\n\nOrder ID: ${order._id}\nTotal Price: $${totalAmount}\n\nThank you for shopping with us!`;
            
            const itemsHtml = populatedOrder.items.map(item => `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: left;">${item.product ? item.product.name : 'Curated Item'}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: center;">${item.qty}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right;">$${item.price.toFixed(2)}</td>
                </tr>
            `).join('');

            const htmlMessage = `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e5e5e5; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h1 style="font-family: Georgia, serif; font-size: 28px; margin: 0; color: #111111; letter-spacing: 0.1em; text-transform: uppercase;">MixedCart</h1>
                        <p style="color: #666666; font-size: 14px; margin-top: 4px;">Thank you for your purchase</p>
                    </div>

                    <p style="font-size: 15px; color: #333333;">Dear ${req.user.name},</p>
                    <p style="font-size: 14px; color: #555555; line-height: 1.6;">Your order has been successfully placed. Here are your transaction details:</p>

                    <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border: 1px solid #eeeeee;">
                        <span style="display: block; font-size: 11px; text-transform: uppercase; color: #888888; margin-bottom: 4px;">Order Number</span>
                        <span style="font-family: monospace; font-size: 14px; color: #111111;">${order._id}</span>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; color: #333333;">
                        <thead>
                            <tr style="background-color: #f5f5f5;">
                                <th style="padding: 12px; text-align: left; font-weight: 600;">Product</th>
                                <th style="padding: 12px; text-align: center; font-weight: 600;">Qty</th>
                                <th style="padding: 12px; text-align: right; font-weight: 600;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" style="padding: 12px; font-weight: 600; text-align: right;">Total Amount</td>
                                <td style="padding: 12px; font-weight: 700; text-align: right; font-size: 16px; color: #2ecc71;">$${totalAmount.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style="border-top: 1px solid #e5e5e5; padding-top: 30px; font-size: 13px; color: #666666; line-height: 1.6;">
                        <h3 style="font-size: 14px; margin: 0 0 10px 0; color: #111111;">Shipping Address</h3>
                        <p style="margin: 0;">${address.fullName}</p>
                        <p style="margin: 0;">${address.street}</p>
                        <p style="margin: 0;">${address.city}, ${address.postalCode}</p>
                        <p style="margin: 0;">${address.country}</p>
                    </div>

                    <div style="margin-top: 40px; border-top: 1px solid #e5e5e5; padding-top: 20px; text-align: center; font-size: 12px; color: #999999;">
                        <p>This is an automated receipt email. If you have any questions, please contact support.</p>
                    </div>
                </div>
            `;
            
            await sendEmail(req.user.email, 'Order Confirmation', textMessage, htmlMessage);
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

        // Populate buyer info for shipment update email notification
        const populatedOrder = await Order.findById(orderId).populate('user', 'name email');
        const productName = product ? product.name : 'Your item';

        if (populatedOrder && populatedOrder.user && populatedOrder.user.email) {
            const subject = `Shipment Update: ${productName}`;
            const text = `Dear ${populatedOrder.user.name},\n\nYour item "${productName}" from Order ${orderId} has been updated to "${status}".\n\nThank you for shopping with us!`;
            const html = `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e5e5e5; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h1 style="font-family: Georgia, serif; font-size: 28px; margin: 0; color: #111111; letter-spacing: 0.1em; text-transform: uppercase;">MixedCart</h1>
                        <p style="color: #666666; font-size: 14px; margin-top: 4px;">Shipment status notification</p>
                    </div>

                    <p style="font-size: 15px; color: #333333;">Dear ${populatedOrder.user.name},</p>
                    <p style="font-size: 14px; color: #555555; line-height: 1.6;">Good news! The seller has updated the fulfillment status of your item:</p>

                    <div style="margin: 30px 0; padding: 24px; background-color: #f9f9f9; border: 1px solid #eeeeee; text-align: center;">
                        <span style="display: block; font-size: 12px; text-transform: uppercase; color: #888888; margin-bottom: 8px;">Product Name</span>
                        <strong style="font-size: 16px; color: #111111; display: block; margin-bottom: 16px;">${productName}</strong>
                        
                        <span style="display: block; font-size: 12px; text-transform: uppercase; color: #888888; margin-bottom: 8px;">New Shipment Status</span>
                        <span style="display: inline-block; padding: 6px 16px; background-color: #2ecc71; color: #ffffff; font-size: 13px; font-weight: 700; border-radius: 4px; text-transform: uppercase;">${status}</span>
                    </div>

                    <p style="font-size: 13px; color: #777777;">Order Reference: <span style="font-family: monospace;">${orderId}</span></p>

                    <div style="margin-top: 40px; border-top: 1px solid #e5e5e5; padding-top: 20px; text-align: center; font-size: 12px; color: #999999;">
                        <p>This is an automated shipping notification. If you have questions about your delivery, please contact support.</p>
                    </div>
                </div>
            `;
            try {
                await sendEmail(populatedOrder.user.email, subject, text, html);
            } catch (err) {
                console.error('Failed to send status update email:', err);
            }
        }

        res.json({ message: 'Item status updated successfully', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cancel an order (customer flow)
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify authorization
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }

        // Verify status
        if (order.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending orders can be cancelled' });
        }

        order.status = 'Cancelled';
        order.items.forEach(item => {
            item.status = 'Cancelled';
        });

        await order.save();

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.qty }
            });
        }

        res.json({ message: 'Order cancelled successfully', order });
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
    updateSellerOrderItemStatus,
    cancelOrder
};