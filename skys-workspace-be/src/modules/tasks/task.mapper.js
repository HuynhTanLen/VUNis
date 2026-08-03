const toTaskResponse = (task) => {
    if (!task) return null;
    return {
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority || 'medium',
        subtasks: Array.isArray(task.subtasks) ? task.subtasks.map(st => ({
            id: st.id,
            title: st.title,
            completed: !!st.completed
        })) : [],
        role: task.role,
        project: task.projectId,
        sprint: task.sprintId,
        assignee: task.assignee && typeof task.assignee === 'object' && task.assignee.id ? {
            id: task.assignee.id,
            name: task.assignee.name,
            email: task.assignee.email
        } : task.assigneeId,
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

const calculateProgress = (subtasks) => {
      if(!Array.isArray(subtasks)|| subtasks.length === 0) return 0;

      const totalSubTasks = subtasks.length;
      const completedSubTasks = subtasks.filter(st => st.completed === true).length
      
      const per = (completedSubTasks / totalSubTasks) * 100;

      return Math.round(per);
}

module.exports = { toTaskResponse, toTaskListResponse, calculateProgress };
