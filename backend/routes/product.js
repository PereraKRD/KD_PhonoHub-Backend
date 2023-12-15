const express =require('express');
const router = express.Router();

const { getProducts,  newProduct, getProductByID, updateProduct, deleteProduct, createProductReview, getProductReviews, 
    deleteReview, getAdminProducts} = require('../controllers/productController');

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.route('/products').get(getProducts);
router.route('/admin/products').get(getAdminProducts);
router.route('/product/:id').get(getProductByID);
router.route('/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);
router.route('/admin/product/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct);
router.route('/admin/deleteproduct/:id').delete(deleteProduct);

// all review related routes
router.route('/review').post(isAuthenticatedUser, createProductReview);
router.route('/reviews').get(isAuthenticatedUser, getProductReviews);
router.route('/reviews').delete(isAuthenticatedUser, deleteReview);

module.exports = router;