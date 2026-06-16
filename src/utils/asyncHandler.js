// This file defines a utility function called asyncHandler, which is used to handle errors in asynchronous Express route handlers. Its main purpose is to avoid repetitive try-catch blocks in each route and ensure that unhandled errors are passed to Express's default error handler.

// here we're using promises to do that we can even use trycatch for the same
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export {asyncHandler}
