const Razorpay = require('razorpay');
const crypto = require('crypto');
dotenv=require('dotenv');
dotenv.config();

const createdOrder = async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const options = {
            amount: req.body.amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };
        const order = await instance.orders.create(options);
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};