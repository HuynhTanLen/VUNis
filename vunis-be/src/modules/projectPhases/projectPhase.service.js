/**
 * @file projectPhase.service.js
 * @description Tầng Service cho module ProjectPhase.
 */
const phaseRepo = require('./projectPhase.repository');
const phaseMapper = require('./projectPhase.mapper');
const { ProjectPhaseNotFoundError } = require('./projectPhase.error');
const prisma = require('../../config/prisma');
const { NotFoundError, ValidationError } = require('../../shared/errors/AppError');

// Mẫu giai đoạn mặc định theo từng mô hình quản lý dự án.
// AGILE_SCRUM và KANBAN không dùng Phase (Scrum dùng Sprint, Kanban chạy liên tục không chia giai đoạn).
const DEFAULT_PHASE_TEMPLATES = {
    WATERFALL: [
        'Requirements Analysis', 'System Design', 'Implementation', 'Testing', 'Deployment', 'Maintenance'
    ],
    V_MODEL: [
        'Requirements Analysis', 'System Design', 'Architecture Design', 'Module Design',
        'Coding',
        'Unit Testing', 'Integration Testing', 'System Testing', 'Acceptance Testing'
    ],
    SPIRAL_MODEL: [
        'Cycle 1: Planning', 'Cycle 1: Risk Analysis', 'Cycle 1: Engineering', 'Cycle 1: Evaluation',
        'Cycle 2: Planning', 'Cycle 2: Risk Analysis', 'Cycle 2: Engineering', 'Cycle 2: Evaluation'
    ]
};

const getByProject = async (projectId) => {
    const projectExists = await prisma.project.findUnique({ where: { id: projectId } });
    if (!projectExists) throw new NotFoundError('Dự án');

    const list = await phaseRepo.findByProjectId(projectId);
    return phaseMapper.toProjectPhaseListResponse(list);
};

const createPhase = async (dto) => {
    const project = await prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundError('Dự án');

    const phase = await phaseRepo.create({
        projectId: dto.projectId,
        name: dto.name,
        order: dto.order,
        startDate: dto.startDate,
        endDate: dto.endDate,
        estimatedCost: dto.estimatedCost
    });

    return phaseMapper.toProjectPhaseResponse(phase);
};

const updatePhase = async (id, dto) => {
    const phase = await phaseRepo.findById(id);
    if (!phase) throw new ProjectPhaseNotFoundError();

    const updated = await phaseRepo.update(id, {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.startDate !== undefined && { startDate: dto.startDate }),
        ...(dto.endDate !== undefined && { endDate: dto.endDate }),
        ...(dto.estimatedCost !== undefined && { estimatedCost: dto.estimatedCost }),
        ...(dto.actualCost !== undefined && { actualCost: dto.actualCost })
    });

    return phaseMapper.toProjectPhaseResponse(updated);
};

const removePhase = async (id) => {
    const phase = await phaseRepo.findById(id);
    if (!phase) throw new ProjectPhaseNotFoundError();

    await phaseRepo.remove(id);
    return { message: 'Đã xóa giai đoạn thành công' };
};

const seedDefaultPhases = async (projectId) => {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundError('Dự án');

    const template = DEFAULT_PHASE_TEMPLATES[project.modelType];
    if (!template) {
        throw new ValidationError(`Mô hình ${project.modelType} không sử dụng giai đoạn (phase) theo mẫu dựng sẵn`);
    }

    const existing = await phaseRepo.findByProjectId(projectId);
    if (existing.length > 0) {
        throw new ValidationError('Dự án đã có giai đoạn — chỉ có thể tạo mẫu cho dự án chưa có giai đoạn nào');
    }

    await phaseRepo.createMany(projectId, template.map((name, i) => ({ name, order: i + 1 })));
    const created = await phaseRepo.findByProjectId(projectId);
    return phaseMapper.toProjectPhaseListResponse(created);
};

module.exports = {
    getByProject,
    createPhase,
    updatePhase,
    removePhase,
    seedDefaultPhases,
    DEFAULT_PHASE_TEMPLATES
};
