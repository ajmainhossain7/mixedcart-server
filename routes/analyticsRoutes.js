const exprees = require('express');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { company } = require('../middleware/companyMiddleware');
const { getAdminStats, getSellerStats } = require('../controllers/analyticsController');


const router = exprees.Router();

router.get('/', protect, admin, getAdminStats);
router.get('/seller', protect, company, getSellerStats);

module.exports = router;