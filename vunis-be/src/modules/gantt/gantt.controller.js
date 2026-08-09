/**
 * @file gantt.controller.js
 * @description Tầng Controller cho module gantt.
 * Nhận HTTP request → Validate DTO → Gọi Service → Trả HTTP Response.
 */

const ganttService = require('./gantt.service')
const asyncHandler = require('../../shared/constants/asyncHandler')

const getGantt = asyncHandler( async(req, res) =>{
    const projectId = req.params.projectId;

    const data = await ganttService.getGanttProject(projectId);

    res.status(200).json(data);
})

module.exports = {getGantt}