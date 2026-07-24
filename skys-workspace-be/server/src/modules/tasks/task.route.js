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

router.post('/', checkProjectPermission('Leader', 'Member'), createTask);
router.get('/:projectId', checkProjectPermission(), getTasksByProject);
router.put('/:id', checkProjectPermission('Leader', 'Member'), updateTask);
router.delete('/:id', checkProjectPermission('Leader'), deleteTask);

// Subtask Routes
router.post('/:id/subtasks', checkProjectPermission('Leader', 'Member'), addSubTask);
router.patch('/:id/subtasks/:subtaskId/toggle', checkProjectPermission('Leader', 'Member'), toggleSubTask);
router.put('/:id/subtasks/:subtaskId', checkProjectPermission('Leader', 'Member'), editSubTask);
router.delete('/:id/subtasks/:subtaskId', checkProjectPermission('Leader', 'Member'), removeSubTask);

module.exports = router;

