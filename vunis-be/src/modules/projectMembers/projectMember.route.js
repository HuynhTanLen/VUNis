/**
 * @file projectMember.route.js
 * @description Route định tuyến cho module ProjectMember.
 * Base path: /api/project-members
 */
const express = require('express');
const router = express.Router();
const { getMembers, addMember, updateRole, deleteMember } = require('./projectMember.controller');
const { protect } = require('../../middleware/auth.middleware');
const { checkProjectPermission } = require('../../middleware/rbac.middleware');

router.get('/project/:projectId', protect, checkProjectPermission(), getMembers);
router.post('/', protect, checkProjectPermission('PROJECT_MANAGER'), addMember);
router.put('/:id/role', protect, checkProjectPermission('PROJECT_MANAGER'), updateRole);
router.delete('/:id', protect, checkProjectPermission('PROJECT_MANAGER'), deleteMember);

module.exports = router;
