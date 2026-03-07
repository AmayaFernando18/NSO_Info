import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema(
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
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 1,
      index: true,
    },
    activeStatus: {
      type: Boolean,
      default: true,
      index: true,
    },
    // Approval workflow fields: Hero slides follow a moderation model where they must be
    // approved by an authorized user (authority 'A' or 'M') before appearing on the public website.
    // This aligns with the News approval workflow for consistency across content types.
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
    // Rejection tracking: If an Approver rejects a slide, the rejectionReason is stored
    // so the creator can see why and make corrections before resubmitting.
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

heroSlideSchema.index({ activeStatus: 1, order: 1, isDeleted: 1 });

export default mongoose.model('HeroSlide', heroSlideSchema);
