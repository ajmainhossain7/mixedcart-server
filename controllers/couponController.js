const Coupon = require('../model/Coupon');

// Create a new coupon (Admin only)
const createCoupon = async (req, res) => {
    try {
        const { code, discountPercentage, expiryDate } = req.body;

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = new Coupon({
            code,
            discountPercentage,
            expiryDate
        });

        await coupon.save();
        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Server error creating coupon', error: error.message });
    }
};

// Validate a coupon (Public)
const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ message: 'Coupon is inactive' });
        }

        if (new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ message: 'Coupon code has expired' });
        }

        res.status(200).json({
            code: coupon.code,
            discountPercentage: coupon.discountPercentage
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error validating coupon', error: error.message });
    }
};

module.exports = {
    createCoupon,
    validateCoupon
};
