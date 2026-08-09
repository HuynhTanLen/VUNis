const { AppError, NotFoundError, ForbiddenError } = require('../../shared/errors/AppError');

class ProjectNotFoundError extends NotFoundError {
    constructor() {
        super('Project');
        this.code = 'PROJECT_NOT_FOUND';
    }
}

class ForbiddenProjectActionError extends ForbiddenError {
    constructor(action = 'perform action on this project') {
        super(`You do not have permission to ${action}`);
        this.code = 'PROJECT_ACTION_FORBIDDEN';
    }
}

module.exports = { ProjectNotFoundError, ForbiddenProjectActionError };
