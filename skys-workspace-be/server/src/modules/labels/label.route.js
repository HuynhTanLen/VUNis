/**
 * @file label.route.js
 * @description Route định tuyến cho module Label.
 * Base path: /api/labels
 */
const express = require('express');
const router = express.Router();
const { getProjectLabels, createLabel, updateLabel, deleteLabel } = require('./label.controller');
const { protect } = require('../../middleware/auth.middleware');

router.get('/project/:projectId', protect, getProjectLabels);
router.post('/', protect, createLabel);
router.put('/:id', protect, updateLabel);
router.delete('/:id', protect, deleteLabel);

module.exports = router;
