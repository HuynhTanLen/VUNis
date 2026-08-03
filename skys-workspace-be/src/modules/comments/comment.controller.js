/**
 * @file comment.controller.js
 * @description Tầng Controller cho module Comment.
 * Nhận HTTP request → Validate DTO → Gọi Service → Trả HTTP Response.
 */
const commentService = require('./comment.service');
const { CreateCommentDTO, UpdateCommentDTO } = require('./comment.dto');
const asyncHandler = require('../../shared/constants/asyncHandler');

const getCommentsByTask = asyncHandler(async (req, res) => {
    const taskId = req.params.taskId || req.params.id;
    const comments = await commentService.getCommentByTask(taskId);
    res.status(200).json(comments);
});

const createComment = asyncHandler(async (req, res) => {
    const dto = new CreateCommentDTO(req.body).validate();
    const comment = await commentService.create(dto, req.user.id || req.user.userId);
    res.status(201).json(comment);
});

const updateComment = asyncHandler(async (req, res) => {
    const dto = new UpdateCommentDTO(req.body).validate();
    const updated = await commentService.update(
        req.params.id,
        dto,
        req.user.id,
        req.user.role
    );
    res.status(200).json(updated);
});

const deleteComment = asyncHandler(async (req, res) => {
    const result = await commentService.remove(
        req.params.id,
        req.user.id,
        req.user.role
    );
    res.status(200).json(result);
});

module.exports = {
    getCommentsByTask,
    createComment,
    updateComment,
    deleteComment
};
