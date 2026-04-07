import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    coverImageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
    activeStatus: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
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
  },
  {
    timestamps: true,
  }
);

gallerySchema.index({ displayOrder: 1, createdAt: -1 });

export default mongoose.model('Gallery', gallerySchema);
