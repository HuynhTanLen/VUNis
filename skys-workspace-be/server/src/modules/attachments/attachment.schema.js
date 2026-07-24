/**
 * @file attachment.schema.js
 * @description Mongoose Schema cho bảng Attachment.
 * Lưu file tài liệu đính kèm vào công việc (Task).
 */
const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: [true, 'Tên file lưu trữ là bắt buộc']
    },
    originalName: {
        type: String,
        required: [true, 'Tên file gốc là bắt buộc']
    },
    url: {
        type: String,
        required: [true, 'Đường dẫn file (URL) là bắt buộc']
    },
    size: {
        type: Number, // Dung lượng file tính bằng bytes
        required: [true, 'Kích thước file là bắt buộc']
    },
    mimeType: {
        type: String,
        required: [true, 'Định dạng file (mimeType) là bắt buộc']
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: [true, 'Tài liệu đính kèm phải thuộc về một công việc']
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Người tải lên tài liệu là bắt buộc']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Attachment', attachmentSchema);
