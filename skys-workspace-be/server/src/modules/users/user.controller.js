/**
 * @file user.controller.js
 * @description Tầng Controller cho module Users độc lập.
 */
const userService = require('./user.service');
const { UpdateProfileDTO, ChangeRoleDTO, ToggleBlockDTO } = require('./user.dto');
const User = require('./user.schema');
const asyncHandler = require('../../shared/asyncHandler');

const getUsers = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers(req.query);
    res.json(users);
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
});

const updateProfile = asyncHandler(async (req, res) => {
    const dto = new UpdateProfileDTO(req.body).validate();
    const currentUserId = req.user._id || req.user.userId;
    const user = await userService.updateProfile(currentUserId, req.params.id, dto);
    res.json({ message: 'Cập nhật thông tin thành công', user });
});

const changeRole = asyncHandler(async (req, res) => {
    const validRoles = Object.values(User.ADMIN_ROLES);
    const dto = new ChangeRoleDTO(req.body).validate(validRoles);
    const currentUserId = req.user._id || req.user.userId;
    const user = await userService.changeUserRole(currentUserId, req.params.id, dto.role);
    res.json({ message: 'Cập nhật vai trò Admin thành công', user });
});

const toggleBlock = asyncHandler(async (req, res) => {
    const dto = new ToggleBlockDTO(req.body).validate();
    const currentUserId = req.user._id || req.user.userId;
    const user = await userService.toggleBlockUser(currentUserId, req.params.id, dto.isBlocked);
    res.json({
        message: dto.isBlocked ? 'Khóa tài khoản người dùng thành công' : 'Mở khóa tài khoản thành công',
        user
    });
});

const deleteUser = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id || req.user.userId;
    const result = await userService.removeUser(currentUserId, req.params.id);
    res.json(result);
});

const getUserLogs = asyncHandler(async (req, res) => {
    const logs = await userService.getUserLogs(req.params.id);
    res.json(logs);
});

const getDashboardStatusStats = asyncHandler(async (req, res) => {
    const stats = await userService.getStatusLogsStats();
    res.json(stats);
});

module.exports = {
    getUsers,
    getUserById,
    updateProfile,
    changeRole,
    toggleBlock,
    deleteUser,
    getUserLogs,
    getDashboardStatusStats
};

