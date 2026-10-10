import React, { useState } from 'react';
import { 
  ActiveView, 
  CourseBooking
} from '../../types';
import { useNotifications } from '../../firebase/NotificationContext';
import { usePlatformData } from '../../firebase/PlatformDataContext';
import { useAuth } from '../../firebase/AuthContext';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import { 
  LayoutDashboard, 
  BookOpen, 
  Heart, 
  Bell, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  FileText,
  Trash2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Printer,
  Download,
  Award,
  Radio,
  RefreshCw,
  CheckCheck,
  AlertTriangle,
} from 'lucide-react';

interface StudentPortalProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView, extraId?: string) => void;
  onSelectCourse: (courseId: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  activeView,
  onNavigate,
  onSelectCourse,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const { userProfile } = useAuth();
  const { services, inquiries, enrollments, savedServiceIds, toggleSavedService, dataError } = usePlatformData();
  const bookings = enrollments;
  const confirmedBooking = bookings.find((booking) => booking.status === 'confirmed' || booking.status === 'in-progress');
  const confirmedService = confirmedBooking ? services.find((service) => service.id === confirmedBooking.courseId) : undefined;
  const {
    notifications,
    unreadCount,
    syncStatus,
    lastSyncedAt,
    isSyncing,
    syncErrorMessage,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshSync,
  } = useNotifications();
  const savedCourses = services.filter((service) => savedServiceIds.includes(service.id));
  const [selectedReceipt, setSelectedReceipt] = useState<CourseBooking | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notifFilter, setNotifFilter] = useState<'all' | 'booking' | 'system' | 'offer'>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const sidebarItems = [
    {
      id: 'overview',
      label: 'لوحة المتابعة العامة',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'bookings',
      label: 'دوراتي وحجوزاتي',
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      id: 'saved',
      label: 'المحفوظات والمفضلة',
      icon: <Heart className="w-4 h-4" />,
    },
    {
      id: 'inquiries',
      label: 'الاستفسارات والرسائل',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: 'notifications',
      label: unreadCount > 0 ? `الإشعارات والتنبيهات (${unreadCount})` : 'الإشعارات والتنبيهات',
      icon: <Bell className="w-4 h-4" />,
    },
  ];

  const handleMarkAllNotificationsRead = async () => {
    await markAllAsRead();
    showToast('تم تعيين جميع الإشعارات كمقروءة');
  };

  const handleRemoveSaved = async (courseId: string, title: string) => {
    try {
      await toggleSavedService(courseId);
      showToast(`تم حذف «${title}» من المحفوظات`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'تعذر حذف البرنامج من المحفوظات.');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === 'all') return true;
    return n.type === notifFilter;
  });

  return (
    <PortalLayout
      roleTitle="بوابة الطالب وولي الأمر"
      roleSubtitle="الوصول إلى الخدمات التعليمية ومتابعة الحجوزات"
      roleBadge="حساب الطالب"
      activeView={activeView}
      onNavigate={onNavigate}
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
    >
      <div className="space-y-6">
        {/* Toast Feedback */}
        {toastMessage && (
          <div 
            role="status" 
            aria-live="polite"
            className="fixed bottom-6 start-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>بوابة الطالب</span>
              <span aria-hidden="true">/</span>
              <span className="text-slate-800 font-medium">
                {activeTab === 'overview' && 'لوحة المتابعة العامة'}
                {activeTab === 'bookings' && 'دوراتي وحجوزاتي الأكاديمية'}
                {activeTab === 'saved' && 'المحفوظات والمفضلة'}
                {activeTab === 'inquiries' && 'الاستفسارات والتواصل'}
                {activeTab === 'notifications' && 'مركز الإشعارات'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              أهلاً بك، {userProfile?.displayName || 'طالب أعالي'} 👋
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('discovery')}
              leftIcon={<BookOpen className="w-3.5 h-3.5" />}
            >
              استكشاف برامج جديدة
            </Button>
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card">
                <div className="text-xs font-semibold text-slate-500 mb-1">الدورات المسجلة</div>
                <div className="text-2xl font-extrabold text-indigo-700 tabular-nums">{bookings.length}</div>
                <div className="text-[11px] text-slate-400 mt-1">حجوزات نشطة ومؤكدة</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card">
                <div className="text-xs font-semibold text-slate-500 mb-1">الاستفسارات المرسلة</div>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{inquiries.length}</div>
                <div className="text-[11px] text-slate-400 mt-1">محادثات مع المؤسسات</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card">
                <div className="text-xs font-semibold text-slate-500 mb-1">البرامج المحفوظة</div>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{savedCourses.length}</div>
                <div className="text-[11px] text-slate-400 mt-1">قائمة المتابعة السريعة</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-soft-card">
                <div className="text-xs font-semibold text-slate-500 mb-1">الإشعارات الجديدة</div>
              <div className="text-2xl font-extrabold text-indigo-700 tabular-nums">{unreadCount}</div>
                <div className="text-[11px] text-slate-400 mt-1">تنبيهات ومواعيد الحصص</div>
              </div>
            </div>

            {/* Confirmed registration summary */}
            {confirmedBooking ? (
              <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-soft-card space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold">طلب تسجيل مؤكد</span>
                  <span className="text-xs text-indigo-200">موعد البدء: {confirmedBooking.startDate || 'لم يحدد بعد'}</span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold">{confirmedBooking.courseTitle}</h3>
                  <p className="text-xs text-indigo-200 mt-1">المؤسسة: {confirmedBooking.providerName}</p>
                  {confirmedService?.schedule && <p className="text-xs text-indigo-200 mt-1">الجدول: {confirmedService.schedule}</p>}
                </div>
                <Button variant="outline" size="sm" className="text-white border-white/40 hover:bg-white/10" onClick={() => setActiveTab('bookings')}>
                  عرض تفاصيل الطلب
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 text-sm text-slate-600">
                لا يوجد طلب تسجيل مؤكد بعد. ستظهر هنا بيانات المؤسسة والبرنامج بعد تأكيد الطلب.
              </div>
            )}

            {/* Active Bookings Summary */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft-card">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">أحدث الحجوزات والدورات</h3>
                  <p className="text-xs text-slate-500 mt-0.5">طلبات التسجيل وحالتها والمبالغ المسجلة</p>
                </div>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  عرض الكل ({bookings.length}) ←
                </button>
              </div>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>اسم البرنامج</TableHeaderCell>
                    <TableHeaderCell>المؤسسة التعليمية</TableHeaderCell>
                    <TableHeaderCell>تاريخ البدء</TableHeaderCell>
                    <TableHeaderCell>الرسوم</TableHeaderCell>
                    <TableHeaderCell>الحالة</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.slice(0, 3).map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-bold text-slate-900">{b.courseTitle}</TableCell>
                      <TableCell>{b.providerName}</TableCell>
                      <TableCell className="text-xs text-slate-500">{b.startDate}</TableCell>
                      <TableCell className="font-bold text-slate-800 tabular-nums">
                        {b.amount.toLocaleString()} {b.currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant={b.status === 'confirmed' || b.status === 'completed' ? 'success' : b.status === 'in-progress' ? 'info' : b.status === 'rejected' || b.status === 'cancelled' ? 'danger' : 'warning'}>
                          {b.status === 'confirmed' ? 'مؤكد' : b.status === 'in-progress' ? 'قيد الدراسة' : b.status === 'completed' ? 'مكتمل' : b.status === 'rejected' ? 'مرفوض' : b.status === 'cancelled' ? 'ملغي' : 'بانتظار تأكيد المؤسسة'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Tab 2: Bookings (Full List) */}
        {activeTab === 'bookings' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">طلبات التسجيل</h2>
                <p className="text-xs text-slate-500">تابع حالة الطلب والمبلغ المطلوب للمؤسسة. الدفع الإلكتروني غير مفعّل.</p>
              </div>
              <span className="text-xs text-slate-500">{bookings.length} حجوزات مسجلة</span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft-card">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>رقم الطلب</TableHeaderCell>
                    <TableHeaderCell>البرنامج التعليمي</TableHeaderCell>
                    <TableHeaderCell>المؤسسة</TableHeaderCell>
                    <TableHeaderCell>المبلغ</TableHeaderCell>
                    <TableHeaderCell>تاريخ الحجز</TableHeaderCell>
                    <TableHeaderCell>الحالة</TableHeaderCell>
                    <TableHeaderCell>الإجراء</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs text-indigo-700 font-bold">{b.transactionId}</TableCell>
                      <TableCell className="font-bold text-slate-900">{b.courseTitle}</TableCell>
                      <TableCell className="text-xs text-slate-600">{b.providerName}</TableCell>
                      <TableCell className="font-bold text-slate-900 tabular-nums">
                        {b.amount.toLocaleString()} {b.currency}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">{b.bookingDate}</TableCell>
                      <TableCell>
                        <Badge variant={b.status === 'confirmed' || b.status === 'completed' ? 'success' : b.status === 'in-progress' ? 'info' : b.status === 'rejected' || b.status === 'cancelled' ? 'danger' : 'warning'}>
                          {b.status === 'confirmed' ? 'مؤكد' : b.status === 'in-progress' ? 'قيد الدراسة' : b.status === 'completed' ? 'مكتمل' : b.status === 'rejected' ? 'مرفوض' : b.status === 'cancelled' ? 'ملغي' : 'بانتظار تأكيد المؤسسة'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReceipt(b)}
                          leftIcon={<FileText className="w-3.5 h-3.5" />}
                        >
                          عرض الطلب
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Tab 3: Saved Courses */}
        {activeTab === 'saved' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">البرامج التعليمية المفضلة</h2>
                <p className="text-xs text-slate-500">البرامج التي حفظتها للرجوع إليها أو استكمال التسجيل</p>
              </div>
              <span className="text-xs text-slate-500">{savedCourses.length} برامج محفوظة</span>
            </div>

            {savedCourses.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
                <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">لا توجد برامج محفوظة في قائمتك حالياً</h3>
                <p className="text-xs text-slate-500">تصفح دليل البرامج وانقر على رمز القلب لحفظ الدورات التي تهمك.</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('discovery')}
                >
                  استكشاف البرامج الآن
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedCourses.map((c) => (
                  <Card key={c.id} className="flex flex-col justify-between">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-indigo-700">{c.providerName}</span>
                        <button
                          onClick={() => handleRemoveSaved(c.id, c.title)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="إزالة من المحفوظات"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <CardTitle className="text-base">{c.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                        {c.description}
                      </p>
                      <div className="text-xs font-bold text-slate-900 tabular-nums">
                        {c.numericPrice.toLocaleString()} {c.currency}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectCourse(c.id)}
                      >
                        عرض التفاصيل
                      </Button>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => onNavigate('checkout', c.id)}
                      >
                        طلب تسجيل
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Inquiries */}
        {activeTab === 'inquiries' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">سجل الاستفسارات والمحادثات مع المؤسسات</h2>
              <p className="text-xs text-slate-500">تواصلك المباشر مع أقسام القبول بالمدارس والمعاهد</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft-card">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>المؤسسة / المعلم</TableHeaderCell>
                    <TableHeaderCell>البرنامج المطلوب</TableHeaderCell>
                    <TableHeaderCell>تاريخ الإرسال</TableHeaderCell>
                    <TableHeaderCell>حالة الرد</TableHeaderCell>
                    <TableHeaderCell>نص الاستفسار</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inquiries.map((inq) => (
                    <TableRow key={inq.id}>
                      <TableCell className="font-bold text-slate-900">{inq.providerName}</TableCell>
                      <TableCell className="text-xs">{inq.serviceTitle}</TableCell>
                      <TableCell className="text-xs text-slate-500">{inq.date}</TableCell>
                      <TableCell>
                        <Badge variant={inq.status === 'confirmed' ? 'success' : inq.status === 'responded' ? 'info' : 'warning'}>
                          {inq.status === 'confirmed' ? 'تم التأكيد' : inq.status === 'responded' ? 'تم الرد' : 'قيد الانتظار'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 max-w-xs truncate">{inq.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Tab 5: Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {/* Real-time Cloud Sync Control Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    syncStatus === 'connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <Radio className={`w-4 h-4 ${syncStatus === 'connected' ? 'animate-pulse text-emerald-600' : ''}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">حالة الإشعارات:</span>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                        syncStatus === 'connected'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : syncStatus === 'syncing'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : syncStatus === 'error'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          syncStatus === 'connected'
                            ? 'bg-emerald-500 animate-pulse'
                            : syncStatus === 'syncing'
                            ? 'bg-amber-500 animate-spin'
                            : syncStatus === 'error'
                            ? 'bg-rose-500'
                            : 'bg-slate-400'
                        }`} />
                        {syncStatus === 'connected' && 'محدّثة'}
                        {syncStatus === 'syncing' && 'جارٍ مزامنة الإشعارات...'}
                        {syncStatus === 'error' && 'تعذر تحديث الإشعارات'}
                        {syncStatus === 'offline' && 'غير متصل حالياً'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {lastSyncedAt
                        ? `آخر تحديث: ${lastSyncedAt.toLocaleTimeString('ar-SA')}`
                        : 'سيتم تحديث الإشعارات تلقائياً عند توفر اتصال.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => refreshSync()}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>إعادة المزامنة</span>
                  </button>
                </div>
              </div>

              {syncErrorMessage && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{syncErrorMessage}</span>
                </div>
              )}
            </div>

            {/* Header and filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <h2 className="text-base font-bold text-slate-900">مركز الإشعارات والتنبيهات</h2>
                <p className="text-xs text-slate-500">التحديثات الأكاديمية ومواعيد البرامج والدروس ({notifications.length} إشعار)</p>
              </div>

              {/* Filter chips for notifications */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setNotifFilter('all')}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer font-semibold ${
                    notifFilter === 'all' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  الكل ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('booking')}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer font-semibold ${
                    notifFilter === 'booking' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  الحجوزات
                </button>
                <button
                  onClick={() => setNotifFilter('offer')}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer font-semibold ${
                    notifFilter === 'offer' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  العروض
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllNotificationsRead}
                    className="ms-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>تعيين الكل كمقروء ({unreadCount})</span>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-soft-card overflow-hidden">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">لا توجد إشعارات مطابقة حالياً</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    ستظهر هنا الإشعارات المتعلقة بطلبات التسجيل والحساب.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                      !notif.read ? 'bg-indigo-50/40' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        notif.type === 'booking'
                          ? 'bg-emerald-100 text-emerald-700'
                          : notif.type === 'offer'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600" />
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            {notif.type === 'booking' ? 'حجز دراسي' : notif.type === 'offer' ? 'عرض خاص' : notif.type === 'reminder' ? 'تذكير' : 'نظام'}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Cloud Synced
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-[11px] text-slate-400">{notif.date}</span>
                      <div className="flex items-center gap-1.5">
                        {!notif.read && (
                          <button
                            type="button"
                            onClick={() => {
                              markAsRead(notif.id);
                              showToast('تم تعيين الإشعار كمقروء');
                            }}
                            className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors text-xs font-semibold"
                            title="تحديد كمقروء"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            deleteNotification(notif.id);
                            showToast('تم حذف الإشعار بنجاح');
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="حذف الإشعار"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enrollment request summary */}
      {selectedReceipt && (
        <Modal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title="ملخص طلب التسجيل"
          description={`رقم الطلب: ${selectedReceipt.transactionId}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  showToast('جاري طباعة ملخص طلب التسجيل.');
                }}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                طباعة الملخص
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedReceipt(null)}
              >
                إغلاق
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">البرنامج:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.courseTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المؤسسة التعليمية:</span>
                <span className="font-semibold text-slate-900">{selectedReceipt.providerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">اسم الطالب:</span>
                <span className="text-slate-900">{selectedReceipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">تاريخ الحجز:</span>
                <span className="text-slate-900">{selectedReceipt.bookingDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">موعد البدء:</span>
                <span className="text-slate-900">{selectedReceipt.startDate}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-sm text-indigo-950">
                <span>المبلغ المطلوب:</span>
                <span className="tabular-nums">{selectedReceipt.amount.toLocaleString()} {selectedReceipt.currency}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed text-center">
              هذا ملخص طلبك في منصة أعالي، رقم الطلب: {selectedReceipt.transactionId}
            </p>
          </div>
        </Modal>
      )}
    </PortalLayout>
  );
};
