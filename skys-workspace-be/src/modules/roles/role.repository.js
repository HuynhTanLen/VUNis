/**
 * @file role.repository.js
 * @description Repository layer cho module Role.
 */
const Role = require('./role.schema');

const findAll = () => {
    return Role.find()
        .populate('permissions', 'code displayName resource action')
        .sort({ level: -1 });
};

const findByName = (name) => {
    return Role.findOne({ name })
        .populate('permissions', 'code displayName resource action');
};

const findById = (id) => {
    return Role.findById(id)
        .populate('permissions', 'code displayName resource action');
};

const create = async (data) => {
    const newRole = await Role.create(data);
    return Role.findById(newRole._id).populate('permissions', 'code displayName resource action');
};

const update = (id, data) => {
    return Role.findByIdAndUpdate(id, data, { new: true })
        .populate('permissions', 'code displayName resource action');
};

const remove = (id) => {
    return Role.findByIdAndDelete(id);
};

module.exports = {
    findAll,
    findByName,
    findById,
    create,
    update,
    remove
};
