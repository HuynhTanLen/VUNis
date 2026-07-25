/**
 * @file task.route.js
 * @description Định tuyến API cho module Task.
 * Base path: /api/tasks
 */
const express = require('express');
const router = express.Router();
const { 
    getTasksByProject, 
    createTask, 
    updateTask, 
    deleteTask,
    addSubTask,
    toggleSubTask,
    editSubTask,
    removeSubTask
} = require('./task.controller');
const { protect } = require('../../middleware/auth.middleware');
const { checkProjectPermission } = require('../../middleware/rbac.middleware');

router.use(protect);

router.post('/', checkProjectPermission(
    'PROJECT_MANAGER', 
    'FRONTEND_LEAD', 'BACKEND_LEAD', 'DESIGN_LEAD', 'QA_LEAD', 'DEVOPS_LEAD',
    'FRONTEND_DEVELOPER', 'BACKEND_DEVELOPER', 'UI_UX_DESIGNER', 'QA_TESTER', 'DEVOPS_ENGINEER', 'MEMBER'
), createTask);
router.get('/:projectId', checkProjectPermission(), getTasksByProject);
router.put('/:id', checkProjectPermission(), updateTask);
router.delete('/:id', checkProjectPermission('PROJECT_MANAGER'), deleteTask);

// Subtask Routes
router.post('/:id/subtasks', checkProjectPermission(), addSubTask);
router.patch('/:id/subtasks/:subtaskId/toggle', checkProjectPermission(), toggleSubTask);
router.put('/:id/subtasks/:subtaskId', checkProjectPermission(), editSubTask);
router.delete('/:id/subtasks/:subtaskId', checkProjectPermission(), removeSubTask);

module.exports = router;

