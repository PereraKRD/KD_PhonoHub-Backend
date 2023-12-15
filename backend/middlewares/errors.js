// import error handler
const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
    // 500 - internal server error
    err.statusCode = err.statusCode || 500;

    if(process.env.NODE_ENV === 'DEVELOPMENT'){
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        })
    }

    if(process.env.NODE_ENV === 'PRODUCTION'){
        let error = {...err}

        error.message = err.message;

        // Wrong mongoose object ID error
        if (err.name === "CastError"){
            const message = `Resource not found. Invalid: ${err.path}`
            error = new ErrorHandler(message,400)
        }

        //Handling Mongoose validation error ValidatorError
        if (err.name === "ValidatorError"){
            const message = Object.values(err.errors).map(value => value.message);
            error = new ErrorHandler (message, 400);
        }

        // Handling mongoose duplicate error
        if(err.code === 11000){
            const message = `Duplicate ${Object.keys(err.keyValue)} entered`
            error = new ErrorHandler(message, 400)
        }

        //  Handling wrong jwt error
        if (err.name === "JsonWebTokenError"){
            const message = 'Json Web token is invalid. Try Again!!!'
            error = new ErrorHandler (message, 400);
        }

        //  Handling Expired jwt error
        if (err.name === "TokenExpiredError"){
            const message = 'Json Web token is expired. Try Again!!!'
            error = new ErrorHandler (message, 400);
        }

        res.status(err.statusCode).json({
            success: false,
            message: error.message || 'Internal Server Error'
        })
    }
}