const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['buy', 'withdraw'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    default: 0, // Used for 'buy'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected', 'cancelled'],
    default: 'completed', // 'withdraw' will set this to 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
