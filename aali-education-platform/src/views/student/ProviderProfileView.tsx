import React, { useEffect, useState } from 'react';
import { ActiveView, EducationalProvider, EducationalService } from '../../types';
import { usePlatformData } from '../../firebase/PlatformDataContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { 
  Building2, 
  MapPin, 
  Star, 
  Mail, 
  Phone, 
  Globe, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Award, 
  ArrowLeft,
  BookOpen,
  Share2,
  Clock,
  Sparkles
} from 'lucide-react';

interface ProviderProfileViewProps {
  providerId: string;
  onNavigate: (view: ActiveView, extraId?: string) => void;
  onSelectCourse: (courseId: string) => void;
  providerOverride?: EducationalProvider;
  editMode?: boolean;
  isSaving?: boolean;
  saveNotice?: { type: 'success' | 'error'; message: string } | null;
  onProviderChange?: (changes: Partial<EducationalProvider>) => void;
  onPreviewImage?: (file: File | undefined, key: 'logoUrl' | 'bannerImageUrl') => void;
  onPreviewGalleryImages?: (files: FileList | null) => void;
  onSaveChanges?: () => void;
  onCancelEdit?: () => void;
}

const externalUrl = (value: string) => {
  if (!value.trim()) return '';
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : '';
  } catch {
    return '';
  }
};

const imageSource = (value: string) => {
  if (value.startsWith('blob:')) return value;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  return externalUrl(value);
};

const socialLabels: Record<string, string> = {
  instagram: 'إنستغرام',
  facebook: 'فيسبوك',
  linkedin: 'لينكدإن',
  youtube: 'يوتيوب',
  tiktok: 'تيك توك',
  whatsapp: 'واتساب',
};

