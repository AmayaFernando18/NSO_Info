import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema(
  {
    gallery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gallery',
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    altText: {
      type: String,
      trim: true,
      default: '',
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
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

galleryImageSchema.index({ gallery: 1, displayOrder: 1, createdAt: -1 });

export default mongoose.model('GalleryImage', galleryImageSchema);
