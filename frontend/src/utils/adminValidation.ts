export type FieldErrors<T extends string = string> = Partial<Record<T, string>>

type ApiIssue = {
  path?: Array<string | number>
  field?: string
  message?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[0-9+()\-\s]{5,}$/

const isValidHttpUrl = (value: string) => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const hasFieldErrors = <T extends string>(errors: FieldErrors<T>) => Object.keys(errors).length > 0

export const parseApiValidationErrors = (err: any) => {
  const data = err?.response?.data || {}
  const details = Array.isArray(data?.details) ? (data.details as ApiIssue[]) : []
  const fieldErrors: FieldErrors = {}

  details.forEach((issue) => {
    const pathParts = Array.isArray(issue.path) ? issue.path.map((part) => String(part)).filter(Boolean) : []
    const pathKey = pathParts.length > 0 ? pathParts[pathParts.length - 1] : ''
    const fieldKey = String(issue.field || pathKey || '').trim()
    if (!fieldKey || fieldErrors[fieldKey]) return
    fieldErrors[fieldKey] = issue.message || 'Invalid value.'
  })

  const message =
    data?.error ||
    data?.message ||
    (details.length > 0 ? 'Please correct the highlighted fields.' : 'Something went wrong. Please try again.')

  return {
    message,
    fieldErrors,
  }
}

export type NewsValidationInput = {
  title: string
  summary: string
  content: string
  category: string
  imageUrl: string
}

export const validateNewsForm = (form: NewsValidationInput): FieldErrors<keyof NewsValidationInput> => {
  const errors: FieldErrors<keyof NewsValidationInput> = {}

  if (!form.title.trim()) errors.title = 'Title is required.'
  if (!form.summary.trim()) errors.summary = 'Summary is required.'
  if (!form.content.trim()) errors.content = 'Content is required.'
  if (!form.category.trim()) errors.category = 'Category is required.'
  if (!form.imageUrl.trim()) errors.imageUrl = 'Please upload an image or provide an image URL.'

  return errors
}

export type EventValidationInput = {
  title: string
  description: string
  eventDate: string
  endDate?: string
  linkUrl?: string
}

export const validateEventForm = (form: EventValidationInput): FieldErrors<keyof EventValidationInput> => {
  const errors: FieldErrors<keyof EventValidationInput> = {}

  if (!form.title.trim()) errors.title = 'Title is required.'
  if (!form.description.trim()) errors.description = 'Description is required.'
  if (!form.eventDate) errors.eventDate = 'Event date is required.'

  if (form.eventDate && form.endDate && form.endDate < form.eventDate) {
    errors.endDate = 'End date cannot be earlier than event date.'
  }

  if (form.linkUrl && form.linkUrl.trim() && !isValidHttpUrl(form.linkUrl.trim())) {
    errors.linkUrl = 'Please enter a valid URL starting with http:// or https://.'
  }

  return errors
}

export type CorporateValidationInput = {
  name: string
  position: string
  phone: string
  email: string
  categoryId: string
}

export const validateCorporateMemberForm = (
  form: CorporateValidationInput
): FieldErrors<keyof CorporateValidationInput> => {
  const errors: FieldErrors<keyof CorporateValidationInput> = {}

  if (!form.name.trim()) errors.name = 'Full name is required.'
  if (!form.position.trim()) errors.position = 'Position is required.'

  const phoneValue = form.phone.trim()
  if (!phoneValue) {
    errors.phone = 'Phone is required.'
  } else if (!PHONE_REGEX.test(phoneValue)) {
    errors.phone = 'Phone must be at least 5 characters and contain only valid symbols.'
  }

  const emailValue = form.email.trim()
  if (!emailValue) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_REGEX.test(emailValue)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!form.categoryId) errors.categoryId = 'Category is required.'

  return errors
}
