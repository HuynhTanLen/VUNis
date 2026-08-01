/**
 * @file attachment.mapper.js
 * @description Format Attachment entity sang Response DTO.
 */

const toAttachmentResponse = (att) => {
    if (!att) return null;

    return {
        id: att.id,
        filename: att.filename,
        originalName: att.originalName,
        url: att.url,
        size: att.size,
        mimeType: att.mimeType,
        taskId: att.task?.id || att.taskId || att.task,
        uploader: att.uploader && typeof att.uploader === 'object' && att.uploader.id ? {
            id: att.uploader.id,
            name: att.uploader.name,
            email: att.uploader.email
        } : att.uploader,
        createdAt: att.createdAt
    };
};

const toAttachmentListResponse = (atts) => {
    if (!Array.isArray(atts)) return [];
    return atts.map(toAttachmentResponse);
};

module.exports = {
    toAttachmentResponse,
    toAttachmentListResponse
};
