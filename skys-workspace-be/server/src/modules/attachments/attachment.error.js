/**
 * @file attachment.error.js
 * @description Custom Error class cho module Attachment.
 */
const { NotFoundError } = require('../../shared/errors/AppError');

class AttachmentNotFoundError extends NotFoundError {
    constructor() {
        super('Tài liệu đính kèm');
    }
}

module.exports = {
    AttachmentNotFoundError
};
