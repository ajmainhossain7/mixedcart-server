const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { sellerOrAdmin } = require('../middleware/sellerOrAdminMiddleware');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, createProductReview } = require('../controllers/productController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


const router = express.Router();

router.route('/').get(getProducts).post(protect, sellerOrAdmin, upload.single('image'), createProduct);
router.route('/:id').get(getProductById).put(protect, sellerOrAdmin, upload.single('image'), updateProduct).delete(protect, sellerOrAdmin, deleteProduct);
router.route('/:id/reviews').post(protect, createProductReview);

module.exports = router;