const { NotFoundError } = require('../../shared/errors/AppError');

class SprintNotFoundError extends NotFoundError {
    constructor() {
        super('Sprint');
        this.code = 'SPRINT_NOT_FOUND';
    }
}

module.exports = { SprintNotFoundError };
