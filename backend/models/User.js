import mongoose from 'mongoose';
import { RBAC_FUNCTIONS } from '../config/rbacFunctions.js';

/**
 * User Model for Function-Based RBAC
 * 
 * Authority Levels:
 * - E (Enter): View + Create
 * - C (Check): View only
 * - A (Approve): View + Approve
 * - M (Manager): Full access (View + Create + Edit + Delete + Approve)
 * - SuperAdmin: Full access to all functions
 * 
 * Functions:
 * - News: News management
 * - Hero: Hero carousel management
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    functionPermissions: {
      type: [
        {
          function: {
            type: String,
            required: true,
            // Use centralized RBAC function list so DB validation stays aligned
            // with route guards and frontend function pickers.
            enum: RBAC_FUNCTIONS,
          },
          authority: {
            type: String,
            required: true,
            enum: ['E', 'C', 'A', 'M'], // Enter, Check, Approve, Manager
          },
          _id: false,
        },
      ],
      default: [],
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
userSchema.index({ 'functionPermissions.function': 1 });

export default mongoose.model('User', userSchema);
