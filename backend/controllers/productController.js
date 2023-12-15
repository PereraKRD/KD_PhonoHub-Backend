const Product = require('../models/product');
const cloudinary = require('cloudinary')
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');

//Create new product => /api/v1/product/new
exports.newProduct = catchAsyncErrors (async (req,res, next) => {

    // set cloudinary images
    let images = []
    if (typeof req.body.images === 'string') {
        images.push(req.body.images)
    } else {
        images = req.body.images
    }

    let imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: 'products'
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }

    req.body.images = imagesLinks

    //get all the from body and create new product
    const product = await Product.create(req.body);

    // use 201 because new product is created
    res.status(201).json({
        success: true,
        product
    })
})

// get all the products from the database
exports.getProducts = catchAsyncErrors (async (req,res,next) => {

    const resPerPage = 8;
    const productsCount = await Product.countDocuments(); // need for frontend..

    const apiFeatures = new APIFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resPerPage)
    const products = await apiFeatures.query;

    res.status(200).json({
        success: true,
        productsCount,
        resPerPage,
        products
    })
    
});

// Get all products (Admin)  =>   /api/v1/admin/products
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {

    const products = await Product.find();

    res.status(200).json({
        success: true,
        products
    })

})

//get single product details with  id  =>  /api/v1/product/:id
exports.getProductByID = catchAsyncErrors (async (req,res,next) => {
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler('product not found', 404));
    }

    res.status(200).json({
        success: true,
        product
    })
})

//update product details with  id  =>  /api/v1/product/:id
exports.updateProduct = catchAsyncErrors (async (req,res,next) => {

    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler('product not found', 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        messsage: "Product updated successfully",
        product
    })
})

// Delete product with id => /api/v1/admin/deleteproduct/:id
exports.deleteProduct = catchAsyncErrors (async (req, res, next) => {
    
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler('product not found', 404));
    }

    

    await Product.findByIdAndRemove(req.params.id, {
        useFindAndModiy: false
    });

    res.status(200).json({
        success: true,
        message: `${product["name"]} with the id ${product["id"]}, is deleted successfully`
    });
}) 

























// HANDLE USER REVIEWS

// create new review => api/v1/review
exports.createProductReview = catchAsyncErrors (async (req, res, next) => {
    // get these things from body
    const { rating, comment, productId } = req.body;

    // prerare review object
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating), //In JavaScript, the Number() function is used to convert a value into a numeric data type. 
        comment: comment
    }

    // get the product and update the product review section
    const product = await Product.findById(productId);

    // check the same user is reviewed the product early
    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    )

    // check isReviewed
    if(isReviewed) {
        product.reviews.forEach(review => {
            if(review.user.toString() === req.user._id.toString()) {
                review.rating = rating;
                review.comment = comment;
            }
        })
    }
    else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }

    // calculate average rating value
    // reduce is used to calculate the average rating
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true
    })   
}) 

// Get product all reviews => api/v1/reviews
exports.getProductReviews = catchAsyncErrors (async (req, res, next) => {
    // search the product
    const product = await Product.findById(req.query.id);
    if(!product){
        return next(new ErrorHandler(`product not found with this id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        allReviews: product.reviews
    })
}) 

// delete product reviews => api/v1/reviews
exports.deleteReview = catchAsyncErrors (async (req, res, next) => {
    // search the product
    const product = await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler(`product not found with this id: ${req.params.id}`, 404));
    }

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString())

    const ratings = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    const numOfReviews = reviews.length;

    // Update product
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }),{
        new: true,
        runValidators: true,
        useFindAndModify: false
    }

    res.status(200).json({
        success: true
    })
}) 