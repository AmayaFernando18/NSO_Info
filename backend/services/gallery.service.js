import Gallery from '../models/Gallery.js';
import GalleryImage from '../models/GalleryImage.js';

const withAlbumDerivedFields = async (album, includeInactiveImages = false) => {
  const filter = {
    gallery: album._id,
    ...(includeInactiveImages
      ? {}
      : {
          activeStatus: true,
          approved: true,
          isDeleted: false,
        }),
  };

  const imageCount = await GalleryImage.countDocuments(filter);
  const firstImage = await GalleryImage.findOne(filter).sort({ displayOrder: 1, createdAt: 1 });

  return {
    ...album.toObject(),
    imageCount,
    coverImageUrl: album.coverImageUrl || firstImage?.imageUrl || '',
  };
};

export const listPublicAlbums = async () => {
  const albums = await Gallery.find({ activeStatus: true, approved: true, isDeleted: false }).sort({ displayOrder: 1, createdAt: -1 });
  return Promise.all(albums.map((album) => withAlbumDerivedFields(album, false)));
};

export const getPublicAlbumWithImages = async (id) => {
  const album = await Gallery.findOne({ _id: id, activeStatus: true, approved: true, isDeleted: false });
  if (!album) return null;

  const images = await GalleryImage.find({ gallery: album._id, activeStatus: true, approved: true, isDeleted: false }).sort({
    displayOrder: 1,
    createdAt: 1,
  });

  const enriched = await withAlbumDerivedFields(album, false);
  return {
    album: enriched,
    images,
  };
};

export const listAdminAlbums = async ({ deletedOnly = false, includeDeleted = false } = {}) => {
  if (deletedOnly) {
    return Gallery.find({ isDeleted: true }).sort({ deletedAt: -1, createdAt: -1 });
  }

  if (includeDeleted) {
    return Gallery.find().sort({ createdAt: -1 });
  }

  return Gallery.find({ isDeleted: false }).sort({ createdAt: -1 });
};

export const getAlbumById = async (id) => Gallery.findById(id);

export const addAlbum = async (payload) => Gallery.create(payload);

export const updateAlbumById = async (id, payload) =>
  Gallery.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

export const approveAlbumById = async (id, approverUsername) =>
  Gallery.findByIdAndUpdate(
    id,
    {
      approved: true,
      approvedBy: approverUsername,
      approvedAt: new Date(),
      updatedBy: approverUsername,
      rejected: false,
      rejectedBy: '',
      rejectionReason: '',
      rejectedAt: null,
    },
    { new: true, runValidators: true }
  );

export const rejectAlbumById = async (id, rejectedBy, rejectionReason) =>
  Gallery.findByIdAndUpdate(
    id,
    {
      rejected: true,
      rejectedBy,
      rejectionReason,
      rejectedAt: new Date(),
      approved: false,
      approvedBy: '',
      approvedAt: null,
    },
    { new: true, runValidators: true }
  );

export const softDeleteAlbumById = async (id, deletedBy) =>
  Gallery.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
    },
    { new: true, runValidators: true }
  );

export const restoreAlbumById = async (id, restoredBy) =>
  Gallery.findByIdAndUpdate(
    id,
    {
      isDeleted: false,
      deletedAt: null,
      deletedBy: '',
      updatedBy: restoredBy,
    },
    { new: true, runValidators: true }
  );

export const permanentlyDeleteAlbumById = async (id) => {
  await GalleryImage.deleteMany({ gallery: id });
  return Gallery.findByIdAndDelete(id);
};

// Legacy function for backward compatibility
export const deleteAlbumById = async (id) => softDeleteAlbumById(id, '');

export const listAdminImagesByAlbum = async (albumId, { deletedOnly = false, includeDeleted = false } = {}) => {
  if (deletedOnly) {
    return GalleryImage.find({ gallery: albumId, isDeleted: true }).sort({ deletedAt: -1, createdAt: -1 });
  }

  if (includeDeleted) {
    return GalleryImage.find({ gallery: albumId }).sort({ createdAt: -1 });
  }

  return GalleryImage.find({ gallery: albumId, isDeleted: false }).sort({ displayOrder: 1, createdAt: 1 });
};

export const getImageById = async (id) => GalleryImage.findById(id);

export const addImageToAlbum = async (payload) => GalleryImage.create(payload);

export const updateImageById = async (id, payload) =>
  GalleryImage.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

export const approveImageById = async (id, approverUsername) =>
  GalleryImage.findByIdAndUpdate(
    id,
    {
      approved: true,
      approvedBy: approverUsername,
      approvedAt: new Date(),
      updatedBy: approverUsername,
      rejected: false,
      rejectedBy: '',
      rejectionReason: '',
      rejectedAt: null,
    },
    { new: true, runValidators: true }
  );

export const rejectImageById = async (id, rejectedBy, rejectionReason) =>
  GalleryImage.findByIdAndUpdate(
    id,
    {
      rejected: true,
      rejectedBy,
      rejectionReason,
      rejectedAt: new Date(),
      approved: false,
      approvedBy: '',
      approvedAt: null,
    },
    { new: true, runValidators: true }
  );

export const softDeleteImageById = async (id, deletedBy) =>
  GalleryImage.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
    },
    { new: true, runValidators: true }
  );

export const restoreImageById = async (id, restoredBy) =>
  GalleryImage.findByIdAndUpdate(
    id,
    {
      isDeleted: false,
      deletedAt: null,
      deletedBy: '',
      updatedBy: restoredBy,
    },
    { new: true, runValidators: true }
  );

export const permanentlyDeleteImageById = async (id) => GalleryImage.findByIdAndDelete(id);

// Legacy function for backward compatibility
export const deleteImageById = async (id) => softDeleteImageById(id, '');
