/**
 * @file gantt.service.js
 * @description Tầng Service cho module Gantt.
 * Chứa toàn bộ logic về sơ đồ.
 */

const prisma = require('../../config/prisma')
const { NotFoundError } = require('../../shared/errors/AppError');


const getGanttProject = async (projectId) =>{
    const project = await prisma.project.findUnique({where:{id: project.id}})

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
    //thực hiện query 2: 
}