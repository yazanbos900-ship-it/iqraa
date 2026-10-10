import { EducationalService, StudentInquiry } from '../../types';

export type ProviderCategoryType = 
  | 'schools'
  | 'universities'
  | 'institutes_lang'
  | 'institutes_tech'
  | 'kindergartens'
  | 'vocational'
  | 'tutors'
  | 'libraries'
  | 'cultural_centers'
  | 'other';

export interface ProviderTypeOption {
  id: ProviderCategoryType;
  nameAr: string;
  categoryTag: string;
  badge: string;
  institutionName: string;
  licenseNumber: string;
  licensingBody: string;
  city: string;
  establishedYear: number;
  description: string;
  avatarText: string;
  avatarBg: string;
}

export interface EnrolledStudent {
  id: string;
  name: string;
  programTitle: string;
  levelOrGrade?: string;
  enrollDate: string;
  progressPercent?: number;
  attendanceRate?: number;
  paymentStatus: 'paid' | 'installments' | 'pending' | 'overdue' | 'failed' | 'refunded';
  guardianName?: string;
  phone: string;
  email: string;
  enrollmentStatus?: string;
  amount?: number;
}

export interface ProviderReviewItem {
  id: string;
  providerId?: string;
  studentName: string;
  avatarInitials: string;
  courseTitle: string;
  rating: number;
  date: string;
  comment: string;
  aspects: { teaching: number; facilities: number; organization: number };
  reply?: {
    text: string;
    date: string;
    responder: string;
  };
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  department: string;
  status: 'active' | 'pending';
}

export interface ExtendedInquiry extends StudentInquiry {
  phone?: string;
  email?: string;
  studentLevel?: string;
  preferredSchedule?: string;
  interviewDate?: string;
  interviewNotes?: string;
  internalNotes?: string;
}
