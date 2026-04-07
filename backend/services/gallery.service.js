import Gallery from '../models/Gallery.js';
import GalleryImage from '../models/GalleryImage.js';

const withAlbumDerivedFields = async (album, includeInactiveImages = false) => {
  const filter = {
    gallery: album._id,
    ...(includeInactiveImages ? {} : { activeStatus: true }),
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
  const albums = await Gallery.find({ activeStatus: true, isDeleted: false }).sort({ displayOrder: 1, createdAt: -1 });
  return Promise.all(albums.map((album) => withAlbumDerivedFields(album, false)));
};

export const getPublicAlbumWithImages = async (id) => {
  const album = await Gallery.findOne({ _id: id, activeStatus: true, isDeleted: false });
  if (!album) return null;

  const images = await GalleryImage.find({ gallery: album._id, activeStatus: true }).sort({
    displayOrder: 1,
    createdAt: 1,
  });

  const enriched = await withAlbumDerivedFields(album, false);
  return {
    album: enriched,
    images,
  };
};

export const listAdminAlbums = async () => {
  const albums = await Gallery.find({ isDeleted: false }).sort({ displayOrder: 1, createdAt: -1 });
  return Promise.all(albums.map((album) => withAlbumDerivedFields(album, true)));
};

export const getAlbumById = async (id) => Gallery.findById(id);

export const addAlbum = async (payload) => Gallery.create(payload);

export const updateAlbumById = async (id, payload) =>
  Gallery.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

export const deleteAlbumById = async (id) => {
  await GalleryImage.deleteMany({ gallery: id });
  return Gallery.findByIdAndDelete(id);
};

export const listAdminImagesByAlbum = async (albumId) =>
  GalleryImage.find({ gallery: albumId }).sort({ displayOrder: 1, createdAt: 1 });

export const getImageById = async (id) => GalleryImage.findById(id);

export const addImageToAlbum = async (payload) => GalleryImage.create(payload);

export const updateImageById = async (id, payload) =>
  GalleryImage.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

export const deleteImageById = async (id) => GalleryImage.findByIdAndDelete(id);
