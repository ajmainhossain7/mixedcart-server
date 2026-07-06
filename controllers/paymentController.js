const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Stripe PaymentIntent
const createdOrder = async (req, res) => {
    try {
        const { amount } = req.body; // Amount in USD
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in cents
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.status(201).json({
            id: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            amount: paymentIntent.amount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Verify Stripe PaymentIntent status
const verifyPayment = async (req, res) => {
    try {
        const { paymentId } = req.body; // This is the Stripe PaymentIntent ID
        if (!paymentId) {
            return res.status(400).json({ message: 'Payment ID is required' });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        if (paymentIntent.status === 'succeeded') {
            res.status(200).json({ status: 'succeeded', message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ status: paymentIntent.status, message: 'Payment verification failed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createdOrder, verifyPayment };