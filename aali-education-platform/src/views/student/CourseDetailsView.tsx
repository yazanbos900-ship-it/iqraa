import React, { useState } from 'react';
import { ActiveView, EducationalService, EducationalProvider } from '../../types';
import { usePlatformData } from '../../firebase/PlatformDataContext';
import { useAuth } from '../../firebase/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { 
  ArrowRight, 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Send, 
  Share2, 
  Heart,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Headphones
} from 'lucide-react';

interface CourseDetailsViewProps {
  courseId: string;
  onNavigate: (view: ActiveView, extraId?: string) => void;
  onEnroll: (course: EducationalService) => void;
}

export const CourseDetailsView: React.FC<CourseDetailsViewProps> = ({
  courseId,
  onNavigate,
  onEnroll,
}) => {
  const { services, providers, reviews, savedServiceIds, toggleSavedService, createInquiry } = usePlatformData();
  const { userProfile } = useAuth();
  const course = services.find((s) => s.id === courseId);
  const providerRecord = course ? providers.find((p) => p.id === course.providerId) : undefined;
  const provider = course ? (providerRecord || {
    id: course.providerId,
    name: course.providerName,
    nameEn: course.providerName,
    category: course.category,
    city: '',
    rating: course.rating,
    reviewsCount: course.reviewsCount,
    description: '',
    accredited: false,
    featured: false,
    contactEmail: '',
    contactPhone: '',
    servicesOffered: [],
    establishedYear: 0,
    tags: [],
  } satisfies EducationalProvider) : undefined;
  
  const isSaved = savedServiceIds.includes(courseId);
  const courseReviews = reviews.filter((review) => review.providerId === course?.providerId && review.courseTitle === course?.title);
  const averageReviewAspect = (key: 'teaching' | 'facilities' | 'organization') => {
    const ratings = courseReviews.map((review) => review.aspects?.[key] || 0).filter((rating) => rating > 0);
    return ratings.length ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : '—';
  };
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [inquiryText, setInquiryText] = useState('');
  const [inquirySent, setInquirySent] = useState(false);
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const percentSeats = course ? Math.round((course.seatsAvailable / Math.max(course.totalSeats, 1)) * 100) : 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = () => {
    showToast('تم نسخ رابط البرنامج التعليمي إلى الحافظة بنجاح!');
  };

  const handleSendInquiry = async () => {
    if (!course) return;
    if (userProfile?.role !== 'student') {
      showToast('سجّل الدخول بحساب طالب لإرسال استفسار.');
      onNavigate('auth-login');
      return;
    }
    if (!inquiryText.trim()) {
      showToast('اكتب رسالتك قبل الإرسال.');
      return;
    }
    setIsSendingInquiry(true);
    try {
      await createInquiry(course, inquiryText);
      setInquirySent(true);
      showToast('تم حفظ استفسارك وإرساله للمؤسسة.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'تعذر إرسال الاستفسار.');
    } finally {
      setIsSendingInquiry(false);
    }
  };

  if (!course || !provider) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-sm text-slate-600">لم نتمكن من العثور على هذا البرنامج في قاعدة البيانات.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
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

      {/* Breadcrumb Navigation */}
      <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => onNavigate('landing')}
          className="hover:text-indigo-600 transition-colors cursor-pointer"
        >
          الرئيسية
        </button>
        <span aria-hidden="true">/</span>
        <button
          onClick={() => onNavigate('discovery')}
          className="hover:text-indigo-600 transition-colors cursor-pointer"
        >
          دليل البرامج والدورات
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-slate-900 font-medium truncate max-w-xs">{course.title}</span>
      </nav>

      {/* Main Grid: 2 Columns (Content 8 cols / Sidebar Card 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Content Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                  {course.level}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                  {course.mode === 'online' ? 'تعليم عن بُعد (أونلاين)' : course.mode === 'hybrid' ? 'تعليم مدمج (حضوري وأونلاين)' : 'تعليم حضوري بالمقر'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    if (userProfile?.role !== 'student') {
                      showToast('سجّل الدخول بحساب طالب لحفظ البرامج.');
                      onNavigate('auth-login');
                      return;
                    }
                    try {
                      await toggleSavedService(course.id);
                      showToast(isSaved ? 'تمت إزالة البرنامج من المفضلة' : 'تمت إضافة البرنامج إلى المفضلة');
                    } catch (error) {
                      showToast(error instanceof Error ? error.message : 'تعذر تحديث المفضلة.');
                    }
                  }}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isSaved
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                  aria-label="حفظ في المفضلة"
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 bg-white transition-colors cursor-pointer"
                  aria-label="مشاركة الرابط"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
              {course.title}
            </h1>

            {/* Provider and Rating row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <button
                onClick={() => onNavigate('provider-profile', provider.id)}
                className="flex items-center gap-2 text-indigo-700 hover:text-indigo-900 font-bold cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-bold text-xs">
                  {provider.name[0]}
                </div>
                <span className="group-hover:underline">{provider.name}</span>
                {providerRecord?.accredited || providerRecord?.verificationStatus === 'approved'
                  ? <Badge variant="success">معتمد</Badge>
                  : <Badge variant="warning">قيد المراجعة</Badge>}
              </button>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{course.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({course.reviewsCount} تقييم)</span>
              </div>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <div className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>{provider.city}</span>
              </div>
            </div>
          </div>

          {/* Description & Overview */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-card space-y-4">
            <h2 className="text-lg font-bold text-slate-900">نظرة عامة على البرنامج والأهداف التعليمية</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {course.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold">المدة الزمنية</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{course.duration}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold">المواعيد والجدول</span>
                </div>
                <div className="font-bold text-slate-900 text-sm">{course.schedule || 'لم يُضف جدول بعد'}</div>
              </div>
            </div>
          </div>

          {/* Syllabus / Modules */}
          {course.modules && course.modules.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">الخطة الدراسية والمحاور (Syllabus)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">يتضمن البرنامج {course.modules.length} وحدات تدريسية تفصيلية</p>
                </div>
              </div>

              <div className="space-y-3">
                {course.modules.map((m, idx) => {
                  const isExpanded = expandedModule === m.id;
                  return (
                    <div
                      key={m.id}
                      className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setExpandedModule(isExpanded ? null : m.id)}
                        className="w-full p-4 text-start bg-slate-50 hover:bg-slate-100/90 flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs shrink-0">
                            0{idx + 1}
                          </span>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{m.title}</div>
                            <div className="text-[11px] text-slate-500">{m.duration} · {m.lessonsCount} درس تطبيقي وتدريبات عملية</div>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </button>

                      {isExpanded && (
                        <div className="p-5 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100 space-y-2">
                          <p>تفاصيل إضافية عن هذا المحور غير مضافة بعد.</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Instructor & Faculty */}
          {(course.instructorName || course.instructorRole) && <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-card space-y-4">
            <h2 className="text-lg font-bold text-slate-900">معلومات المحاضر</h2>
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold text-lg shrink-0">
                {(course.instructorName || course.instructorRole || 'م')[0]}
              </div>
              <div className="space-y-1">
                {course.instructorName && <div className="text-sm font-bold text-slate-900">{course.instructorName}</div>}
                {course.instructorRole && <div className="text-xs text-indigo-700 font-semibold">{course.instructorRole}</div>}
              </div>
            </div>
          </div>}

          {/* Reviews Breakdown */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-card space-y-4">
            <h2 className="text-lg font-bold text-slate-900">تقييمات هذا البرنامج</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-center">
              <div>
                <div className="text-slate-500 mb-1">المحتوى والمادة العلمية</div>
                <div className="font-extrabold text-amber-600 text-lg">{averageReviewAspect('teaching')}{courseReviews.length ? ' / 5' : ''}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">كفاءة وتفاعل المحاضر</div>
                <div className="font-extrabold text-amber-600 text-lg">{averageReviewAspect('facilities')}{courseReviews.length ? ' / 5' : ''}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">سهولة المتابعة والمنصة</div>
                <div className="font-extrabold text-amber-600 text-lg">{averageReviewAspect('organization')}{courseReviews.length ? ' / 5' : ''}</div>
              </div>
            </div>
            {courseReviews.length === 0 && <p className="text-xs text-slate-500">ما في تقييمات محفوظة لهذا البرنامج لحد الآن.</p>}
          </div>
        </div>

        {/* Right Sticky Enrollment Card Column (4 cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <div className="bg-white rounded-3xl p-6 border-2 border-indigo-200 shadow-lg space-y-6">
            <div>
              <div className="text-xs text-slate-500 font-medium mb-1">قيمة البرنامج:</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {course.numericPrice.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-indigo-700">{course.currency}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{course.priceNote}</p>
            </div>

            {/* Seats progress indicator */}
            <div className="space-y-1.5 p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span>المقاعد الشاغرة المتبقية</span>
                <span className="tabular-nums">{course.seatsAvailable} من {course.totalSeats} مقعد</span>
              </div>
              <div className="w-full bg-amber-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentSeats}%` }}
                />
              </div>
              <p className="text-[11px] text-amber-800">
                التسجيل متاح حتى اكتمال العدد أو حلول موعد بدء البرنامج.
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <Button
                variant="accent"
                size="lg"
                className="w-full py-3.5 text-base shadow-clay-cta font-bold"
                onClick={() => onEnroll(course)}
              >
                إرسال طلب تسجيل
              </Button>

              <Button
                variant="outline"
                size="md"
                className="w-full text-xs font-semibold"
                onClick={() => setIsInquiryModalOpen(true)}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                تواصل مباشر أو طلب استفسار
              </Button>
            </div>

            {/* Trust and Guarantee Checklist */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>مزود الخدمة معتمد على المنصة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ستتواصل المؤسسة لتأكيد الطلب وترتيب التفاصيل</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>الدفع الإلكتروني غير مفعّل حالياً</span>
              </div>
            </div>
          </div>

          {/* Provider Mini Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-soft-card space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">مقدم الخدمة التعليمية</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold text-base shrink-0">
                {provider.name[0]}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{provider.name}</h4>
                <div className="text-xs text-slate-500">{provider.city}{provider.establishedYear ? ` · تأسست عام ${provider.establishedYear}` : ''}</div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs font-semibold"
              onClick={() => onNavigate('provider-profile', provider.id)}
            >
              عرض الملف التعريفي الكامل للمؤسسة
            </Button>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <Modal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        title={`استفسار عن: ${course.title}`}
        description={`المؤسسة: ${provider.name}`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInquiryModalOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendInquiry}
              disabled={isSendingInquiry}
            >
              {isSendingInquiry ? 'جارٍ الإرسال…' : 'إرسال الاستفسار'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-start">
          {inquirySent ? (
            <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="font-bold">تم إرسال استفسارك بنجاح!</div>
              <p className="text-xs text-emerald-700 mt-1">سيتواصل معك مسؤولو التسجيل بالمؤسسة في أقرب وقت.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اكتب رسالتك أو أسئلتك للمؤسسة:
                </label>
                <textarea
                  rows={4}
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  placeholder="مثال: أود معرفة مواعيد الدفعات، وهل تتوفر خصومات للأخوة أو المتفوقين؟"
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                سيصل استفسارك مباشرة لقسم القبول والتسجيل في {provider.name}.
              </p>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
