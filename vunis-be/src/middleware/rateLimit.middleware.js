const rateLimit = require('express-rate-limit');

// Giới hạn chung: 500 request / 15 phút / IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút' }
});

// Giới hạn login/register: 10 lần / 15 phút / IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Quá nhiều lần đăng nhập thất bại, thử lại sau 15 phút' }
});

const failedAttempts = {};
const customLoginLimiter = (req, res, next) =>{
   const email = req.body?.email;

   if(!email) return next();

   const attempts = failedAttempts[email] || 0

   if(attempts > 5) {
    return res.status(429).json({
        message:` Email ${email} is locked. Due to too many failed attempts.Please try again after 15 minutes`
    });
   }

   req.recordFaildlogin = () => {

        failedAttempts[email] = (failedAttempts[email] || 0) + 1;
   }

   req.resetFailedLogin = () =>{
        delete failedAttempts[email];
   }

   next();
}

module.exports = { globalLimiter, authLimiter };