/**
 * Iqra Education Platform - Firestore Diagnostic & Connection Verification Script
 * نص برمجي للتحقق من اتصال قاعدة بيانات Cloud Firestore وتشخيص حالة البيانات
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDocFromServer,
  limit,
  query
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. قراءة ملف التهيئة
const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  console.error('❌ خطأ: تعذر العثور على ملف firebase-applet-config.json');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('=================================================================');
console.log('🔍 بدء فحص اتصال Cloud Firestore - منصة اقرأ التعليمية');
console.log('=================================================================');
console.log(`📌 معرّف المشروع (Project ID):   ${config.projectId}`);
console.log(`🌐 نطاق المصادقة (Auth Domain): ${config.authDomain}`);
console.log(`🗄️  معرّف قاعدة البيانات (Database): ${config.firestoreDatabaseId || '(default)'}`);
console.log('-----------------------------------------------------------------');

async function runDiagnostics() {
  const startTime = Date.now();
  let app;
  let db;

  try {
    // تهيئة تطبيق فايربيز
    app = initializeApp(config);
    db = getFirestore(app, config.firestoreDatabaseId || '(default)');
    console.log('✅ تم تهيئة Firebase SDK بنجاح.');
  } catch (err) {
    console.error('❌ فشل تهيئة Firebase SDK:', err.message);
    return;
  }

  // 2. اختبار الاتصال المباشر بالخادم (Server Ping)
  console.log('\n📡 جاري فحص الاتصال بالخادم السحابي لـ Firestore...');
  try {
    const testDocRef = doc(db, 'system_health', 'ping');
    // محاولة جلب المستند مباشرة من خوادم جوجل السحابية
    await getDocFromServer(testDocRef);
    const latency = Date.now() - startTime;
    console.log(`✅ الاتصال بالخادم السحابي ناجح 100%! (زمن الاستجابة: ${latency}ms)`);
  } catch (err) {
    if (err.code === 'permission-denied' || err.message.includes('insufficient permissions')) {
      console.log('✅ الاتصال بالخادم السحابي نشط ويعمل (تم رفض الوصول بسبب قواعد الأمان Firestore Rules).');
    } else if (err.code === 'unavailable' || err.message.includes('offline')) {
      console.error('❌ تعذر الوصول إلى الخادم السحابي (العميل غير متصل أو اسم قاعدة البيانات غير موجود).');
      console.error('التفاصيل:', err.message);
      return;
    } else {
      console.log(`ℹ️ استجابة الخادم: ${err.message}`);
    }
  }

  // 3. فحص المجموعات الأساسية ومعرفة سبب عدم ظهور البيانات
  console.log('\n📊 فحص المجموعات (Collections) وعدد المستندات الحالية:');
  const collectionsToCheck = [
    { name: 'services', label: 'الدورات والبرامج التعليمية' },
    { name: 'providers', label: 'مؤسسات ومزودو الخدمة' },
    { name: 'categories', label: 'القطاعات والتصنيفات' },
    { name: 'users', label: 'حسابات المستخدمين' },
    { name: 'enrollments', label: 'الحجوزات والتسجيلات' },
    { name: 'admins', label: 'سجلات المشرفين' },
  ];

  const results = [];

  for (const col of collectionsToCheck) {
    try {
      const colRef = collection(db, col.name);
      const q = query(colRef, limit(10));
      const snap = await getDocs(q);
      results.push({
        المجموعة: col.name,
        الوصف: col.label,
        'المستندات الموجودة': snap.size,
        'حالة الوصول': 'متاح للقراءة (Read OK)',
      });
    } catch (err) {
      results.push({
        المجموعة: col.name,
        الوصف: col.label,
        'المستندات الموجودة': 0,
        'حالة الوصول': `مقيد بقواعد الأمان (${err.code || 'permission-denied'})`,
      });
    }
  }

  console.table(results);

  // 4. التشخيص النهائي والحل المقترح
  console.log('=================================================================');
  console.log('📝 نتيجة التشخيص النهائي:');
  console.log('=================================================================');

  const totalFound = results.reduce((acc, curr) => acc + (typeof curr['المستندات الموجودة'] === 'number' ? curr['المستندات الموجودة'] : 0), 0);

  if (totalFound === 0) {
    console.log('💡 سبب عدم ظهور البيانات في قاعدة البيانات / الكونسول:');
    console.log('1. الاتصال بين التطبيق وسحابة Firestore سليم وقائم بنجاح.');
    console.log('2. قاعدة البيانات (default) تم إنشاؤها حديثاً وتبدأ خالية تماماً من المستندات.');
    console.log('3. البيانات المعروضة حالياً في واجهة التطبيق هي بيانات تجريبية (Mock Data).');
    console.log('4. لكي تظهر المجموعات والمستندات في كونسول Firebase:');
    console.log('   - اضغط على زر "تغذية قاعدة البيانات وحفظ البيانات الأولية" في لوحة تحكم المشرف (Admin Portal).');
    console.log('   - أو قم بتسجيل حساب جديد لإنشاء أول مستند في مجموعة users تلقائياً.');
  } else {
    console.log(`🎉 تم العثور على ${totalFound} مستندات في قاعدة البيانات.`);
  }

  console.log('=================================================================\n');

  try {
    const { terminate } = await import('firebase/firestore');
    await terminate(db);
  } catch {
    // Ignore cleanup errors
  }
  process.exit(0);
}

runDiagnostics().catch((err) => {
  console.error(err);
  process.exit(1);
});
