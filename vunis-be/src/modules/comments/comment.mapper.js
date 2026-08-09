/**
 * @file comment.mapper.js
 * @description Chuyển đổi Entity Comment sang Response DTO an toàn cho Frontend.
 */

const toCommentResponse = (comment) => {
    if (!comment) return null;

    return {
        id: comment.id,
        content: comment.content,
        taskId: comment.task?.id || comment.taskId || comment.task,
        parentId: comment.parentId || null,
        author: comment.author && typeof comment.author === 'object' && comment.author.id ? {
            id: comment.author.id,
            name: comment.author.name,
            email: comment.author.email,
            avatar: comment.author.avatar
        } : comment.author,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
    };
};

const toCommentListResponse = (comments) => {
    if (!Array.isArray(comments)) return [];
    return comments.map(toCommentResponse);
};

module.exports = {
    toCommentResponse,
    toCommentListResponse
};
