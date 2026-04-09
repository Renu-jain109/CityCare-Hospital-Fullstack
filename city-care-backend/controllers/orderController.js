const Order = require('../models/order');

// Create a new pharmacy order
const createOrder = async (req, res) => {
  try {
    const { patientName, patientEmail, contact, address, items, totalAmount } = req.body;
    const order = await Order.create({
      patientName,
      patientEmail,
      contact,
      address,
      items,
      totalAmount
    });
    res.status(201).json(order);
  } catch (error) {
    require('fs').appendFileSync('debug.log', `[Order Error] ${new Date().toISOString()}: ${error.message}\n${error.stack}\n`);
    res.status(400).json({ message: 'Order creation failed', error: error.message });
  }
};

// Get orders for a specific patient by email
const getOrdersByPatient = async (req, res) => {
  try {
    const orders = await Order.find({ patientEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patient orders', error: error.message });
  }
};

// Get all orders for Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all orders', error: error.message });
  }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error updating order status', error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrdersByPatient,
  getAllOrders,
  updateOrderStatus
};
