// import product
const Product = require('../models/product');
//import dotenv because we have to connect with the mongoDB
const dotenv = require('dotenv');
const connectDatabase = require('../config/database');
const products = require('../data/product.json');
const {connect} =require('mongoose');

//setting up config file
dotenv.config({ path: 'backend/config/config.env' });

connectDatabase();

const seedProducts = async () => {
    try{
        //Delete all the data 
        await Product.deleteMany();
        console.log('Products are deleted');

        //insert all the data inside the product.json
        await Product.insertMany(products);
        console.log('all products are added');

        process.exit();
    }
    catch(error){
        console.log(error.message);
        process.exit();
    }
}

seedProducts();