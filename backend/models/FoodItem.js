const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: false },
    category: { type: String, enum: ['North Indian', 'South Indian', 'Snacks', 'Tiffins'], default: 'South Indian' },
    dietType: { type: String, enum: ['Veg', 'Non-Veg'], default: 'Veg' },
    chefId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
module.exports = FoodItem;
