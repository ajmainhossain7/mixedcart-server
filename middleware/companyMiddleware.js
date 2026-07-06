const CompanyProfile = require('../model/CompanyProfile');

const company = async (req, res, next) => {
    if (req.user && req.user.role === 'company') {
        const profile = await CompanyProfile.findOne({ user: req.user._id });
        if (profile && profile.isVerified) {
            next();
        } else {
            res.status(403).json({ message: 'Your seller account is pending admin verification.' });
        }
    } else {
        res.status(403).json({ message: 'Not authorized as a company seller' });
    }
};

module.exports = { company };
