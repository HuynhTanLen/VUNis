/**
 * @file attachment.controller.js
 * @description Controller layer cho module Attachment.
 */
const attService = require('./attachment.service');
const { CreateAttachmentDTO } = require('./attachment.dto');

const getTaskAttachments = async (req, res) => {
    try {
        const taskId = req.params.taskId || req.params.id;
        const atts = await attService.getByTask(taskId);
        res.status(200).json(atts);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const uploadAttachment = async (req, res) => {
    try {
        const dto = new CreateAttachmentDTO(req.body).validate();
        const att = await attService.createAttachment(dto, req.user.userId);
        res.status(201).json(att);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const deleteAttachment = async (req, res) => {
    try {
        const result = await attService.removeAttachment(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

module.exports = {
    getTaskAttachments,
    uploadAttachment,
    deleteAttachment
};
