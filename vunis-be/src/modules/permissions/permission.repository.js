/**
 * @file permission.repository.js
 * @description Tầng Repository truy vấn CSDL cho module Permission.
 */
const prisma = require('../../config/prisma');

const findAll = () => {

    return prisma.permission.findMany(
        {orderBy: {module:'asc'}}
    );

}

module.exports = {
    findAll
};
