const express = require('express');
const {
    createOrder,
    getMyOrders,
    getChefOrders,
    updateOrderStatus
} = require('../controllers/orderController');
const { protect, customerOnly, chefOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, customerOnly, createOrder);

router.route('/myorders')
    .get(protect, customerOnly, getMyOrders);

router.route('/cheforders')
    .get(protect, chefOnly, getChefOrders);

router.route('/:id/status')
    .put(protect, chefOnly, updateOrderStatus);

module.exports = router;
