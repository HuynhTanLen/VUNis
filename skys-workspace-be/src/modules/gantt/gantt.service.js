/**
 * @file gantt.service.js
 * @description Tầng Service cho module Gantt.
 * Chứa toàn bộ logic về sơ đồ.
 */

const prisma = require('../../config/prisma')
const { NotFoundError } = require('../../shared/errors/AppError');


const getGanttProject = async (projectId) =>{
    const project = await prisma.project.findUnique({where:{id: projectId}})

    if(!project) throw new Error('Project Not Found')

    let phases = [];

    if(project.modelType === 'WATERFALL'){
        phases = await prisma.projectPhase.findMany({
            where:{
                projectId: project.id
            },
            orderBy:{
                order:'asc'
            }
        })
    }
    const tasks = await prisma.task.findMany({
        where:{
            projectId: project.id
        },
        select:{
            id: true,
            title: true,
            createdAt: true,
            dueDate: true,
            status: true,
            assignee:{
                select:{
                    id: true,
                    name: true,
                    avatar: true
                }
            }
        },
        orderBy:{
            createdAt: 'asc'
        }
    })

    const result = phases.flatMap( phase =>{
       const phasesObject = {
            id: phase.id,
            name: phase.name,
            type: 'PHASE',
            startDate: phase.startDate,
            endDate: phase.endDate
        }
        const matchingTask = tasks
            .filter(task => task.createdAt >= phase.startDate && task.createdAt <= phase.endDate)
            .map(task =>({
                id: task.id,
                name: task.title,
                type: 'TASK',
                startDate: task.createdAt,
                endDate: task.dueDate,
                parentPhaseId: phase.id
            }))
            return [phasesObject,...matchingTask]
    })
    const orphanTasks = tasks
        .filter(task => {
            // Kiểm tra xem task này có thuộc phase nào không
            const isBelongToAnyPhase = phases.some(phase => 
                task.createdAt >= phase.startDate && task.createdAt <= phase.endDate
            );
            return !isBelongToAnyPhase; // Chỉ lấy những đứa mồ côi
        })
        .map(task => ({
            id: task.id,
            name: task.title,
            type: 'TASK',
            startDate: task.createdAt,
            endDate: task.dueDate,
            parentPhaseId: null // Mồ côi nên không có phụ huynh
        }));
    
    result.push(...orphanTasks);
    return result;
}

module.exports = { getGanttProject}