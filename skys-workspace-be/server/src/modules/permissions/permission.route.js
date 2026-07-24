/**
 * @file permission.route.js
 * @description Route định tuyến cho module Permission.
 * Base path: /api/permissions
 */
const express = require('express');
const router = express.Router();
const { getPermissions, createPermission, updatePermission, deletePermission } = require('./permission.controller');
const { protect } = require('../../middleware/auth.middleware');

router.get('/', protect, getPermissions);
router.post('/', protect, createPermission);
router.put('/:id', protect, updatePermission);
router.delete('/:id', protect, deletePermission);

module.exports = router;
