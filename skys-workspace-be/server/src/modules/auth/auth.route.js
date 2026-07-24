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
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

// Routes Quản trị viên (Google Workspace Admin Levels)
// SUPER_ADMIN và USER_ADMIN có quyền xem danh sách, cập nhật role, khóa/mở khóa người dùng
router.get('/users', protect, authorize('SUPER_ADMIN', 'USER_ADMIN', 'HELP_DESK_ADMIN'), getUsers);
router.patch('/users/:id/role', protect, authorize('SUPER_ADMIN', 'USER_ADMIN'), updateRole);
router.patch('/users/:id/block', protect, authorize('SUPER_ADMIN', 'USER_ADMIN'), toggleBlockUser);
router.delete('/users/:id', protect, authorize('SUPER_ADMIN', 'USER_ADMIN'), deleteUser);
router.get('/roles', protect, getRoles);

module.exports = router;

