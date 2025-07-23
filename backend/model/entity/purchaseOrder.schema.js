const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
    employee_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Employee' 
    },
    publisher_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Publisher' 
    },
    note: String,

    items: [{
        product_id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product'
        },
        title: String,
        quantity: Number,
        import_price: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
