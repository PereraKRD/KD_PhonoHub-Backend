// fetch things from app,js
const app = require('./app');
// get database from database.js
const connectDatabase = require('./config/database');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary')

// Handle uncaught exceptions
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.message}`);
    console.log("Shutting Down server due to uncaught exceptions");
    process.exit(1);
})
//setting up config file
dotenv.config({ path: 'backend/config/config.env' });

//Connecting Database
connectDatabase();
// setting up cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const server = app.listen(process.env.PORT, () => {
    console.log(`server started on PORT ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.message}`);
    console.log('shutting down the server due to unhhandled promisse rejections');
    server.close(() => {
        process.exit(1)
    })
})