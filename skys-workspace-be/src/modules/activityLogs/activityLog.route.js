/**
 * @file activityLog.route.js
 * @description Route định tuyến cho module ActivityLog.
 * Base path: /api/activity-logs
 */
const express = require('express');
const router = express.Router();
const { getProjectActivityLogs, logActivity } = require('./activityLog.controller');
const { protect } = require('../../middleware/auth.middleware');

router.get('/project/:projectId', protect, getProjectActivityLogs);
router.post('/', protect, logActivity);

module.exports = router;
