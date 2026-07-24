/**
 * @file comment.repository.js
 * @description Tầng Repository cho module Comment.
 * Chứa tất cả các truy vấn trực tiếp tới Database MongoDB qua Mongoose.
 */
const Comment = require('./comment.schema');

const findCommentByTaskId = (taskId) => {
    return Comment.find({ taskId: taskId })
        .populate('userId', 'name email avatar')
        .sort({ createdAt: -1 });
};

const findById = (commentId) => {
    return Comment.findById(commentId)
        .populate('userId', 'name email avatar');
};

const createComment = async (data) => {
    const newComment = await Comment.create(data);
    return Comment.findById(newComment._id).populate('userId', 'name email avatar');
};

const update = (commentId, content) => {
    return Comment.findByIdAndUpdate(
        commentId,
        {$set: {content} },
        { new: true }
    ).populate('userId', 'name email avatar');
};

const removeComment = (commentId) => {
    return Comment.findByIdAndDelete(commentId);
};

module.exports = {
    findCommentByTaskId,
    findById,
    createComment,
    update,
    removeComment
};
