const projectService = require('./project.service');
const { CreateProjectDTO, UpdateProjectDTO } = require('./project.dto');
const asyncHandler = require('../../shared/constants/asyncHandler');

const getProjects = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user.userId;
    const projects = await projectService.getAll(userId);
    res.status(200).json(projects);
});

const getRootProjects = asyncHandler(async (req, res) => {
    const projects = await projectService.getRootProjects();
    res.status(200).json(projects);
});

const getProjectById = asyncHandler(async (req, res) => {
    const project = await projectService.getById(req.params.id);
    res.status(200).json(project);
});

const getSubProjects = asyncHandler(async (req, res) => {
    const projects = await projectService.getSubProjects(req.params.id);
    res.status(200).json(projects);
});

const createProject = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user.userId;
    const dto = new CreateProjectDTO(req.body).validate();
    const project = await projectService.create(dto, userId);
    res.status(201).json(project);
});

const deleteProject = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user.userId;
    const result = await projectService.remove(req.params.id, userId);
    res.status(200).json(result);
});

const updateProject = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user.userId;
    const dto = new UpdateProjectDTO(req.body).validate();
    const updated = await projectService.update(req.params.id, dto, userId);
    res.status(200).json(updated);
});

const getAllProjectsAdmin = asyncHandler(async (req, res) => {
    const projects = await projectService.getAllProjects();
    res.status(200).json(projects);
});

const deleteProjectAdmin = asyncHandler(async (req, res) => {
    const result = await projectService.removeProjectByAdmin(req.params.id);
    res.status(200).json(result);
});

const addProjectMember = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email thành viên là bắt buộc', code: 'EMAIL_REQUIRED' });
    }
    const userId = req.user.id || req.user.userId;
    const project = await projectService.addMember(req.params.id, email, userId);
    res.status(200).json(project);
});

const getProjectMembers = asyncHandler(async (req, res) => {
    const userId = req.user.id || req.user.userId;
    const members = await projectService.getMembers(req.params.id, userId);
    res.status(200).json(members);
});

module.exports = {
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
    getProjectById
};

