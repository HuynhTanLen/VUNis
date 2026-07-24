/**
 * @file attachment.route.js
 * @description Route định tuyến cho module Attachment.
 * Base path: /api/attachments
 */
const express = require('express');
const router = express.Router();
const { getTaskAttachments, uploadAttachment, deleteAttachment } = require('./attachment.controller');
const { protect } = require('../../middleware/auth.middleware');

router.get('/task/:taskId', protect, getTaskAttachments);
router.post('/', protect, uploadAttachment);
router.delete('/:id', protect, deleteAttachment);

module.exports = router;
