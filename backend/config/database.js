
const mongoose = require('mongoose');

//create function to connect database mongoDB
const connectDatabase = () => {
    //connect mongoDB with server
    mongoose.connect("mongodb://0.0.0.0:27017/KDPhonoHub",{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => console.log('Connected to the Database...'))
}

module.exports = connectDatabase