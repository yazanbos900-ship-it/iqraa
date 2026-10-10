import React, { useState } from 'react';
import { ActiveView, EducationalProvider, EducationalService } from '../types';
import { usePlatformData } from '../firebase/PlatformDataContext';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { HeroImageBanner } from '../components/banner/HeroImageBanner';
import { 
  Search, 
  MapPin, 
  Star, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  Users, 
  Award, 
  Library, 
  CheckCircle2, 
  ArrowLeft, 
  Mail, 
  Phone, 
  Clock, 
  Layers, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Calendar,
  Globe
} from 'lucide-react';

const PROVIDER_MEDIA: Record<string, { image: string; logo: string }> = {
  'prov-1': {
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
  },
  'prov-2': {
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=150&auto=format&fit=crop&q=80',
  },
  'prov-3': {
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=150&auto=format&fit=crop&q=80',
  },
  'prov-4': {
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  'prov-5': {
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=150&auto=format&fit=crop&q=80',
  },
  'prov-6': {
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=150&auto=format&fit=crop&q=80',
  },
};

interface LandingPageProps {
  onNavigate: (view: ActiveView, extraId?: string) => void;
  onSelectCourse?: (courseId: string) => void;
  onSelectProvider?: (providerId: string) => void;
  onEnroll?: (course: EducationalService) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onNavigate,
  onSelectCourse,
  onSelectProvider,
  onEnroll,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [previewProvider, setPreviewProvider] = useState<EducationalProvider | null>(null);
  const { providers, services, categories } = usePlatformData();
  const publicProviders = providers.filter((provider) => provider.accredited || provider.verificationStatus === 'approved');
  const publicProviderIds = new Set(publicProviders.map((provider) => provider.id));
  const publicServices = services.filter((service) => service.status === 'active' && publicProviderIds.has(service.providerId));
  const availableCities = Array.from(new Set(
    publicProviders
      .map((provider) => provider.city)
      .filter((city): city is string => Boolean(city))
  )).sort((first, second) => first.localeCompare(second, 'ar'));

  // Icon mapping helper
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-indigo-600" />;
      case 'Building2': return <Building2 className="w-5 h-5 text-indigo-600" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-indigo-600" />;
      case 'Users': return <Users className="w-5 h-5 text-indigo-600" />;
      case 'Award': return <Award className="w-5 h-5 text-indigo-600" />;
      case 'Library': return <Library className="w-5 h-5 text-indigo-600" />;
      default: return <BookOpen className="w-5 h-5 text-indigo-600" />;
    }
  };

  const filteredProviders = publicProviders.filter((provider) => {
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory;
    const matchesCity = selectedCity === 'all' || provider.city === selectedCity;
    const matchesSearch =
      searchQuery.trim() === '' ||
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesCity && matchesSearch;
  });

  return (
    <div className="space-y-14 pb-16">
      {/* 1. Editable hero and directory search */}
      <HeroImageBanner
        onNavigate={onNavigate}
        searchContent={(
          <div className="max-w-6xl">
            <div className="grid grid-cols-1 gap-2.5 rounded-xl border border-white/70 bg-white p-2.5 shadow-soft-card md:grid-cols-12">
              <div className="relative md:col-span-5">
                <label htmlFor="provider-search" className="sr-only">ابحث عن مؤسسة تعليمية</label>
                <Search className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input
                  id="provider-search"
                  type="search"
                  placeholder="اسم المؤسسة أو التخصص"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 ps-11 text-sm text-slate-900 placeholder:text-slate-500 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-300/60"
                />
              </div>

              <label className="md:col-span-3">
                <span className="sr-only">التصنيف التعليمي</span>
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="h-12 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-300/60"
                >
                  <option value="all">كل المجالات التعليمية</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.nameAr}</option>
                  ))}
                </select>
              </label>

              <label className="md:col-span-2">
                <span className="sr-only">المدينة</span>
                <select
                  value={selectedCity}
                  onChange={(event) => setSelectedCity(event.target.value)}
                  className="h-12 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-300/60"
                >
                  <option value="all">كل المدن</option>
                  {availableCities.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
              </label>

              <Button
                variant="accent"
                size="md"
                className="h-12 w-full md:col-span-2"
                onClick={() => document.getElementById('providers')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                ابحث الآن
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-100">
              <span>{publicProviders.length} مؤسسة تعليمية معتمدة</span>
              <button
                onClick={() => onNavigate('auth-register')}
                className="font-semibold text-white underline decoration-white/50 underline-offset-4 transition-colors hover:text-amber-200"
              >
                تمثل مؤسسة؟ انضم إلى أعالي
              </button>
            </div>
          </div>
        )}
      />

      {/* 2. Educational Categories Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
              القطاعات التعليمية المشمولة
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              مجالات الخدمات على منصة أعالي
            </h2>
          </div>
          <button
            onClick={() => onNavigate('discovery')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>استعراض كافة البرامج</span>
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => {
            const count = publicProviders.filter((p) => p.category === cat.id).length;

            return (
              <div
                key={cat.id}
                onClick={() => onNavigate('discovery')}
                className="p-6 rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-xs transition-all duration-200 text-start cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {getCategoryIcon(cat.iconName)}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors">
                  {cat.nameAr}
                </h3>
                <div className="text-xs text-slate-400 mb-2 font-mono">
                  {cat.nameEn}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {cat.descriptionAr}
                </p>
                <div className="text-xs text-slate-500 flex items-center justify-between pt-3 border-t border-slate-100">
                  <span>{count > 0 ? `${count} مزود معتمد` : 'متاح للتسجيل'}</span>
                  <span className="text-indigo-600 font-semibold group-hover:underline">تصفح البرامج ←</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Educational Courses & Programs (New in Redesign) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              برامج دراسية مختارة
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              أبرز البرامج والدورات الأكاديمية
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('discovery')}
          >
            عرض جميع البرامج ({publicServices.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publicServices.slice(0, 3).map((service) => (
            <Card key={service.id} hoverable className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-indigo-700 truncate max-w-[170px]">
                      {service.providerName}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-800 shrink-0">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{service.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <CardTitle className="text-base leading-snug">
                    {service.title}
                  </CardTitle>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {service.level}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {service.duration}
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">الرسوم المقررة:</span>
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
                  onClick={() => onSelectCourse ? onSelectCourse(service.id) : onNavigate('course-details', service.id)}
                >
                  المنهج والتفاصيل
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => onEnroll ? onEnroll(service) : onNavigate('checkout', service.id)}
                >
                  طلب تسجيل
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Featured Educational Providers Catalog */}
      <section id="providers" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>دليل الاعتماد الأكاديمي والمهني</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              مزودو الخدمات التعليمية المعتمدون على المنصة
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              تصفح البرامج المنشورة ومعلومات مزودي الخدمة المتاحة، وابحث حسب المجال أو المدينة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <span className="text-sm text-slate-600" aria-live="polite">
              عرض {filteredProviders.length} من {publicProviders.length} مؤسسة
            </span>
            {(searchQuery || selectedCategory !== 'all' || selectedCity !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedCity('all');
                }}
                className="text-sm font-semibold text-indigo-700 underline underline-offset-4 hover:text-indigo-900"
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>

        {/* Provider Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.length > 0 ? filteredProviders.map((provider) => {
              const media = PROVIDER_MEDIA[provider.id] || {
                image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
                logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
              };
              const categoryConfig = categories.find((c) => c.id === provider.category);

              return (
                <div 
                  key={provider.id}
                  className="group bg-white rounded-3xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Card Header Media & Banner */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                      <img 
                        src={media.image} 
                        alt={provider.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                      {/* Top Banner Badges */}
                      <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between gap-2 z-10">
                        <span className="bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm border border-white/50">
                          {categoryConfig?.nameAr || 'مقدم خدمة تعليمية'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {provider.featured && (
                            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                              مميّز
                            </span>
                          )}
                          {(provider.accredited || provider.verificationStatus === 'approved') && (
                            <span className="bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>معتمد على المنصة</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* City & Established Tag on Banner Bottom */}
                      <div className="absolute bottom-3 end-3.5 flex items-center gap-2 text-xs text-white/90 z-10">
                        <span className="flex items-center gap-1 bg-black/45 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px]">
                          <MapPin className="w-3 h-3 text-indigo-300" />
                          {provider.city}
                        </span>
                        {provider.establishedYear && <span className="flex items-center gap-1 bg-black/45 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px]">
                          <Calendar className="w-3 h-3 text-indigo-300" />
                          تأسس {provider.establishedYear}
                        </span>}
                      </div>
                    </div>

                    {/* Provider Logo Avatar & Title Section */}
                    <div className="p-5 pb-0">
                      <div className="flex items-start justify-between gap-3 -mt-10 relative z-20 mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-md border-2 border-white ring-1 ring-slate-100 overflow-hidden shrink-0">
                          <img 
                            src={media.logo} 
                            alt={provider.name} 
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>

                        {/* Rating Pill */}
                        <div className="flex items-center gap-1.5 bg-amber-50/90 border border-amber-200/80 px-2.5 py-1 rounded-xl shadow-2xs mt-4">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-black text-amber-950">{provider.rating.toFixed(1)}</span>
                          <span className="text-[11px] text-amber-700/80 font-medium">({provider.reviewsCount})</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {provider.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                          {provider.nameEn}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mt-2.5">
                        {provider.description}
                      </p>

                      {/* Services and Programs Chips */}
                      <div className="mt-3.5 space-y-1.5">
                        <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                          <span>أبرز البرامج والمسارات:</span>
                          <span className="text-[10px] text-indigo-600 font-semibold">{provider.servicesOffered.length} خدمات</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {provider.servicesOffered.map((srv, idx) => (
                            <span 
                              key={idx} 
                              className="text-[11px] font-medium bg-slate-100/80 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60 transition-colors hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                            >
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Official Accreditation Council Badge */}
                      {provider.accreditationBody && (
                        <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-600 truncate">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{provider.accreditationBody}</span>
                          </div>
                          {provider.verifiedLicenseNumber && (
                            <span className="font-mono text-[10px] font-semibold text-slate-400 shrink-0 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {provider.verifiedLicenseNumber.split('-')[0]}-{provider.verifiedLicenseNumber.split('-')[1]}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-5 pt-4 mt-2 border-t border-slate-100 flex items-center gap-2">
                    <Button
                      variant="accent"
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-2 shadow-xs"
                      onClick={() => onSelectProvider ? onSelectProvider(provider.id) : onNavigate('provider-profile', provider.id)}
                    >
                      <span>عرض الملف والبرامج</span>
                      <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-2.5 shrink-0 text-slate-600 hover:text-indigo-600"
                      title="موقع المؤسسة أو التواصل"
                      onClick={() => onSelectProvider ? onSelectProvider(provider.id) : onNavigate('provider-profile', provider.id)}
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                <Search className="mx-auto h-6 w-6 text-slate-400" aria-hidden="true" />
                <h3 className="mt-3 text-lg font-bold text-slate-900">ما لقينا مؤسسات تطابق بحثك</h3>
                <p className="mt-1 text-sm text-slate-600">جرّب كلمة بحث مختلفة أو وسّع خيارات التصنيف والمدينة.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedCity('all');
                  }}
                  className="mt-4 text-sm font-semibold text-indigo-700 underline underline-offset-4 hover:text-indigo-900"
                >
                  عرض كل المؤسسات
                </button>
              </div>
            )}
        </div>
      </section>



      {/* 6. Why Aali */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-slate-200 rounded-3xl bg-white p-8 sm:p-12 shadow-xs">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">
              ركائز المنظومة
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              لماذا يختار الطلاب والمؤسسات منصة أعالي؟
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm mb-3.5 border border-emerald-100">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">اعتماد وتدقيق رسمي</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                تراجع الإدارة طلبات الاعتماد قبل إظهار مزود الخدمة في دليل البحث.
              </p>
            </div>

            <div className="text-start">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold text-sm mb-3.5 border border-indigo-100">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">معلومات واضحة للمقارنة</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                اعرض بيانات البرامج والخدمات المسجلة ومعلومات مزودي الخدمة المتاحة.
              </p>
            </div>

            <div className="text-start">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-sm mb-3.5 border border-amber-100">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">طلب تسجيل ومتابعة</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                أرسل طلب التسجيل للمؤسسة وتابع حالته من حسابك. الدفع الإلكتروني غير مفعّل حالياً.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Provider Details Modal (Preview) */}
      {previewProvider && (
        <Modal
          isOpen={!!previewProvider}
          onClose={() => setPreviewProvider(null)}
          title={previewProvider.name}
          description={`${previewProvider.nameEn} · ${previewProvider.city}`}
          maxWidth="lg"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewProvider(null)}
              >
                إغلاق
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const id = previewProvider.id;
                  setPreviewProvider(null);
                  if (onSelectProvider) onSelectProvider(id);
                  else onNavigate('provider-profile', id);
                }}
              >
                عرض الملف الكامل للمؤسسة
              </Button>
            </>
          }
        >
          <div className="space-y-5 text-start">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success">
                <CheckCircle2 className="w-3 h-3 me-1 text-emerald-600" />
                مزود معتمد على المنصة
              </Badge>
              {previewProvider.establishedYear && <Badge variant="neutral">تأسست عام {previewProvider.establishedYear}</Badge>}
              <Badge variant="warning">
                ★ {previewProvider.rating.toFixed(1)} ({previewProvider.reviewsCount} تقييم)
              </Badge>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                نبذة عن المؤسسة
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {previewProvider.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                البرامج والخدمات المقدمة
              </h4>
              <ul className="space-y-1.5">
                {previewProvider.servicesOffered.map((s, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="text-[11px] font-semibold text-slate-500 mb-1">بيانات التواصل:</div>
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span dir="ltr">{previewProvider.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span dir="ltr">{previewProvider.contactPhone}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
