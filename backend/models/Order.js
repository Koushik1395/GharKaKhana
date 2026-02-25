const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    chefId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        foodItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true } // Price at time of order
    }],
    totalPrice: { type: Number, required: true },
    deliveryAddress: { type: String, required: true },
    deliveryTime: { type: Date, required: true },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI'], default: 'Cash' },
    amountPaid: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Completed'], default: 'Pending' }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
