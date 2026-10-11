export type UserRole = 'guest' | 'student' | 'provider' | 'admin';

export type ServiceCategory = 
  | 'schools'           // مدارس خاصة
  | 'universities'      // جامعات وكليات
  | 'institutes'        // معاهد لغات وتدريب
  | 'tutors'            // مدرسون ومعلمون خصوصيون
  | 'training_centers'  // مراكز تدريب مهني
  | 'libraries';        // مكتبات ومراكز بحثية

export interface EducationalProvider {
  id: string;
  name: string;
  nameEn: string;
  category: ServiceCategory;
  city: string;
  rating: number;
  reviewsCount: number;
  description: string;
  accredited: boolean;
  featured: boolean;
  contactEmail: string;
  contactPhone: string;
  servicesOffered: string[];
  establishedYear?: number;
  tags: string[];
  coverColor?: string;
  website?: string;
  address?: string;
  accreditationBody?: string;
  verifiedLicenseNumber?: string;
  providerId?: string;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  licenseNumber?: string;
  createdAt?: string;
  submittedAt?: string;
  updatedAt?: string;
  commissionRate?: number;
  accountStatus?: 'active' | 'suspended';
  contactPerson?: string;
  landline?: string;
  workingHours?: string;
  addressDetails?: {
    country: string;
    city: string;
    district: string;
    street: string;
    number: string;
  };
  logoUrl?: string;
  bannerUrl?: string;
  bannerImageUrl?: string;
  galleryImageUrls?: string[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
    whatsapp?: string;
  };
}

export interface CourseModule {
  id: string;
  title: string;
  duration: string;
  lessonsCount: number;
}

export interface EducationalService {
  id: string;
  providerId: string;
  providerName: string;
  title: string;
  category: ServiceCategory;
  level: string; // ابتدائي، متوسط، ثانوي، جامعي، عام
  duration: string;
  priceNote: string;
  numericPrice: number; // For simulated checkout
  currency: string;
  description: string;
  seatsAvailable: number;
  totalSeats: number;
  status: 'active' | 'draft' | 'closed';
  rating: number;
  reviewsCount: number;
  mode: 'online' | 'on-campus' | 'hybrid';
  modules?: CourseModule[];
  schedule?: string;
  instructorName?: string;
  instructorId?: string;
  instructorRole?: string;
  prerequisites?: string[];
  featured?: boolean;
  pausedByAdmin?: boolean;
  statusBeforePause?: 'active' | 'draft' | 'closed';
  startDate?: string;
  minStudents?: number;
  canStartBelowMin?: boolean;
  paymentMethods?: ('cash' | 'online')[];
  freeLessonsCount?: number;
}

export interface StudentInquiry {
  id: string;
  studentName: string;
  providerName: string;
  serviceTitle: string;
  date: string;
  status: 'pending' | 'responded' | 'confirmed' | 'rejected';
  notes: string;
  studentId?: string;
  providerId?: string;
  serviceId?: string;
  studentEmail?: string;
  responseNote?: string;
  interviewDate?: string;
  internalNotes?: string;
}

export interface CourseBooking {
  id: string;
  courseId: string;
  courseTitle: string;
  providerName: string;
  studentName: string;
  amount: number;
  currency: string;
  bookingDate: string;
  startDate: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'in-progress' | 'completed' | 'cancelled';
  studentId?: string;
  providerId?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  studentEmail?: string;
  studentPhone?: string;
  paymentMethod: 'credit_card' | 'mada' | 'apple_pay' | 'wire_transfer';
  transactionId: string;
}

export interface StudentNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'booking' | 'reminder' | 'system' | 'offer';
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  link?: string;
  syncedWithFirestore?: boolean;
}

export interface ProviderVerification {
  id: string;
  institutionName: string;
  category: ServiceCategory;
  licenseNumber: string;
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  city: string;
}

export type ActiveView = 
  | 'landing' 
  | 'discovery'
  | 'course-details'
  | 'provider-profile'
  | 'student' 
  | 'checkout'
  | 'provider' 
  | 'admin' 
  | 'auth-login' 
  | 'auth-register'
  | 'auth-recovery';
