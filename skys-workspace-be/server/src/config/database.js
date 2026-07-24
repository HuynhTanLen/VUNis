/**
 * @file database.js
 * @description Kết nối MongoDB và Seeding dữ liệu mặc định.
 * Tách riêng logic kết nối DB ra khỏi server.js để dễ bảo trì.
 */
const mongoose = require('mongoose');
const env = require('./env');

const connectDatabase = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log('✅ Kết nối MongoDB thành công');
        
        // Chạy seed admin tài khoản mặc định
        await seedDefaultData();
    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB:', error.message);
        process.exit(1); // Thoát ứng dụng nếu không kết nối được DB
    }
};

/**
 * Tự động tạo dữ liệu mặc định (Super Admin account) nếu chưa có.
 */
const seedDefaultData = async () => {
    try {
        const User = require('../modules/auth/auth.schema');
        const bcrypt = require('bcryptjs');

        const adminExists = await User.findOne({ email: 'admin@skys.com' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('Admin@123', 10);
            await User.create({
                name: 'System Admin',
                email: 'admin@skys.com',
                password: hashedPassword,
                role: User.ADMIN_ROLES.SUPER_ADMIN,
                status: 'offline',
                isBlocked: false
            });
            console.log('✅ Đã tạo tài khoản Super Admin mặc định (admin@skys.com / Admin@123) với vai trò SUPER_ADMIN');
        } else {
            console.log('⚡ Tài khoản Admin mặc định đã tồn tại.');
        }
    } catch (error) {
        console.error('❌ Lỗi khi seed dữ liệu mặc định:', error.message);
    }
};

module.exports = connectDatabase;

