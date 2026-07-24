/**
 * @file notification.schema.js
 * @description Mongoose Schema cho bảng Notification.
 * Lưu thông báo gửi đến người dùng hệ thống.
 */
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: {
        type: String,
        required: [true, 'Nội dung thông báo là bắt buộc'],
        trim: true
    },
    type: {
        type: String,
        enum: ['task_assigned', 'comment_mentioned', 'sprint_closing', 'deadline_approaching', 'system'],
        default: 'system'
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Thông báo phải có người nhận']
    },
    relatedProject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    relatedTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
