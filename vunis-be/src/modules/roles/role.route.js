const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const {
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
} = require('./role.controller');

router.get('/', protect, getRoles);
router.get('/:id', protect, getRoleById);
router.post('/', protect, authorize('SUPER_ADMIN', 'USER_ADMIN'), createRole);
router.put('/:id', protect, authorize('SUPER_ADMIN', 'USER_ADMIN'), updateRole);
router.delete('/:id', protect, authorize('SUPER_ADMIN', 'USER_ADMIN'), deleteRole);

module.exports = router;
