const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  image: String,
  publish_date: { 
    type: Date, 
    default: Date.now 
  },
  employee_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee' 
  },
  status: { 
    type: String, 
    enum: ['Đã đăng', 'Đã lên lịch', 'Bản nháp'], 
    default: 'Bản nháp' 
  },
  scheduled_date: { 
    type: Date 
  },
  views: { 
    type: Number, 
    default: 0 
  },
  reacts: { 
    type: Number, 
    default: 0 
  },

  comments: [{
    customer_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Customer' 
    },
    content: String,
    created_at: { 
      type: Date, 
      default: Date.now 
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
