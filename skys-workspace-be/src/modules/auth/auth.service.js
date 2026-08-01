/**
 * @file auth.service.js
 * @description Tầng Service cho module Auth.
 * Business logic cho đăng ký, đăng nhập, phân quyền Google Workspace Admin và quản lý trạng thái người dùng.
 */
const authRepo = require('./auth.repository');
const authMapper = require('./auth.mapper');
const { EmailExistsError, InvalidCredentialsError, UserNotFoundError } = require('./auth.error');
const prisma = require('../../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const crypto = require('crypto');
const sendEmail = require('../../shared/utils/sendEmail');

const SYSTEM_ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    USER: 'USER'
};

/**
 * Đăng ký tài khoản mới.
 * Nếu là user đầu tiên trong hệ thống -> Tự động gắn SUPER_ADMIN.
 * Các user đăng ký sau mặc định là USER.
 */
const register = async (dto) => {
    const userExists = await authRepo.findByEmail(dto.email);
    if (userExists) throw new EmailExistsError();

    const countUsers = await authRepo.countUsers();
    const defaultRole = countUsers === 0 ? SYSTEM_ROLES.SUPER_ADMIN : SYSTEM_ROLES.USER;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const newUser = await authRepo.createUser({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: defaultRole,
        status: 'offline',
        phone: dto.phone || null,
        jobTitle: dto.jobTitle || 'Software Engineer',
        department: dto.department || 'Engineering',
        company: dto.company || 'KS Organization'
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
    await prisma.user.update({
        where: { id: user.id },
        data: { status: 'online', lastActiveAt: new Date() }
    });

    // Ghi nhật ký đăng nhập (UserStatusLog) để theo dõi
    await prisma.userStatusLog.create({
        data: {
            userId: user.id,
            status: 'LOGIN'
        }
    });

    const token = jwt.sign(
        {
            userId: user.id,
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
        await prisma.user.update({
            where: { id: userId },
            data: { status: 'offline' }
        });

        await prisma.userStatusLog.create({
            data: {
                userId: user.id,
                status: 'LOGOUT'
            }
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

    const validRoles = Object.values(SYSTEM_ROLES);
    if (!validRoles.includes(newRole)) {
        const error = new Error(`Vai trò không hợp lệ. Danh sách hợp lệ: ${validRoles.join(', ')}`);
        error.statusCode = 400;
        throw error;
    }

    const targetUser = await authRepo.findById(targetUserId);
    if (!targetUser) throw new UserNotFoundError();

    const updatedUser = await authRepo.updateUserRole(targetUserId, newRole);

    await prisma.userStatusLog.create({
        data: {
            userId: targetUserId,
            status: 'ROLE_CHANGED'
        }
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

    if (targetUser.role === SYSTEM_ROLES.SUPER_ADMIN) {
        const error = new Error('Không thể khóa tài khoản SUPER_ADMIN');
        error.statusCode = 403;
        throw error;
    }

    const updatedUser = await authRepo.toggleBlockUser(targetUserId, isBlocked);

    await prisma.userStatusLog.create({
        data: {
            userId: targetUserId,
            status: isBlocked ? 'BLOCKED' : 'UNBLOCKED'
        }
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

    if (targetUser.role === SYSTEM_ROLES.SUPER_ADMIN) {
        const error = new Error('Không thể xóa tài khoản SUPER_ADMIN hệ thống');
        error.statusCode = 403;
        throw error;
    }

    await authRepo.deleteUser(targetUserId);
    return { message: 'Xóa người dùng thành công' };
};

const forgotPassword = async (email) => {
    const user = await authRepo.findByEmail(email);
    if (user) {
        const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
        
        const hashedToken = crypto.createHash('sha256').update(resetOTP).digest('hex');
        const expireDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await authRepo.setResetToken(user.id, hashedToken, expireDate);

        const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f5;">
                <h2 style="color: #2563eb;">KS TEAM WORKSPACE — Mã Khôi Phục Mật Khẩu</h2>
                <p>Xin chào <b>${user.name || 'bạn'}</b>,</p>
                <p>Mã OTP để khôi phục mật khẩu của bạn là:</p>
                <h1 style="color: #ef4444; letter-spacing: 5px;">${resetOTP}</h1>
                <p>Mã này có hiệu lực trong vòng <b>10 phút</b>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        </div>
        `;

        await sendEmail({
            email: user.email,
            subject: 'Mã OTP khôi phục mật khẩu - KS Team',
            message: `Mã này có hiệu lực trong vòng 10 phút.`,
            html: htmlContent
        });
    }
    
    return {
        message: 'Mã OTP khôi phục mật khẩu đã được gửi, vui lòng kiểm tra email của bạn (hoặc console server)'
    };
};

const resetPassword = async (email, token, newPassword) => {
    const user = await authRepo.findByEmail(email);
    if (!user) {
        const error = new Error('Người dùng không tồn tại');
        error.statusCode = 400;
        throw error;
    }

    const hashedOTP = crypto.createHash('sha256').update(token).digest('hex');
    const validUser = await authRepo.findByValidResetToken(hashedOTP);

    if (!validUser || validUser.id !== user.id) {
        const err = new Error('OTP invalid or expired');
        err.statusCode = 400;
        throw err;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await authRepo.updatePassword(user.id, hashedPassword);

    return { message: 'Mật khẩu đã được đặt lại thành công' };  
};

const getRoles = async () => {
    return Object.values(SYSTEM_ROLES);
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

