// Here, In this file i am going to overwrite few errors written in node.js api error class
// Reference: https://nodejs.org/api/errors.html

class ApiError extends Error{
    // 
    constructor(
        statusCode,
        message="Something Went wrong",
        errors = [],
        stack = ""
    ){
        super(message)                      // Call base Error constructor
        this.statusCode = statusCode        // HTTP status
        this.data = null                    // Usually null for errors
        this.message = message              // Error message
        this.success = false                // Always false for error
        this.errors = errors                // Optionaly array for specific error

         // Capture stack trace for debugging
        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}


export {ApiError}