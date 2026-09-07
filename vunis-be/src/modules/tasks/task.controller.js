const taskService = require('./task.service');
const { CreateTaskDTO, UpdateTaskDTO } = require('./task.dto');
const asyncHandler = require('../../shared/constants/asyncHandler');
const prisma = require('../../config/prisma');

const getTasksByProject = asyncHandler(async (req, res) => {
    const tasks = await taskService.getByProject(req.params.projectId);
    res.status(200).json(tasks);

});

const createTask = asyncHandler(
    async (req, res) => {
        const dto = new CreateTaskDTO(req.body).validate();
        const task = await taskService.create(dto, req.user.id);
        res.status(201).json(task);
    });

const updateTask = asyncHandler(async (req, res) => {
    const dto = new UpdateTaskDTO(req.body).validate();
    const updated = await taskService.update(req.params.id, dto);
    res.status(200).json(updated);
});

const deleteTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    await taskService.remove(taskId);
    res.status(200).json({ message: 'Xóa công việc thành công' });
});

const addSubTask = asyncHandler(async (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: 'Tiêu đề việc nhỏ là bắt buộc' });
    const userProjectRole = req.projectMember?.role || 'PROJECT_MANAGER';
    const task = await taskService.addSubTaskService(req.params.id, title, req.user.id, userProjectRole);
    res.json(task);
});

const removeSubTask = asyncHandler(async (req, res) => {
    const userProjectRole = req.projectMember?.role || 'PROJECT_MANAGER';
    const task = await taskService.removeSubTaskService(req.params.id, req.params.subtaskId, req.user.id, userProjectRole);
    res.json(task);
});

const editSubTask = asyncHandler(async (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: 'Tiêu đề mới là bắt buộc' });
    const userProjectRole = req.projectMember?.role || 'PROJECT_MANAGER';
    const task = await taskService.editSubTaskService(req.params.id, req.params.subtaskId, title, req.user.id, userProjectRole);
    res.json(task);
});

const toggleSubTask = asyncHandler(async (req, res) => {
    const userProjectRole = req.projectMember?.role || 'PROJECT_MANAGER';
    const task = await taskService.toggleSubtaskService(req.params.id, req.params.subtaskId, req.user.id, userProjectRole);
    res.json(task);
});

const getTaskAssignments = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const assignments = await prisma.taskAssignment.findMany({
        where: { taskId: id },
        include: {
            user: {
                select: { id: true, name: true, email: true, avatar: true, hourlyRate: true }
            }
        },
        orderBy: { startDate: 'asc' }
    });
    res.status(200).json(assignments);
});

module.exports = {
    getTasksByProject,
    createTask,
    updateTask,
    deleteTask,
    addSubTask,
    removeSubTask,
    editSubTask,
    toggleSubTask,
    getTaskAssignments
};

