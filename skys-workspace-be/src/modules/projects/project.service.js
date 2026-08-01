const prisma = require('../../config/prisma');
const projectRepo = require('./project.repository');
const projectMapper = require('./project.mapper');
const authRepo = require('../auth/auth.repository');
const { AppError } = require('../../shared/errors/AppError');
const { ProjectNotFoundError, ForbiddenProjectActionError } = require('./project.error');

const getAll = async (userId) => {
    const projects = await projectRepo.findProjectsByOwner(userId);
    const mapped = projectMapper.toProjectListResponse(projects);

    const projectsWithRole = await Promise.all(mapped.map(async (project) => {
        const memberRecord = await prisma.projectMember.findFirst({
            where: {
                projectId: project.id,
                userId: userId
            }
        });

        const ownerId = project.owner && typeof project.owner === 'object' ? project.owner.id?.toString() : project.owner?.toString();
        const userRole = memberRecord ? memberRecord.role : (ownerId === userId.toString() ? 'PROJECT_MANAGER' : null);

        return {
            ...project,
            userRole
        };
    }));

    return projectsWithRole;
};

const generateProjectKey = (name) => {
    const clean = (name || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
    const prefix = clean.length >= 2 ? clean : 'PRJ';
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
};

const create = async (dto, userId) => {
    const validPriorityMap = {
        'low': 'LOW',
        'medium': 'MEDIUM',
        'high': 'HIGH',
        'urgent': 'URGENT'
    };
    const normalizedPriority = validPriorityMap[(dto.priority || '').toLowerCase()] || 'MEDIUM';

    const projectData = {
        name: dto.name,
        key: dto.key || generateProjectKey(dto.name),
        description: dto.description || '',
        budget: typeof dto.budget === 'number' ? dto.budget : 0,
        durationWeeks: dto.durationWeeks ? Math.max(1, Math.round(dto.durationWeeks)) : 4,
        startDate: dto.startDate || new Date(),
        endDate: dto.endDate || null,
        status: 'ACTIVE',
        priority: normalizedPriority,
        ownerId: userId
    };

    const newProject = await prisma.$transaction(async (tx) => {
        const proj = await tx.project.create({ data: projectData });
        await tx.projectMember.create({
            data: {
                userId: userId,
                projectId: proj.id,
                role: 'PROJECT_MANAGER'
            }
        });
        return proj;
    });

    const fullProject = await projectRepo.findProjectById(newProject.id);
    return projectMapper.toProjectResponse(fullProject);
};

const remove = async (projectId, userId) => {
    const project = await projectRepo.findProjectById(projectId);
    if (!project) {
        throw new ProjectNotFoundError();
    }
    const ownerId = project.owner?.id?.toString() || project.ownerId?.toString();
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
    const ownerId = project.owner?.id?.toString() || project.ownerId?.toString();
    if (ownerId !== userId) {
        throw new ForbiddenProjectActionError('cập nhật dự án này');
    }

    const statusMap = {
        'active': 'ACTIVE',
        'paused': 'ON_HOLD',
        'done': 'COMPLETED',
        'planning': 'PLANNING',
        'cancelled': 'CANCELLED',
        'ACTIVE': 'ACTIVE',
        'ON_HOLD': 'ON_HOLD',
        'COMPLETED': 'COMPLETED'
    };

    const priorityMap = {
        'low': 'LOW',
        'medium': 'MEDIUM',
        'high': 'HIGH',
        'urgent': 'URGENT',
        'LOW': 'LOW',
        'MEDIUM': 'MEDIUM',
        'HIGH': 'HIGH',
        'URGENT': 'URGENT'
    };

    const updateData = {};
    const allowedFields = ['name', 'description', 'budget', 'durationWeeks', 'startDate', 'endDate'];
    allowedFields.forEach(field => {
        if (dto[field] !== undefined) {
            updateData[field] = dto[field];
        }
    });

    if (dto.status !== undefined) {
        updateData.status = statusMap[(dto.status || '').toLowerCase()] || 'ACTIVE';
    }

    if (dto.priority !== undefined) {
        updateData.priority = priorityMap[(dto.priority || '').toLowerCase()] || 'MEDIUM';
    }

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
    
    const ownerId = project.owner?.id?.toString() || project.ownerId?.toString();
    if (!ownerId) {
        throw new AppError('Dự án không có chủ sở hữu hợp lệ', 400, 'PROJECT_OWNER_INVALID');
    }
    
    // Allow adding members to project
    
    // Find user to add
    // AuthRepo should ideally be migrated, assuming it returns an object with an 'id'
    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
        throw new AppError('Không tìm thấy người dùng với email này', 404, 'MEMBER_NOT_FOUND');
    }
    
    const userToAddId = userToAdd.id;
    
    // Check if user is owner
    if (ownerId === userToAddId) {
        throw new AppError('Người dùng này là chủ sở hữu dự án', 400, 'MEMBER_IS_OWNER');
    }
    
    // Check if user is already a member
    const existingMember = await prisma.projectMember.findFirst({
        where: { projectId: projectId, userId: userToAddId }
    });
    if (existingMember) {
        throw new AppError('Người dùng này đã là thành viên của dự án', 400, 'MEMBER_ALREADY_EXISTS');
    }
    
    // Add user to project members
    await prisma.projectMember.create({
        data: {
            userId: userToAddId,
            projectId: projectId,
            role: 'MEMBER'
        }
    });
    
    const updatedProject = await projectRepo.findProjectById(projectId);
    return projectMapper.toProjectResponse(updatedProject);
};

const getMembers = async (projectId, userId) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                owner: { select: { id: true, name: true, email: true, avatar: true } }
            }
        });

        if (!project) return [];
        
        let ownerUser = project.owner;
        if (!ownerUser && project.ownerId) {
            ownerUser = await prisma.user.findUnique({
                where: { id: project.ownerId },
                select: { id: true, name: true, email: true, avatar: true }
            });
        }
        if (!ownerUser && userId) {
            ownerUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, email: true, avatar: true }
            });
        }
        
        const ownerItem = ownerUser ? {
            id: ownerUser.id,
            name: ownerUser.name || 'Chủ dự án',
            email: ownerUser.email || '',
            avatar: ownerUser.avatar || '',
            role: 'Owner'
        } : null;
        
        const projectMembers = await prisma.projectMember.findMany({
            where: { projectId },
            include: { user: { select: { id: true, name: true, email: true, avatar: true } } }
        });

        const memberItems = (projectMembers || [])
            .filter(m => m && m.user && m.user.id && m.user.id !== ownerUser?.id)
            .map(m => ({
                id: m.user.id,
                name: m.user.name || 'Thành viên',
                email: m.user.email || '',
                avatar: m.user.avatar || '',
                role: m.role || 'Member'
            }));
        
        return ownerItem ? [ownerItem, ...memberItems] : memberItems;
    } catch (err) {
        console.error('Lỗi getMembers:', err);
        return [];
    }
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

