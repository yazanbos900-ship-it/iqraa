import React, { useState } from 'react';
import { ActiveView, ProviderVerification } from '../../types';
import { usePlatformData } from '../../firebase/PlatformDataContext';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import { 
  ShieldCheck, 
  Building, 
  Users, 
  FileCheck2, 
  Layers, 
  Check, 
  X, 
  TrendingUp, 
  AlertTriangle, 
  Database, 
  Cloud, 
  RefreshCw,
  Copy,
  ExternalLink,
  Code2,
  CheckCircle2,
  Lock,
  Activity,
  Terminal
} from 'lucide-react';
import { FIRESTORE_RULES_TEXT } from '../../firebase/dataService';
import { runBrowserFirestoreDiagnostics, DiagnosticReport } from '../../firebase/diagnostics';

interface AdminPortalProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  activeView,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<string>('verifications');
  const { providers, services, categories, updateProvider, catalogLoading, catalogError } = usePlatformData();
  const approvedCount = providers.filter((provider) => provider.accredited || provider.verificationStatus === 'approved').length;
  const verifications: ProviderVerification[] = providers
    .filter((provider) => provider.verificationStatus === 'pending')
    .map((provider) => ({
      id: provider.id,
      institutionName: provider.name,
      category: provider.category,
      licenseNumber: provider.licenseNumber || '',
      submissionDate: provider.submittedAt || provider.createdAt || '',
      status: 'pending',
      city: provider.city,
    }));
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [copiedRules, setCopiedRules] = useState(false);
  const [showRulesCode, setShowRulesCode] = useState(false);
  const [isRunningDiag, setIsRunningDiag] = useState(false);
  const [diagReport, setDiagReport] = useState<DiagnosticReport | null>(null);

  const sidebarItems = [
    {
      id: 'verifications',
      label: 'طلبات الاعتماد والتحقق',
      icon: <FileCheck2 className="w-4 h-4" />,
    },
    {
      id: 'categories',
      label: 'إدارة القطاعات التعليمية',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'database',
      label: 'قاعدة بيانات Firestore',
      icon: <Database className="w-4 h-4" />,
    },
    {
      id: 'compliance',
      label: 'حوكمة الجودة والأمان',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  const handleCopyRules = async () => {
    try {
      await navigator.clipboard.writeText(FIRESTORE_RULES_TEXT);
      setCopiedRules(true);
      setTimeout(() => setCopiedRules(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleRunDiagnostics = async () => {
    setIsRunningDiag(true);
    try {
      const report = await runBrowserFirestoreDiagnostics();
      setDiagReport(report);
      setActionNotice('تم فحص اتصال Firestore بنجاح وطباعة التقرير في Console.');
    } catch {
      // Fallback
    } finally {
      setIsRunningDiag(false);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: 'approved' | 'rejected') => {
    const item = verifications.find((v) => v.id === id);
    void updateProvider(id, { verificationStatus: newStatus, accredited: newStatus === 'approved' })
      .then(() => {
        setActionNotice(newStatus === 'approved'
          ? `تم اعتماد «${item?.institutionName}» وتفعيل ظهورها في الدليل.`
          : `تم رفض طلب «${item?.institutionName}».`);
        setTimeout(() => setActionNotice(null), 5000);
      })
      .catch((error) => setActionNotice(error instanceof Error ? error.message : 'تعذر تحديث طلب الاعتماد.'));
  };

  const pendingCount = verifications.filter((v) => v.status === 'pending').length;

  return (
    <PortalLayout
      roleTitle="بوابة الإدارة والحوكمة"
      roleSubtitle="الإشراف العام وتدقيق تراخيص مزودي الخدمة"
      roleBadge="المشرف العام"
      activeView={activeView}
      onNavigate={onNavigate}
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
    >
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>لوحة الإدارة</span>
              <span aria-hidden="true">/</span>
              <span className="text-slate-800 font-medium">حوكمة المنظومة</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              مركز التدقيق وحوكمة منصة أعالي
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">حالة النظام:</span>
            <span className={`font-semibold ${catalogError ? 'text-rose-700' : catalogLoading ? 'text-amber-700' : 'text-emerald-700'}`}>
              {catalogError ? 'تعذّر تحميل البيانات' : catalogLoading ? 'جارٍ الاتصال بـ Firebase' : 'تم تحميل بيانات Firebase'}
            </span>
          </div>
        </div>

        {actionNotice && (
          <Alert type="info" onClose={() => setActionNotice(null)}>
            {actionNotice}
          </Alert>
        )}

        {/* Global Statistics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs font-medium text-slate-500 mb-1">طلبات الاعتماد المعلقة</div>
            <div className="text-2xl font-bold text-amber-600 tabular-nums">{pendingCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">بحاجة لتدقيق الوثائق</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs font-medium text-slate-500 mb-1">المؤسسات المعتمدة</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{approvedCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">من سجلات مزودي الخدمة</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs font-medium text-slate-500 mb-1">الخدمات المفهرسة</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{services.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">البرامج والخدمات في Firestore</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs font-medium text-slate-500 mb-1">التصنيفات التعليمية</div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">{categories.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">التصنيفات المحفوظة في Firestore</div>
          </div>
        </div>

        {/* Tab 1: Verifications Queue */}
        {activeTab === 'verifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">قائمة تدقيق تراخيص مزودي الخدمات الجدد</h2>
                <p className="text-xs text-slate-500">التأكد من التراخيص الرسمية قبل منح شارة الاعتماد للمؤسسة</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>اسم المؤسسة / المركز</TableHeaderCell>
                    <TableHeaderCell>التصنيف</TableHeaderCell>
                    <TableHeaderCell>رقم الترخيص</TableHeaderCell>
                    <TableHeaderCell>المدينة</TableHeaderCell>
                    <TableHeaderCell>تاريخ التقديم</TableHeaderCell>
                    <TableHeaderCell>الحالة</TableHeaderCell>
                    <TableHeaderCell>إجراء المشرف</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {verifications.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-semibold text-slate-900">
                        {v.institutionName}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {categories.find((c) => c.id === v.category)?.nameAr}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {v.licenseNumber}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{v.city}</TableCell>
                      <TableCell className="text-xs text-slate-500">{v.submissionDate}</TableCell>
                      <TableCell>
                        {v.status === 'pending' && <Badge variant="warning">قيد التدقيق</Badge>}
                        {v.status === 'approved' && <Badge variant="success">معتمد</Badge>}
                        {v.status === 'rejected' && <Badge variant="danger">مرفوض</Badge>}
                      </TableCell>
                      <TableCell>
                        {v.status === 'pending' ? (
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="primary"
                              size="sm"
                              className="text-xs py-1 px-2.5 bg-emerald-700 hover:bg-emerald-800"
                              onClick={() => handleUpdateStatus(v.id, 'approved')}
                              leftIcon={<Check className="w-3 h-3" />}
                            >
                              اعتماد
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              className="text-xs py-1 px-2.5"
                              onClick={() => handleUpdateStatus(v.id, 'rejected')}
                              leftIcon={<X className="w-3 h-3" />}
                            >
                              رفض
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">تم البت</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Tab 2: Categories Management */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 mb-2">القطاعات والتصنيفات المفعلة بالمنصة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{cat.nameAr}</h3>
                    <p className="text-xs text-slate-500 font-mono">{cat.nameEn}</p>
                    <p className="text-xs text-slate-600 mt-1">{cat.descriptionAr}</p>
                  </div>
                  <Badge variant="success">مفعل</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Compliance */}
        {activeTab === 'compliance' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 text-xs text-slate-600">
            <h2 className="text-base font-semibold text-slate-900 mb-1">سياسات الامتثال والجودة الأكاديمية</h2>
            <p>
              توفر منصة أعالي آليات لحماية الطلاب والمؤسسات من خلال:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>التحقق من صحة التراخيص الصادرة عن وزارات التربية والتعليم والتعليم العالي.</li>
              <li>منع نشر أي إعلانات مضللة أو شهادات غير معترف بها.</li>
              <li>ضمان خصوصية بيانات الطلاب وأولياء الأمور وعدم مشاركتها مع أطراف ثالثة دون إذن.</li>
            </ul>
          </div>
        )}

        {/* Tab 4: Firestore Database Management */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">إدارة قاعدة بيانات Cloud Firestore</h2>
                    <p className="text-xs text-slate-500">مشروع Firebase المتصل: <span className="font-mono text-indigo-700 font-semibold">iqradatabase-f8767</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    قاعدة البيانات: (default)
                  </span>

                  <button
                    type="button"
                    onClick={handleRunDiagnostics}
                    disabled={isRunningDiag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isRunningDiag ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        <span>جارٍ الفحص...</span>
                      </>
                    ) : (
                      <>
                        <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                        <span>فحص الاتصال في Console</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {diagReport && (
                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-600 shrink-0" />
                      <strong className="text-indigo-950">نتيجة فحص الاتصال والتشخيص المباشر:</strong>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {diagReport.connected ? 'الخادم السحابي متصل بنجاح' : 'غير متصل'}
                      </span>
                    </div>
                    <span className="text-[11px] text-indigo-700 font-mono">
                      زمن الاستجابة: {diagReport.latencyMs}ms | المستندات: {diagReport.totalDocuments}
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed">
                    {diagReport.recommendation}
                  </p>

                  <div className="bg-white p-3 rounded-lg border border-indigo-100 overflow-x-auto">
                    <table className="w-full text-right text-[11px]">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-100">
                          <th className="pb-1 font-semibold">المجموعة (Collection)</th>
                          <th className="pb-1 font-semibold">الوصف</th>
                          <th className="pb-1 font-semibold">عدد المستندات</th>
                          <th className="pb-1 font-semibold">حالة القراءة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {diagReport.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-1.5 font-mono font-bold text-indigo-900">{item.collection}</td>
                            <td className="py-1.5 text-slate-600">{item.label}</td>
                            <td className="py-1.5 font-mono">{item.count}</td>
                            <td className="py-1.5 text-slate-500">{item.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="text-[11px] text-indigo-800 bg-white/70 p-2 rounded-lg border border-indigo-100 flex items-center justify-between">
                    <span>💡 تمت طباعة الجدول والتقرير كاملاً في Console المتصفح (اضغط F12 ➔ Console).</span>
                    <span className="font-mono text-[10px] text-slate-400">window.checkFirestoreConnection()</span>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-xs text-slate-700 space-y-2">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-indigo-600" />
                  اتصال المنصة بقاعدة بيانات Firebase
                </div>
                <p className="text-slate-600 leading-relaxed">
                  البرامج والمؤسسات والقطاعات تُقرأ من Firestore مباشرة. طلبات الالتحاق والاستفسارات والمفضلة تُحفظ تحت حساب المستخدم. لا تُستبدل البيانات الموجودة ببيانات تجريبية.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="text-xs text-slate-500">مجموعة الخدمات والبرامج</div>
                  <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">services</div>
                  <div className="text-[11px] text-slate-400 mt-1">الدورات والمناهج التعليمية</div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="text-xs text-slate-500">مجموعة مزودي الخدمة</div>
                  <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">providers</div>
                  <div className="text-[11px] text-slate-400 mt-1">المدارس، الجامعات، والمعاهد</div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="text-xs text-slate-500">مجموعة الحسابات والمستخدمين</div>
                  <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">users</div>
                  <div className="text-[11px] text-slate-400 mt-1">تُنشأ عند تسجيل الدخول</div>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="text-xs text-slate-500">صندوق إشعارات المستخدم</div>
                  <div className="text-sm font-bold text-indigo-700 font-mono mt-0.5">users/{'{uid}'}/notifications</div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1">خاص بالحساب ومزامن لحظياً</div>
                </div>
              </div>
            </div>

            {/* Notifications Cloud Management Card */}
            <div className="bg-white rounded-xl border border-indigo-200 p-6 space-y-4 shadow-soft-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">الإشعارات الخاصة بالحسابات</h3>
                    <p className="text-xs text-slate-500">كل مستخدم يقرأ ويحدّث صندوقه الخاص فقط</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://console.firebase.google.com/project/iqradatabase-f8767/firestore/databases/-default-/data"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                  >
                    <span>فتح بيانات Firestore</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-700 space-y-2">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span>📌 مسار الإشعارات الخاص بكل مستخدم:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-emerald-700 font-bold block mb-0.5">صندوق المستخدم:</span>
                    <span className="text-slate-600">users/{`{userId}`}/notifications/{`{id}`}</span>
                    <p className="text-[10px] text-slate-400 mt-1 font-sans">صندوق معزول ومستقل تماماً لكل حساب على حدة لضمان الخصوصية التامة.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Firestore Security Rules Guidance Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">قواعد أمان وحماية Cloud Firestore (Security Rules)</h3>
                    <p className="text-xs text-slate-500">مطلوبة لتفعيل صلاحيات المشرفين والمؤسسات وحماية بيانات المستخدمين</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyRules}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedRules ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-200" />
                        <span>تم نسخ القواعد بنجاح!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ القواعد البرمجية</span>
                      </>
                    )}
                  </button>

                  <a
                    href="https://console.firebase.google.com/project/iqradatabase-f8767/firestore/rules"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
                  >
                    <span>فتح صفحة Rules في Firebase</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>خطوات النشر السريعة:</span>
                  <button
                    type="button"
                    onClick={() => setShowRulesCode(!showRulesCode)}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{showRulesCode ? 'إخفاء كود القواعد' : 'معاينة كود القواعد'}</span>
                  </button>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 leading-normal">
                  <li>انقر على زر <strong>نسخ القواعد البرمجية</strong> أعلاه.</li>
                  <li>انقر على <strong>فتح صفحة Rules في Firebase</strong> (أو ادخل إلى Firebase Console ➔ Firestore ➔ Rules).</li>
                  <li>استبدل محتوى المحرر بالقواعد المنسوخة ثم اضغط <strong>Publish (نشر)</strong>.</li>
                  <li>راجع القواعد قبل نشرها؛ نشر القواعد يغيّر صلاحيات مشروع Firebase مباشرة.</li>
                </ol>
              </div>

              {showRulesCode && (
                <div className="relative mt-2">
                  <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 border border-slate-800 leading-relaxed dir-ltr text-left">
                    {FIRESTORE_RULES_TEXT}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
