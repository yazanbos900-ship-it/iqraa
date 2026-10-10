import React, { useState, useRef } from 'react';
import { ActiveView, UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Alert } from '../../components/ui/Alert';
import { useAuth } from '../../firebase/AuthContext';
import { 
  GraduationCap, 
  Building2, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck,
  Info,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Globe
} from 'lucide-react';

interface AuthViewProps {
  initialMode: 'login' | 'register' | 'recovery';
  onNavigate: (view: ActiveView) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode,
  onNavigate,
}) => {
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    sendPasswordReset,
    userProfile 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<'student' | 'provider'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [providerType, setProviderType] = useState('schools');
  const [recoverySubmitted, setRecoverySubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [copiedHostname, setCopiedHostname] = useState(false);

  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleCopyHostname = async () => {
    if (typeof window !== 'undefined' && currentHostname) {
      try {
        await navigator.clipboard.writeText(currentHostname);
        setCopiedHostname(true);
        setTimeout(() => setCopiedHostname(false), 2500);
      } catch {
        // Fallback
      }
    }
  };

  const formatFirebaseError = (err: unknown): string => {
    if (err && typeof err === 'object' && 'code' in err) {
      const code = (err as { code: string }).code;
      switch (code) {
        case 'auth/unauthorized-domain':
          return 'نطاق التطبيق غير مصرح به في إعدادات Firebase Authentication لمشروعك (Authorized Domains).';
        case 'auth/operation-not-allowed':
          return 'طريقة تسجيل الدخول هذه غير مفعلة في لوحة Firebase Console. يرجى تفعيلها من قسم Authentication > Sign-in method.';
        case 'auth/popup-closed-by-user':
          return 'تم إغلاق نافذة تسجيل الدخول قبل اكتمال العملية.';
        case 'auth/popup-blocked':
          return 'قام المتصفح بحظر النافذة المنبثقة، يرجى السماح بالنوافذ المنبثقة للمتابعة.';
        case 'auth/cancelled-popup-request':
          return 'تم إلغاء عملية تسجيل الدخول عبر النافذة المنبثقة.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          return 'بيانات تسجيل الدخول غير صحيحة، يرجى التأكد من البريد وكلمة المرور';
        case 'auth/email-already-in-use':
          return 'هذا البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول به مباشرة';
        case 'auth/weak-password':
          return 'كلمة المرور ضعيفة جداً، يرجى إدخال 6 خانات على الأقل';
        case 'auth/invalid-email':
          return 'صيغة البريد الإلكتروني غير صالحة';
        case 'auth/network-request-failed':
          return 'تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت';
        case 'auth/too-many-requests':
          return 'تم تجاوز عدد المحاولات المسموح بها، يرجى الانتظار قليلاً ثم إعادة المحاولة';
        default:
          return (err as { message?: string }).message || 'حدث خطأ في عملية المصادقة';
      }
    }
    return err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!email.trim()) errors.push('يرجى إدخال البريد الإلكتروني');
    if (mode !== 'recovery' && (!password || password.length < 6)) {
      errors.push('كلمة المرور يجب أن لا تقل عن 6 خانات');
    }
    if (mode === 'register' && !name.trim()) {
      errors.push('يرجى إدخال الاسم بالكامل');
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      errorSummaryRef.current?.focus();
      return;
    }

    setFormErrors([]);
    setIsUnauthorizedDomain(false);
    setIsSubmitting(true);

    try {
      if (mode === 'recovery') {
        await sendPasswordReset(email.trim());
        setRecoverySubmitted(true);
      } else if (mode === 'login') {
        const profile = await signInWithEmail(email.trim(), password);
        const destinationRole = profile?.role || selectedRole;
        if (destinationRole === 'admin') {
          onNavigate('admin');
        } else if (destinationRole === 'provider') {
          onNavigate('provider');
        } else {
          onNavigate('student');
        }
      } else {
        const profile = await signUpWithEmail(
          email.trim(),
          password,
          name.trim(),
          selectedRole,
          selectedRole === 'provider' ? providerType : undefined
        );
        if (profile.role === 'provider') {
          onNavigate('provider');
        } else {
          onNavigate('student');
        }
      }
    } catch (err) {
      setFormErrors([formatFirebaseError(err)]);
      errorSummaryRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    setFormErrors([]);
    setIsUnauthorizedDomain(false);
    try {
      const profile = await signInWithGoogle(selectedRole);
      if (profile.role === 'admin') {
        onNavigate('admin');
      } else if (profile.role === 'provider') {
        onNavigate('provider');
      } else {
        onNavigate('student');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'auth/unauthorized-domain') {
        setIsUnauthorizedDomain(true);
      } else {
        setIsUnauthorizedDomain(false);
      }
      setFormErrors([formatFirebaseError(err)]);
      errorSummaryRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-5 lg:gap-8 items-stretch">
        <aside className="hidden md:flex flex-col justify-between min-h-[620px] rounded-3xl bg-slate-900 text-white p-8 lg:p-10 overflow-hidden relative">
          <div className="absolute -top-20 -end-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -start-20 w-72 h-72 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="relative">
            <button onClick={() => onNavigate('landing')} className="inline-flex items-center gap-3 text-start">
              <span className="w-11 h-11 rounded-2xl bg-indigo-500 text-white flex items-center justify-center font-bold text-xl">إ</span>
              <span>
                <span className="block text-xl font-bold text-white">أعالي</span>
                <span className="block text-xs text-slate-300">منصتك للخدمات التعليمية</span>
              </span>
            </button>
            <p className="mt-16 text-sm font-semibold text-indigo-200">كل ما تحتاجه لرحلتك التعليمية</p>
            <h2 className="mt-3 text-3xl lg:text-4xl leading-tight font-bold text-white">اكتشف، قارن، وتابع خياراتك التعليمية بسهولة.</h2>
            <p className="mt-5 text-base leading-7 text-slate-300">حساب واحد يوصلك إلى البرامج التعليمية ومزودي الخدمة، ويساعدك على متابعة طلباتك من مكان واحد.</p>
          </div>
          <div className="relative grid gap-3 text-sm text-slate-200">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"><CheckCircle2 className="w-5 h-5 text-indigo-300" /><span>دليل منظم للمؤسسات والبرامج</span></div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"><CheckCircle2 className="w-5 h-5 text-indigo-300" /><span>حساب خاص للطلاب ومزودي الخدمة</span></div>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"><CheckCircle2 className="w-5 h-5 text-indigo-300" /><span>متابعة واضحة للطلبات والإشعارات</span></div>
          </div>
        </aside>
        <div className="min-w-0 space-y-5">
        {/* Brand Header */}
        <div className="text-center md:text-start px-1">
          <button
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2.5 group mb-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg group-hover:bg-indigo-700 transition-colors">
              إ
            </div>
            <span className="text-2xl font-extrabold text-slate-900">منصة أعالي</span>
          </button>
          <h2 className="text-2xl font-bold text-slate-900">
            {mode === 'login'
              ? 'تسجيل الدخول إلى حسابك'
              : mode === 'register'
              ? 'إنشاء حساب جديد بالمنصة'
              : 'استعادة كلمة المرور'}
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            {mode === 'login'
              ? 'اختر دورك وسجّل دخولك للوصول المباشر إلى لوحة التحكم'
              : mode === 'register'
              ? 'انضم إلى مجتمع أعالي للخدمات التعليمية المتكاملة'
              : 'أدخل بريدك الإلكتروني المسجل لإرسال رابط إعادة التعيين'}
          </p>
        </div>

        {/* Focusable Error Summary */}
        {formErrors.length > 0 && (
          <div
            ref={errorSummaryRef}
            tabIndex={-1}
            role="alert"
            aria-labelledby="auth-error-title"
            className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-900 space-y-1 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <div className="flex items-center gap-2 font-bold" id="auth-error-title">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>تنبيه: تعذر إتمام الطلب</span>
            </div>
            <ul className="list-disc list-inside ps-2">
              {formErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>

            {/* Unauthorized Domain Helper Card */}
            {isUnauthorizedDomain && (
              <div className="mt-3 pt-3 border-t border-rose-200/80 text-slate-800 space-y-2.5">
                <div className="flex items-start gap-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900">
                  <Globe className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-bold block text-amber-950 mb-0.5">سبب ظهور هذا الخطأ:</span>
                    تسجيل الدخول عبر Google (Pop-up) يتطلب إضافة نطاق عمل التطبيق إلى قائمة <strong>النطاقات المصرح بها (Authorized Domains)</strong> في كونسول مشروعك <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-mono text-[10px]">iqradatabase-f8767</code>.
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] space-y-2">
                  <div className="text-slate-700 font-semibold flex items-center justify-between">
                    <span>النطاق الحالي للتطبيق:</span>
                    <span className="text-[10px] text-slate-400 font-normal">انسخه وأضفه في Firebase</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-2 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 justify-between">
                    <span className="truncate select-all text-indigo-900 font-medium">{currentHostname}</span>
                    <button
                      type="button"
                      onClick={handleCopyHostname}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-sans text-[11px] font-bold transition-colors shrink-0 cursor-pointer shadow-2xs"
                    >
                      {copiedHostname ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ النطاق</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-[10px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <strong className="text-slate-800 block mb-1">خطوات الحل في ثوانٍ:</strong>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>توجه إلى Firebase Console: <strong>Authentication ➔ Settings ➔ Authorized domains</strong>.</li>
                      <li>انقر على <strong>Add domain (إضافة نطاق)</strong>.</li>
                      <li>الصق النطاق المنسوخ أعلاه واضغط <strong>Save (حفظ)</strong>.</li>
                    </ol>
                  </div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-950 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="leading-snug">
                    <span className="font-bold block text-emerald-900 mb-0.5">⚡ حل مباشر وفوري:</span>
                    تسجيل الدخول أو إنشاء حساب بالبريد الإلكتروني وكلمة المرور أدناه يعمل بشكل فوري وكامل الآن دون الحاجة لأي إعدادات إضافية!
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnauthorizedDomain(false);
                      setFormErrors([]);
                      setMode('login');
                    }}
                    className="shrink-0 text-[11px] font-bold text-emerald-900 bg-white border border-emerald-300 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer text-center"
                  >
                    متابعة بالبريد وكلمة المرور
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white p-6 sm:p-8 lg:p-9 rounded-3xl border border-slate-200 shadow-soft-card">
          {mode !== 'recovery' && (
            <>
              {/* Mode Switcher Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 mb-7 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-indigo-950 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  تسجيل الدخول
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white text-indigo-950 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  حساب جديد
                </button>
              </div>

              {/* Role Choice (Student vs Provider) */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  اختر نوع الحساب:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('student')}
                    className={`p-4 rounded-2xl border text-start flex items-center gap-3 transition-all cursor-pointer ${
                      selectedRole === 'student'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-950 font-bold ring-1 ring-indigo-500/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5 text-indigo-700 shrink-0" />
                    <div className="text-sm">
                      <div className="font-bold">طالب / ولي أمر</div>
                      <div className="text-xs text-slate-500">للبحث والاستفسار</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('provider')}
                    className={`p-4 rounded-2xl border text-start flex items-center gap-3 transition-all cursor-pointer ${
                      selectedRole === 'provider'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-950 font-bold ring-1 ring-indigo-500/30'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-indigo-700 shrink-0" />
                    <div className="text-sm">
                      <div className="font-bold">مزود خدمة</div>
                      <div className="text-xs text-slate-500">مدرسة / معهد / معلم</div>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          {mode === 'recovery' && recoverySubmitted ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">تم إرسال رابط الاستعادة</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                تم إرسال رابط إعادة التعيين إلى البريد الإلكتروني الذي أدخلته: <strong dir="ltr">{email}</strong>.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  setRecoverySubmitted(false);
                  setMode('login');
                }}
              >
                العودة إلى تسجيل الدخول
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <Input
                  label={selectedRole === 'student' ? 'الاسم الكامل' : 'اسم المؤسسة التعليمية أو المعلم'}
                  placeholder={selectedRole === 'student' ? 'مثال: عبد الله أحمد' : 'مثال: أكاديمية قرطبة أو أ. محمد'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />
              )}

              {mode === 'register' && selectedRole === 'provider' && (
                <Select
                  label="نوع المؤسسة التعليمية"
                  value={providerType}
                  onChange={(e) => setProviderType(e.target.value)}
                  options={[
                    { value: 'schools', label: 'مدرسة خاصة أو دولية' },
                    { value: 'universities', label: 'جامعة أو كلية' },
                    { value: 'institutes', label: 'معهد لغات أو تقنية' },
                    { value: 'tutors', label: 'معلم أو مدرب خصوصي معتمد' },
                    { value: 'training_centers', label: 'مركز تدريب مهني' },
                    { value: 'libraries', label: 'مكتبة أو مركز بحثي' },
                  ]}
                />
              )}

              <Input
                label="البريد الإلكتروني"
                type="email"
                placeholder="example@iqra-edu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              {mode !== 'recovery' && (
                <div>
                  <div className="relative">
                    <Input
                      label="كلمة المرور"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      leftIcon={<Lock className="w-4 h-4" />}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-8 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                      aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {mode === 'login' && (
                    <div className="flex justify-end mt-1.5">
                      <button
                        type="button"
                        onClick={() => setMode('recovery')}
                        className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer font-medium"
                      >
                        نسيت كلمة المرور؟
                      </button>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                variant="accent"
                size="md"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 font-bold flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                <span>
                  {mode === 'login'
                    ? `الدخول كـ ${selectedRole === 'student' ? 'طالب' : 'مقدم خدمة'}`
                    : mode === 'register'
                    ? `إنشاء حساب كـ ${selectedRole === 'student' ? 'طالب' : 'مقدم خدمة'}`
                    : 'إرسال رابط استعادة كلمة المرور'}
                </span>
              </Button>

              {mode === 'recovery' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  >
                    ← العودة إلى تسجيل الدخول
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Social Single Sign-On */}
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
            <div className="text-center text-[11px] text-slate-400">أو سجّل الدخول باستخدام:</div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isSubmitting}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
              >
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">G</span>
                <span>حساب Google الحقيقي</span>
              </button>
            </div>
          </div>

        </div>

        {/* Back to Home link */}
        <div className="text-center">
          <button
            onClick={() => onNavigate('landing')}
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <span>العودة إلى الصفحة الرئيسية لمنصة أعالي</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};
