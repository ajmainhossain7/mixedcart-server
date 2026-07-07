const express = require('express');
const router = express.Router();
const { createCoupon, validateCoupon } = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Route to create coupon (Admin only)
router.post('/', protect, admin, createCoupon);

// Route to validate coupon (Public)
router.post('/validate', validateCoupon);

module.exports = router;
