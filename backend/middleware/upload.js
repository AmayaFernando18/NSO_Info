import multer from 'multer'
import path from 'path'
import { ensureUploadDirExists, getUploadDir } from '../utils/uploadPath.js'
import { getUploadPolicy, UPLOAD_POLICY_KEYS } from '../config/uploadPolicies.js'

const normalizeExt = (filename) => path.extname(filename || '').toLowerCase()
const normalizeMime = (mimeType) => String(mimeType || '').toLowerCase()

const createFileFilter = (policy) => (req, file, cb) => {
  const ext = normalizeExt(file.originalname)
  const mime = normalizeMime(file.mimetype)

  const isExtensionAllowed = policy.allowedExtensions.includes(ext)
  const isMimeAllowed = policy.allowedMimeTypes.includes(mime)

  if (isExtensionAllowed || isMimeAllowed) {
    cb(null, true)
    return
  }

  cb(
    new Error(
      `Invalid file type for ${policy.label}. Allowed extensions: ${policy.allowedExtensions.join(', ')}`
    ),
    false
  )
}

const createStorage = (subdirectory) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, getUploadDir(subdirectory))
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      const ext = path.extname(file.originalname)
      const nameWithoutExt = path.basename(file.originalname, ext)
      cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`)
    },
  })

export const buildUploadPublicPath = (subdirectory, filename) => `/uploads/${subdirectory}/${filename}`

export const createUploadMiddleware = ({ subdirectory, policyKey }) => {
  const policy = getUploadPolicy(policyKey)
  ensureUploadDirExists(subdirectory)

  return multer({
    storage: createStorage(subdirectory),
    fileFilter: createFileFilter(policy),
    limits: {
      fileSize: policy.maxFileSizeMB * 1024 * 1024,
    },
  })
}

const defaultUpload = createUploadMiddleware({ subdirectory: 'news', policyKey: UPLOAD_POLICY_KEYS.NEWS_IMAGE })

export default defaultUpload
