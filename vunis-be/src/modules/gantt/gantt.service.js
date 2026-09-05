/**
 * @file gantt.service.js
 * @description Tầng Service cho module Gantt.
 * Chứa toàn bộ logic về sơ đồ - trả về Tree Structure.
 */

const prisma = require('../../config/prisma')

const getGanttProject = async (projectId) => {
    const project = await prisma.project.findUnique({ where: { id: projectId } })

    if (!project) throw new Error('Project Not Found')

    const tasks = await prisma.task.findMany({
        where: { projectId: project.id },
        select: {
            id: true,
            title: true,
            createdAt: true,
            dueDate: true,
            status: true,
            priority: true,
            estimatedCost: true,
            actualCost: true,
            phaseId: true,
            assignee: {
                select: { id: true, name: true, avatar: true }
            }
        },
        orderBy: { createdAt: 'asc' }
    })

    // Nếu dự án có mô hình WATERFALL → lấy danh sách Phase và build Tree
    if (project.modelType === 'WATERFALL') {
        const phases = await prisma.projectPhase.findMany({
            where: { projectId: project.id },
            orderBy: { order: 'asc' }
        })

        const tree = phases.map(phase => {
            // Tasks thuộc phase này (dựa vào phaseId)
            const phaseTasksRaw = tasks.filter(task => task.phaseId === phase.id)

            // % hiển thị trên thanh Gantt phải phản ánh tiến độ thực tế (task đã DONE / tổng số task
            // của giai đoạn) — KHÔNG phải tỷ lệ thời lượng giai đoạn chiếm trong tổng thời gian dự án
            // (con số đó cố định ngay từ lúc tạo phase, không đổi dù task có xong hay chưa).
            const doneCount = phaseTasksRaw.filter(t => t.status === 'DONE' || t.status === 'Done').length
            const phasePct = phaseTasksRaw.length > 0 ? Math.round((doneCount / phaseTasksRaw.length) * 100) : 0

            const phaseTasks = phaseTasksRaw.map(task => ({
                id: task.id,
                name: task.title,
                type: 'TASK',
                status: task.status,
                priority: task.priority,
                startDate: task.createdAt,
                endDate: task.dueDate,
                estimatedCost: task.estimatedCost ? Number(task.estimatedCost) : 0,
                actualCost: task.actualCost ? Number(task.actualCost) : 0,
                assignee: task.assignee || null
            }))

            return {
                id: phase.id,
                name: phase.name,
                type: 'PHASE',
                order: phase.order,
                startDate: phase.startDate,
                endDate: phase.endDate,
                phasePct,
                estimatedCost: phase.estimatedCost ? Number(phase.estimatedCost) : 0,
                actualCost: phase.actualCost ? Number(phase.actualCost) : 0,
                tasks: phaseTasks
            }
        })

        // Task mồ côi (không có phaseId hoặc phaseId không khớp phase nào)
        const phaseIds = new Set(phases.map(p => p.id))
        const orphanTasks = tasks
            .filter(task => !task.phaseId || !phaseIds.has(task.phaseId))
            .map(task => ({
                id: task.id,
                name: task.title,
                type: 'TASK',
                status: task.status,
                priority: task.priority,
                startDate: task.createdAt,
                endDate: task.dueDate,
                estimatedCost: task.estimatedCost ? Number(task.estimatedCost) : 0,
                actualCost: task.actualCost ? Number(task.actualCost) : 0,
                assignee: task.assignee || null
            }))

        return {
            projectId: project.id,
            projectName: project.name,
            modelType: project.modelType,
            startDate: project.startDate,
            endDate: project.endDate,
            durationWeeks: project.durationWeeks,
            phases: tree,
            orphanTasks
        }
    }

    // Các mô hình khác (Scrum, Kanban...) — không có Phase, trả về danh sách task phẳng
    const flatTasks = tasks.map(task => ({
        id: task.id,
        name: task.title,
        type: 'TASK',
        status: task.status,
        priority: task.priority,
        startDate: task.createdAt,
        endDate: task.dueDate,
        estimatedCost: task.estimatedCost ? Number(task.estimatedCost) : 0,
        actualCost: task.actualCost ? Number(task.actualCost) : 0,
        assignee: task.assignee || null
    }))

    return {
        projectId: project.id,
        projectName: project.name,
        modelType: project.modelType,
        startDate: project.startDate,
        endDate: project.endDate,
        durationWeeks: project.durationWeeks,
        phases: [],
        orphanTasks: flatTasks
    }
}

module.exports = { getGanttProject }