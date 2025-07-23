const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: function() {
            return !this.isTemporary; // Bắt buộc nếu không phải khách hàng tạm thời
        }, 
        unique: true, 
        sparse: true, // Cho phép nhiều giá trị null/undefined
        trim: true 
    },
    phone: { 
        type: String, 
        required: true, 
        unique: true 
    },
    address: { 
        type: String, 
        required: true 
    },
    date_of_birth: { 
        type: Date 
    },
    gender: { 
        type: String, 
        enum: ['Nam', 'Nữ', 'Khác'], 
        required: function() {
            return !this.isTemporary; // Bắt buộc nếu không phải khách hàng tạm thời
        }
    },
    username: { 
        type: String, 
        required: function() {
            return !this.isTemporary; // Bắt buộc nếu không phải khách hàng tạm thời
        }, 
        unique: true,
        sparse: true // Cho phép nhiều giá trị null/undefined
    },
    password: { 
        type: String, 
        required: function() {
            return !this.isTemporary; // Bắt buộc nếu không phải khách hàng tạm thời
        }
    },
    isTemporary: {
        type: Boolean,
        default: false
    },
    isDeleted: { 
        type: Boolean, 
        default: false 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Customer', customerSchema);
