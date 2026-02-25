const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gharkakhana');

        const existingAdmin = await User.findOne({ email: 'admin@gharkakhana.com' });
        if (existingAdmin) {
            console.log('Admin already exists.');
        } else {
            const admin = new User({
                name: 'Super Admin',
                email: 'admin@gharkakhana.com',
                password: 'password123',
                role: 'admin',
                phone: '0000000000'
            });
            await admin.save();
            console.log('Admin user created: admin@gharkakhana.com / password123');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createAdmin();
