const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  aiQueryCount: { type: Number, default: 0 }
}, { timestamps: true });

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  originalCategory: { type: String },
  description: { type: String },
  type: { type: String, enum: ['expense', 'income'], default: 'expense' },
  isUserCorrected: { type: Boolean, default: false },
  isTrained: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  monthlyLimit: { type: Number, required: true, default: 0 },
  categoryLimits: [{
    category: String,
    limit: Number
  }]
}, { timestamps: true });

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  conversations: [{
    sender: { type: String, enum: ['user', 'admin'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
  // Legacy fields
  message: { type: String }, 
  adminReply: { type: String, default: '' },
  repliedAt: { type: Date }
}, { timestamps: true });

module.exports = {
  User: mongoose.model('User', userSchema),
  Expense: mongoose.model('Expense', expenseSchema),
  Budget: mongoose.model('Budget', budgetSchema),
  Feedback: mongoose.model('Feedback', feedbackSchema)
};
