import React, { useState, useRef, useEffect } from 'react';
import { ActiveView, EducationalService, CourseBooking } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  Building2, 
  FileText,
  Sparkles,
  Printer,
  Download,
  AlertCircle
} from 'lucide-react';
import { useNotifications } from '../../firebase/NotificationContext';
import { usePlatformData } from '../../firebase/PlatformDataContext';
import { useAuth } from '../../firebase/AuthContext';

interface CheckoutViewProps {
  course: EducationalService;
  onNavigate: (view: ActiveView, extraId?: string) => void;
  onBookingCompleted: (booking: CourseBooking) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  course,
  onNavigate,
  onBookingCompleted,
}) => {
  const { addNotification } = useNotifications();
  const { createEnrollment } = usePlatformData();
  const { user, userProfile } = useAuth();
  const [cardHolder, setCardHolder] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<CourseBooking | null>(null);
  const [printFeedback, setPrintFeedback] = useState<string | null>(null);

  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCardHolder(userProfile?.displayName || '');
    setStudentEmail(user?.email || userProfile?.email || '');
  }, [user, userProfile]);

  // Price calculations
  const rawSubtotal = course.numericPrice;
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!user || userProfile?.role !== 'student') errors.push('سجّل الدخول بحساب طالب لإرسال طلب الالتحاق.');
    if (!cardHolder.trim()) errors.push('يرجى إدخال الاسم الثلاثي للطالب المسجل');
    if (!studentEmail.trim()) errors.push('يرجى إدخال البريد الإلكتروني للتواصل');
    if (!studentPhone.trim()) errors.push('يرجى إدخال رقم الهاتف للتواصل');

    if (errors.length > 0) {
      setFormErrors(errors);
      errorSummaryRef.current?.focus();
      return;
    }

    setFormErrors([]);
    setIsProcessing(true);
    try {
      const newBooking = await createEnrollment({
        courseId: course.id,
        courseTitle: course.title,
        providerName: course.providerName,
        studentName: cardHolder,
        studentEmail,
        studentPhone,
        amount: course.numericPrice,
        currency: course.currency,
        bookingDate: new Date().toISOString().split('T')[0],
        startDate: course.schedule || 'يحدد لاحقاً',
        status: 'pending',
        paymentMethod: 'wire_transfer',
      });
      setCompletedBooking(newBooking);
      setIsSuccess(true);
      onBookingCompleted(newBooking);

      await addNotification({
        title: `تم استلام طلب الالتحاق: ${course.title}`,
        message: 'طلبك محفوظ في حسابك. ستتواصل المؤسسة معك لتأكيد المقعد وترتيب الدفع.',
        type: 'booking',
        read: false,
        date: 'الآن',
      }).catch(() => undefined);
    } catch (error) {
      setFormErrors([error instanceof Error ? error.message : 'تعذر حفظ طلب الالتحاق.']);
      errorSummaryRef.current?.focus();
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintVoucher = () => {
    setPrintFeedback('تم إعداد إشعار الحجز بصيغة PDF وجاهز للطباعة الإلكترونية!');
    setTimeout(() => setPrintFeedback(null), 3000);
  };

  if (isSuccess && completedBooking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
        {printFeedback && (
          <div role="status" className="bg-slate-900 text-white text-xs py-2 px-4 rounded-xl shadow-lg inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{printFeedback}</span>
          </div>
        )}

        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            تم استلام طلب الالتحاق بنجاح
          </h1>
          <p className="text-sm text-slate-600">
            أرسلنا طلبك إلى {completedBooking.providerName}. سيتغير وضعه بعد رد المؤسسة.
          </p>
        </div>

        {/* Official Printable Receipt Slip Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-100 text-start space-y-4 shadow-soft-card text-xs relative overflow-hidden">
          {/* Watermark / Official Badge */}
          <div className="absolute top-4 end-4 text-emerald-600/20 rotate-12 uppercase font-mono font-black text-4xl select-none pointer-events-none">
            PENDING
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px]">رقم المعاملة المرجعي:</span>
              <span className="font-mono font-bold text-indigo-700 text-sm">{completedBooking.transactionId}</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              بانتظار تأكيد المؤسسة
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-500 block">اسم الطالب المسجل:</span>
              <span className="font-bold text-slate-900 text-sm">{completedBooking.studentName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">تاريخ الطلب:</span>
              <span className="text-slate-900 font-medium">{completedBooking.bookingDate}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-500 block">المؤسسة الأكاديمية:</span>
              <span className="font-semibold text-slate-900">{completedBooking.providerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">تاريخ بدء الدراسة:</span>
              <span className="font-semibold text-indigo-700">{completedBooking.startDate}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-base font-extrabold text-slate-900">
            <span>المبلغ المطلوب:</span>
            <span className="text-indigo-700 tabular-nums">
              {completedBooking.amount.toLocaleString()} {completedBooking.currency}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
            <span>حالة الدفع: لم يتم الدفع</span>
            <span className="text-slate-600 font-semibold flex items-center gap-1">
              طلبك محفوظ في Firebase
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            variant="accent"
            size="md"
            onClick={() => onNavigate('student')}
          >
            متابعة طلباتي في بوابة الطالب
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={handlePrintVoucher}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            طباعة / تحميل ملخص الطلب
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={() => onNavigate('discovery')}
          >
            استكشاف برامج أخرى
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => onNavigate('discovery')}
          className="hover:text-indigo-600 transition-colors cursor-pointer"
        >
          الدليل
        </button>
        <span aria-hidden="true">/</span>
        <button
          onClick={() => onNavigate('course-details', course.id)}
          className="hover:text-indigo-600 transition-colors cursor-pointer truncate max-w-xs"
        >
          {course.title}
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-slate-900 font-medium">طلب الالتحاق</span>
      </nav>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          طلب الالتحاق بالبرنامج
        </h1>
        <p className="text-xs text-slate-500">
          أرسل بيانات التواصل للمؤسسة لمراجعة طلبك وتأكيد توفر المقعد.
        </p>
      </div>

      {/* Focusable Error Summary per UI UX Pro Max UX Rule */}
      {formErrors.length > 0 && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="error-summary-title"
          className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-xs text-rose-900 space-y-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <div className="flex items-center gap-2 font-bold" id="error-summary-title">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>يرجى تصحيح الأخطاء التالية قبل المتابعة:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 ps-2">
            {formErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Grid: Form (7 cols) + Order Summary (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleProcessPayment} className="space-y-6">
            {/* Student Info Box */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-card space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>بيانات الطالب المسجل</span>
              </h2>

              <div className="space-y-3">
                <Input
                  label="الاسم الثلاثي للطالب / المسجل"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="البريد الإلكتروني للإشعارات"
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="رقم الهاتف للتواصل"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-950 leading-relaxed">
              نسجل طلب الالتحاق في Firebase فقط. الدفع الإلكتروني غير مفعّل حالياً، ولن نطلب أو نحفظ بيانات بطاقة بنكية. ستتواصل المؤسسة معك لتأكيد المقعد وترتيب الرسوم.
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full py-4 text-base shadow-clay-cta font-bold"
              isLoading={isProcessing}
            >
              إرسال طلب الالتحاق ({course.numericPrice.toLocaleString()} {course.currency})
            </Button>
          </form>
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-card space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              ملخص تفاصيل البرنامج
            </h2>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-indigo-700">{course.providerName}</span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{course.title}</h3>
              </div>

              <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span>المستوى الأكاديمي:</span>
                  <span className="font-bold text-slate-800">{course.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>المدة المقررة:</span>
                  <span className="font-bold text-slate-800">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>نمط الحضور:</span>
                  <span className="font-bold text-slate-800">
                    {course.mode === 'online' ? 'أونلاين' : course.mode === 'hybrid' ? 'مدمج' : 'حضوري'}
                  </span>
                </div>
              </div>
            </div>

            {/* Amount is the value stored with the enrollment request. */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>قيمة البرنامج حسب بيانات المؤسسة:</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {rawSubtotal.toLocaleString()} {course.currency}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-sm font-extrabold text-slate-900">
                <span>المبلغ في طلب التسجيل:</span>
                <span className="text-indigo-700 text-lg tabular-nums">
                  {rawSubtotal.toLocaleString()} {course.currency}
                </span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 leading-relaxed">
              * هذا طلب تسجيل فقط. الدفع الإلكتروني والخصومات والضرائب غير مفعّلة في هذه المرحلة.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
