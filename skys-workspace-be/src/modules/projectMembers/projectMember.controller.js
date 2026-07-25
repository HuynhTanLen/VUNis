/**
 * @file projectMember.controller.js
 * @description Tầng Controller cho module ProjectMember.
 */
const memberService = require('./projectMember.service');
const { AddProjectMemberDTO, UpdateMemberRoleDTO } = require('./projectMember.dto');
const asyncHandler = require('../../shared/constants/asyncHandler');

const getMembers = asyncHandler(async (req, res) => {
    const projectId = req.params.projectId || req.params.id;
    const members = await memberService.getMembersByProject(projectId);
    res.status(200).json(members);
});

const addMember = asyncHandler(async (req, res) => {
    const dto = new AddProjectMemberDTO(req.body).validate();
    const member = await memberService.addMemberToProject(dto);
    res.status(201).json(member);
});

const updateRole = asyncHandler(async (req, res) => {
    const dto = new UpdateMemberRoleDTO(req.body).validate();
    const updated = await memberService.updateMemberRole(req.params.id, dto);
    res.status(200).json(updated);
});

const deleteMember = asyncHandler(async (req, res) => {
    const result = await memberService.removeMember(req.params.id);
    res.status(200).json(result);
});

module.exports = {
    getMembers,
    addMember,
    updateRole,
    deleteMember
};
