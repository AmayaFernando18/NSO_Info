import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
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
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
    updatedBy: {
      type: String,
      trim: true,
      default: '',
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
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

newsSchema.index({ category: 1, publishedAt: -1 });

export default mongoose.model('News', newsSchema);
