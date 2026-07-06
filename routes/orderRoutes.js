const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { company } = require('../middleware/companyMiddleware');
const { createOrder, getOrders, myOrders, updateOrderStatus, getSellerOrders, updateSellerOrderItemStatus } = require('../controllers/orderController');
const router = express.Router();

router.route("/").post(protect, createOrder).get(protect, admin, getOrders);
router.route("/myorders").get(protect, myOrders);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

router.route('/seller').get(protect, company, getSellerOrders);
router.route('/seller/:orderId/item/:productId/status').put(protect, company, updateSellerOrderItemStatus);

module.exports = router;