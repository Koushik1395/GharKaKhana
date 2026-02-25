const express = require('express');
const {
    getFoodItems,
    getFoodItemById,
    createFoodItem,
    updateFoodItem,
    deleteFoodItem
} = require('../controllers/foodController');
const { protect, chefOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getFoodItems)
    .post(protect, chefOrAdmin, createFoodItem);

router.route('/:id')
    .get(getFoodItemById)
    .put(protect, chefOrAdmin, updateFoodItem)
    .delete(protect, chefOrAdmin, deleteFoodItem);

module.exports = router;
