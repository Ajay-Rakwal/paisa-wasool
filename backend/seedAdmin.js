
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User } = require('./models');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_USERNAME = 'admin';

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log('Admin user already exists!');
      console.log(`  Email: ${ADMIN_EMAIL}`);
      console.log(`  Role: ${existing.role}`);
      
      // Ensure role is admin
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log('  Updated role to admin');
      }
      
      process.exit(0);
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    const admin = new User({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    
    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log(`  Role:     admin`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  Change the password after first login!');
    
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err.message);
    process.exit(1);
  }
}

seedAdmin();
