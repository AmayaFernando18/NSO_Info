import type { RbacFunctionCode } from '../constants/rbac'

export type AuthorityCode = 'E' | 'C' | 'A' | 'M';
// FunctionCode is derived from shared constants to avoid duplicating literal unions
// in multiple files when functions are added/renamed.
export type FunctionCode = RbacFunctionCode;

export interface FunctionPermission {
  function: FunctionCode;
  authority: AuthorityCode;
}

export interface User {
  id?: string;
  username: string;
  name: string;
  email?: string;
  department?: string;
  role?: string;
  isSuperAdmin: boolean;
  functionPermissions: FunctionPermission[];
  isRbacUser?: boolean; // True if user exists in RBAC system (added by SuperAdmin)
}

export interface Employee {
  id: string;
  username: string;
  name: string;
  email: string;
  department: string;
  role: string;
  designation: string;
  phone: string;
}

export interface CorporateMemberDto {
  id?: string;
  _id?: string;
  name: string;
  position: string;
  department?: string;
  phone: string;
  email: string;
  imageUrl?: string;
  category?: CorporateCategoryDto | string | null;
  categoryId?: string;
  activeStatus?: boolean;
  displayOrder?: number;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string | null;
  deletedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CorporateCategoryDto {
  id?: string;
  _id?: string;
  name: string;
  activeStatus?: boolean;
  displayOrder?: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryAlbumDto {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  displayOrder?: number;
  activeStatus?: boolean;
  approved?: boolean;
  approvedBy?: string;
  approvedAt?: string | null;
  rejected?: boolean;
  rejectedBy?: string;
  rejectionReason?: string;
  rejectedAt?: string | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string;
  imageCount?: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryImageDto {
  id?: string;
  _id?: string;
  gallery?: string;
  title?: string;
  altText?: string;
  imageUrl: string;
  displayOrder?: number;
  activeStatus?: boolean;
  approved?: boolean;
  approvedBy?: string;
  approvedAt?: string | null;
  rejected?: boolean;
  rejectedBy?: string;
  rejectionReason?: string;
  rejectedAt?: string | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryAlbumDetailDto {
  album: GalleryAlbumDto;
  images: GalleryImageDto[];
}

export interface NewsDto {
  id?: string;
  _id?: string;
  title: string;
  excerpt?: string;
  summary?: string;
  content: string;
  category: string;
  imageUrl?: string;
  publishedAt: string;
  author?: string;
  activeStatus?: boolean;
  approved?: boolean;
  createdBy?: string;
  updatedBy?: string;
  approvedBy?: string;
  approvedAt?: string | null;
  rejected?: boolean;
  rejectedBy?: string;
  rejectionReason?: string;
  rejectedAt?: string | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string;
}

export type EventCategory = string;

export interface EventCategoryDto {
  id?: string;
  _id?: string;
  name: string;
  activeStatus?: boolean;
  displayOrder?: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventCategoryInput {
  name: string;
  activeStatus?: boolean;
  displayOrder?: number;
}

export interface EventDto {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  category: EventCategory;
  eventDate: string;
  endDate?: string | null;
  linkLabel?: string;
  linkUrl?: string;
  isHoliday?: boolean;
  isSpecialDay?: boolean;
  activeStatus?: boolean;
  approved?: boolean;
  approvedBy?: string;
  approvedAt?: string | null;
  rejected?: boolean;
  rejectedBy?: string;
  rejectionReason?: string;
  rejectedAt?: string | null;
  createdBy?: string;
  updatedBy?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PersonalEventDto {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  eventDate: string;
  endDate?: string | null;
  ownerUsername: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PersonalEventInput {
  title: string;
  description?: string;
  eventDate: string;
  endDate?: string | null;
}

export interface HolidayDto {
  date: string;
  title: string;
  isHoliday?: boolean;
  isSpecialDay?: boolean;
}

export interface CalendarDataDto {
  events: EventDto[];
  holidays: HolidayDto[];
  specialDays: HolidayDto[];
  year: number;
  month: number;
}

export interface QuickAccessDto {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  category?: string;
  order?: number;
  activeStatus?: boolean;
  approved?: boolean;
  approvedBy?: string;
  approvedAt?: string | null;
  rejected?: boolean;
  rejectedBy?: string;
  rejectedAt?: string | null;
  rejectionReason?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string;
}

export interface ServiceDto {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
}

export interface HighlightDto {
  id: string;
  title: string;
  description?: string;
  value: string;
  icon: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}

export interface HeroCarouselImageDto {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
  activeStatus?: boolean;
  approved?: boolean;
  approvedBy?: string;
  approvedAt?: string | null;
  rejected?: boolean;
  rejectedBy?: string;
  rejectionReason?: string;
  rejectedAt?: string | null;
}
