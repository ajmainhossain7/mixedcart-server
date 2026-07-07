const express = require('express');
const router = express.Router();
const { registerUser, verifyOTP, resendOTP, loginUser, getUsers, toggleWishlist, getWishlist, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/users', protect, admin, getUsers);
router.route('/wishlist').post(protect, toggleWishlist).get(protect, getWishlist);

module.exports = router;