import { collection, getDocs } from 'firebase/firestore';
import { db } from './config';
import firestoreRules from '../../firestore.rules?raw';

export interface SeedResult {
  success: boolean;
  servicesCount: number;
  providersCount: number;
  categoriesCount: number;
  notificationsCount?: number;
  isPermissionError?: boolean;
  error?: string;
}

export interface SeedNotificationsResult {
  success: boolean;
  savedCount: number;
  userId: string;
  userEmail: string;
  pathsCreated: string[];
  error?: string;
  isPermissionError?: boolean;
}

// The admin panel copies the same rules file that ships with this project.
export const FIRESTORE_RULES_TEXT = firestoreRules;

// Seeding mock data into a connected customer database is intentionally disabled.
export async function seedFirestoreInitialData(): Promise<SeedResult> {
  return {
    success: false,
    servicesCount: 0,
    providersCount: 0,
    categoriesCount: 0,
    notificationsCount: 0,
    error: 'تم إيقاف تعبئة البيانات التجريبية حتى لا تستبدل أو تكرر بياناتك الحالية.',
  };
}

export async function checkFirestoreDataStats() {
  const [servicesSnap, providersSnap, categoriesSnap] = await Promise.all([
    getDocs(collection(db, 'services')).catch(() => null),
    getDocs(collection(db, 'providers')).catch(() => null),
    getDocs(collection(db, 'categories')).catch(() => null),
  ]);
  return {
    services: servicesSnap?.size || 0,
    providers: providersSnap?.size || 0,
    categories: categoriesSnap?.size || 0,
  };
}

// Notifications are created by real account actions; there is no fake notification seeder.
export async function seedNotificationsDirectly(): Promise<SeedNotificationsResult> {
  return {
    success: false,
    savedCount: 0,
    userId: '',
    userEmail: '',
    pathsCreated: [],
    error: 'تم إيقاف إنشاء إشعارات تجريبية. الإشعارات تنشأ من عمليات الحساب الفعلية.',
  };
}
