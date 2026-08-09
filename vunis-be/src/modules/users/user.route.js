/**
 * @file user.route.js
 * @description Định tuyến API cho module Users độc lập.
 * Base path: /api/users
 */
const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,
    updateProfile,
    changeRole,
    toggleBlock,
    deleteUser,
    getUserLogs,
    getDashboardStatusStats,
    getSalaryUser,
    updateSalaryUser
} = require('./user.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');

// API Thống kê hoạt động 7 ngày gần nhất (Dashboard Admin Chart)
router.get('/dashboard/stats', protect, authorize('SUPER_ADMIN', 'USER_ADMIN', 'HELP_DESK_ADMIN'), getDashboardStatusStats);

// Xem danh sách người dùng (Super Admin, User Admin, Help Desk Admin)
router.get('/', protect, authorize('SUPER_ADMIN', 'USER_ADMIN', 'HELP_DESK_ADMIN'), getUsers);

// Xem thông tin chi tiết người dùng
router.get('/:id', protect, getUserById);

// Cập nhật profile người dùng (Chính chủ hoặc Super Admin / User Admin)
router.put('/:id', protect, updateProfile);

// Cập nhật vai trò Admin (Super Admin, User Admin)
router.patch('/:id/role', protect, authorize('SUPER_ADMIN', 'USER_ADMIN'), changeRole);

// Khóa / Mở khóa tài khoản người dùng (Super Admin, User Admin)
router.patch('/:id/block', protect, authorize('SUPER_ADMIN', 'USER_ADMIN'), toggleBlock);

// Xóa người dùng (Super Admin, User Admin)
router.delete('/:id', protect, authorize('SUPER_ADMIN', 'USER_ADMIN'), deleteUser);

// Xem lịch sử log hoạt động của người dùng (Super Admin, User Admin, Help Desk Admin)
router.get('/:id/logs', protect, authorize('SUPER_ADMIN', 'USER_ADMIN', 'HELP_DESK_ADMIN'), getUserLogs);

// Xem và cập nhật mức lương của người dùng
router.route('/:id/salary')
    .get( protect, authorize('SUPER_MAIN', 'USER_ADMIN','PROJECT_MANAGER'),getSalaryUser)
    .put( protect, authorize('SUPER_MAIN', 'USER_ADMIN','PROJECT_MANAGER'),updateSalaryUser)
module.exports = router;

