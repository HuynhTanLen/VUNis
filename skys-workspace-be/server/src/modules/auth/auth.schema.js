/**
 * @file auth.schema.js
 * @description Mongoose Schema cho bảng User.
 * Định nghĩa cấu trúc dữ liệu người dùng trong MongoDB.
 */
const mongoose = require('mongoose');

const ADMIN_ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    USER_ADMIN: 'USER_ADMIN',
    GROUPS_ADMIN: 'GROUPS_ADMIN',
    SERVICE_ADMIN: 'SERVICE_ADMIN',
    HELP_DESK_ADMIN: 'HELP_DESK_ADMIN',
    USER: 'USER'
};

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Họ và tên là bắt buộc'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email là bắt buộc'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} không phải là email hợp lệ!`
        }
    },
    password: {
        type: String,
        required: [true, 'Mật khẩu là bắt buộc'],
        minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
    },
    role: {
        type: String,
        enum: Object.values(ADMIN_ROLES),
        default: ADMIN_ROLES.USER
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'inactive_long', 'suspended'],
        default: 'offline'
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    lastActiveAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpire: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
User.ADMIN_ROLES = ADMIN_ROLES;

module.exports = User;

