const taskRepo = require('./task.repository');
const taskMapper = require('./task.mapper');
const projectRepo = require('../projects/project.repository');
const { ValidationError } = require('../../shared/errors/AppError');

/**
 * Kiểm tra ngày của Task có nằm trong khoảng ngày của Dự án không.
 */
const validateTaskDatesWithinProject = (project, taskStartDate, taskEndDate) => {
    if (!project.startDate || !project.endDate) return; // Dự án chưa đặt thời gian => bỏ qua
    const pStart = new Date(project.startDate);
    const pEnd = new Date(project.endDate);

    if (taskStartDate && taskStartDate < pStart) {
        throw new ValidationError(
            `Ngày bắt đầu công việc (${taskStartDate.toLocaleDateString('vi-VN')}) không được sớm hơn ngày bắt đầu dự án (${pStart.toLocaleDateString('vi-VN')})`
        );
    }
    if (taskEndDate && taskEndDate > pEnd) {
        throw new ValidationError(
            `Ngày kết thúc công việc (${taskEndDate.toLocaleDateString('vi-VN')}) không được muộn hơn ngày kết thúc dự án (${pEnd.toLocaleDateString('vi-VN')})`
        );
    }
};

const getByProject = async (projectId) => {
    const tasks = await taskRepo.findTasksByProject(projectId);
    return taskMapper.toTaskListResponse(tasks);
};

const create = async (dto, userId) => {
    const finalStartDate = dto.startDate ? new Date(dto.startDate) : null;
    const finalEndDate = dto.endDate ? new Date(dto.endDate) : null;

    if (finalStartDate && finalEndDate && finalEndDate < finalStartDate) {
        throw new ValidationError('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
    }

    // Kiểm tra ngày task có nằm trong khoảng ngày dự án không
    const project = await projectRepo.findProjectById(dto.projectId);
    if (project) {
        validateTaskDatesWithinProject(project, finalStartDate, finalEndDate);
    }

    const taskData = {
        title: dto.title,
        status: dto.status,
        priority: dto.priority || 'medium',
        subtasks: dto.subtasks || [],
        role: dto.role,
        project: dto.projectId,
        sprint: dto.sprintId,
        assignee: dto.assigneeId || userId,
        startDate: finalStartDate,
        endDate: finalEndDate,
        estimatedCost: dto.estimatedCost,
        actualCost: dto.actualCost
    };
    const newTask = await taskRepo.createTask(taskData);
    return taskMapper.toTaskResponse(newTask);
};

const update = async (taskId, dto) => {
    const task = await taskRepo.findTaskById(taskId);
    if (!task) {
        throw new Error('Không tìm thấy công việc');
    }

    const finalStartDate = dto.startDate ? new Date(dto.startDate) : task.startDate;
    const finalEndDate = dto.endDate ? new Date(dto.endDate) : task.endDate;

    if (finalStartDate && finalEndDate && finalEndDate < finalStartDate) {
        throw new ValidationError('Ngày kết thúc không được nhỏ hơn ngày bắt đầu');
    }

    // Kiểm tra ngày task có nằm trong khoảng ngày dự án không
    const project = await projectRepo.findProjectById(task.project);
    if (project) {
        validateTaskDatesWithinProject(project, finalStartDate, finalEndDate);
    }

    const updateData = {};
    const allowedFields = [
        'title', 'status', 'priority', 'subtasks', 'role', 'sprint', 'assignee',
        'startDate', 'endDate', 'estimatedCost', 'actualCost'
    ];
    allowedFields.forEach(field => {
        if (dto[field] !== undefined) {
            updateData[field] = dto[field];
        }
    });
    if (dto.assigneeId !== undefined) updateData.assignee = dto.assigneeId || null;

    const updatedTask = await taskRepo.updateTask(taskId, updateData);
    return taskMapper.toTaskResponse(updatedTask);
};

const remove = async (taskId) => {
    const task = await taskRepo.findTaskById(taskId);
    if (!task) {
        const error = new Error('Không tìm thấy công việc');
        error.statusCode = 404;
        throw error;
    }
    await taskRepo.deleteTask(taskId);
    return { message: 'Xóa công việc thành công' };
};



const toggleSubtaskService = async (taskId, subtaskId) => {
    const task = await taskRepo.findTaskById(taskId);
    if (!task) throw new ValidationError('Công việc không tồn tại');
    return await taskRepo.toggleSubtask(taskId, subtaskId);
};

const addSubTaskService = async (taskId, title) => {
    const task = await taskRepo.findTaskById(taskId);
    if (!task) throw new ValidationError('Công việc không tồn tại');
    return await taskRepo.addSubtask(taskId, { title, completed: false });
};

const removeSubTaskService = async (taskId, subTaskId) => {
    const task = await taskRepo.findTaskById(taskId);
    if (!task) throw new ValidationError('Công việc không tồn tại');
    return await taskRepo.removeSubtask(taskId, subTaskId);
};

const editSubTaskService = async (taskId, subTaskId, title) => {
    const task = await taskRepo.findTaskById(taskId);
    if (!task) throw new ValidationError('Công việc không tồn tại');
    return await taskRepo.editSubtask(taskId, subTaskId, title);
};

module.exports = { 
    getByProject, 
    create, 
    update, 
    remove,
    toggleSubtaskService,
    addSubTaskService,
    removeSubTaskService,
    editSubTaskService
};

