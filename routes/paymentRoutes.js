const ecpress = require('express');
const { createOrder, verifyPayment } = require('../controllers/paymentController');

const router = ecpress.Router();

router.post('/order', createOrder);
router.post('/verify', verifyPayment);

module.exports = router;