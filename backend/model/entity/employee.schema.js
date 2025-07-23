const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Vui lòng nhập email hợp lệ']
    },
    phone: { 
        type: String, 
        required: true, 
        unique: true 
    },
    dob: { 
        type: Date 
    },
    address: { 
        type: String 
    },
    role: { 
        type: String, 
        enum: ['quản lý', 'nhân viên'], 
        required: true 
    },
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    avatar: { 
        type: String, 
        default: 'avt.jpg' 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Employee', employeeSchema);
