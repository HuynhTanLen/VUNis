/**
 * @file attachment.route.js
 * @description Route định tuyến cho module Attachment.
 * Base path: /api/attachments
 */
const express = require('express');
const router = express.Router();
const { getTaskAttachments, uploadAttachment, deleteAttachment, editAttachment } = require('./attachment.controller');
const { protect } = require('../../middleware/auth.middleware');
const { checkProjectPermission } = require('../../middleware/rbac.middleware');

router.get('/task/:taskId', protect, checkProjectPermission(), getTaskAttachments);
router.post('/', protect, checkProjectPermission(), uploadAttachment);
router.delete('/:id', protect, checkProjectPermission(), deleteAttachment);
router.patch('/edit/:id', protect, checkProjectPermission(), editAttachment);

module.exports = router;
