/**
 * Seed Script: Add First RBAC User (SuperAdmin)
 * 
 * Usage:
 *   node scripts/seed-admin.js
 * 
 * This script adds a SuperAdmin user to the database so you can log in
 * and manage RBAC permissions for other users.
 * 
 * Modify the `adminUser` object below to change credentials.
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dir, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nso_info';

/**
 * SuperAdmin user to be created
 * Modify this object to change the first admin credentials
 */
const adminUser = {
  username: 'admin',
  isSuperAdmin: true,
  functionPermissions: [], // SuperAdmin gets all permissions automatically
};

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ username: adminUser.username });
    if (existingUser) {
      console.log(`✗ User "${adminUser.username}" already exists in database`);
      console.log(`  Current permissions: isSuperAdmin=${existingUser.isSuperAdmin}`);
      console.log('\nTo modify this user, use the Admin Panel or update directly in database.');
      await mongoose.connection.close();
      return;
    }

    // Create new user
    const user = new User(adminUser);
    await user.save();
    console.log(`✓ Created ${adminUser.isSuperAdmin ? 'SuperAdmin' : 'regular'} user: "${adminUser.username}"`);
    console.log(`  EPF/Username: ${user.username}`);
    console.log(`  SuperAdmin: ${user.isSuperAdmin}`);
    console.log(`  Permissions: ${user.functionPermissions.length > 0 ? user.functionPermissions.length : 'All (SuperAdmin)'}`);

    console.log('\n✓ User created successfully!');
    console.log(`\nYou can now log in using:`);
    console.log(`  Username: ${adminUser.username}`);
    console.log(`  Mock Password: admin123 (if using mock AD, see auth.service.js)`);
    console.log(`  Real AD Password: Your actual AD password\n`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('✗ Error creating user:', error.message);
    process.exit(1);
  }
}

seedAdmin();
