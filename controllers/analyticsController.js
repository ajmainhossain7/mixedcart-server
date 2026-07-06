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

// Compute sales performance stats for a specific seller
const getSellerStats = async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user._id });
        const productIds = products.map(p => p._id.toString());
        const totalProducts = products.length;

        const orders = await Order.find({
            'items.product': { $in: productIds }
        });

        // Past 6 months chart structures
        const salesData = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            salesData.push({
                month: monthNames[d.getMonth()],
                year: d.getFullYear(),
                revenue: 0,
                itemsSold: 0
            });
        }

        let totalRevenue = 0;
        let totalItemsSold = 0;

        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const orderMonth = orderDate.getMonth();
            const orderYear = orderDate.getFullYear();

            const chartMonth = salesData.find(s => s.month === monthNames[orderMonth] && s.year === orderYear);

            order.items.forEach(item => {
                // Since item.product could be populated or raw objectId, check toString matching
                const itemProdId = item.product._id ? item.product._id.toString() : item.product.toString();
                const matchedProduct = products.find(p => p._id.toString() === itemProdId);

                if (matchedProduct) {
                    const itemRevenue = item.price * item.qty;
                    totalRevenue += itemRevenue;
                    totalItemsSold += item.qty;

                    if (chartMonth) {
                        chartMonth.revenue += itemRevenue;
                        chartMonth.itemsSold += item.qty;
                    }
                }
            });
        });

        res.json({
            totalProducts,
            totalOrders: orders.length,
            totalRevenue,
            totalItemsSold,
            salesData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAdminStats, getSellerStats };