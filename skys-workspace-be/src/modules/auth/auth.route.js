/**
 * @file auth.route.js
 * @description Định tuyến API cho module Auth.
 * Base path: /api/auth
 */
const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    logoutUser,
    getMe, 
    getUsers, 
    updateRole, 
    toggleBlockUser,
    deleteUser,
    forgotPassword,
    resetPassword,
    getRoles
} = require('./auth.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const { authLimiter } = require('../../middleware/rateLimit.middleware');

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', protect, logoutUser);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/me', protect, getMe);


module.exports = router;

