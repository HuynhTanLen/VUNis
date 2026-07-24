/**
 * @file auth.middleware.js
 * @description Middleware xác thực JWT Token.
 * Kiểm tra token trong cookie/header, xác thực User tồn tại trong DB và kiểm tra trạng thái khóa.
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../modules/auth/auth.schema');

/**
 * Middleware: Yêu cầu đăng nhập (protect)
 * Kiểm tra token JWT hợp lệ, người dùng tồn tại và chưa bị khóa trước khi tiếp tục.
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
        
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại trên hệ thống' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên' });
        }

        // Cập nhật trạng thái và thời gian hoạt động
        user.lastActiveAt = new Date();
        user.status = 'online';
        await user.save();

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token hết hạn hoặc không hợp lệ: ' + error.message });
    }
};

module.exports = { protect };

