const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

// @desc    Buy water and add to stock
// @route   POST /api/store/buy
// @access  Private (Customer)
const buyProduct = async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  try {
    // Get current product price and check stock
    let product = await Product.findOne({ name: '1.5L Water' });
    if (!product) {
      product = await Product.create({ name: '1.5L Water', price: 15, stock: 0 });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient store stock' });
    }

    const totalPrice = quantity * product.price;

    // In a real app, payment processing happens here. 
    // We assume payment is completely successful and mock it.

    // Deduct from central store stock
    product.stock -= Number(quantity);
    await product.save();

    // Create transaction record
    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'buy',
      quantity: Number(quantity),
      totalPrice,
      status: 'pending',
    });

    res.status(200).json({
      message: 'Purchase request submitted',
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Request withdrawal of water from stock
// @route   POST /api/store/withdraw
// @access  Private (Customer)
const withdrawProduct = async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  try {
    const user = await User.findById(req.user._id);

    // Deduct from stock immediately to reserve it (can be negative)
    user.stock_balance -= Number(quantity);
    await user.save();

    // Create pending withdrawal transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'withdraw',
      quantity: Number(quantity),
      status: 'pending',
    });

    res.status(200).json({
      message: 'Withdrawal request submitted',
      stock_balance: user.stock_balance,
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's transactions
// @route   GET /api/store/transactions
// @access  Private
const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel a pending transaction (buy or withdraw)
// @route   PUT /api/store/transactions/:id/cancel
// @access  Private (Customer)
const cancelTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Ensure transaction belongs to the user
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to cancel this transaction' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending transactions can be cancelled' });
    }

    // Process Refund
    if (transaction.type === 'buy') {
      // Refund to store stock
      const product = await Product.findOne({ name: '1.5L Water' });
      if (product) {
        product.stock += transaction.quantity;
        await product.save();
      }
    } else if (transaction.type === 'withdraw') {
      // Refund to user virtual stock
      const user = await User.findById(req.user._id);
      if (user) {
        user.stock_balance += transaction.quantity;
        await user.save();
      }
    }

    transaction.status = 'cancelled';
    await transaction.save();

    res.status(200).json({ message: 'Transaction cancelled successfully', transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during cancellation' });
  }
};

module.exports = {
  buyProduct,
  withdrawProduct,
  getMyTransactions,
  cancelTransaction,
};
