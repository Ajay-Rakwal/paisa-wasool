require('dotenv').config();
const bcrypt = require('bcrypt');
const { User } = require('./models');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_USERNAME = 'admin';

async function seedAdmin() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('⚠️ Skipping admin seeding: ADMIN_EMAIL or ADMIN_PASSWORD not configured in environment.');
    return;
  }
  try {
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
        console.log('  Updated existing user role to admin');
      }
      return;
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
  } catch (err) {
    console.error('Error seeding admin:', err.message);
  }
}

module.exports = seedAdmin;

if (require.main === module) {
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB for direct seeding');
      seedAdmin().then(() => process.exit(0));
    })
    .catch(err => {
      console.error('Connection failed:', err.message);
      process.exit(1);
    });
}
