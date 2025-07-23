const mongoose = require('mongoose');

const discountCategorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: String,
    discount_percentage: { 
        type: Number, 
        required: true 
    },
    start_date: Date,
    end_date: Date
}, 
{ 
    timestamps: true 
});

module.exports = mongoose.model('DiscountCategory', discountCategorySchema);
