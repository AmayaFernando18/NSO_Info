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

export interface EventDto {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime?: string;
  location: string;
  category: string;
}

export interface QuickAccessDto {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  category: string;
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
  description: string;
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
