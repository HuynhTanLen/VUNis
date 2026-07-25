/**
 * @file projectMember.repository.js
 * @description Tầng Repository cho module ProjectMember.
 */
const ProjectMember = require('./projectMember.schema');

const findByProjectId = (projectId) => {
    return ProjectMember.find({ project: projectId })
        .populate('user', 'name email')
        .sort({ joinedAt: -1 });
};

const findByUserAndProject = (userId, projectId) => {
    return ProjectMember.findOne({ user: userId, project: projectId });
};

const findById = (id) => {
    return ProjectMember.findById(id).populate('user', 'name email');
};

const create = async (data) => {
    const member = await ProjectMember.create(data);
    return ProjectMember.findById(member._id).populate('user', 'name email');
};

const updateRole = (id, role) => {
    return ProjectMember.findByIdAndUpdate(id, {$set: { role }}, { new: true }).populate('user', 'name email');
};

const remove = (id) => {
    return ProjectMember.findByIdAndDelete(id);
};

const findByRoles = (projectId, rolesArray) =>{
    if(!rolesArray || rolesArray.length == 0){
        return ProjectMember.find({project:projectId}).populate('user', 'name email avatar').sort({joinedAt: -1})
    }

    return ProjectMember.find({project: projectId, role: {$in: rolesArray}}).populate('user', 'name email avatar').sort({joinedAt: -1})
}

module.exports = {
    findByProjectId,
    findByUserAndProject,
    findById,
    create,
    updateRole,
    remove,
    findByRoles
};
