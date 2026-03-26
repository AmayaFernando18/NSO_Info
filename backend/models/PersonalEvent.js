import mongoose from 'mongoose';

const personalEventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    eventDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    ownerUsername: {
      type: String,
      required: true,
      trim: true,
      index: true,
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
  },
  {
    timestamps: true,
  }
);

personalEventSchema.index({ ownerUsername: 1, eventDate: 1 });

const PersonalEvent = mongoose.model('PersonalEvent', personalEventSchema);

export default PersonalEvent;
