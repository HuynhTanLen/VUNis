/**
 * @file role.route.js
 * @description Route định tuyến cho module Role.
 * Base path: /api/roles
 */
const express = require('express');
const router = express.Router();
const { getRoles, createRole, updateRole, deleteRole } = require('./role.controller');
const { protect } = require('../../middleware/auth.middleware');

router.get('/', protect, getRoles);
router.post('/', protect, createRole);
router.put('/:id', protect, updateRole);
router.delete('/:id', protect, deleteRole);

module.exports = router;
