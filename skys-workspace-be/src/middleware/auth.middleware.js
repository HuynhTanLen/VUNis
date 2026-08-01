/**
 * @file auth.middleware.js
 * @description Middleware xác thực JWT Token (Sử dụng PostgreSQL & Prisma ORM).
 * Kiểm tra token trong cookie/header, xác thực User tồn tại trong DB và kiểm tra trạng thái khóa.
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../config/prisma');

/**
 * Middleware: Yêu cầu đăng nhập (protect)
 */
const protect = async (req, res, next) => {
    try {
        let token = req.cookies?.token;  // Đọc từ cookie trước
        
        // Fallback: đọc từ header (cho Postman test)
        if (!token && req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) return res.status(401).json({ message: 'Chưa đăng nhập, vui lòng cung cấp token hợp lệ' });
        
        const decoded = jwt.verify(token, env.JWT_SECRET);
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId || decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                isBlocked: true,
                lastActiveAt: true
            }
        });

        if (!user) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại trên hệ thống' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên' });
        }

        // Throttle cập nhật trạng thái online (chỉ ghi DB nếu cách lần cuối trên 5 phút)
        const FIVE_MINUTES = 5 * 60 * 1000;
        const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt).getTime() : 0;

        if (Date.now() - lastActive > FIVE_MINUTES) {
            prisma.user.update({
                where: { id: user.id },
                data: { lastActiveAt: new Date(), status: 'online' }
            }).catch(() => {});
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token hết hạn hoặc không hợp lệ: ' + error.message });
    }
};

module.exports = { protect };
