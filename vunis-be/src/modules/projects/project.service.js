const prisma = require('../../config/prisma');
const projectRepo = require('./project.repository');
const projectMapper = require('./project.mapper');
const authRepo = require('../auth/auth.repository');
const { AppError } = require('../../shared/errors/AppError');
const { ProjectNotFoundError, ForbiddenProjectActionError } = require('./project.error');
const projectMemberService = require('../projectMembers/projectMember.service');



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
        modelType: dto.modelType,
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
        if(proj.modelType === 'WATERFALL'){
            const start = new Date(proj.startDate);
            const totalDays = proj.durationWeeks * 7;

            const waterfallPhases = [
                {name: 'Analysis & Requirements', ratio: 0.10},
                {name: 'Design', ratio: 0.15},
                {name: 'Implementation', ratio: 0.35},
                {name: 'Testing & Integration', ratio: 0.20},
                {name: 'Deployment', ratio: 0.10 },
                {name: 'Maintenance', ratio: 0.10}
            ];
            let currentStartDate = new Date(start)

            const phasesToInsert = waterfallPhases.map((phase, index) =>{
                const phaseDays = Math.round(totalDays*phase.ratio);
                const currentEndDate = new Date(currentStartDate)
                currentEndDate.setDate(currentStartDate.getDate() + phaseDays)

                const phaseRecord = {
                    projectId:proj.id,
                    name: phase.name,
                    order: index + 1,
                    startDate: new Date(currentStartDate),
                    endDate: new Date(currentEndDate)
                }

                currentStartDate = new Date(currentEndDate)
                return phaseRecord;
            })
            await tx.projectPhase.createMany({data: phasesToInsert})
        }

        else if(proj.modelType === 'AGILE_SCRUM'){
            await tx.sprint.create({
                data:{
                    projectId: proj.id,
                    name: 'Sprint 1',
                    goal: 'Khởi tạo dự án',
                    status: 'PLANNING',
                    startDate: proj.startDate
                }
            })
        }

        else if(proj.modelType === 'V_MODEL')
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
    return await projectMemberService.addMemberToProject({projectId, email, role:'MEMBER'});
};

const getMembers = async (projectId, userId) => {
    try {
        const memberService = require('../projectMembers/projectMember.service');
        return await memberService.getMembersByProject(projectId);
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

const getById = async (projectId) => {
    const project = await projectRepo.findProjectById(projectId);
    if (!project) {
        throw new ProjectNotFoundError();
    }
    return projectMapper.toProjectResponse(project);
};

const getProjectTotalCost = async (projectId) => {
    // Tổng chi phí thực từ TaskAssignment (lương đã tính)
    const assignmentResult = await prisma.taskAssignment.aggregate({
        where: { task: { projectId } },
        _sum: { cost: true }
    });

    // Tổng estimatedCost và actualCost từ các Task
    const taskResult = await prisma.task.aggregate({
        where: { projectId },
        _sum: { estimatedCost: true, actualCost: true }
    });

    return {
        totalActualCost: assignmentResult._sum.cost ? Number(assignmentResult._sum.cost) : 0,
        totalEstimatedCost: taskResult._sum.estimatedCost ? Number(taskResult._sum.estimatedCost) : 0,
        totalActualTaskCost: taskResult._sum.actualCost ? Number(taskResult._sum.actualCost) : 0
    };
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
    getSubProjects,
    getById,
    getProjectTotalCost
};
