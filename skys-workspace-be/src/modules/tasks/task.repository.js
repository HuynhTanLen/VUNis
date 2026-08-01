const prisma = require('../../config/prisma');

const findTasksByProject = (projectId) => {
    return prisma.task.findMany({
        where: { projectId },
        include: {
            assignee: { select: { id: true, name: true, email: true, avatar: true } },
            lead: { select: { id: true, name: true, email: true, avatar: true } },
            subtasks: true
        },
        orderBy: { createdAt: 'desc' }
    });
};

const findTaskById = (taskId) => {
    return prisma.task.findUnique({
        where: { id: taskId },
        include: {
            assignee: { select: { id: true, name: true, email: true, avatar: true } },
            lead: { select: { id: true, name: true, email: true, avatar: true } },
            subtasks: true
        }
    });
};

const createTask = (taskData) => {
    const { subtasks, ...data } = taskData;
    return prisma.task.create({
        data: {
            ...data,
            subtasks: subtasks && subtasks.length > 0 ? {
                create: subtasks.map(st => ({ title: st.title, completed: st.completed || false }))
            } : undefined
        },
        include: { subtasks: true }
    });
};

const updateTask = (taskId, updateData) => {
    const { subtasks, ...data } = updateData;
    return prisma.task.update({
        where: { id: taskId },
        data,
        include: {
            assignee: { select: { id: true, name: true, email: true, avatar: true } },
            lead: { select: { id: true, name: true, email: true, avatar: true } },
            subtasks: true
        }
    });
};

const deleteTask = (taskId) => {
    return prisma.task.delete({
        where: { id: taskId }
    });
};

const toggleSubtask = async (taskId, subtaskId) => {
    const subtask = await prisma.subtask.findUnique({ where: { id: subtaskId } });
    if (!subtask) return null;
    await prisma.subtask.update({
        where: { id: subtaskId },
        data: { completed: !subtask.completed }
    });
    return findTaskById(taskId);
};

const addSubtask = async (taskId, subtaskData) => {
    await prisma.subtask.create({
        data: {
            taskId,
            ...subtaskData
        }
    });
    return findTaskById(taskId);
};

const removeSubtask = async (taskId, subtaskId) => {
    await prisma.subtask.delete({
        where: { id: subtaskId }
    });
    return findTaskById(taskId);
};

const editSubtask = async (taskId, subtaskId, title) => {
    await prisma.subtask.update({
        where: { id: subtaskId },
        data: { title }
    });
    return findTaskById(taskId);
};

module.exports = {
    findTasksByProject,
    findTaskById,
    createTask,
    updateTask,
    deleteTask,
    toggleSubtask,
    addSubtask,
    removeSubtask,
    editSubtask
};
