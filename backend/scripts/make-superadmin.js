/**
 * Script to Make Admin User a SuperAdmin
 * 
 * Usage:
 *   node scripts/make-superadmin.js <username>
 * 
 * Example:
 *   node scripts/make-superadmin.js admin
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dir, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nso_info';

// Get username from command line arguments
const username = process.argv[2];

if (!username) {
  console.error('❌ Please provide a username');
  console.error('Usage: node scripts/make-superadmin.js <username>');
  process.exit(1);
}

async function makeSuperAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      console.error(`❌ User "${username}" not found in database`);
      console.error('Please create the user first using seed-admin.js or assign-access endpoint');
      await mongoose.connection.close();
      process.exit(1);
    }

    // Update to SuperAdmin
    user.isSuperAdmin = true;
    user.functionPermissions = []; // SuperAdmin doesn't need function permissions
    await user.save();

    console.log(`✓ Successfully made "${username}" a SuperAdmin`);
    console.log(`  Username: ${user.username}`);
    console.log(`  SuperAdmin: ${user.isSuperAdmin}`);
    console.log(`  Last Login: ${user.lastLogin || 'Never'}`);
    console.log('\n✓ User is now SuperAdmin with full access to all functions!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

makeSuperAdmin();
