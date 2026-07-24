/**
 * @file userStatusLog.schema.js
 * @description Mongoose Schema cho bảng UserStatusLog (Nhật ký theo dõi trạng thái người dùng).
 * Phục vụ Dashboard Admin theo dõi người dùng online/offline/blocked chống nghẽn cổ chai.
 */
const mongoose = require('mongoose');

const userStatusLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    action: {
        type: String,
        enum: ['LOGIN', 'LOGOUT', 'PING', 'BLOCKED', 'UNBLOCKED', 'ROLE_CHANGED'],
        required: true
    },
    ipAddress: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// TTL Index: Tự động dọn dẹp log cũ sau 90 ngày (7,776,000 giây) để tránh tràn bộ nhớ DB
userStatusLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('UserStatusLog', userStatusLogSchema);
