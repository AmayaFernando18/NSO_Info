import mongoose from 'mongoose';

const corporateMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: 'NSO (Pvt) Ltd.',
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CorporateCategory',
      default: null,
    },
    activeStatus: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      trim: true,
      required: true,
    },
    updatedBy: {
      type: String,
      trim: true,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching active members (for public display)
corporateMemberSchema.index({ activeStatus: 1, displayOrder: 1 });

export default mongoose.model('CorporateMember', corporateMemberSchema);
