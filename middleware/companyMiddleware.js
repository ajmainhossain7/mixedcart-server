const company = (req, res, next) => {
    if (req.user && req.user.role === 'company') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a company seller' });
    }
};

module.exports = { company };
