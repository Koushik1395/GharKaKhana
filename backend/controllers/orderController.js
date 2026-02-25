const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer
const createOrder = async (req, res) => {
    try {
        const { orderItems, deliveryAddress, chefId, deliveryTime, paymentMethod, amountPaid } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Calculate total price based on passed prices (ideally validate this against FoodItem DB in production)
        const totalPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

        if (amountPaid < totalPrice * 0.25) {
            return res.status(400).json({ message: 'Must pay at least 25% of total amount beforehand' });
        }

        const order = new Order({
            customerId: req.user._id,
            chefId,
            items: orderItems,
            deliveryAddress,
            deliveryTime,
            paymentMethod: paymentMethod || 'Cash',
            amountPaid: amountPaid || 0,
            totalPrice,
            status: 'Pending'
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged in customer's orders
// @route   GET /api/orders/myorders
// @access  Private/Customer
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.user._id })
            .populate('chefId', 'name') // Only fetching chef's name
            .populate('items.foodItemId', 'title imageUrl');

        // Format to strictly enforce privacy
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            items: order.items.map(item => ({
                title: item.foodItemId?.title || 'Unknown Item',
                imageUrl: item.foodItemId?.imageUrl,
                quantity: item.quantity,
                price: item.price
            })),
            totalPrice: order.totalPrice,
            status: order.status,
            deliveryAddress: order.deliveryAddress, // Customer can see their own
            chefName: order.chefId?.name || 'Unknown',
            createdAt: order.createdAt
        }));

        res.json(formattedOrders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get orders for chef
// @route   GET /api/orders/cheforders
// @access  Private/Chef
const getChefOrders = async (req, res) => {
    try {
        const orders = await Order.find({ chefId: req.user._id })
            .populate('customerId', 'name') // Only fetch customer's name, not phone/email here
            .populate('items.foodItemId', 'title');

        // Format to strictly enforce privacy - chef only sees necessary customer details
        const formattedOrders = orders.map(order => ({
            _id: order._id,
            customerName: order.customerId?.name || 'Unknown',
            items: order.items.map(item => ({
                title: item.foodItemId?.title || 'Unknown Item',
                quantity: item.quantity,
                price: item.price
            })),
            totalPrice: order.totalPrice,
            status: order.status,
            deliveryAddress: order.deliveryAddress, // Chef needs this to deliver
            createdAt: order.createdAt
        }));

        res.json(formattedOrders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Chef
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            if (order.chefId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to update this order' });
            }

            order.status = status || order.status;
            const updatedOrder = await order.save();

            res.json({ _id: updatedOrder._id, status: updatedOrder.status });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getChefOrders,
    updateOrderStatus
};
