/**
 * @file user.repository.js
 * @description Tầng Repository cho module Users độc lập.
 * CHỈ chứa truy vấn MongoDB liên quan đến quản lý người dùng.
 */
const User = require('./user.schema');

const findAllUsers = (filter = {}) => {
    return User.find(filter).select('-password').sort({ createdAt: -1 });
};

const findUserById = (id) => {
    return User.findById(id).select('-password');
};

const findUserByEmail = (email) => {
    return User.findOne({ email });
};

const updateUserProfile = (userId, updateData) => {
    return User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select('-password');
};

const updateUserRole = (userId, role) => {
    return User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
};

const toggleBlockUser = (userId, isBlocked) => {
    return User.findByIdAndUpdate(userId, { isBlocked }, { new: true }).select('-password');
};

const deleteUser = (userId) => {
    return User.findByIdAndDelete(userId);
};

module.exports = {
    findAllUsers,
    findUserById,
    findUserByEmail,
    updateUserProfile,
    updateUserRole,
    toggleBlockUser,
    deleteUser
};
