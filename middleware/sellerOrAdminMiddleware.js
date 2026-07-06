const CompanyProfile = require('../model/CompanyProfile');

const sellerOrAdmin = async (req, res, next) => {
    if (req.user) {
        if (req.user.role === 'admin') {
            return next();
        }
        if (req.user.role === 'company') {
            const profile = await CompanyProfile.findOne({ user: req.user._id });
            if (profile && profile.isVerified) {
                return next();
            } else {
                return res.status(403).json({ message: 'Your seller account is pending admin verification.' });
            }
        }
    }
    res.status(403).json({ message: 'Not authorized as a seller or admin' });
};

module.exports = { sellerOrAdmin };
