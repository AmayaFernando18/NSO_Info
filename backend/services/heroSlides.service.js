import HeroSlide from '../models/HeroSlide.js';

export const listPublicHeroSlides = async () =>
  // Public hero slides must be activeStatus=true AND either approved=true OR lacking the approved field altogether.
  // The $exists check ensures backward compatibility: old slides created before approval workflow was added
  // will still appear publicly without requiring explicit re-approval, reducing migration friction.
  HeroSlide.find({
    activeStatus: true,
    isDeleted: false,
    $or: [{ approved: true }, { approved: { $exists: false } }],
  }).sort({ order: 1, createdAt: 1 });

export const listAdminHeroSlides = async ({ deletedOnly = false, includeDeleted = false } = {}) => {
  if (deletedOnly) {
    return HeroSlide.find({ isDeleted: true }).sort({ deletedAt: -1, createdAt: -1 });
  }

  if (includeDeleted) {
    return HeroSlide.find().sort({ order: 1, createdAt: 1 });
  }

  return HeroSlide.find({ isDeleted: false }).sort({ order: 1, createdAt: 1 });
};

export const getHeroSlideById = async (id) => HeroSlide.findById(id);

export const addHeroSlide = async (payload) => HeroSlide.create(payload);

export const updateHeroSlideById = async (id, payload) =>
  HeroSlide.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

export const approveHeroSlideById = async (id, approverUsername) =>
  // Approver (authority A/M) marks a pending slide as approved for public display.
  // Simultaneously clear rejection flags to allow re-approval after prior rejection.
  HeroSlide.findByIdAndUpdate(
    id,
    {
      approved: true,
      approvedBy: approverUsername,
      approvedAt: new Date(),
      rejected: false,
      rejectedBy: '',
      rejectionReason: '',
      rejectedAt: null,
      updatedBy: approverUsername,
    },
    { new: true, runValidators: true }
  );

export const rejectHeroSlideById = async (id, rejectedBy, rejectionReason) =>
  // Approver rejects a slide and provides reason for rejection.
  // Clears approved status so slide is sent back to pending state.
  // Creator will see rejectionReason and can edit + resubmit for re-approval.
  HeroSlide.findByIdAndUpdate(
    id,
    {
      rejected: true,
      rejectedBy,
      rejectionReason,
      rejectedAt: new Date(),
      approved: false,
      approvedBy: '',
      approvedAt: null,
      updatedBy: rejectedBy,
    },
    { new: true, runValidators: true }
  );

export const softDeleteHeroSlideById = async (id, deletedBy) =>
  HeroSlide.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
    },
    { new: true, runValidators: true }
  );

export const restoreHeroSlideById = async (id, restoredBy) =>
  HeroSlide.findByIdAndUpdate(
    id,
    {
      isDeleted: false,
      deletedAt: null,
      deletedBy: '',
      updatedBy: restoredBy,
    },
    { new: true, runValidators: true }
  );

export const permanentlyDeleteHeroSlideById = async (id) => HeroSlide.findByIdAndDelete(id);

export const deleteHeroSlideById = async (id) => HeroSlide.findByIdAndDelete(id);

export const reorderHeroSlides = async (orderedIds) => {
  const operations = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { order: index + 1 },
    },
  }));

  if (operations.length > 0) {
    await HeroSlide.bulkWrite(operations);
  }

  return listAdminHeroSlides();
};
