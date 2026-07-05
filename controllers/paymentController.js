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

const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');
            if(genaratedSignature === razorpay_signature){
                res.status(200).json({ message: 'Payment verified successfully' });
            }
            else{
                res.status(400).json({ message: 'Payment verification failed' });
            }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createdOrder, verifyPayment };