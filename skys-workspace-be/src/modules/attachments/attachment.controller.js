/**
 * @file attachment.controller.js
 * @description Controller layer cho module Attachment.
 */
const attService = require('./attachment.service');
const { CreateAttachmentDTO } = require('./attachment.dto');
const asyncHandler = require('../../shared/constants/asyncHandler');

const getTaskAttachments = asyncHandler(async (req, res) => {
    const taskId = req.params.taskId || req.params.id;
    const atts = await attService.getByTask(taskId);
    res.status(200).json(atts);
});

const uploadAttachment = asyncHandler(async (req, res) => {
    const dto = new CreateAttachmentDTO(req.body).validate();
    const att = await attService.createAttachment(dto, req.user.id);
    res.status(201).json(att);
});

const deleteAttachment = asyncHandler(async (req, res) => {
    const result = await attService.removeAttachment(req.params.id);
    res.status(200).json(result);
});

const editAttachment = asyncHandler(async (req, res) => {
    const updatedAtt = await attService.editAttachment(req.params.id, req.body);
    res.status(200).json(updatedAtt)
})


module.exports = {
    getTaskAttachments,
    uploadAttachment,
    deleteAttachment,
    editAttachment
};