export const ProviderProfileView: React.FC<ProviderProfileViewProps> = ({
  providerId,
  onNavigate,
  onSelectCourse,
  providerOverride,
  editMode = false,
  isSaving = false,
  saveNotice,
  onProviderChange,
  onPreviewImage,
  onPreviewGalleryImages,
  onSaveChanges,
  onCancelEdit,
}) => {
  const { providers, services } = usePlatformData();
  const provider = providerOverride
    || providers.find((p) => p.id === providerId && (p.accredited || p.verificationStatus === 'approved'));
  const providerServices = services.filter((s) => s.providerId === providerId && s.status === 'active');
  const [activeTab, setActiveTab] = useState<'courses' | 'about' | 'contact'>('courses');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [failedBannerUrl, setFailedBannerUrl] = useState('');
  const [failedLogoUrl, setFailedLogoUrl] = useState('');
  useEffect(() => {
    setFailedBannerUrl('');
    setFailedLogoUrl('');
  }, [provider?.id, provider?.bannerUrl, provider?.bannerImageUrl, provider?.logoUrl]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = () => {
    showToast('تم نسخ رابط الملف التعريفي للمؤسسة بنجاح!');
  };

  if (!provider) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-sm text-slate-600">لم نتمكن من العثور على بيانات هذه المؤسسة في قاعدة البيانات.</div>;
  }

  const bannerImage = imageSource(editMode
    ? provider.bannerImageUrl || provider.bannerUrl || ''
    : provider.bannerUrl || provider.bannerImageUrl || '');
  const logoImage = provider.logoUrl ? imageSource(provider.logoUrl) : '';
  const websiteLink = provider.website ? externalUrl(provider.website) : '';
  const inputClass = 'w-full rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
  const inlineInputClass = 'rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';
  const textField = (
    value: string,
    key: keyof EducationalProvider,
    options: { label: string; className?: string; dir?: 'ltr' | 'rtl'; type?: string } ,
  ) => editMode ? (
    <label className="block space-y-1">
      <span className="text-[10px] font-medium text-slate-500">{options.label}</span>
      <input
        type={options.type || 'text'}
        dir={options.dir}
        className={options.className || inputClass}
        value={value}
        onChange={(event) => onProviderChange?.({ [key]: event.target.value })}
      />
    </label>
  ) : value;

  const updateAddress = (key: keyof NonNullable<EducationalProvider['addressDetails']>, value: string) => {
    if (!onProviderChange) return;
    onProviderChange({
      addressDetails: {
        country: provider.addressDetails?.country || '',
        city: provider.addressDetails?.city || '',
        district: provider.addressDetails?.district || '',
        street: provider.addressDetails?.street || '',
        number: provider.addressDetails?.number || '',
        [key]: value,
      },
    });
  };

  const updateSocialLink = (key: keyof NonNullable<EducationalProvider['socialLinks']>, value: string) => {
    onProviderChange?.({ socialLinks: { ...provider.socialLinks, [key]: value } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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

      {editMode && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
          <div>
            <h2 className="font-bold text-indigo-950">أنت الآن تعدّل صفحة المؤسسة كما تظهر للزوار</h2>
            <p className="mt-1 text-xs text-indigo-800">اضغط على المعلومات داخل الصفحة لتعديلها، ثم احفظ التغييرات.</p>
          </div>
          <div className="flex items-center gap-2">
            {onCancelEdit && <Button type="button" variant="outline" onClick={onCancelEdit}>إلغاء</Button>}
            <Button type="button" variant="primary" disabled={isSaving} onClick={onSaveChanges}>
              {isSaving ? 'جارٍ الحفظ…' : 'حفظ تعديلات الصفحة'}
            </Button>
          </div>
          {saveNotice && (
            <p role={saveNotice.type === 'error' ? 'alert' : 'status'} className={`w-full rounded-lg px-3 py-2 text-xs ${saveNotice.type === 'error' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {saveNotice.message}
            </p>
          )}
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
          دليل المؤسسات
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-slate-900 font-medium">{provider.name}</span>
      </nav>

      {/* Header Profile Cover Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft-card">
        {/* Cover gradient */}
        <div
          className={`h-40 sm:h-48 relative overflow-hidden bg-gradient-to-r ${provider.coverColor || 'from-indigo-900 to-indigo-700'} p-6 flex items-end justify-between`}
        >
          {bannerImage && failedBannerUrl !== bannerImage && (
            <img
              src={bannerImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setFailedBannerUrl(bannerImage)}
            />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(255,255,255,0.22),transparent_34%),radial-gradient(circle_at_78%_80%,rgba(255,255,255,0.12),transparent_30%)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/20 to-transparent" />
          <Building2 className="absolute bottom-5 start-8 h-28 w-28 text-white/10" aria-hidden="true" />
          <span className="absolute bottom-7 start-10 text-xs font-semibold tracking-[0.22em] text-white/75">AALI · EDUCATION PARTNER</span>
          <div className="absolute top-4 end-4">
            {editMode ? (
              <label className="block max-w-56 rounded-xl bg-slate-950/70 p-3 text-xs text-white">
                <span className="mb-2 block font-semibold">صورة البنر · معاينة فورية</span>
                <input type="file" accept="image/*" onChange={(event) => onPreviewImage?.(event.target.files?.[0], 'bannerImageUrl')} className="block w-full text-[10px]" />
                <span className="mt-2 block">أو أدخل رابط الصورة</span>
                <input
                  type="url"
                  dir="ltr"
                  aria-label="رابط صورة البنر"
                  className="mt-1 w-full rounded-md px-2 py-1 text-slate-900"
                  value={provider.bannerImageUrl?.startsWith('blob:') ? '' : provider.bannerImageUrl || ''}
                  placeholder="https://"
                  onChange={(event) => onProviderChange?.({ bannerImageUrl: event.target.value })}
                />
              </label>
            ) : (
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-black/25 hover:bg-black/40 text-white backdrop-blur-xs transition-colors cursor-pointer"
                aria-label="مشاركة الرابط"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="p-6 sm:p-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-14 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-md border border-slate-100 shrink-0">
                {editMode ? (
                  <label className="relative block h-full w-full cursor-pointer">
                    {logoImage && failedLogoUrl !== logoImage
                      ? <img src={logoImage} alt={`شعار ${provider.name}`} onError={() => setFailedLogoUrl(logoImage)} className="w-full h-full rounded-xl object-cover" />
                      : <div className="w-full h-full rounded-xl bg-indigo-950 text-white flex items-center justify-center font-bold text-3xl">{provider.name.trim()[0] || 'م'}</div>}
                    <span className="absolute inset-x-0 bottom-0 rounded-b-xl bg-slate-950/75 px-1 py-1 text-center text-[9px] text-white">تغيير الشعار</span>
                    <input type="file" accept="image/*" className="sr-only" onChange={(event) => onPreviewImage?.(event.target.files?.[0], 'logoUrl')} />
                  </label>
                ) : logoImage && failedLogoUrl !== logoImage ? (
                  <img src={logoImage} alt={`شعار ${provider.name}`} onError={() => setFailedLogoUrl(logoImage)} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <div className="w-full h-full rounded-xl bg-indigo-950 text-white flex items-center justify-center font-bold text-3xl">{provider.name.trim()[0] || 'م'}</div>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {textField(provider.name, 'name', { label: 'اسم المؤسسة', className: `${inlineInputClass} text-xl font-bold` })}
                  </h1>
                  <Badge variant="success">
                    <ShieldCheck className="w-3.5 h-3.5 me-1 text-emerald-600" />
                    معتمد على المنصة
                  </Badge>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {textField(provider.nameEn, 'nameEn', { label: 'الاسم بالإنجليزية', dir: 'ltr', className: inlineInputClass })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="accent"
                size="md"
                onClick={() => setActiveTab('courses')}
              >
                استعراض البرامج ({providerServices.length})
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <div className="text-slate-500 mb-0.5">التقييم العام</div>
              <div className="flex items-center gap-1 font-bold text-slate-900 text-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{provider.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({provider.reviewsCount} تقييم)</span>
              </div>
            </div>

            <div>
              <div className="text-slate-500 mb-0.5">سنة التأسيس</div>
              <div className="font-bold text-slate-900 text-sm">
                {editMode
                  ? <input type="number" min="0" className={inlineInputClass} value={provider.establishedYear || ''} aria-label="سنة التأسيس" onChange={(event) => onProviderChange?.({ establishedYear: event.target.value ? Number(event.target.value) : undefined })} />
                  : provider.establishedYear || 'غير مسجلة'}
              </div>
            </div>

            <div>
              <div className="text-slate-500 mb-0.5">المدينة والمقر</div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{textField(provider.city, 'city', { label: 'المدينة', className: inlineInputClass })}</span>
              </div>
            </div>

            <div>
              <div className="text-slate-500 mb-0.5">رقم الترخيص الرسمي</div>
              <div className="font-mono font-bold text-indigo-700 text-xs truncate">
                {editMode
                  ? <input className={inlineInputClass} value={provider.verifiedLicenseNumber || ''} aria-label="رقم الترخيص الرسمي" onChange={(event) => onProviderChange?.({ verifiedLicenseNumber: event.target.value })} />
                  : provider.verifiedLicenseNumber || provider.licenseNumber || 'غير مسجل'}
              </div>
            </div>
            {editMode && (
              <label className="col-span-2 flex items-center gap-2 text-xs text-slate-700 sm:col-span-4">
                <span className="font-semibold">نوع الجهة</span>
                <select value={provider.category} className={inlineInputClass} onChange={(event) => onProviderChange?.({ category: event.target.value as EducationalProvider['category'] })}>
                  <option value="schools">مدارس</option>
                  <option value="universities">جامعات وكليات</option>
                  <option value="institutes">معاهد</option>
                  <option value="tutors">مدرسون خصوصيون</option>
                  <option value="training_centers">مراكز تدريب</option>
                  <option value="libraries">مكتبات ومراكز بحث</option>
                </select>
                <span className="font-semibold">لون البنر</span>
                <select value={provider.coverColor || 'from-indigo-900 to-indigo-700'} className={inlineInputClass} onChange={(event) => onProviderChange?.({ coverColor: event.target.value })}>
                  <option value="from-indigo-900 to-indigo-700">أزرق</option>
                  <option value="from-violet-900 to-fuchsia-700">بنفسجي</option>
                  <option value="from-emerald-900 to-teal-700">أخضر</option>
                  <option value="from-slate-900 to-slate-700">رمادي</option>
                  <option value="from-rose-900 to-orange-700">مرجاني</option>
                </select>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div role="tablist" aria-label="أقسام ملف المؤسسة" className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('courses')}
          role="tab"
          aria-selected={activeTab === 'courses'}
          className={`px-4 py-2 rounded-xl transition-all font-semibold cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          البرامج والدورات المتاحة ({providerServices.length})
        </button>

        <button
          onClick={() => setActiveTab('about')}
          role="tab"
          aria-selected={activeTab === 'about'}
          className={`px-4 py-2 rounded-xl transition-all font-semibold cursor-pointer ${
            activeTab === 'about'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          نبذة عن المؤسسة والاعتمادات
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          role="tab"
          aria-selected={activeTab === 'contact'}
          className={`px-4 py-2 rounded-xl transition-all font-semibold cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          الموقع وبيانات التواصل
        </button>
      </div>

      {/* Tab 1: Available Courses */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              الدورات والخدمات المقدمة من {provider.name}
            </h2>
            <span className="text-xs text-slate-500">{providerServices.length} برامج منشورة</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providerServices.map((service) => (
              <Card key={service.id} hoverable className="flex flex-col justify-between">
                <div>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {service.level.trim() && (
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-semibold">
                          {service.level}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-800">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{service.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-indigo-950 text-white">
                        {logoImage && failedLogoUrl !== logoImage
                          ? <img src={logoImage} alt="" className="h-full w-full object-cover" onError={() => setFailedLogoUrl(logoImage)} />
                          : <span className="flex h-full w-full items-center justify-center text-xs font-bold">{provider.name.trim()[0] || 'م'}</span>}
                      </div>
                      <CardTitle className="min-w-0 text-base">{service.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                      {service.duration.trim() && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {service.duration}
                        </span>
                      )}
                      <span>{service.mode === 'online' ? 'أونلاين' : service.mode === 'hybrid' ? 'مدمج' : 'حضوري'}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {service.description.trim() && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">الرسوم:</span>
                        <span className="text-sm font-bold text-slate-900 tabular-nums">
                          {service.numericPrice.toLocaleString()} {service.currency}
                        </span>
                      </div>
                      <div className="text-end">
                        <span className="text-slate-400 block text-[10px]">المقاعد الشاغرة:</span>
                        <span className="text-xs font-semibold text-emerald-700">
                          {service.seatsAvailable} مقعد
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectCourse(service.id)}
                  >
                    تفاصيل المنهج
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => onNavigate('checkout', service.id)}
                  >
                    حجز مقعد
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: About & Accreditation */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft-card">
            <h2 className="text-lg font-bold text-slate-900">نبذة تعريفية شاملة</h2>
            {editMode
              ? <textarea rows={5} aria-label="نبذة المؤسسة" className={inputClass} value={provider.description} onChange={(event) => onProviderChange?.({ description: event.target.value })} />
              : <p className="text-sm text-slate-600 leading-relaxed">{provider.description}</p>}

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">الخدمات المسجلة:</h3>
              {editMode
                ? <textarea rows={3} aria-label="الخدمات المقدمة، كل خدمة بسطر" className={inputClass} value={provider.servicesOffered.join('\n')} onChange={(event) => onProviderChange?.({ servicesOffered: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })} />
                : <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {provider.servicesOffered.map((srv, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{srv}</span>
                      </div>
                    ))}
                  </div>}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">الاعتماد الأكاديمي والرقابي:</h3>
              {editMode
                ? <input className={inputClass} aria-label="جهة الاعتماد الأكاديمي" value={provider.accreditationBody || ''} onChange={(event) => onProviderChange?.({ accreditationBody: event.target.value })} />
                : <p className="text-xs text-slate-600 leading-relaxed">{provider.accreditationBody || 'لم تُسجّل جهة الإشراف في ملف المؤسسة.'}</p>}
            </div>

            {editMode && (
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <h3 className="text-sm font-bold text-slate-900">صور صفحة المؤسسة</h3>
                <p className="text-xs text-slate-500">اختيار الملفات يعرضها مؤقتاً في الصفحة. لإظهار الصور للزوار بعد التحديث أدخل رابطاً عاماً للصورة.</p>
                <textarea
                  rows={3}
                  dir="ltr"
                  aria-label="روابط صور المعرض، كل رابط بسطر"
                  className={inputClass}
                  value={(provider.galleryImageUrls || []).filter((url) => !url.startsWith('blob:')).join('\n')}
                  onChange={(event) => onProviderChange?.({
                    galleryImageUrls: [
                      ...event.target.value.split('\n').map((item) => item.trim()).filter(Boolean),
                      ...(provider.galleryImageUrls || []).filter((url) => url.startsWith('blob:')),
                    ],
                  })}
                />
                <input type="file" accept="image/*" multiple aria-label="اختيار صور للمعاينة المؤقتة" onChange={(event) => onPreviewGalleryImages?.(event.target.files)} className="block w-full text-xs" />
              </div>
            )}
            {provider.galleryImageUrls && provider.galleryImageUrls.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">صور المؤسسة:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {provider.galleryImageUrls.map((image, index) => {
                    const source = imageSource(image);
                    return source
                      ? <img key={`${image}-${index}`} src={source} alt={`${provider.name} — صورة ${index + 1}`} className="h-32 w-full rounded-xl object-cover" />
                      : null;
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-4 space-y-4">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">الكلمات المفتاحية والوسوم</h3>
              {editMode
                ? <textarea rows={3} aria-label="الوسوم، كل وسم بسطر" className={inputClass} value={provider.tags.join('\n')} onChange={(event) => onProviderChange?.({ tags: event.target.value.split('\n').map((item) => item.trim()).filter(Boolean) })} />
                : <div className="flex flex-wrap gap-1.5">
                    {provider.tags.map((t, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700">#{t}</span>
                    ))}
                  </div>}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Contact Details */}
      {activeTab === 'contact' && (
        <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-soft-card space-y-5 text-xs">
          <h2 className="text-lg font-bold text-slate-900">معلومات الاتصال والموقع الجغرافي</h2>
          <div className="space-y-3 text-slate-700">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Mail className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-slate-400 block text-[10px]">البريد الإلكتروني للقبول:</span>
                <span dir="ltr" className="font-semibold text-slate-900">
                  {textField(provider.contactEmail, 'contactEmail', { label: 'البريد الإلكتروني', type: 'email', dir: 'ltr' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Phone className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-slate-400 block text-[10px]">الهاتف المباشر:</span>
                <span dir="ltr" className="font-semibold text-slate-900">
                  {textField(provider.contactPhone, 'contactPhone', { label: 'رقم الجوال', type: 'tel', dir: 'ltr' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-slate-400 block text-[10px]">العنوان والمقر:</span>
                <span className="font-semibold text-slate-900">
                  {textField(
                    provider.address || (provider.addressDetails
                      ? [provider.addressDetails.number, provider.addressDetails.street, provider.addressDetails.district, provider.addressDetails.city, provider.addressDetails.country].filter(Boolean).join('، ')
                      : `${provider.city}، المملكة العربية السعودية`),
                    'address',
                    { label: 'العنوان العام' },
                  )}
                </span>
              </div>
            </div>

            {(provider.contactPerson || editMode) && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <div><span className="text-slate-400 block text-[10px]">الشخص المسؤول:</span><span className="font-semibold text-slate-900">{textField(provider.contactPerson || '', 'contactPerson', { label: 'الشخص المسؤول' })}</span></div>
              </div>
            )}
            {(provider.landline || editMode) && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Phone className="w-4 h-4 text-indigo-600" />
                <div><span className="text-slate-400 block text-[10px]">الهاتف الأرضي:</span><span dir="ltr" className="font-semibold text-slate-900">{textField(provider.landline || '', 'landline', { label: 'الهاتف الأرضي', type: 'tel', dir: 'ltr' })}</span></div>
              </div>
            )}
            {(provider.workingHours || editMode) && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Clock className="w-4 h-4 text-indigo-600" />
                <div><span className="text-slate-400 block text-[10px]">ساعات الدوام:</span><span className="font-semibold text-slate-900">{textField(provider.workingHours || '', 'workingHours', { label: 'ساعات الدوام' })}</span></div>
              </div>
            )}

            {(websiteLink || editMode) && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Globe className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="text-slate-400 block text-[10px]">الموقع الإلكتروني الرسمي:</span>
                  {editMode
                    ? <input type="url" dir="ltr" aria-label="الموقع الإلكتروني" className={inputClass} value={provider.website || ''} onChange={(event) => onProviderChange?.({ website: event.target.value })} placeholder="https://" />
                    : <a href={websiteLink} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-semibold" dir="ltr">{provider.website}</a>}
                </div>
              </div>
            )}

            {((provider.socialLinks && Object.entries(provider.socialLinks).some(([, url]) => Boolean(url))) || editMode) && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="mb-3 font-bold text-slate-900">تابعونا على مواقع التواصل</h3>
                <div className="flex flex-wrap gap-2">
                  {(editMode
                    ? Object.keys(socialLabels).map((network) => [network, provider.socialLinks?.[network as keyof NonNullable<EducationalProvider['socialLinks']>] || ''])
                    : Object.entries(provider.socialLinks || {}).filter(([, url]) => Boolean(url))
                  ).map(([network, url]) => {
                    if (!url) return null;
                    const href = network === 'whatsapp' && !/^https?:\/\//i.test(url)
                      ? `https://wa.me/${url.replace(/\D/g, '')}`
                      : externalUrl(url);
                    if (!editMode && (!href || href === 'https://wa.me/')) return null;
                    if (editMode) {
                      const socialKey = network as keyof NonNullable<EducationalProvider['socialLinks']>;
                      return (
                        <label key={network} className="min-w-40 flex-1 space-y-1">
                          <span className="block text-[10px] font-medium text-slate-500">{socialLabels[network] || network}</span>
                          <input
                            dir="ltr"
                            className={inputClass}
                            value={provider.socialLinks?.[socialKey] || ''}
                            onChange={(event) => updateSocialLink(socialKey, event.target.value)}
                            placeholder={network === 'whatsapp' ? 'رقم أو رابط wa.me' : 'https://'}
                          />
                        </label>
                      );
                    }
                    if (!href || href === 'https://wa.me/') return null;
                    return (
                      <a key={network} href={href} target="_blank" rel="noreferrer" dir="ltr" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-indigo-700 hover:bg-indigo-50">
                        {socialLabels[network] || network}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
