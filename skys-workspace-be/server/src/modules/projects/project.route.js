/**
 * @file project.route.js
 * @description Định tuyến API cho module Project.
 * Base path: /api/projects
 */
const express = require('express');
const router = express.Router();
const { 
    getProjects, 
    getRootProjects,
    getSubProjects,
    createProject, 
    deleteProject, 
    updateProject, 
    getAllProjectsAdmin, 
    deleteProjectAdmin,
    addProjectMember,
    getProjectMembers,
    
} = require('./project.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');

router.use(protect);

// Route Cây dự án (Dự án gốc và Dự án con)
router.get('/roots', getRootProjects);
router.get('/:id/sub-projects', getSubProjects);

router.route('/')
    .get(getProjects)
    .post(createProject);

// Admin-only project routes (Google Workspace Admin Levels: SUPER_ADMIN, SERVICE_ADMIN)
router.get('/admin/all', authorize('SUPER_ADMIN', 'SERVICE_ADMIN'), getAllProjectsAdmin);
router.delete('/admin/:id', authorize('SUPER_ADMIN', 'SERVICE_ADMIN'), deleteProjectAdmin);

router.route('/:id/members')
    .get(getProjectMembers)
    .post(addProjectMember);

router.route('/:id')
    .put(updateProject)
    .delete(deleteProject);

module.exports = router;

