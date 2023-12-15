const User = require('../models//user')
const jwt = require("jsonwebtoken");

// Import catch async errors function
const catchAsyncErrors = require('./catchAsyncErrors');

// Import ErrorHandler
const ErrorHandler = require('../utils/errorHandler');
const { request } = require('express');

// check if user is authenticate or not
exports.isAuthenticatedUser = catchAsyncErrors( async (req, res, next) => {
    const { token } = req.cookies
    
    // if token doesn't exist
    if(!token){
        return next(new ErrorHandler('Login First to access the resource', 401))
    }

    // if token exist then verify the user
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id);

    next()
})


// Handling User roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(
                new ErrorHandler(`Role ${req.user.role} is not allowed to access this resource`, 403))
        }
        next()
    }
}