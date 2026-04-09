const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const {
  createOrder,
  getOrdersByPatient,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');

// All order routes
router.post('/', authMiddleware.protect, createOrder);
router.get('/patient/:email', authMiddleware.protect, getOrdersByPatient);
router.get('/', authMiddleware.protect, getAllOrders);
router.put('/:id/status', authMiddleware.protect, updateOrderStatus);

module.exports = router;
