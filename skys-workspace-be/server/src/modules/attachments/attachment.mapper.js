/**
 * @file attachment.mapper.js
 * @description Format Attachment entity sang Response DTO.
 */

const toAttachmentResponse = (att) => {
    if (!att) return null;

    return {
        id: att._id,
        filename: att.filename,
        originalName: att.originalName,
        url: att.url,
        size: att.size,
        mimeType: att.mimeType,
        taskId: att.task?._id || att.task,
        uploader: att.uploader && typeof att.uploader === 'object' && att.uploader._id ? {
            id: att.uploader._id,
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
