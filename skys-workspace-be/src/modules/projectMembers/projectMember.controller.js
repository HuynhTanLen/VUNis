/**
 * @file projectMember.controller.js
 * @description Tầng Controller cho module ProjectMember.
 */
const memberService = require('./projectMember.service');
const { AddProjectMemberDTO, UpdateMemberRoleDTO } = require('./projectMember.dto');

const getMembers = async (req, res) => {
    try {
        const projectId = req.params.projectId || req.params.id;
        const members = await memberService.getMembersByProject(projectId);
        res.status(200).json(members);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const addMember = async (req, res) => {
    try {
        const dto = new AddProjectMemberDTO(req.body).validate();
        const member = await memberService.addMemberToProject(dto);
        res.status(201).json(member);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const updateRole = async (req, res) => {
    try {
        const dto = new UpdateMemberRoleDTO(req.body).validate();
        const updated = await memberService.updateMemberRole(req.params.id, dto);
        res.status(200).json(updated);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

const deleteMember = async (req, res) => {
    try {
        const result = await memberService.removeMember(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message, code: error.code });
    }
};

module.exports = {
    getMembers,
    addMember,
    updateRole,
    deleteMember
};
