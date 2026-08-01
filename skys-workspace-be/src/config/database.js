/**
 * @file database.js
 * @description Kết nối PostgreSQL bằng Prisma và Seeding dữ liệu mặc định.
 * Tách riêng logic kết nối DB ra khỏi server.js để dễ bảo trì.
 */
const prisma = require('./prisma');
const bcrypt = require('bcryptjs');

const connectDatabase = async () => {
    try {
        await prisma.$connect();
        console.log('Kết nối PostgreSQL thành công');
        
        // Chạy seed admin tài khoản mặc định
        await seedDefaultData();
    } catch (error) {
        console.error('Lỗi kết nối PostgreSQL:', error.message);
        process.exit(1); // Thoát ứng dụng nếu không kết nối được DB
    }
};

/**
 * Tự động tạo dữ liệu mặc định (Super Admin account) nếu chưa có.
 */
const seedDefaultData = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@ks.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

        const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await prisma.user.create({
                data: {
                    name: 'System Admin',
                    email: adminEmail,
                    password: hashedPassword,
                    role: 'SUPER_ADMIN',
                    status: 'offline',
                    isBlocked: false
                }
            });
            console.log(`Đã tạo tài khoản Super Admin từ môi trường env (${adminEmail})`);
        } else {
            console.log('Tài khoản Admin hệ thống đã tồn tại.');
        }
    } catch (error) {
        console.error('Lỗi khi seed dữ liệu mặc định:', error.message);
    }
};


module.exports = connectDatabase;
