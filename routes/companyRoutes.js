const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { company } = require('../middleware/companyMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { createOrUpdateProfile, getMyProfile, getProfileById, getMyProducts, getAllProfiles, verifyCompanyProfile } = require('../controllers/companyController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Profile endpoints
router.route('/profile')
    .post(protect, company, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), createOrUpdateProfile)
    .get(protect, company, getMyProfile);

router.route('/profile/:id').get(getProfileById);

// Company products endpoint
router.route('/products').get(protect, company, getMyProducts);

// Admin-specific company endpoints
router.route('/admin/profiles').get(protect, admin, getAllProfiles);
router.route('/admin/profiles/:id/verify').put(protect, admin, verifyCompanyProfile);

module.exports = router;
