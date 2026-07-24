/**
 * @file auth.service.js
 * @description Tầng Service cho module Auth.
 * Business logic cho đăng ký, đăng nhập, phân quyền Google Workspace Admin và quản lý trạng thái người dùng.
 */
const authRepo = require('./auth.repository');
const authMapper = require('./auth.mapper');
const { EmailExistsError, InvalidCredentialsError, UserNotFoundError } = require('./auth.error');
const UserStatusLog = require('../activityLogs/userStatusLog.schema');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const User = require('./auth.schema');

/**
 * Đăng ký tài khoản mới.
 * Nếu là user đầu tiên trong hệ thống -> Tự động gắn SUPER_ADMIN.
 * Các user đăng ký sau mặc định là USER.
 */
const register = async (dto) => {
    const userExists = await authRepo.findByEmail(dto.email);
    if (userExists) throw new EmailExistsError();

    const countUsers = await User.countDocuments();
    const defaultRole = countUsers === 0 ? User.ADMIN_ROLES.SUPER_ADMIN : User.ADMIN_ROLES.USER;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const newUser = await authRepo.createUser({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: defaultRole,
        status: 'offline'
    });

    return authMapper.toUserResponse(newUser);
};

/**
 * Đăng nhập và tạo JWT token.
 */
const login = async (dto, reqMeta = {}) => {
    const user = await authRepo.findByEmail(dto.email);
    if (!user) throw new InvalidCredentialsError();

    if (user.isBlocked) {
        const error = new Error('Tài khoản của bạn đã bị khóa bởi Quản trị viên.');
        error.statusCode = 403;
        throw error;
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new InvalidCredentialsError();

    // Cập nhật trạng thái người dùng
    user.status = 'online';
    user.lastActiveAt = new Date();
    await user.save();

    // Ghi nhật ký đăng nhập (UserStatusLog) để theo dõi
    await UserStatusLog.create({
        userId: user._id,
        action: 'LOGIN',
        ipAddress: reqMeta.ip || null,
        userAgent: reqMeta.userAgent || null
    });

    const token = jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role
        },
        env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return authMapper.toLoginResponse(user, token);
};

/**
 * Đăng xuất
 */
const logout = async (userId) => {
    const user = await authRepo.findById(userId);
    if (user) {
        user.status = 'offline';
        await user.save();

        await UserStatusLog.create({
            userId: user._id,
            action: 'LOGOUT'
        });
    }
    return { message: 'Đăng xuất thành công' };
};

const getMe = async (userId) => {
    const user = await authRepo.findById(userId);
    if (!user) throw new UserNotFoundError();
    return authMapper.toUserResponse(user);
};

const getAllUsers = async () => {
    const users = await authRepo.findAllUsers();
    return users.map(authMapper.toUserResponse);
};

/**
 * Đổi phân quyền Admin theo cấp độ Google Workspace
 */
const changeUserRole = async (currentUserId, targetUserId, newRole) => {
    if (currentUserId === targetUserId) {
        const error = new Error('Không thể tự thay đổi vai trò của chính mình');
        error.statusCode = 400;
        throw error;
    }

    const validRoles = Object.values(User.ADMIN_ROLES);
    if (!validRoles.includes(newRole)) {
        const error = new Error(`Vai trò không hợp lệ. Danh sách hợp lệ: ${validRoles.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }

    const targetUser = await authRepo.findById(targetUserId);
    if (!targetUser) throw new UserNotFoundError();

    const updatedUser = await authRepo.updateUserRole(targetUserId, newRole);

    await UserStatusLog.create({
        userId: targetUserId,
        action: 'ROLE_CHANGED'
    });

    return authMapper.toUserResponse(updatedUser);
};

/**
 * Khóa / Mở khóa tài khoản người dùng
 */
const toggleBlockUser = async (currentUserId, targetUserId, isBlocked) => {
    if (currentUserId === targetUserId) {
        const error = new Error('Không thể tự khóa tài khoản của chính mình');
        error.statusCode = 400;
        throw error;
    }

    const targetUser = await authRepo.findById(targetUserId);
    if (!targetUser) throw new UserNotFoundError();

    if (targetUser.role === User.ADMIN_ROLES.SUPER_ADMIN) {
        const error = new Error('Không thể khóa tài khoản SUPER_ADMIN');
        error.statusCode = 403;
        throw error;
    }

    const updatedUser = await authRepo.toggleBlockUser(targetUserId, isBlocked);

    await UserStatusLog.create({
        userId: targetUserId,
        action: isBlocked ? 'BLOCKED' : 'UNBLOCKED'
    });

    return authMapper.toUserResponse(updatedUser);
};

const removeUser = async (currentUserId, targetUserId) => {
    if (currentUserId === targetUserId) {
        const error = new Error('Không thể tự xóa chính mình');
        error.statusCode = 400;
        throw error;
    }

    const targetUser = await authRepo.findById(targetUserId);
    if (!targetUser) throw new UserNotFoundError();

    if (targetUser.role === User.ADMIN_ROLES.SUPER_ADMIN) {
        const error = new Error('Không thể xóa tài khoản SUPER_ADMIN hệ thống');
        error.statusCode = 403;
        throw error;
    }

    await authRepo.deleteUser(targetUserId);
    return { message: 'Xóa người dùng thành công' };
};

const forgotPassword = async (email) => {
    const user = await authRepo.findByEmail(email);
    if (!user) throw new UserNotFoundError();

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    console.log(`\n==================================================`);
    console.log(`[QUÊN MẬT KHẨU] Mã OTP khôi phục cho ${email}: ${resetToken}`);
    console.log(`==================================================\n`);

    return {
        message: 'Mã OTP khôi phục mật khẩu đã được gửi, vui lòng kiểm tra email của bạn (hoặc console server)',
        resetToken
    };
};

const resetPassword = async (email, token, newPassword) => {
    const user = await authRepo.findByEmail(email);
    if (!user) throw new UserNotFoundError();

    if (!user.resetPasswordToken || user.resetPasswordToken !== token || user.resetPasswordExpire < Date.now()) {
        const error = new Error('Mã OTP không hợp lệ hoặc đã hết hạn');
        error.statusCode = 400;
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    return { message: 'Thay đổi mật khẩu thành công' };
};

const getRoles = async () => {
    return Object.values(User.ADMIN_ROLES);
};

module.exports = {
    register,
    login,
    logout,
    getMe,
    getAllUsers,
    changeUserRole,
    toggleBlockUser,
    removeUser,
    forgotPassword,
    resetPassword,
    getRoles
};

