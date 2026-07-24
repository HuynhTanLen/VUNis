/**
 * @file activityLog.schema.js
 * @description Mongoose Schema cho bảng ActivityLog (Nhật ký hoạt động).
 * Ghi nhận toàn bộ các hành động thao tác trong hệ thống dự án.
 */
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: [true, 'Mô tả hành động là bắt buộc'],
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Loại hành động (ví dụ: task, project, member) là bắt buộc'],
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Hành động phải được thực hiện bởi một người dùng']
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Hành động phải thuộc về một dự án cụ thể']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
