import path from 'path';
import fs from 'fs';

export const getUploadBasePath = () => {
  const uploadPath = process.env.UPLOAD_PATH;
  if (!uploadPath) {
    const fallback = path.join(process.cwd(), 'uploads');
    console.warn(`UPLOAD_PATH not configured — falling back to local uploads at: ${fallback}`);
    return fallback;
  }
  return uploadPath;
};

export const getUploadDir = (subdirectory) => {
  const basePath = getUploadBasePath();
  return path.join(basePath, subdirectory);
};

export const ensureUploadDirExists = (subdirectory) => {
  const uploadsDir = getUploadDir(subdirectory);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`📁 Created upload directory: ${uploadsDir}`);
  }
};

export const getAbsoluteFilePath = (relativePath) => {
  const basePath = getUploadBasePath();
  const normalizedPath = String(relativePath || '').replace(/\\/g, '/').replace(/^\/+uploads\//, '');
  return path.join(basePath, normalizedPath);
};

export const deleteUploadedFileByRelativePath = (relativePath) => {
  if (!relativePath || typeof relativePath !== 'string') {
    return false;
  }

  const normalizedPath = relativePath.replace(/\\/g, '/').trim();

  if (!normalizedPath.startsWith('/uploads/')) {
    return false;
  }

  const uploadsRoot = path.resolve(getUploadBasePath(), 'uploads');
  const targetPath = path.resolve(getAbsoluteFilePath(normalizedPath));

  if (!targetPath.startsWith(uploadsRoot)) {
    return false;
  }

  if (!fs.existsSync(targetPath)) {
    return false;
  }

  fs.unlinkSync(targetPath);
  return true;
};
