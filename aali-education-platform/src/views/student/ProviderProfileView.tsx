import React, { useState } from 'react';
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
}

export const ProviderProfileView: React.FC<ProviderProfileViewProps> = ({
  providerId,
  onNavigate,
  onSelectCourse,
}) => {
  const { providers, services } = usePlatformData();
  const provider = providers.find((p) => p.id === providerId && (p.accredited || p.verificationStatus === 'approved'));
  const providerServices = services.filter((s) => s.providerId === providerId && s.status === 'active');
  const [activeTab, setActiveTab] = useState<'courses' | 'about' | 'contact'>('courses');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
        <div className={`h-40 sm:h-48 bg-gradient-to-r ${provider.coverColor || 'from-indigo-900 to-indigo-700'} relative p-6 flex items-end justify-between`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(255,255,255,0.22),transparent_34%),radial-gradient(circle_at_78%_80%,rgba(255,255,255,0.12),transparent_30%)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/20 to-transparent" />
          <Building2 className="absolute bottom-5 start-8 h-28 w-28 text-white/10" aria-hidden="true" />
          <span className="absolute bottom-7 start-10 text-xs font-semibold tracking-[0.22em] text-white/75">AALI · EDUCATION PARTNER</span>
          <div className="absolute top-4 end-4">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-black/25 hover:bg-black/40 text-white backdrop-blur-xs transition-colors cursor-pointer"
              aria-label="مشاركة الرابط"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="p-6 sm:p-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-14 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-md border border-slate-100 shrink-0">
                <div className="w-full h-full rounded-xl bg-indigo-950 text-white flex items-center justify-center font-bold text-3xl">
                  {provider.name[0]}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{provider.name}</h1>
                  <Badge variant="success">
                    <ShieldCheck className="w-3.5 h-3.5 me-1 text-emerald-600" />
                    معتمد على المنصة
                  </Badge>
                </div>
                <div className="text-xs text-slate-500 font-mono">{provider.nameEn}</div>
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
              <div className="font-bold text-slate-900 text-sm">{provider.establishedYear || 'غير مسجلة'}</div>
            </div>

            <div>
              <div className="text-slate-500 mb-0.5">المدينة والمقر</div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{provider.city}</span>
              </div>
            </div>

            <div>
              <div className="text-slate-500 mb-0.5">رقم الترخيص الرسمي</div>
              <div className="font-mono font-bold text-indigo-700 text-xs truncate">
                {provider.verifiedLicenseNumber || provider.licenseNumber || 'غير مسجل'}
              </div>
            </div>
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
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 text-xs font-semibold">
                        {service.level}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-800">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{service.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <CardTitle className="text-base">{service.title}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {service.duration}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{service.mode === 'online' ? 'أونلاين' : service.mode === 'hybrid' ? 'مدمج' : 'حضوري'}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {service.description}
                    </p>
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
            <p className="text-sm text-slate-600 leading-relaxed">
              {provider.description}
            </p>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">الخدمات المسجلة:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {provider.servicesOffered.map((srv, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h3 className="text-sm font-bold text-slate-900">الاعتماد الأكاديمي والرقابي:</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {provider.accreditationBody || 'لم تُسجّل جهة الإشراف في ملف المؤسسة.'}
              </p>
            </div>
          </div>

          <div className="md:col-span-4 space-y-4">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">الكلمات المفتاحية والوسوم</h3>
              <div className="flex flex-wrap gap-1.5">
                {provider.tags.map((t, idx) => (
                  <span key={idx} className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700">
                    #{t}
                  </span>
                ))}
              </div>
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
                <span dir="ltr" className="font-semibold text-slate-900">{provider.contactEmail}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Phone className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-slate-400 block text-[10px]">الهاتف المباشر:</span>
                <span dir="ltr" className="font-semibold text-slate-900">{provider.contactPhone}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <div>
                <span className="text-slate-400 block text-[10px]">العنوان والمقر:</span>
                <span className="font-semibold text-slate-900">{provider.address || `${provider.city}، المملكة العربية السعودية`}</span>
              </div>
            </div>

            {provider.website && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Globe className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="text-slate-400 block text-[10px]">الموقع الإلكتروني الرسمي:</span>
                  <a href={provider.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-semibold" dir="ltr">
                    {provider.website}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
