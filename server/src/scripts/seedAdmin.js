/**
 * One-time script to seed the first admin user
 * Run: node src/scripts/seedAdmin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socialbee');

  // Promote the first user to admin
  const user = await User.findOne();
  if (!user) {
    console.log('❌ No users found. Sign in first, then run this script.');
    process.exit(1);
  }
  user.role = 'admin';
  await user.save();
  console.log(`✅ Promoted "${user.name}" (${user.email}) to admin.`);
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
