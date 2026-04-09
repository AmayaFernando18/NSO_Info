import mongoose from 'mongoose';

const quickAccessSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },
    activeStatus: {
      type: Boolean,
      default: true,
      index: true,
    },
    approved: {
      type: Boolean,
      default: false,
      index: true,
    },
    approvedBy: {
      type: String,
      trim: true,
      default: '',
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejected: {
      type: Boolean,
      default: false,
      index: true,
    },
    rejectedBy: {
      type: String,
      trim: true,
      default: '',
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: String,
      trim: true,
      default: '',
    },
    updatedBy: {
      type: String,
      trim: true,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
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

quickAccessSchema.index({ activeStatus: 1, approved: 1, order: 1, isDeleted: 1 });

export default mongoose.model('QuickAccess', quickAccessSchema);
