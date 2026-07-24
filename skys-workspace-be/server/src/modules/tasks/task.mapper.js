const toTaskResponse = (task) => {
    if (!task) return null;
    return {
        id: task._id,
        title: task.title,
        status: task.status,
        priority: task.priority || 'medium',
        subtasks: Array.isArray(task.subtasks) ? task.subtasks.map(st => ({
            id: st._id,
            title: st.title,
            completed: !!st.completed
        })) : [],
        role: task.role,
        project: task.project,
        sprint: task.sprint,
        assignee: task.assignee && typeof task.assignee === 'object' && task.assignee._id ? {
            id: task.assignee._id,
            name: task.assignee.name,
            email: task.assignee.email
        } : task.assignee,
        startDate: task.startDate,
        endDate: task.endDate,
        estimatedCost: task.estimatedCost ? Number(task.estimatedCost.toString()) : 0,
        actualCost: task.actualCost ? Number(task.actualCost.toString()) : 0,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
    };
};

const toTaskListResponse = (tasks) => {
    if (!Array.isArray(tasks)) return [];
    return tasks.map(toTaskResponse);
};

module.exports = { toTaskResponse, toTaskListResponse };
