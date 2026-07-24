/**
 * @file comment.schema.js
 * @description Mongoose Schema cho bảng Comment.
 * Lưu trữ bình luận, trao đổi trực tiếp trên từng Task.
 */
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Nội dung bình luận không được để trống'],
        trim: true
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: [true, 'Bình luận phải thuộc về một công việc']
    },
    userId:{type: mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    parentId:{type: mongoose.Schema.Types.ObjectId, ref:'Comment', default:null},
}, {
    timestamps: true
});
commentSchema.index({ taskId: 1, createdAt: -1 });
module.exports = mongoose.model('Comment', commentSchema);
