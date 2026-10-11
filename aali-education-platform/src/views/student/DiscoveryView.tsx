import React, { useState, useId } from 'react';
import { ActiveView, EducationalService, ServiceCategory } from '../../types';
import { usePlatformData } from '../../firebase/PlatformDataContext';
import { useAuth } from '../../firebase/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  BookOpen, 
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  GraduationCap,
  Heart,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DiscoveryViewProps {
  onNavigate: (view: ActiveView, extraId?: string) => void;
  onSelectCourse: (courseId: string) => void;
  onEnroll: (course: EducationalService) => void;
}

export const DiscoveryView: React.FC<DiscoveryViewProps> = ({
  onNavigate,
  onSelectCourse,
  onEnroll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'seats' | 'price'>('rating');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { services, providers, categories, savedServiceIds, toggleSavedService, catalogLoading, catalogError } = usePlatformData();
  const { userProfile } = useAuth();
  const approvedProviderIds = new Set(providers
    .filter((provider) => provider.accredited || provider.verificationStatus === 'approved')
    .map((provider) => provider.id));

  const searchInputId = useId();

  // Autocomplete preview suggestions
  const searchSuggestions = searchQuery.trim().length > 1
    ? services.filter(c => c.status === 'active' && approvedProviderIds.has(c.providerId) && (
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.providerName.toLowerCase().includes(searchQuery.toLowerCase())
      )).slice(0, 4)
    : [];

  const handleToggleSave = async (courseId: string, title: string) => {
    if (userProfile?.role !== 'student') {
      showToast('سجّل الدخول بحساب طالب لحفظ البرامج.');
      onNavigate('auth-login');
      return;
    }
    try {
      const wasSaved = savedServiceIds.includes(courseId);
      await toggleSavedService(courseId);
      showToast(wasSaved ? `تمت إزالة «${title}» من المحفوظات` : `تم حفظ «${title}» في المفضلة`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'تعذر حفظ البرنامج حالياً.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter logic
  const filteredCourses = services.filter((c) => c.status === 'active' && approvedProviderIds.has(c.providerId)).filter((c) => {
    const matchesQuery =
      searchQuery.trim() === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesMode = selectedMode === 'all' || c.mode === selectedMode;
    const matchesLevel = selectedLevel === 'all' || c.level.includes(selectedLevel);

    return matchesQuery && matchesCat && matchesMode && matchesLevel;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'seats') return b.seatsAvailable - a.seatsAvailable;
    if (sortBy === 'price') return a.numericPrice - b.numericPrice;
    return 0;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedMode('all');
    setSelectedLevel('all');
    setSortBy('rating');
  };

  const popularKeywords = ['آيلتس', 'تأسيس قدرات', 'برمجة بايثون', 'لغة إنجليزية', 'روبوت وذكاء اصطناعي'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast feedback notification */}
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
      {catalogLoading && <p role="status" className="text-xs text-slate-500">جارٍ تحميل البرامج والقطاعات من قاعدة البيانات…</p>}
      {catalogError && <p role="alert" className="text-xs text-rose-700">تعذر تحميل بيانات المنصة: {catalogError}</p>}

      {/* Breadcrumb */}
      <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-sm text-slate-500">
        <button
          onClick={() => onNavigate('landing')}
          className="hover:text-indigo-600 transition-colors cursor-pointer"
        >
          الرئيسية
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-slate-900 font-medium">دليل البرامج والخدمات التعليمية</span>
      </nav>

      {/* Header and Search Strip */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            استكشف البرامج والخدمات الأكاديمية
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            قارن بين مئات البرامج المعتمدة في المدارس والمعاهد والجامعات والمراكز التدريبية.
          </p>
        </div>

        {/* Search input with autocomplete support */}
        <div className="w-full lg:w-96 relative">
          <label htmlFor={searchInputId} className="sr-only">ابحث باسم الدورة أو المؤسسة</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3.5" aria-hidden="true" />
            <input
              id={searchInputId}
              type="search"
              placeholder="ابحث باسم الدورة أو المؤسسة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-12 bg-white border border-slate-300 rounded-xl ps-9 pe-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-2xs"
            />
          </div>

          {/* Autocomplete Dropdown Preview */}
          {searchSuggestions.length > 0 && (
            <div className="absolute top-full start-0 end-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-30 p-2 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">مقترحات البحث السريع</div>
              {searchSuggestions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSearchQuery(item.title);
                    onSelectCourse(item.id);
                  }}
                  className="w-full text-start p-2 rounded-lg hover:bg-indigo-50 flex items-center justify-between text-xs text-slate-800 transition-colors cursor-pointer group"
                >
                  <div className="truncate max-w-[240px]">
                    <div className="font-semibold text-slate-900 group-hover:text-indigo-700 truncate">{item.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{item.providerName}</div>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-600 shrink-0">
                    {item.numericPrice.toLocaleString()} {item.currency}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popular Search Keywords Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-sm">
        <span className="text-slate-600 font-medium">بحث رائج:</span>
        {popularKeywords.map((kw, i) => (
          <button
            key={i}
            onClick={() => setSearchQuery(kw)}
            className="min-h-10 px-3 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-sm transition-colors cursor-pointer"
          >
            {kw}
          </button>
        ))}
      </div>

      {/* Mobile filter toggle */}
      <div className="lg:hidden flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
          leftIcon={<SlidersHorizontal className="w-4 h-4" />}
        >
          {isMobileFiltersOpen ? 'إخفاء الفلاتر' : 'تصفية النتائج'}
        </Button>
        <span className="text-sm text-slate-600">{filteredCourses.length} برنامج متاح</span>
      </div>

      {/* Layout Grid: Filters (3 cols) + Results (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Filters Sidebar */}
        <aside
          className={`${
            isMobileFiltersOpen ? 'block' : 'hidden'
          } lg:block lg:col-span-3 space-y-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-card`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>فلاتر البحث</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة ضبط</span>
            </button>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800 block">التصنيف التعليمي</label>
            <div className="space-y-1 text-sm">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full min-h-11 text-start px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-50 font-bold text-indigo-950 border border-indigo-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                جميع التصنيفات
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full min-h-11 text-start px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-50 font-bold text-indigo-950 border border-indigo-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.nameAr}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Filter */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <label className="text-sm font-bold text-slate-800 block">طريقة الدراسة والحضور</label>
            <div className="space-y-1 text-sm">
              <button
                onClick={() => setSelectedMode('all')}
                className={`w-full min-h-11 text-start px-3 py-2.5 rounded-lg cursor-pointer ${
                  selectedMode === 'all' ? 'bg-indigo-50 font-bold text-indigo-950 border border-indigo-200' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setSelectedMode('online')}
                className={`w-full min-h-11 text-start px-3 py-2.5 rounded-lg cursor-pointer ${
                  selectedMode === 'online' ? 'bg-indigo-50 font-bold text-indigo-950 border border-indigo-200' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                عن بُعد (أونلاين)
              </button>
              <button
                onClick={() => setSelectedMode('hybrid')}
                className={`w-full min-h-11 text-start px-3 py-2.5 rounded-lg cursor-pointer ${
                  selectedMode === 'hybrid' ? 'bg-indigo-50 font-bold text-indigo-950 border border-indigo-200' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                تعليم مدمج (هجين)
              </button>
              <button
                onClick={() => setSelectedMode('on-campus')}
                className={`w-full min-h-11 text-start px-3 py-2.5 rounded-lg cursor-pointer ${
                  selectedMode === 'on-campus' ? 'bg-indigo-50 font-bold text-indigo-950 border border-indigo-200' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                حضوري بالمقر
              </button>
            </div>
          </div>

          {/* Level Filter */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <label className="text-sm font-bold text-slate-800 block">المرحلة الدراسية</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full min-h-11 bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm text-slate-700 cursor-pointer focus:ring-2 focus:ring-indigo-600"
            >
              <option value="all">كافة المراحل</option>
              <option value="ثانوية">المرحلة الثانوية</option>
              <option value="متوسط">المرحلة المتوسطة</option>
              <option value="جامعي">التعليم الجامعي</option>
              <option value="جميع">جميع المستويات / عام</option>
            </select>
          </div>
        </aside>

        {/* Results Main Area (9 cols) */}
        <main className="lg:col-span-9 space-y-5 min-w-0">
          {/* Top Sort and Count Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 pb-2">
            <span className="font-semibold text-slate-800">
              عرض {filteredCourses.length} برنامج وخدمة تعليمية متاحة
            </span>
            <div className="flex items-center gap-2">
              <span>ترتيب حسب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="min-h-11 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 cursor-pointer focus:ring-2 focus:ring-indigo-600"
              >
                <option value="rating">الأعلى تقييماً ★</option>
                <option value="seats">أكثر المقاعد الشاغرة</option>
                <option value="price">الأقل سعراً أولاً</option>
              </select>
            </div>
          </div>

          {/* Empty state per UI UX Pro Max UX rule: Show suggestions instead of bare blank */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-4">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">لم يتم العثور على برامج تطابق هذه المعايير</h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto">
                  جرب تغيير كلمات البحث أو إزالة بعض الفلاتر للاطلاع على مئات البرامج الأكاديمية الأخرى.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
              >
                إعادة ضبط جميع الفلاتر
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredCourses.map((course) => {
                const isSaved = savedServiceIds.includes(course.id);
                return (
                  <Card key={course.id} hoverable className="flex flex-col justify-between">
                    <div>
                      <CardHeader className="relative">
                        <div className="flex items-center justify-between gap-2 mb-2 pe-8">
                          <span className="text-sm font-semibold text-indigo-700 truncate max-w-[180px]">
                            {course.providerName}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-semibold text-slate-800 shrink-0">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{course.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Save Favorite Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSave(course.id, course.title);
                          }}
                          className={`absolute top-5 end-5 p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isSaved
                              ? 'bg-rose-50 border-rose-200 text-rose-600'
                              : 'bg-white/80 border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-50'
                          }`}
                          aria-label={isSaved ? "إزالة من المفضلة" : "حفظ في المفضلة"}
                        >
                          <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
                        </button>

                        <CardTitle className="text-base leading-snug">
                          {course.title}
                        </CardTitle>

                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mt-3">
                          {course.level.trim() && (
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-medium">
                              {course.level}
                            </span>
                          )}
                          {course.duration.trim() && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {course.duration}
                            </span>
                          )}
                          <span className="text-slate-600 font-medium">
                            {course.mode === 'online' ? 'أونلاين' : course.mode === 'hybrid' ? 'مدمج' : 'حضوري'}
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent>
                        {course.description.trim() && (
                          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                            {course.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-100">
                          <div>
                            <span className="text-slate-500 block text-xs">الرسوم المقررة:</span>
                            <span className="text-sm font-bold text-slate-900 tabular-nums">
                              {course.numericPrice.toLocaleString()} {course.currency}
                            </span>
                          </div>
                          <div className="text-end">
                            <span className="text-slate-500 block text-xs">المقاعد الشاغرة:</span>
                            <span className="text-sm font-semibold text-emerald-700">
                              {course.seatsAvailable} مقعد
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    <CardFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectCourse(course.id)}
                      >
                        التفاصيل والمنهج
                      </Button>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => onEnroll(course)}
                      >
                        تسجيل وحجز
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
