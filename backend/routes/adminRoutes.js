const express = require('express');
const router = express.Router();
const { setPrice, getPrice, getPendingRequests, processRequest } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/price', getPrice);

// Admin only routes
router.use(protect);
router.use(admin);

router.post('/price', setPrice);
router.get('/requests', getPendingRequests);
router.put('/requests/:id', processRequest);

module.exports = router;
