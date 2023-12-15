// get mongoose
const mongoose = require('mongoose');

// Import the validator
const validator = require('validator');

// Import bcrypt package
const bcrypt = require('bcryptjs');

// Import jsonwebtoken package
const jwt = require('jsonwebtoken');

// Import crypto for forget password recovery and send token to the user
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,'please enter product name'],
        maxLength: [30,'product name cannot exceed 30 characters']
    },
    email:{
        type: String,
        required: [true,'please enter your Email'],
        // Email should be unique
        unique: true,
        ///  first check email is valid or not by validator.isEmail and if not, give message
        validate: [validator.isEmail, 'please enter valid email address']
    },
    password:{
        type: String,
        required: [true,'please enter your password'],
        minlength: [6, 'password must be longer than 6 characters'],
        // select false means when user is displayed the password is not displayed because it is not selected
        select: false
    },
    avatar:{
        url: {
            type: String,
            required: true
        }
    },
    role:{
        type: String,
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})

// Encrypting Password before saving
// pre means before , here before saving
userSchema.pre('save', async function (next){
    // if password is not changed then next
    if(!this.isModified('password')){
        next()
    }
    // if password is changed encrypt 
    // here 10 means number of characters in encrypted password
    // when number is bigger, the strongness also increased
    this.password = await bcrypt.hash(this.password,10)
})
// Compare user password
userSchema.methods.comparePassword = async function (enteredPassword){
    // .comapare is the method in the bcrypt to compare two passwords
    // return true or false
    return await bcrypt.compare(enteredPassword, this.password)
}
// return JWT tokens
userSchema.methods.getJwtToken = function(){
    // In here we save the user id as payload in token
    // JWT keeps as secret
    // set jwt expire time
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });          
} 



















// Generate password reset token
userSchema.methods.getResetPasswordToken = function (){
    // Generate token
    // Crypto use for generate random bytes, this is buffer file and toString to convert them in to string, encoding is hex
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // set Token expire time
    this.resetPasswordExpire = Date.now() + (30*60*1000)
    
    return resetToken
}

module.exports = mongoose.model('User', userSchema);