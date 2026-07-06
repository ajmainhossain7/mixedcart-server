const Order = require('../model/Order');
const User = require('../model/User');
const Product = require('../model/Product');
const CompanyProfile = require('../model/CompanyProfile');

const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalCompanies = await User.countDocuments({ role: 'company' });
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();

        const orders = await Order.find({});
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        const verifiedCompanies = await CompanyProfile.countDocuments({ isVerified: true });

        res.json({
            totalUsers,
            totalCompanies,
            totalOrders,
            totalProducts,
            totalRevenue,
            verifiedCompanies
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAdminStats };