const StatusCode = {
    FORBIDDEN: 403,
    CONFLICT: 409
}

const ErrorMessage = {
    FORBIDDEN: 'Bad Request Error',
    CONFLICT: 'Conflict Error'
}

class ErrorResponse extends Error {
    constructor(message, status) {
        super(message)
        this.status = status
    }
}

class ConflictRequestError extends ErrorResponse{
    constructor(message = ErrorMessage.CONFLICT, statusCode = StatusCode.CONFLICT) {
        super(message, statusCode)
    }
}

class BadRequestError extends ErrorResponse{
    constructor(message = ErrorMessage.FORBIDDEN, statusCode = StatusCode.FORBIDDEN) {
        super(message, statusCode)
    }
}

class AuthFailureError extends ErrorResponse{
    constructor(message = ErrorMessage.FORBIDDEN, statusCode = StatusCode.FORBIDDEN) {
        super(message, statusCode)
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError,
    AuthFailureError
}