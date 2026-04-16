/**
 * Seed script to create a demo user with sample data.
 * Run: node seedDemo.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User, Expense, Budget } = require('./models');

const DEMO_EMAIL = process.env.DEMO_EMAIL ;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ;
const DEMO_USERNAME = 'Demo User';

async function seedDemo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove existing demo data to prevent duplication
    const existingUser = await User.findOne({ email: DEMO_EMAIL });
    if (existingUser) {
        await Expense.deleteMany({ userId: existingUser._id });
        await Budget.deleteMany({ userId: existingUser._id });
        await User.deleteOne({ _id: existingUser._id });
        console.log('Cleared existing demo user and data.');
    }

    // Create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, salt);

    const user = new User({
      username: DEMO_USERNAME,
      email: DEMO_EMAIL,
      password: hashedPassword,
      role: 'user'
    });
    await user.save();
    console.log('Demo user created.');

    // Create Budget
    const budget = new Budget({
        userId: user._id,
        monthlyLimit: 50000
    });
    await budget.save();
    console.log('Demo budget created.');

    // Create Sample Data (Income)
    const income = [
        { amount: 80000, category: 'Salary', description: 'Monthly Salary', type: 'income', date: new Date(new Date().setDate(1)) },
        { amount: 5000, category: 'Freelance', description: 'Web Project', type: 'income', date: new Date(new Date().setDate(15)) }
    ];

    // Create Sample Data (Expenses)
    const expenses = [
        { amount: 15000, category: 'rent', description: 'Monthly House Rent', type: 'expense', date: new Date(new Date().setDate(2)) },
        { amount: 4500, category: 'food', description: 'Dinner with family', type: 'expense', date: new Date() },
        { amount: 1200, category: 'travel', description: 'Uber to work', type: 'expense', date: new Date() },
        { amount: 3500, category: 'shopping', description: 'New sneakers', type: 'expense', date: new Date(new Date().setDate(10)) },
        { amount: 2500, category: 'utilities', description: 'Electricity Bill', type: 'expense', date: new Date(new Date().setDate(5)) },
        { amount: 800, category: 'food', description: 'Zomato order', type: 'expense', date: new Date(new Date().setDate(12)) },
        { amount: 2000, category: 'healthcare', description: 'Medicine purchase', type: 'expense', date: new Date(new Date().setDate(18)) },
        { amount: 4500, category: 'investment', description: 'Mutual Fund SIP', type: 'expense', date: new Date(new Date().setDate(2)) },
        { amount: 1500, category: 'entertainment', description: 'Movie night', type: 'expense', date: new Date(new Date().setDate(20)) }
    ];

    const allTransactions = [...income, ...expenses].map(t => ({ ...t, userId: user._id }));
    await Expense.insertMany(allTransactions);

    console.log('\n✅ Demo environment seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Email:    ${DEMO_EMAIL}`);
    console.log(`  Password: ${DEMO_PASSWORD}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding demo:', err.message);
    process.exit(1);
  }
}

seedDemo();
