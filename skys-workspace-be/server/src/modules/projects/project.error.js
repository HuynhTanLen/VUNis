const { AppError, NotFoundError, ForbiddenError } = require('../../shared/errors/AppError');

class ProjectNotFoundError extends NotFoundError {
    constructor() {
        super('Dự án');
        this.code = 'PROJECT_NOT_FOUND';
    }
}

class ForbiddenProjectActionError extends ForbiddenError {
    constructor(action = 'thao tác trên dự án này') {
        super(`Bạn không có quyền ${action}`);
        this.code = 'PROJECT_ACTION_FORBIDDEN';
    }
}

module.exports = { ProjectNotFoundError, ForbiddenProjectActionError };
