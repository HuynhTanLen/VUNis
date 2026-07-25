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

router.use(protect);

router.get('/project/:projectId', checkProjectPermission(), getSprints);

router.post('/project/:projectId', checkProjectPermission(
    'PROJECT_MANAGER', 'FRONTEND_LEAD', 'BACKEND_LEAD', 'DESIGN_LEAD', 'QA_LEAD', 'DEVOPS_LEAD'
), createSprint);

router.patch('/:id/start', checkProjectPermission(
    'PROJECT_MANAGER', 'FRONTEND_LEAD', 'BACKEND_LEAD', 'DESIGN_LEAD', 'QA_LEAD', 'DEVOPS_LEAD'
), startSprint);

router.put('/:id/complete', checkProjectPermission(
    'PROJECT_MANAGER', 'FRONTEND_LEAD', 'BACKEND_LEAD', 'DESIGN_LEAD', 'QA_LEAD', 'DEVOPS_LEAD'
), completeSprint);

module.exports = router;
