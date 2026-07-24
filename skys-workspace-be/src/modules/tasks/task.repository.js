const Task = require('./task.schema');

const findTasksByProject = (projectId) => {
    return Task.find({ projectId })
        .populate('assigneeId', 'name email avatar')
        .populate('leadId', 'name email avatar')
        .sort({ createdAt: -1 });
};

const findTaskById = (taskId) => {
    return Task.findById(taskId)
        .populate('assigneeId', 'name email avatar')
        .populate('leadId', 'name email avatar');
};

const createTask = (taskData) => {
    return Task.create(taskData);
};

const updateTask = (taskId, updateData) => {
    return Task.findByIdAndUpdate(
        taskId,
        { $set: updateData },
        { new: true }
    ).populate('assigneeId', 'name email avatar');
};

const deleteTask = (taskId) => {
    return Task.findByIdAndDelete(taskId);
};

const toggleSubtask = async (taskId, subtaskId) => {
    const task = await Task.findById(taskId);
    if (!task) return null;
    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) return null;
    subtask.completed = !subtask.completed;
    await task.save();
    return task;
};

const addSubtask = (taskId, subtaskData) => {
    return Task.findByIdAndUpdate(
        taskId,
        { $push: { subtasks: subtaskData } },
        { new: true }
    );
};

const removeSubtask = (taskId, subtaskId) => {
    return Task.findByIdAndUpdate(
        taskId,
        { $pull: { subtasks: { _id: subtaskId } } },
        { new: true }
    );
};

const editSubtask = (taskId, subtaskId, title) => {
    return Task.findOneAndUpdate(
        { _id: taskId, 'subtasks._id': subtaskId },
        { $set: { 'subtasks.$.title': title } },
        { new: true }
    );
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


