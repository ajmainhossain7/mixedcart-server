const sellerOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'company')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a seller or admin' });
    }
};

module.exports = { sellerOrAdmin };
