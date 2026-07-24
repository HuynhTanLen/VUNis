/**
 * @file projectMember.route.js
 * @description Route định tuyến cho module ProjectMember.
 * Base path: /api/project-members
 */
const express = require('express');
const router = express.Router();
const { getMembers, addMember, updateRole, deleteMember } = require('./projectMember.controller');
const { protect } = require('../../middleware/auth.middleware');

router.get('/project/:projectId', protect, getMembers);
router.post('/', protect, addMember);
router.put('/:id/role', protect, updateRole);
router.delete('/:id', protect, deleteMember);

module.exports = router;
