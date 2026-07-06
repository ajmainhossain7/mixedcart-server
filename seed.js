const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./model/User');
const Product = require('./model/Product');

dotenv.config();

const defaultProducts = [
    { name: 'Ribbed Ceramic Vase', price: 48, category: 'Home Decor', description: 'Handcrafted ceramic vase with vertical ribbing and a soft matte finish. A perfect statement piece for minimalist styling.', stock: 15, imageUrl: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600' },
    { name: 'Essential Cotton Tee', price: 32, category: 'Apparel', description: 'Classic fit tee made from 100% organic cotton for everyday luxury. Heavyweight knit with durable side seam structure.', stock: 25, imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600' },
    { name: 'Minimalist Lounge Chair', price: 240, category: 'Furniture', description: 'Sleek wooden frame lounge chair with high-density foam cushions. Fully upholstered in heavy textured linen.', stock: 5, imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=600' },
    { name: 'Charcoal Wool Cushion', price: 58, category: 'Home Decor', description: 'Cozy throw cushion cover woven from premium Australian wool. Hand-finished details with invisible zipper closure.', stock: 20, imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=600' },
    { name: 'Onyx Leather Jacket', price: 320, category: 'Apparel', description: 'Hand-burnished black leather jacket with premium metal zippers. Slim fit profile with fully lined quilted interior.', stock: 8, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600' },
    { name: 'Matte Ceramic Vessel', price: 26, category: 'Home Decor', description: 'Earth-toned ceramic container, perfect for storage or floral styling. Food safe glazing inside.', stock: 12, imageUrl: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=600' },
    { name: 'Tactile Leather Sleeve', price: 78, category: 'Modern Utility', description: 'Full-grain leather laptop sleeve lined with protective soft microfiber. Fits modern 13-14 inch laptops.', stock: 30, imageUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=600' },
    { name: 'Organic Herbal Wellness Tea', price: 18, category: 'Wellness', description: 'Loose-leaf blend of chamomile, peppermint, and lavender for calming rituals. Sustainably sourced.', stock: 50, imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600' }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.AUTH_DB_URI);
        console.log('MongoDB Connected for Seeding...');

        // 1. Create or Get Admin User
        let adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            adminUser = await User.create({
                name: 'Admin User',
                email: 'admin@lifestyle.com',
                password: hashedPassword,
                role: 'admin',
                verified: true
            });
            console.log('Default Admin User Created: admin@lifestyle.com / password123');
        } else {
            console.log(`Using existing Admin User: ${adminUser.email}`);
        }

        // 2. Seed Products
        const count = await Product.countDocuments();
        if (count > 0) {
            console.log(`Database already has ${count} products. Skipping seeding.`);
        } else {
            const productsToSeed = defaultProducts.map(p => ({
                ...p,
                seller: adminUser._id,
                sellerType: 'Admin'
            }));
            await Product.insertMany(productsToSeed);
            console.log(`${productsToSeed.length} Products successfully seeded!`);
        }

        mongoose.connection.close();
        console.log('Database seeding process completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
