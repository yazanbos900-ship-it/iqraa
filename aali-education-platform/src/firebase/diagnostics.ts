/** Browser-side, read-only checks for Firestore collections the app may read. */

import { collection, getDocs, doc, getDocFromServer, limit, query } from 'firebase/firestore';
import { auth, db } from './config';
import firebaseConfig from '../../firebase-applet-config.json';

export interface DiagnosticItem {
  collection: string;
  label: string;
  count: number;
  status: string;
}

export interface DiagnosticReport {
  connected: boolean;
  projectId: string;
  databaseId: string;
  latencyMs: number;
  items: DiagnosticItem[];
  totalDocuments: number;
  recommendation: string;
}

export async function runBrowserFirestoreDiagnostics(): Promise<DiagnosticReport> {
  const startTime = Date.now();
  console.group('%c🔍 فحص اتصال Cloud Firestore', 'background: #4f46e5; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
  console.log(`📌 معرّف المشروع: %c${firebaseConfig.projectId}`, 'font-weight: bold; color: #4338ca;');
  console.log(`🗄️ قاعدة البيانات: %c${firebaseConfig.firestoreDatabaseId || '(default)'}`, 'font-weight: bold; color: #059669;');

  let connected = false;
  try {
    // A missing ping document still proves the server responded; the catch below distinguishes rules failures.
    await getDocFromServer(doc(db, 'system_health', 'ping'));
    connected = true;
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? String((error as { code: unknown }).code) : '';
    const message = error instanceof Error ? error.message : String(error);
    connected = code === 'permission-denied' || message.toLowerCase().includes('permission');
    if (!connected) console.warn('تعذر تأكيد الاتصال بالخادم:', message);
  }
  const latencyMs = Date.now() - startTime;

  // Root users/admins/notifications are private or deliberately denied by the app's rules.
  // Probe only public collections and the signed-in user's private subcollections.
  const collectionsToCheck = [
    { name: 'services', label: 'البرامج والخدمات' },
    { name: 'providers', label: 'مزودو الخدمة' },
    { name: 'categories', label: 'التصنيفات' },
    { name: 'reviews', label: 'التقييمات' },
    ...(auth.currentUser ? [
      { name: `users/${auth.currentUser.uid}/notifications`, label: 'إشعارات الحساب الحالي' },
      { name: `users/${auth.currentUser.uid}/savedServices`, label: 'المفضلة للحساب الحالي' },
      { name: `users/${auth.currentUser.uid}/teamMembers`, label: 'جهات اتصال الحساب الحالي' },
    ] : []),
  ];

  const items: DiagnosticItem[] = [];
  for (const item of collectionsToCheck) {
    try {
      const snapshot = await getDocs(query(collection(db, item.name), limit(10)));
      items.push({ collection: item.name, label: item.label, count: snapshot.size, status: 'استجابة ناجحة (حتى 10 مستندات)' });
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? String((error as { code: unknown }).code) : 'unknown';
      items.push({ collection: item.name, label: item.label, count: 0, status: `تعذرت القراءة (${code})` });
    }
  }

  console.table(items);
  const totalDocuments = items.reduce((sum, item) => sum + item.count, 0);
  const recommendation = connected
    ? 'وصل التطبيق إلى Firestore. الأعداد عينة حتى 10 مستندات لكل مجموعة، والبيانات الخاصة تُفحص للحساب المسجل فقط.'
    : 'لم يكتمل الاتصال بالخادم. تحقق من إعداد Firebase والاتصال بالإنترنت ثم أعد الفحص.';
  console.log(connected ? `✅ استجاب Firestore خلال ${latencyMs}ms.` : '⚠️ لم يتم تأكيد اتصال Firestore.');
  console.groupEnd();

  return {
    connected,
    projectId: firebaseConfig.projectId,
    databaseId: firebaseConfig.firestoreDatabaseId || '(default)',
    latencyMs,
    items,
    totalDocuments,
    recommendation,
  };
}

if (typeof window !== 'undefined') {
  (window as unknown as { checkFirestoreConnection?: () => Promise<DiagnosticReport> }).checkFirestoreConnection = runBrowserFirestoreDiagnostics;
}
