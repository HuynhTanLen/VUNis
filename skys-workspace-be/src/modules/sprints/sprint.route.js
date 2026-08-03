/**
 * @file sprint.route.js
 * @description Định tuyến API cho module Sprint.
 * Base path: /api/sprints
 */
const express = require('express');
const router = express.Router();
const { getSprints, createSprint, completeSprint,startSprint } = require('./sprint.controller');
const { protect } = require('../../middleware/auth.middleware');
const {checkProjectPermission} = require('../../middleware/rbac.middleware');
const { LEAD_ROLES } = require('../../shared/constants/teamRoles');

router.use(protect);

router.get('/project/:projectId', checkProjectPermission(), getSprints);

router.post('/project/:projectId', checkProjectPermission(...LEAD_ROLES), createSprint);

router.patch('/:id/start', checkProjectPermission(...LEAD_ROLES), startSprint);

router.put('/:id/complete', checkProjectPermission(...LEAD_ROLES), completeSprint);

module.exports = router;
