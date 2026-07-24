
const authService = require('./auth.service');
const { RegisterDTO, LoginDTO } = require('./auth.dto');
const asyncHandler = require('../../shared/asyncHandler');

const registerUser = asyncHandler(async (req, res) => {
    const dto = new RegisterDTO(req.body).validate();
    const user = await authService.register(dto);
    res.status(201).json({ message: 'Đăng ký thành công', user });
});

const loginUser = asyncHandler(async (req, res) => {
    const dto = new LoginDTO(req.body).validate();
    const reqMeta = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
    };
    
    const result = await authService.login(dto, reqMeta);
    
    res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });
    
    res.json({ message: 'Đăng nhập thành công', user: result.user, token: result.token });
});

const logoutUser = asyncHandler(async (req, res) => {
    if (req.user) {
        const userId = req.user._id || req.user.userId;
        await authService.logout(userId);
    }
    res.clearCookie('token');
    res.json({ message: 'Đăng xuất thành công' });
});

const getMe = asyncHandler(async (req, res) => {
    const userId = req.user._id || req.user.userId;
    const user = await authService.getMe(userId);
    res.json(user);
});

const getUsers = asyncHandler(async (req, res) => {
    const users = await authService.getAllUsers();
    res.json(users);
});

const updateRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const currentUserId = req.user._id || req.user.userId;
    const user = await authService.changeUserRole(currentUserId, req.params.id, role);
    res.json({ message: 'Cập nhật vai trò Admin thành công', user });
});

const toggleBlockUser = asyncHandler(async (req, res) => {
    const { isBlocked } = req.body;
    const currentUserId = req.user._id || req.user.userId;
    const user = await authService.toggleBlockUser(currentUserId, req.params.id, isBlocked);
    res.json({
        message: isBlocked ? 'Khóa tài khoản người dùng thành công' : 'Mở khóa tài khoản thành công',
        user
    });
});

const getRoles = asyncHandler(async (req, res) => {
    const roles = await authService.getRoles();
    res.json(roles);
});

const deleteUser = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id || req.user.userId;
    const result = await authService.removeUser(currentUserId, req.params.id);
    res.json(result);
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email là bắt buộc', code: 'EMAIL_REQUIRED' });
    }
    const result = await authService.forgotPassword(email);
    res.json(result);
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) {
        return res.status(400).json({ message: 'Email, mã OTP và mật khẩu mới là bắt buộc', code: 'REQUIRED_FIELDS_MISSING' });
    }
    const result = await authService.resetPassword(email, token, newPassword);
    res.json(result);
});

module.exports = { 
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
};

