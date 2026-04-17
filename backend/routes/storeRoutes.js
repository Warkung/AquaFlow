const express = require('express');
const router = express.Router();
const { buyProduct, withdrawProduct, getMyTransactions } = require('../controllers/storeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/buy', buyProduct);
router.post('/withdraw', withdrawProduct);
router.get('/transactions', getMyTransactions);

module.exports = router;
