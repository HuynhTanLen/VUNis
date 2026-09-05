/**
 * @file projectPhase.route.js
 * @description Route định tuyến cho module ProjectPhase.
 * Base path: /api/project-phases
 */
const express = require('express');
const router = express.Router();
const {
    getProjectPhases,
    createProjectPhase,
    updateProjectPhase,
    deleteProjectPhase,
    seedProjectPhases
} = require('./projectPhase.controller');
const { protect } = require('../../middleware/auth.middleware');
const { checkProjectPermission } = require('../../middleware/rbac.middleware');

router.get('/project/:projectId', protect, checkProjectPermission(), getProjectPhases);
router.post('/', protect, checkProjectPermission('PROJECT_MANAGER'), createProjectPhase);
router.post('/project/:projectId/seed', protect, checkProjectPermission('PROJECT_MANAGER'), seedProjectPhases);
router.put('/:id', protect, checkProjectPermission('PROJECT_MANAGER'), updateProjectPhase);
router.delete('/:id', protect, checkProjectPermission('PROJECT_MANAGER'), deleteProjectPhase);

module.exports = router;
