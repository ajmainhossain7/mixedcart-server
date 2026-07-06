const CompanyProfile = require('../model/CompanyProfile');
const Product = require('../model/Product');
const cloudinary = require('../config/cloudinary');

// Create or update company profile
const createOrUpdateProfile = async (req, res) => {
    try {
        const { companyName, description, address, phone, website } = req.body;
        
        let logoUrl = '';
        let bannerUrl = '';

        // If logo is uploaded
        if (req.files && req.files.logo && req.files.logo[0]) {
            const result = await cloudinary.uploader.upload(req.files.logo[0].path);
            logoUrl = result.secure_url;
        }

        // If banner is uploaded
        if (req.files && req.files.banner && req.files.banner[0]) {
            const result = await cloudinary.uploader.upload(req.files.banner[0].path);
            bannerUrl = result.secure_url;
        }

        let profile = await CompanyProfile.findOne({ user: req.user._id });

        if (profile) {
            // Update profile
            profile.companyName = companyName || profile.companyName;
            profile.description = description || profile.description;
            profile.address = address || profile.address;
            profile.phone = phone || profile.phone;
            profile.website = website || profile.website;
            if (logoUrl) profile.logoUrl = logoUrl;
            if (bannerUrl) profile.bannerUrl = bannerUrl;

            const updatedProfile = await profile.save();
            return res.json(updatedProfile);
        } else {
            // Create new profile
            if (!logoUrl) {
                return res.status(400).json({ message: 'Logo is required for new company profile' });
            }
            profile = new CompanyProfile({
                user: req.user._id,
                companyName,
                description,
                address,
                phone,
                website,
                logoUrl,
                bannerUrl
            });
            const savedProfile = await profile.save();
            return res.status(201).json(savedProfile);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get current company profile
const getMyProfile = async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne({ user: req.user._id });
        if (profile) {
            res.json(profile);
        } else {
            res.status(404).json({ message: 'Company profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get public profile by company ID
const getProfileById = async (req, res) => {
    try {
        const profile = await CompanyProfile.findById(req.params.id).populate('user', 'name email');
        if (profile) {
            res.json(profile);
        } else {
            res.status(404).json({ message: 'Company profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get current company's products
const getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user._id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all company profiles (Admin only)
const getAllProfiles = async (req, res) => {
    try {
        const profiles = await CompanyProfile.find().populate('user', 'name email verified');
        res.json(profiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Verify/approve a company profile (Admin only)
const verifyCompanyProfile = async (req, res) => {
    try {
        const { isVerified } = req.body;
        const profile = await CompanyProfile.findById(req.params.id);
        
        if (profile) {
            profile.isVerified = typeof isVerified !== 'undefined' ? isVerified : true;
            const updatedProfile = await profile.save();
            res.json({ message: `Company profile ${profile.isVerified ? 'verified' : 'unverified'} successfully`, profile: updatedProfile });
        } else {
            res.status(404).json({ message: 'Company profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrUpdateProfile,
    getMyProfile,
    getProfileById,
    getMyProducts,
    getAllProfiles,
    verifyCompanyProfile
};
