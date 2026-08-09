/**
 * @file label.route.js
 * @description Route định tuyến cho module Label.
 * Base path: /api/labels
 */
const express = require('express');
const router = express.Router();
const { getProjectLabels, createLabel, updateLabel, deleteLabel } = require('./label.controller');
const { protect } = require('../../middleware/auth.middleware');
const { checkProjectPermission } = require('../../middleware/rbac.middleware');

router.get('/project/:projectId', protect, checkProjectPermission(), getProjectLabels);
router.post('/', protect, checkProjectPermission('PROJECT_MANAGER'), createLabel);
router.put('/:id', protect, checkProjectPermission('PROJECT_MANAGER'), updateLabel);
router.delete('/:id', protect, checkProjectPermission('PROJECT_MANAGER'), deleteLabel);

module.exports = router;
