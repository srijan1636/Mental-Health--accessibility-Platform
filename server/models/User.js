const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nickname: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String 
  },
  age: { 
    type: Number, 
    required: true 
  },
  gender: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', userSchema);