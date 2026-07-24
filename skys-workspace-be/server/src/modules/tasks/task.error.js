const { NotFoundError } = require('../../shared/errors/AppError');

class TaskNotFoundError extends NotFoundError {
    constructor() {
        super('Công việc');
        this.code = 'TASK_NOT_FOUND';
    }
}

module.exports = { TaskNotFoundError };
