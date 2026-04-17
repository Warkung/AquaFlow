const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Set product price
// @route   POST /api/admin/price
// @access  Private (Admin)
const setPrice = async (req, res) => {
  const { price, stock } = req.body;

  if (price !== undefined && price <= 0) {
    return res.status(400).json({ message: 'Invalid price' });
  }

  try {
    let product = await Product.findOne({ name: '1.5L Water' });
    if (!product) {
      product = await Product.create({ name: '1.5L Water', price: price || 15, stock: stock || 0 });
    } else {
      if (price !== undefined) product.price = price;
      if (stock !== undefined) product.stock = stock;
      await product.save();
    }

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get product price
// @route   GET /api/admin/price
// @access  Public
const getPrice = async (req, res) => {
  try {
    let product = await Product.findOne({ name: '1.5L Water' });
    if (!product) {
      product = await Product.create({ name: '1.5L Water', price: 15, stock: 0 }); // default 15
    }
    res.status(200).json({ price: product.price, stock: product.stock });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all pending requests (buy and withdraw)
// @route   GET /api/admin/requests
// @access  Private (Admin)
const getPendingRequests = async (req, res) => {
  try {
    const requests = await Transaction.find({ status: 'pending', type: { $in: ['buy', 'withdraw'] } })
      .populate('user', 'username stock_balance')
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Approve/Reject withdrawal request
// @route   PUT /api/admin/requests/:id
// @access  Private (Admin)
const processRequest = async (req, res) => {
  const { status } = req.body; // 'completed' or 'rejected'

  if (!['completed', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction already processed' });
    }

    transaction.status = status;
    await transaction.save();

    if (status === 'completed') {
      if (transaction.type === 'buy') {
        const user = await User.findById(transaction.user);
        user.stock_balance += transaction.quantity;
        await user.save();
      }
    } else if (status === 'rejected') {
      if (transaction.type === 'withdraw') {
        const user = await User.findById(transaction.user);
        user.stock_balance += transaction.quantity;
        await user.save();
      } else if (transaction.type === 'buy') {
        let product = await Product.findOne({ name: '1.5L Water' });
        product.stock += transaction.quantity;
        await product.save();
      }
    }

    res.status(200).json({ message: `Request ${status}`, transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  setPrice,
  getPrice,
  getPendingRequests,
  processRequest,
};
