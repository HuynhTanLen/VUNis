/**
 * @file permission.repository.js
 * @description Repository layer cho module Permission.
 */
const Permission = require('./permission.schema');

const findAll = () => {
    return Permission.find().sort({ resource: 1, action: 1 });
};

const findByCode = (code) => {
    return Permission.findOne({ code });
};

const findById = (id) => {
    return Permission.findById(id);
};

const create = (data) => {
    return Permission.create(data);
};

const update = (id, data) => {
    return Permission.findByIdAndUpdate(id, data, { new: true });
};

const remove = (id) => {
    return Permission.findByIdAndDelete(id);
};

module.exports = {
    findAll,
    findByCode,
    findById,
    create,
    update,
    remove
};
