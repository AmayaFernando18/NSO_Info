const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

const DOCUMENT_EXTENSIONS = ['.doc', '.docx', '.xls', '.xlsx', '.pdf', '.txt', '.odt', '.ods']
const DOCUMENT_MIME_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/pdf',
  'text/plain',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
]

const ARCHIVE_EXTENSIONS = ['.zip', '.tar', '.gz', '.tgz', '.rar', '.7z']
const ARCHIVE_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-tar',
  'application/gzip',
  'application/x-gzip',
  'application/vnd.rar',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
]

const uniq = (items) => [...new Set(items)]

export const UPLOAD_POLICY_KEYS = {
  NEWS_IMAGE: 'NEWS_IMAGE',
  HERO_IMAGE: 'HERO_IMAGE',
  LOGIN_SLIDE_IMAGE: 'LOGIN_SLIDE_IMAGE',
  CORPORATE_TEAM_IMAGE: 'CORPORATE_TEAM_IMAGE',
  GALLERY_IMAGE: 'GALLERY_IMAGE',
  DOWNLOAD_PDF: 'DOWNLOAD_PDF',
  DOCUMENT_ATTACHMENT: 'DOCUMENT_ATTACHMENT',
  SPECIFICATION_FILE: 'SPECIFICATION_FILE',
  ASSET_BUNDLE: 'ASSET_BUNDLE',
}

export const UPLOAD_POLICIES = {
  [UPLOAD_POLICY_KEYS.NEWS_IMAGE]: {
    label: 'News image uploads',
    maxFileSizeMB: 3,
    allowedExtensions: IMAGE_EXTENSIONS,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  },
  [UPLOAD_POLICY_KEYS.HERO_IMAGE]: {
    label: 'Hero image uploads',
    maxFileSizeMB: 5,
    allowedExtensions: IMAGE_EXTENSIONS,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  },
  [UPLOAD_POLICY_KEYS.LOGIN_SLIDE_IMAGE]: {
    label: 'Login slide image uploads',
    maxFileSizeMB: 5,
    allowedExtensions: IMAGE_EXTENSIONS,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  },
  [UPLOAD_POLICY_KEYS.CORPORATE_TEAM_IMAGE]: {
    label: 'Corporate team image uploads',
    maxFileSizeMB: 5,
    allowedExtensions: IMAGE_EXTENSIONS,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  },
  [UPLOAD_POLICY_KEYS.GALLERY_IMAGE]: {
    label: 'Gallery image uploads',
    maxFileSizeMB: 6,
    allowedExtensions: IMAGE_EXTENSIONS,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  },
  [UPLOAD_POLICY_KEYS.DOWNLOAD_PDF]: {
    label: 'Download PDF uploads',
    maxFileSizeMB: 15,
    allowedExtensions: ['.pdf'],
    allowedMimeTypes: ['application/pdf'],
  },
  [UPLOAD_POLICY_KEYS.DOCUMENT_ATTACHMENT]: {
    label: 'Document uploads',
    maxFileSizeMB: 15,
    allowedExtensions: DOCUMENT_EXTENSIONS,
    allowedMimeTypes: DOCUMENT_MIME_TYPES,
  },
  [UPLOAD_POLICY_KEYS.SPECIFICATION_FILE]: {
    label: 'Specification file uploads',
    maxFileSizeMB: 25,
    allowedExtensions: uniq([...DOCUMENT_EXTENSIONS, ...ARCHIVE_EXTENSIONS]),
    allowedMimeTypes: uniq([...DOCUMENT_MIME_TYPES, ...ARCHIVE_MIME_TYPES]),
  },
  [UPLOAD_POLICY_KEYS.ASSET_BUNDLE]: {
    label: 'Mixed asset uploads',
    maxFileSizeMB: 25,
    allowedExtensions: uniq([...IMAGE_EXTENSIONS, ...DOCUMENT_EXTENSIONS, ...ARCHIVE_EXTENSIONS]),
    allowedMimeTypes: uniq([...IMAGE_MIME_TYPES, ...DOCUMENT_MIME_TYPES, ...ARCHIVE_MIME_TYPES]),
  },
}

export const getUploadPolicy = (policyKey) => {
  const policy = UPLOAD_POLICIES[policyKey]
  if (!policy) {
    throw new Error(`Unknown upload policy key: ${policyKey}`)
  }
  return policy
}
