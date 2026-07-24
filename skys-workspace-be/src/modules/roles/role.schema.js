/**
 * @file role.schema.js
 * @description Mongoose Schema cho bảng Role.
 * Quản lý vai trò hệ thống (super_admin, admin, user, ...).
 * Mỗi Role chứa danh sách permissions xác định quyền hạn cụ thể.
 * 
 * Thiết kế RBAC:
 *   User ──(belongsTo)──> Role ──(hasMany)──> Permission
 * 
 * Ví dụ:
 *   Role "admin" có permissions: ['user:read', 'user:update', 'project:delete', ...]
 *   Role "user"  có permissions: ['project:read', 'project:create', 'task:read', ...]
 */
const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    /**
     * Tên vai trò (unique, dùng làm key tra cứu).
     * VD: 'super_admin', 'admin', 'manager', 'user'
     */
    name: {
        type: String,
        required: [true, 'Tên vai trò là bắt buộc'],
        unique: true,
        trim: true,
        lowercase: true
    },

    /**
     * Tên hiển thị thân thiện cho UI.
     * VD: 'Quản trị viên tối cao', 'Quản trị viên', 'Người dùng'
     */
    displayName: {
        type: String,
        required: [true, 'Tên hiển thị là bắt buộc'],
        trim: true
    },

    /**
     * Mô tả chức năng và phạm vi quyền hạn của vai trò.
     */
    description: {
        type: String,
        default: '',
        trim: true
    },

    /**
     * Danh sách mã quyền (permission codes) mà vai trò này sở hữu.
     * Mỗi phần tử là ObjectId tham chiếu đến bảng Permission.
     */
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }],

    /**
     * Đánh dấu vai trò hệ thống (không thể xóa, sửa tên, hoặc hạ quyền).
     * VD: super_admin luôn là isSystem = true.
     */
    isSystem: {
        type: Boolean,
        default: false
    },

    /**
     * Mức độ ưu tiên (số càng cao → quyền càng lớn).
     * Dùng để so sánh: user cấp thấp KHÔNG THỂ thao tác lên user cấp cao hơn.
     * VD: super_admin = 100, admin = 50, manager = 30, user = 10
     */
    level: {
        type: Number,
        default: 10,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

// Index tên vai trò để tra cứu nhanh
roleSchema.index({ name: 1 });
roleSchema.index({ level: -1 });

module.exports = mongoose.model('Role', roleSchema);
