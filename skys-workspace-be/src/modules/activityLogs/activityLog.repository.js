/**
 * @file activityLog.repository.js
 * @description Tầng Repository cho module ActivityLog.
 */
const ActivityLog = require('./activityLog.schema');

const findByProjectId = (projectId) => {
    return ActivityLog.find({ project: projectId })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(100);
};

const create = async (data) => {
    const newLog = await ActivityLog.create(data);
    return ActivityLog.findById(newLog._id).populate('user', 'name email');
};

module.exports = {
    findByProjectId,
    create
};
