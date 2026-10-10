import React from 'react';
import { EducationalProvider, EducationalService } from '../../../types';
import { ProviderTypeOption, ExtendedInquiry, EnrolledStudent } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { 
  Users, 
  Layers, 
  Inbox, 
  TrendingUp, 
  Star, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Clock, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Plus, 
  FileText, 
  School, 
  ExternalLink 
} from 'lucide-react';

interface OverviewTabProps {
  currentType: ProviderTypeOption;
  provider?: EducationalProvider;
  services: EducationalService[];
  inquiries: ExtendedInquiry[];
  students: EnrolledStudent[];
  onOpenAddModal: () => void;
  onNavigateTab: (tabId: string) => void;
  onRespondInquiry: (inquiry: ExtendedInquiry) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  currentType,
  provider,
  services,
  inquiries,
  students,
  onOpenAddModal,
  onNavigateTab,
  onRespondInquiry,
}) => {
  const pendingInquiries = inquiries.filter((inq) => inq.status === 'pending');
  const activeServices = services.filter((service) => service.status === 'active');
  const lowSeatServices = activeServices.filter((service) => service.seatsAvailable > 0 && service.seatsAvailable <= 5);
  const verificationStatus = provider?.accredited || provider?.verificationStatus === 'approved'
    ? 'approved'
    : provider?.verificationStatus || 'pending';
  const availableSeats = activeServices.reduce((acc, service) => acc + service.seatsAvailable, 0);

  const monthlyData = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date();
    monthDate.setDate(1);
    monthDate.setMonth(monthDate.getMonth() - (5 - index));
    const month = monthDate.toLocaleDateString('ar', { month: 'long' });
    const matchesMonth = (value: string) => {
      const date = new Date(value);
      return !Number.isNaN(date.getTime()) && date.getFullYear() === monthDate.getFullYear() && date.getMonth() === monthDate.getMonth();
    };
    return {
      month,
      enrollments: students.filter((student) => matchesMonth(student.enrollDate)).length,
      inquiries: inquiries.filter((inquiry) => matchesMonth(inquiry.date)).length,
    };
  });
  const maxActivity = Math.max(1, ...monthlyData.flatMap((data) => [data.enrollments, data.inquiries]));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Provider Custom Context Callout */}
      <div className="bg-gradient-to-l from-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white/20 text-white backdrop-blur-xs">
              {currentType.categoryTag}
            </span>
              <span className="text-xs text-indigo-200">ملخص مباشر من بيانات حسابك</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold leading-tight">
            مرحباً بك في لوحة تشغيل {currentType.institutionName}
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
            تابع البرامج والطلبات المسجلة فعلياً في حساب مؤسستك.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="accent"
            size="sm"
            onClick={onOpenAddModal}
            className="text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>نشر برنامج جديد</span>
          </Button>
          <button
            onClick={() => onNavigateTab('accreditation')}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors border border-white/20 flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>ملف الاعتماد والترخيص</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">البرامج والخدمات النشطة</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">{activeServices.length}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">برامج منشورة ومتاحة للتسجيل</p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">إجمالي الطلاب المسجلين</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">{students.length}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{students.length} في المتابعة الفورية</p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">الطلبات والاستفسارات</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">{inquiries.length}</span>
              {pendingInquiries.length > 0 && (
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                  {pendingInquiries.length} بانتظار الرد
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">الاستفسارات المحفوظة في Firestore</p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">المقاعد المتاحة في البرامج النشطة</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">{availableSeats}</span>
              <span className="text-xs font-medium text-slate-500">مقعداً بحسب بيانات البرامج</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart & Urgent Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live activity chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                تحليل حركة التسجيل واستفسارات الالتحاق الأكاديمي
              </h3>
              <p className="text-xs text-slate-500">عدد طلبات التسجيل والاستفسارات خلال الستة أشهر الأخيرة</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-indigo-900 inline-block" />
                طلبات التسجيل
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
                الاستفسارات الواردة
              </span>
            </div>
          </div>

          {/* Counts are based on records saved in Firestore. */}
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-6 pt-6 pb-2 border-b border-slate-100">
            {monthlyData.map((d, idx) => {
              const heightPercent = Math.round((d.enrollments / maxActivity) * 100);
              const inqPercent = Math.round((d.inquiries / maxActivity) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                    {/* Enrollments Bar */}
                    <div 
                      className="w-4 sm:w-7 bg-indigo-900 rounded-t-md hover:bg-indigo-800 transition-all relative cursor-pointer"
                      style={{ height: `${heightPercent}%` }}
                      title={`طلبات التسجيل في ${d.month}: ${d.enrollments}`}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 start-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded transition-opacity whitespace-nowrap z-10">
                        {d.enrollments} طلب تسجيل
                      </span>
                    </div>
                    {/* Inquiries Bar */}
                    <div 
                      className="w-3 sm:w-5 bg-amber-400 rounded-t-md hover:bg-amber-300 transition-all relative cursor-pointer"
                      style={{ height: `${inqPercent}%` }}
                      title={`الاستفسارات في ${d.month}: ${d.inquiries}`}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 start-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded transition-opacity whitespace-nowrap z-10">
                        {d.inquiries} استفسار
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-600">{d.month}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span>الأعداد المعروضة مأخوذة من الطلبات المحفوظة خلال آخر ستة أشهر.</span>
            <button 
              onClick={() => onNavigateTab('students')}
              className="text-indigo-600 hover:underline font-semibold flex items-center gap-1"
            >
              <span>عرض سجل الطلاب والملتحقين</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Actionable Alerts & Tasks (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                تنبيهات وإجراءات سريعة
              </h3>
              <Badge variant={pendingInquiries.length ? 'warning' : 'success'}>{pendingInquiries.length} بانتظار الرد</Badge>
            </div>

            <div className="space-y-3">
              {pendingInquiries[0] && <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-rose-600" />
                    استفسار عاجل بحاجة لرد
                  </span>
                  <span className="text-[10px] text-rose-600">{pendingInquiries[0].date}</span>
                </div>
                <p className="text-xs text-rose-900 leading-snug">
                  طلب من {pendingInquiries[0].studentName} بخصوص {pendingInquiries[0].serviceTitle}.
                </p>
                <button
                    onClick={() => onRespondInquiry(pendingInquiries[0])}
                    className="text-xs font-bold text-rose-700 hover:text-rose-800 underline block"
                  >
                    الرد الآن وتحديد موعد ←
                  </button>
              </div>}

              {lowSeatServices[0] && <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    المقاعد قاربت على الاكتمال
                  </span>
                  <span className="text-[10px] text-amber-600">تنبيه طاقة</span>
                </div>
                <p className="text-xs text-amber-900 leading-snug">
                  تبقى {lowSeatServices[0].seatsAvailable} مقاعد في برنامج «{lowSeatServices[0].title}».
                </p>
                <button
                  onClick={() => onNavigateTab('services')}
                  className="text-xs font-bold text-amber-800 hover:text-amber-900 underline block"
                >
                  تعديل الطاقة الاستيعابية ←
                </button>
              </div>}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className={`w-3.5 h-3.5 ${verificationStatus === 'approved' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    حالة الاعتماد
                  </span>
                  <span className="text-[10px] text-slate-500">{verificationStatus === 'approved' ? 'معتمد' : verificationStatus === 'rejected' ? 'يحتاج استكمال' : 'قيد المراجعة'}</span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">
                  {provider?.licenseNumber ? `رقم الترخيص المسجل: ${provider.licenseNumber}` : 'أضف رقم الترخيص من صفحة الاعتماد لإرساله للمراجعة.'}
                </p>
              </div>

              {!pendingInquiries.length && !lowSeatServices.length && <p className="p-3 text-center text-xs text-slate-500">لا توجد تنبيهات تشغيلية حالياً.</p>}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('inquiries')}
              className="w-full py-2 text-center text-xs font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              عرض كافة استفسارات وطلبات الطلاب ({inquiries.length})
            </button>
          </div>
        </div>
      </div>

      {/* Recent Inquiries and Programs Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Inquiries Table Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">أحدث طلبات واستفسارات الالتحاق</h3>
              <p className="text-xs text-slate-500">الطلبات المسجلة من الطلاب وأولياء الأمور عبر المنصة</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('inquiries')}
              className="text-xs"
            >
              عرض الكل
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            {inquiries.slice(0, 3).map((inq) => (
              <div key={inq.id} className="py-3 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">{inq.studentName}</span>
                    {inq.status === 'pending' && <Badge variant="warning">جديد</Badge>}
                    {inq.status === 'responded' && <Badge variant="info">تم الرد</Badge>}
                    {inq.status === 'confirmed' && <Badge variant="success">مقبول</Badge>}
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-1">{inq.serviceTitle}</div>
                  <div className="text-[11px] text-slate-400">{inq.date} • {inq.phone}</div>
                </div>

                <div className="shrink-0 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRespondInquiry(inq)}
                    className="text-xs"
                  >
                    عرض وتفاصيل
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Programs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">البرامج والخدمات المنشورة</h3>
              <p className="text-xs text-slate-500">حالة المقاعد ومعدلات الإقبال لكل برنامج</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('services')}
              className="text-xs"
            >
              إدارة البرامج
            </Button>
          </div>

          <div className="space-y-3">
            {services.map((srv) => {
              return (
                <div key={srv.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block line-clamp-1">{srv.title}</span>
                      <span className="text-[11px] text-slate-500">{srv.level} • {srv.duration}</span>
                    </div>
                    <Badge variant={srv.seatsAvailable > 5 ? 'success' : 'warning'}>
                      {srv.seatsAvailable} مقعد شاغر
                    </Badge>
                  </div>

                  <div className="text-[11px] text-slate-500">الطاقة المسجلة: {srv.totalSeats} مقعداً · القيمة المتاحة بحسب آخر تحديث للبرنامج.</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
