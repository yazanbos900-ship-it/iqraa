import React, { useState } from 'react';
import { Activity, Check, Cloud, Code2, Copy, Database, ExternalLink, Lock, RefreshCw, Terminal } from 'lucide-react';
import { usePlatformData } from '../../../firebase/PlatformDataContext';
import { FIRESTORE_RULES_TEXT } from '../../../firebase/dataService';
import { DiagnosticReport, runBrowserFirestoreDiagnostics } from '../../../firebase/diagnostics';
import { Alert } from '../../../components/ui/Alert';
import { Card } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../components/ui/Table';

export const DatabaseTab: React.FC = () => {
  const { catalogLoading, catalogError } = usePlatformData();
  const [copiedRules, setCopiedRules] = useState(false);
  const [showRulesCode, setShowRulesCode] = useState(false);
  const [isRunningDiag, setIsRunningDiag] = useState(false);
  const [diagReport, setDiagReport] = useState<DiagnosticReport | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleCopyRules = async () => {
    try {
      await navigator.clipboard.writeText(FIRESTORE_RULES_TEXT);
      setCopiedRules(true);
      setTimeout(() => setCopiedRules(false), 2500);
    } catch {
      setCopiedRules(false);
    }
  };

  const handleRunDiagnostics = async () => {
    setIsRunningDiag(true);
    try {
      setDiagReport(await runBrowserFirestoreDiagnostics());
      setActionNotice('تم فحص اتصال Firestore بنجاح وطباعة التقرير في Console.');
    } catch {
      // Keep the existing console-only diagnostic failure behavior.
    } finally {
      setIsRunningDiag(false);
    }
  };

  return (
    <div className="space-y-6">
      {catalogError && <Alert type="error">تعذر تحميل بيانات المنصة: {catalogError}</Alert>}
      {actionNotice && <Alert type="success" onClose={() => setActionNotice(null)}>{actionNotice}</Alert>}
      {catalogLoading && <LoadingSpinner label="جارٍ الاتصال ببيانات Firestore" />}

      <Card className="!rounded-xl !shadow-none space-y-5 p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">إدارة قاعدة بيانات Cloud Firestore</h2>
              <p className="text-xs text-slate-500">مشروع Firebase المتصل: <span className="font-mono font-semibold text-indigo-700">iqradatabase-f8767</span></p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              قاعدة البيانات: (default)
            </span>
            <button
              type="button"
              onClick={() => void handleRunDiagnostics()}
              disabled={isRunningDiag}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
            >
              {isRunningDiag ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" /> : <Terminal className="h-3.5 w-3.5 text-indigo-600" />}
              {isRunningDiag ? 'جارٍ الفحص...' : 'فحص الاتصال في Console'}
            </button>
          </div>
        </div>

        {diagReport && (
          <div className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 text-xs">
            <div className="flex flex-col justify-between gap-2 border-b border-indigo-100 pb-2.5 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <Activity className="h-4 w-4 shrink-0 text-indigo-600" />
                <strong className="text-indigo-950">نتيجة فحص الاتصال والتشخيص المباشر:</strong>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${diagReport.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {diagReport.connected ? 'الخادم السحابي متصل بنجاح' : 'غير متصل'}
                </span>
              </div>
              <span className="font-mono text-[11px] text-indigo-700">زمن الاستجابة: {diagReport.latencyMs}ms | المستندات: {diagReport.totalDocuments}</span>
            </div>
            <p className="leading-relaxed text-slate-700">{diagReport.recommendation}</p>
            <Table className="text-xs">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>المجموعة (Collection)</TableHeaderCell>
                  <TableHeaderCell>الوصف</TableHeaderCell>
                  <TableHeaderCell>عدد المستندات</TableHeaderCell>
                  <TableHeaderCell>حالة القراءة</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {diagReport.items.map((item) => (
                  <TableRow key={item.collection}>
                    <TableCell className="font-mono font-bold text-indigo-900">{item.collection}</TableCell>
                    <TableCell>{item.label}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-indigo-100 bg-white/70 p-2 text-[11px] text-indigo-800">
              <span>تمت طباعة التقرير كاملاً في Console المتصفح (اضغط F12 ثم Console).</span>
              <span className="font-mono text-[10px] text-slate-500">window.checkFirestoreConnection()</span>
            </div>
          </div>
        )}

        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900"><Cloud className="h-4 w-4 text-indigo-600" />اتصال المنصة بقاعدة بيانات Firebase</div>
          <p className="leading-relaxed text-slate-600">البرامج والمؤسسات والقطاعات تُقرأ من Firestore مباشرة. طلبات الالتحاق والاستفسارات والمفضلة تُحفظ تحت حساب المستخدم. لا تُستبدل البيانات الموجودة ببيانات تجريبية.</p>
        </div>

        <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['مجموعة الخدمات والبرامج', 'services', 'الدورات والمناهج التعليمية'],
            ['مجموعة مزودي الخدمة', 'providers', 'المدارس، الجامعات، والمعاهد'],
            ['مجموعة الحسابات والمستخدمين', 'users', 'تُنشأ عند تسجيل الدخول'],
            ['صندوق إشعارات المستخدم', 'users/{uid}/notifications', 'خاص بالحساب ومزامن لحظياً'],
          ].map(([label, collection, description]) => (
            <div key={collection} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="mt-0.5 font-mono text-sm font-bold text-slate-800">{collection}</div>
              <div className="mt-1 text-[11px] text-slate-500">{description}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="!rounded-xl !shadow-none space-y-4 border-indigo-200 p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-indigo-100 pb-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700"><Activity className="h-4 w-4" /></div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">الإشعارات الخاصة بالحسابات</h3>
              <p className="text-xs text-slate-500">كل مستخدم يقرأ ويحدّث صندوقه الخاص فقط</p>
            </div>
          </div>
          <a href="https://console.firebase.google.com/project/iqradatabase-f8767/firestore/databases/-default-/data" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 text-xs font-semibold text-slate-800 hover:bg-slate-200">
            فتح بيانات Firestore <ExternalLink className="h-3 w-3 text-slate-500" />
          </a>
        </div>
        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900"><Activity className="h-4 w-4 text-indigo-600" />مسار الإشعارات الخاص بكل مستخدم:</div>
          <div className="rounded-lg border border-slate-200 bg-white p-2.5 font-mono text-[11px]">
            <span className="mb-0.5 block font-bold text-emerald-700">صندوق المستخدم:</span>
            <span className="text-slate-600">users/{'{userId}'}/notifications/{'{id}'}</span>
            <p className="mt-1 font-sans text-[10px] text-slate-500">صندوق معزول ومستقل لكل حساب لضمان الخصوصية.</p>
          </div>
        </div>
      </Card>

      <Card className="!rounded-xl !shadow-none space-y-4 p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700"><Lock className="h-4 w-4" /></div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">قواعد أمان وحماية Cloud Firestore (Security Rules)</h3>
              <p className="text-xs text-slate-500">مطلوبة لتفعيل صلاحيات المشرفين والمؤسسات وحماية بيانات المستخدمين</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => void handleCopyRules()} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700">
              {copiedRules ? <><Check className="h-3.5 w-3.5 text-emerald-200" />تم نسخ القواعد بنجاح!</> : <><Copy className="h-3.5 w-3.5" />نسخ القواعد البرمجية</>}
            </button>
            <a href="https://console.firebase.google.com/project/iqradatabase-f8767/firestore/rules" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 text-xs font-semibold text-slate-800 hover:bg-slate-200">
              فتح صفحة Rules في Firebase <ExternalLink className="h-3 w-3 text-slate-500" />
            </a>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-200/70 bg-slate-50 p-4 text-xs text-slate-600">
          <div className="flex items-center justify-between gap-2 font-bold text-slate-800">
            <span>خطوات النشر السريعة:</span>
            <button type="button" onClick={() => setShowRulesCode((visible) => !visible)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">
              <Code2 className="h-3.5 w-3.5" />{showRulesCode ? 'إخفاء كود القواعد' : 'معاينة كود القواعد'}
            </button>
          </div>
          <ol className="list-inside list-decimal space-y-1 leading-normal text-slate-700">
            <li>انقر على زر <strong>نسخ القواعد البرمجية</strong> أعلاه.</li>
            <li>افتح صفحة Rules في Firebase Console.</li>
            <li>استبدل محتوى المحرر بالقواعد المنسوخة ثم اضغط <strong>Publish (نشر)</strong>.</li>
            <li>راجع القواعد قبل نشرها؛ نشر القواعد يغيّر صلاحيات مشروع Firebase مباشرة.</li>
          </ol>
        </div>
        {showRulesCode && <pre className="max-h-72 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 p-4 text-left font-mono text-[11px] leading-relaxed text-slate-100 dir-ltr">{FIRESTORE_RULES_TEXT}</pre>}
      </Card>
    </div>
  );
};