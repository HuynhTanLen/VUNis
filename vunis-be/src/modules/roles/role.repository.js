const prisma = require('../../config/prisma');

const findAll = () => {
    return prisma.role.findMany({
        include: {
            permissions: {
                include: { permission: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const findById = (id) => {
    return prisma.role.findUnique({
        where: { id },
        include: {
            permissions: {
                include: { permission: true }
            }
        }
    });
};

const findByCode = (code) => {
    return prisma.role.findUnique({ where: { code } });
};

const create = async (roleData, permissionCodes = []) => {
    const perms = await prisma.permission.findMany({
        where: { code: { in: permissionCodes } }
    });

    return prisma.role.create({
        data: {
            ...roleData,
            permissions: {
                create: perms.map(p => ({ permissionId: p.id }))
            }
        },
        include: { permissions: { include: { permission: true } } }
    });
};

const update = async (id, updateData, permissionCodes) => {
    return prisma.$transaction(async (tx) => {
        await tx.role.update({
            where: { id },
            data: updateData
        });

        if (Array.isArray(permissionCodes)) {
            await tx.rolePermission.deleteMany({ where: { roleId: id } });

            const perms = await tx.permission.findMany({
                where: { code: { in: permissionCodes } }
            });

            if (perms.length > 0) {
                await tx.rolePermission.createMany({
                    data: perms.map(p => ({ roleId: id, permissionId: p.id }))
                });
            }
        }

        return tx.role.findUnique({
            where: { id },
            include: { permissions: { include: { permission: true } } }
        });
    });
};

const remove = (id) => {
    return prisma.role.delete({ where: { id } });
};

module.exports = {
    findAll,
    findById,
    findByCode,
    create,
    update,
    remove
};
