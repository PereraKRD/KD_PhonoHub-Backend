
const Order = require('../models/order');
const Product = require('../models/product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

//  Create a new order => /api/v1/order/new
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
    const{
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo

    } = req.body;

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        order
    })
});

// Get  single order => /api/v1/order/:id
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    
    if(!order){
        return next(new ErrorHandler(`order not found with this id: ${req.params.id}`, 404));
    }
    
    res.status(200).json({
        success: true,
        order
    })
})

// Get  logged user orders => /api/v1/orders/me
exports.myOrders = catchAsyncErrors(async (req, res, next) => {

    const orders = await Order.find({user: req.user.id});
    
    res.status(200).json({
        success: true,
        orders
    })
})

// Get  all the orders => /api/v1/admin/orders
exports.allOrders = catchAsyncErrors(async (req, res, next) => {

    // Get all the orders
    const orders = await Order.find();
    let totalAmount = 0;
    // calculate the total price
    orders.forEach(order => {
        totalAmount += order.totalPrice;
    })  

    res.status(200).json({
        success: true,
        message: `Total Amount: ${totalAmount}`,
        orders
    })
})

// update process of the order => /api/v1/admin/order/:id
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {

    // Get the order by id
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler(`order not found with this id: ${req.params.id}`, 404));
    }

    if (order.orderStatus === 'Delivered'){
        return next(new ErrorHandler(`order with this id: ${req.params.id} is already delivered`, 400)); 
    }

    // update the stock 
    order.orderItems.forEach(async item => {
        await updateStock(item.product, item.quantity);
    })

    // change the order status
    order.orderStatus = req.body.status;
    order.deliveredAt = Date.now(); 
    await order.save();

    res.status(200).json({
        success: true
    })
})

// product stock update function 
async function updateStock(id, quantity){
    const product = await Product.findById(id);
    product.stock -= quantity;
    await product.save();   
}

// Delete an order by admin => /api/v1/admin/order/delete/:id
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    // find order by id
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler(`order not found with this id: ${req.params.id}`, 404));
    }
    // delete the order
    await Order.findByIdAndRemove(req.params.id, {
        useFindAndModiy: false
    });  
    
    res.status(200).json({
        success: true
    })  
})