import mongoose from 'mongoose';

const eventCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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
  },
  {
    timestamps: true,
  }
);

eventCategorySchema.index({ activeStatus: 1, displayOrder: 1, name: 1 });

export default mongoose.model('EventCategory', eventCategorySchema);
