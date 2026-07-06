const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers, toggleWishlist, getWishlist } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', protect, admin, getUsers);
router.route('/wishlist').post(protect, toggleWishlist).get(protect, getWishlist);

module.exports = router;