const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: '1.5L Water',
  },
  price: {
    type: Number,
    required: true,
    default: 15, // Default price
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
