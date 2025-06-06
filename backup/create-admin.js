const User = require('../models/User');
const sequelize = require('../config/database');
const logger = require('../utils/logger');

async function createAdminUser() {
  try {
    // Check database connection
    await sequelize.authenticate();
    console.log('Database connection successful.');

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: {
        email: 'admin@example.com',
        role: 'admin'
      }
    });

    if (existingAdmin) {
      console.log('Admin account already exists.');
      return;
    }

    // Create admin account
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true
    });

    console.log('Admin account created successfully:');
    console.log('- Email: admin@example.com');
    console.log('- Password: Admin@123');
    console.log('Please change the password after the first login.');
  } catch (error) {
    console.error('Error creating admin account:', error);
  } finally {
    process.exit();
  }
}

createAdminUser();