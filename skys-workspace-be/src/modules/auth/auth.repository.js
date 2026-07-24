/**
 * @file auth.repository.js
 * @description Tầng Repository cho module Auth.
 * CHỈ chứa các truy vấn Database đơn giản, hiệu năng cao không cần populate.
 */
const User = require('./auth.schema');

const findByEmail = (email) => {
    return User.findOne({ email });
};

const findById = (id) => {
    return User.findById(id).select('-password');
};

const createUser = (data) => {
    return User.create(data);
};

const findAllUsers = () => {
    return User.find()
};

const updateUserRole = (userId, role) => {
    return User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
};

const toggleBlockUser = (userId, isBlocked) => {
    return User.findByIdAndUpdate( userId, {isBlocked}, {new:true}).select('-password')
};

const deleteUser = (userId) => {
    return User.findByIdAndDelete(userId);
};

module.exports = { findByEmail, findById, createUser, findAllUsers, updateUserRole, toggleBlockUser, deleteUser };

