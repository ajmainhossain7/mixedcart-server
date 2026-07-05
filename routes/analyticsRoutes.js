const exprees = require('express');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { getAdminStats } = require('../controllers/analyticsController');


const router = exprees.Router();

router.get('/', protect, admin, getAdminStats);

module.exports = router;