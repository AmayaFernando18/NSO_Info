import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ['Meeting', 'Training', 'Workshop', 'Conference', 'Holiday', 'Special Day', 'Coordination', 'Drill', 'Other'],
      default: 'Other',
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
    linkLabel: {
      type: String,
      trim: true,
      default: '',
    },
    linkUrl: {
      type: String,
      trim: true,
      default: '',
    },
    isHoliday: {
      type: Boolean,
      default: false,
      index: true,
    },
    isSpecialDay: {
      type: Boolean,
      default: false,
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
      required: true,
      trim: true,
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

// Index for efficient date-range queries
eventSchema.index({ eventDate: 1, endDate: 1 });
eventSchema.index({ approved: 1, activeStatus: 1, isDeleted: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
