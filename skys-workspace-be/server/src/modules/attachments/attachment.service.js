/**
 * @file attachment.service.js
 * @description Service layer cho module Attachment.
 */
const attRepo = require('./attachment.repository');
const attMapper = require('./attachment.mapper');
const { AttachmentNotFoundError } = require('./attachment.error');
const Task = require('../tasks/task.schema');
const { NotFoundError } = require('../../shared/errors/AppError');

const getByTask = async (taskId) => {
    const taskExists = await Task.findById(taskId);
    if (!taskExists) {
        throw new NotFoundError('Công việc');
    }

    const list = await attRepo.findByTaskId(taskId);
    return attMapper.toAttachmentListResponse(list);
};

const createAttachment = async (dto, uploaderId) => {
    const taskExists = await Task.findById(dto.taskId);
    if (!taskExists) {
        throw new NotFoundError('Công việc');
    }

    const att = await attRepo.create({
        filename: dto.filename,
        originalName: dto.originalName,
        url: dto.url,
        size: dto.size,
        mimeType: dto.mimeType,
        task: dto.taskId,
        uploader: uploaderId
    });

    return attMapper.toAttachmentResponse(att);
};

const removeAttachment = async (id) => {
    const att = await attRepo.findById(id);
    if (!att) throw new AttachmentNotFoundError();

    await attRepo.remove(id);
    return { message: 'Đã xóa tài liệu đính kèm thành công' };
};

module.exports = {
    getByTask,
    createAttachment,
    removeAttachment
};
