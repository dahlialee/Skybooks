const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  address: String,
  phone: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  email: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  website: String
}, 
{ 
  timestamps: true 
});

module.exports = mongoose.model('Publisher', publisherSchema);
