const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { createProduct, getOrders, getOrdersById, updateOrderStatus } = require('../controllers/orderController');
const router = express.Router();

router.route("/").post(protect, createProduct).get(protect, admin, getOrders);
router.route("/myorders").get(protect, getOrdersById);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

module.exports = router;