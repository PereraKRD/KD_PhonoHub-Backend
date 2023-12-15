// get mongoose
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please enter product name"],
    trim: true,
    maxlength: [100, "product name cannot exceed 100 characters"],
  },
  price: {
    type: Number,
    required: [true, "please enter product price"],
    maxlength: [5, "product price cannot exceed 5 characters"],
    default: 0.0,
  },
  description: {
    type: String,
    required: [true, "please enter product description"],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  images: [
    {
      url: {
        type: String,
        required: true,
      },
    },
  ],
  category: {
    type: String,
    required: [true, "Please enter category for this product"],
    enum: {
      values: [
        "MobilePhones",
        "Cameras",
        "Laptops",
        "Accessories",
        "Headphones",
        "Speakers",
      ],
      message: "Please select correct category for Product",
    },
  },
  seller: {
    type: String,
    required: [true, "Please enter product seller"],
  },
  stock: {
    type: Number,
    required: [true, "please enter product stock"],
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
