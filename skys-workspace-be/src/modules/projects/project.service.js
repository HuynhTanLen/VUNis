const ProjectMember = require('../projectMembers/projectMember.schema');
const projectRepo = require('./project.repository');
const projectMapper = require('./project.mapper');
const authRepo = require('../auth/auth.repository');
const { AppError } = require('../../shared/errors/AppError');
const { ProjectNotFoundError, ForbiddenProjectActionError } = require('./project.error');

const getAll = async (userId) => {
    const projects = await projectRepo.findProjectsByOwner(userId);
    const mapped = projectMapper.toProjectListResponse(projects);

    const projectsWithRole = await Promise.all(mapped.map(async (project) => {
        const memberRecord = await ProjectMember.findOne({
            project: project.id,
            user: userId
        }).lean();

        const ownerId = project.owner && typeof project.owner === 'object' ? project.owner.id?.toString() : project.owner?.toString();
        const userRole = memberRecord ? memberRecord.role : (ownerId === userId.toString() ? 'Project Manager' : null);

        return {
            ...project,
            userRole
        };
    }));

    return projectsWithRole;
};

const create = async (dto, userId) => {
    const projectData = {
        name: dto.name,
        description: dto.description,
        budget: dto.budget,
        durationWeeks: dto.durationWeeks,
        startDate: dto.startDate,
        endDate: dto.endDate,
        status: 'active',
        priority: dto.priority,
        owner: userId
    };
    const newProject = await projectRepo.createProject(projectData);

    // Tự động tạo bản ghi thành viên dự án cho người tạo với vai trò Project Manager
    await ProjectMember.create({
        user: userId,
        project: newProject._id,
        role: 'PROJECT_MANAGER',
        status: 'accepted'
    });

    return projectMapper.toProjectResponse(newProject);
};

const remove = async (projectId, userId) => {
    const project = await projectRepo.findProjectById(projectId);
    if (!project) {
        throw new ProjectNotFoundError();
    }
    const ownerId = project.owner?._id?.toString() || project.owner?.toString();
    if (ownerId !== userId) {
        throw new ForbiddenProjectActionError('xóa dự án này');
    }
    await projectRepo.deleteProject(projectId);
    return { message: 'Xóa dự án thành công' };
};

const update = async (projectId, dto, userId) => {
    const project = await projectRepo.findProjectById(projectId);
    if (!project) {
        throw new ProjectNotFoundError();
    }
    const ownerId = project.owner?._id?.toString() || project.owner?.toString();
    if (ownerId !== userId) {
        throw new ForbiddenProjectActionError('cập nhật dự án này');
    }

    const updateData = {};
    const allowedFields = ['name', 'description', 'budget', 'durationWeeks', 'startDate', 'endDate', 'status', 'priority'];
    allowedFields.forEach(field => {
        if (dto[field] !== undefined) {
            updateData[field] = dto[field];
        }
    });

    const updatedProject = await projectRepo.updateProject(projectId, updateData);
    return projectMapper.toProjectResponse(updatedProject);
};

const getAllProjects = async () => {
    const projects = await projectRepo.findAllProjects();
    return projectMapper.toProjectListResponse(projects, true);
};

const removeProjectByAdmin = async (projectId) => {
    const project = await projectRepo.findProjectById(projectId);
    if (!project) {
        throw new ProjectNotFoundError();
    }
    await projectRepo.deleteProject(projectId);
    return { message: 'Xóa dự án thành công (Quyền Admin)' };
};

const addMember = async (projectId, email, userId) => {
    const project = await projectRepo.findProjectById(projectId);
    if (!project) {
        throw new ProjectNotFoundError();
    }
    
    const ownerId = project.owner?._id?.toString() || project.owner?.toString();
    if (!ownerId) {
        throw new AppError('Dự án không có chủ sở hữu hợp lệ', 400, 'PROJECT_OWNER_INVALID');
    }
    
    // Only owner can invite members
    if (ownerId !== userId) {
        throw new ForbiddenProjectActionError('thêm thành viên vào dự án này');
    }
    
    // Find user to add
    const userToAdd = await authRepo.findByEmail(email);
    if (!userToAdd) {
        throw new AppError('Không tìm thấy người dùng với email này', 404, 'MEMBER_NOT_FOUND');
    }
    
    const userToAddId = userToAdd._id.toString();
    
    // Check if user is owner
    if (ownerId === userToAddId) {
        throw new AppError('Người dùng này là chủ sở hữu dự án', 400, 'MEMBER_IS_OWNER');
    }
    
    // Check if user is already a member
    const isAlreadyMember = project.members.some(m => {
        const mId = m?._id?.toString() || m?.toString();
        return mId === userToAddId;
    });
    if (isAlreadyMember) {
        throw new AppError('Người dùng này đã là thành viên của dự án', 400, 'MEMBER_ALREADY_EXISTS');
    }
    
    // Add user _id to project members
    project.members.push(userToAdd._id);
    
    const updatedProject = await projectRepo.updateProject(projectId, { members: project.members });
    return projectMapper.toProjectResponse(updatedProject);
};

const getMembers = async (projectId, userId) => {
    const project = await projectRepo.findProjectById(projectId);
    if (!project) {
        throw new ProjectNotFoundError();
    }
    
    const ownerId = project.owner?._id?.toString() || project.owner?.toString();
    if (!ownerId) {
        throw new AppError('Dự án không có chủ sở hữu hợp lệ', 400, 'PROJECT_OWNER_INVALID');
    }
    
    const isOwner = ownerId === userId;
    const isMember = project.members.some(m => {
        const mId = m?._id?.toString() || m?.toString();
        return mId === userId;
    });
    
    if (!isOwner && !isMember) {
        throw new ForbiddenProjectActionError('truy cập danh sách thành viên dự án này');
    }
    
    const ownerItem = {
        id: project.owner?._id || project.owner,
        name: project.owner?.name || 'Unknown Owner',
        email: project.owner?.email || '',
        role: 'Owner'
    };
    
    const memberItems = project.members.map(m => ({
        id: m?._id || m,
        name: m?.name || 'Unknown Member',
        email: m?.email || '',
        role: m?.role || 'Member'
    })).filter(m => m.id);
    
    return [ownerItem, ...memberItems];
};

const getRootProjects = async () => {
    return await projectRepo.findRootProjects();
};

const getSubProjects = async (parentProjectId) => {
    const parent = await projectRepo.findProjectById(parentProjectId);
    if (!parent) {
        const error = new Error('Dự án gốc không tồn tại');
        error.statusCode = 404;
        throw error;
    }
    return await projectRepo.findSubProjects(parentProjectId);
};

module.exports = { 
    getAll, 
    create, 
    remove, 
    update, 
    getAllProjects, 
    removeProjectByAdmin,
    addMember,
    getMembers,
    getRootProjects,
    getSubProjects
};

