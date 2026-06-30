const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const genarateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
}

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const exsistingUser = await User.findOne({ email });
        if (exsistingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // TODO: Hash the password before saving to the database for security

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // TODO: Implement proper validation for the input data (name, email, password)
        // TODO: OTP Sending and verification email
        // TODO: Implement JWT token generation for user authentication
        // TODO: Welcome email after successful registration
        const newUser = await User.create({ name, email, password: hashedPassword });
        if (newUser) {
            const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit OTP
            const message = `
            Welcome to MixedCart, ${name}!
            Your OTP for registration is: ${otp}`;

            await sendEmail(email, 'Welcome to MixedCart - OTP Verification', message);

            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                token: genarateToken(newUser._id),
            });
        }else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: genarateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password field from the response
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUsers
};