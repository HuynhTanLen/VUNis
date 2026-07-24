const rateLimit = require('express-rate-limit');

// Giới hạn chung: 100 request / 15 phút / IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút' }
});

// Giới hạn login/register: 10 lần / 15 phút / IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Quá nhiều lần đăng nhập thất bại, thử lại sau 15 phút' }
});

module.exports = { globalLimiter, authLimiter };