import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Pencil,
  Sparkles, 
  Pause, 
  Play, 
  Trash2, 
  SlidersHorizontal, 
  Check, 
  ArrowLeft,
  X,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../ui/Button';
import { ActiveView } from '../../types';
import { useAuth } from '../../firebase/AuthContext';

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  highlightText?: string;
  imageUrl: string;
  ctaText: string;
  ctaView?: ActiveView;
  secondaryCtaText?: string;
  secondaryView?: ActiveView;
  isCustom?: boolean;
}

const parseBannerItems = (value: unknown): BannerItem[] | null => {
  if (!Array.isArray(value)) return null;
  const parsed = value.filter((item): item is BannerItem => {
    if (!item || typeof item !== 'object') return false;
    const banner = item as Record<string, unknown>;
    return ['id', 'title', 'subtitle', 'badge', 'imageUrl', 'ctaText']
      .every((key) => typeof banner[key] === 'string');
  });
  return parsed.length > 0 ? parsed : null;
};

const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: 'b-1',
    title: 'موسم التسجيل الأكاديمي والجامعي 2026',
    subtitle: 'استكشف المؤسسات وبرامجها المنشورة، وقارن التفاصيل قبل إرسال طلب التسجيل.',
    badge: 'دليل البرامج التعليمية',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop',
    ctaText: 'استكشف البرامج',
    ctaView: 'discovery',
    secondaryCtaText: 'دليل المؤسسات',
    secondaryView: 'discovery',
  },
  {
    id: 'b-2',
    title: 'برامج التقنية واللغات',
    subtitle: 'تعرّف على البرامج المنشورة في المعاهد ومراكز التدريب، واطّلع على متطلباتها ومدتها ورسومها.',
    badge: 'معاهد ومراكز تدريب',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1600&auto=format&fit=crop',
    ctaText: 'تصفح البرامج',
    ctaView: 'discovery',
    secondaryCtaText: 'استعراض معاهد اللغات',
    secondaryView: 'discovery',
  },
  {
    id: 'b-3',
    title: 'خيارات التعليم المدرسي',
    subtitle: 'قارن بين المؤسسات المعتمدة والبرامج المنشورة، ثم تواصل مع المؤسسة لمعرفة تفاصيل القبول.',
    badge: 'المدارس الخاصة',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1600&auto=format&fit=crop',
    ctaText: 'استعراض المدارس',
    ctaView: 'discovery',
    secondaryCtaText: 'طلب استشارة قبول',
    secondaryView: 'discovery',
  },
];

const PRESET_IMAGE_OPTIONS = [
  {
    label: 'حرم جامعي وطلاب',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop',
  },
  {
    label: 'مختبر تقني وبرمجة',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop',
  },
  {
    label: 'فصل دراسي ومدرسة حديثة',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1600&auto=format&fit=crop',
  },
  {
    label: 'مكتبة وقاعة أبحاث',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1600&auto=format&fit=crop',
  },
];

const bannersRef = doc(db, 'siteSettings', 'homepageBanners');

interface HeroImageBannerProps {
  onNavigate: (view: ActiveView, extraId?: string) => void;
  searchContent?: React.ReactNode;
}

export const HeroImageBanner: React.FC<HeroImageBannerProps> = ({ onNavigate, searchContent }) => {
  const { userProfile } = useAuth();
  const canManageBanners = userProfile?.role === 'admin';
  const [banners, setBanners] = useState<BannerItem[]>(DEFAULT_BANNERS);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // New banner form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newBadge, setNewBadge] = useState('عرض تعليمي حصري');
  const [newHighlight, setNewHighlight] = useState('');
  const [newImageUrl, setNewImageUrl] = useState(PRESET_IMAGE_OPTIONS[0].url);
  const [newCtaText, setNewCtaText] = useState('سجل الآن بالبرنامج');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Read shared settings and migrate any previous admin-local changes once.
  useEffect(() => {
    const unsubscribe = onSnapshot(bannersRef, (snapshot) => {
      if (snapshot.exists()) {
        setBanners(parseBannerItems(snapshot.data().banners) || DEFAULT_BANNERS);
        return;
      }

      let initialBanners = DEFAULT_BANNERS;
      if (canManageBanners) {
        try {
          const legacyValue = localStorage.getItem('iqra_hero_banners');
          const legacyBanners = legacyValue ? parseBannerItems(JSON.parse(legacyValue)) : null;
          const customBanners = legacyBanners?.filter((banner) => banner.isCustom) || [];
          if (customBanners.length > 0) initialBanners = [...customBanners, ...DEFAULT_BANNERS];
        } catch {
          // Use the defaults when legacy browser data is invalid.
        }

        void setDoc(bannersRef, { banners: initialBanners, updatedAt: new Date().toISOString() })
          .catch((error) => console.error('Unable to initialize homepage banners:', error));
      }
      setBanners(initialBanners);
    }, (error) => {
      console.error('Unable to load homepage banners:', error);
    });

    return unsubscribe;
  }, [bannersRef, canManageBanners]);

  // Auto-play timer
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, banners.length]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const saveBanners = async (nextBanners: BannerItem[]) => {
    if (!canManageBanners) return false;
    try {
      await setDoc(bannersRef, {
        banners: nextBanners,
        updatedAt: new Date().toISOString(),
      });
      setBanners(nextBanners);
      return true;
    } catch (error) {
      console.error('Unable to save homepage banners:', error);
      showToast('تعذر حفظ البنر. تحقق من اتصال Firebase وصلاحية المشرف العام.');
      return false;
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newImageUrl.trim()) {
      showToast('يرجى كتابة عنوان البنر واختيار صورة');
      return;
    }

    const created: BannerItem = {
      id: editingBannerId || `custom-b-${Date.now()}`,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'فرصة مميزة لاستكشاف البرامج والمؤسسات التعليمية المعتمدة.',
      badge: newBadge.trim() || 'إعلان معتمد',
      highlightText: newHighlight.trim() || undefined,
      imageUrl: newImageUrl.trim(),
      ctaText: newCtaText.trim() || 'سجل الآن',
      ctaView: 'discovery',
      secondaryCtaText: 'تصفح الدليل',
      secondaryView: 'discovery',
      isCustom: true,
    };

    const editedIndex = banners.findIndex((banner) => banner.id === editingBannerId);
    const updated = editingBannerId
      ? banners.map((banner) => banner.id === editingBannerId ? created : banner)
      : [created, ...banners];
    if (!await saveBanners(updated)) return;
    setCurrentIndex(editingBannerId && editedIndex >= 0 ? editedIndex : 0);
    setIsManageModalOpen(false);
    showToast(editingBannerId ? 'تم حفظ تعديلات البنر الرئيسي للجميع.' : 'تمت إضافة البنر الرئيسي وحفظه للجميع.');

    setEditingBannerId(null);
    setNewTitle('');
    setNewSubtitle('');
  };

  const handleEditBanner = (banner: BannerItem) => {
    setEditingBannerId(banner.id);
    setNewTitle(banner.title);
    setNewSubtitle(banner.subtitle);
    setNewBadge(banner.badge);
    setNewHighlight(banner.highlightText || '');
    setNewImageUrl(banner.imageUrl);
    setNewCtaText(banner.ctaText);
    document.getElementById('homepage-banner-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDeleteBanner = async (id: string) => {
    if (banners.length <= 1) {
      showToast('يجب الاحتفاظ ببنر واحد على الأقل في الواجهة');
      return;
    }
    const updated = banners.filter((b) => b.id !== id);
    if (!await saveBanners(updated)) return;
    if (currentIndex >= updated.length) {
      setCurrentIndex(0);
    }
    showToast('تم حذف البنر الرئيسي للجميع.');
  };

  const handleResetDefaults = async () => {
    if (!await saveBanners(DEFAULT_BANNERS)) return;
    setCurrentIndex(0);
    showToast('تمت استعادة البنرات الرئيسية الافتراضية للجميع.');
  };

  const activeBanner = banners[currentIndex] || DEFAULT_BANNERS[0];

  return (
    <section className="landing-hero relative isolate overflow-hidden bg-slate-950 text-white group" aria-label="اكتشف المؤسسات والبرامج التعليمية">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 start-6 z-50 bg-slate-900/95 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 backdrop-blur-sm border border-slate-700 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Banner Card Container */}
      <div className="relative min-h-[520px] overflow-hidden bg-slate-900 sm:min-h-[540px] md:min-h-[560px]">
        {/* Background Image with Depth Gradients */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeBanner.imageUrl}
            alt={activeBanner.title}
            className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out scale-105 group-hover:scale-100 opacity-75"
          />
          {/* Multi-layer Gradient Overlay for crisp readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-transparent rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-900/40" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 mx-auto flex min-h-[520px] w-full max-w-7xl flex-col justify-center px-4 py-10 sm:min-h-[540px] sm:px-6 md:min-h-[560px] lg:px-8">
          <div className="max-w-2xl text-white">
            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/90 text-white backdrop-blur-md shadow-xs border border-indigo-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {activeBanner.badge}
              </span>
              {activeBanner.highlightText && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-xs">
                  {activeBanner.highlightText}
                </span>
              )}
              {activeBanner.isCustom && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/80 text-white">
                  بنر مخصص
                </span>
              )}
            </div>

            {/* Banner Title */}
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight text-balance mb-3.5 drop-shadow-sm"
              style={{ color: '#fff' }}
            >
              {activeBanner.title}
            </h2>

            {/* Banner Subtitle */}
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl mb-7 drop-shadow-xs line-clamp-2 sm:line-clamp-3">
              {activeBanner.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="accent"
                size="md"
                onClick={() => onNavigate(activeBanner.ctaView || 'discovery')}
                rightIcon={<ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />}
                className="shadow-lg shadow-orange-600/30 font-semibold px-6"
              >
                {activeBanner.ctaText}
              </Button>

              {activeBanner.secondaryCtaText && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => onNavigate(activeBanner.secondaryView || 'discovery')}
                  className="bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-md font-medium"
                >
                  {activeBanner.secondaryCtaText}
                </Button>
              )}
            </div>
          </div>

          {searchContent && <div className="mt-8">{searchContent}</div>}

          {/* Bottom Bar: Indicators & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5 mt-7">
            {/* Pagination Dots */}
            <div className="flex items-center gap-2">
              {banners.map((b, idx) => (
                <button
                  key={b.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === idx
                      ? 'w-8 bg-amber-400 shadow-xs shadow-amber-400/50'
                      : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`انتقال إلى البنر ${idx + 1}`}
                />
              ))}
              <span className="text-[11px] font-medium text-slate-300 ms-2 font-mono">
                {currentIndex + 1} / {banners.length}
              </span>
            </div>

            {/* Controls & Management Trigger */}
            <div className="flex items-center gap-2">
              {/* Play/Pause Button */}
              <button
                onClick={() => setIsPaused((prev) => !prev)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer backdrop-blur-md"
                title={isPaused ? 'تشغيل التبديل التلقائي' : 'إيقاف مؤقت'}
                aria-label="تبديل التشغيل التلقائي"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>

              {/* Prev / Next Arrows */}
              <button
                onClick={handlePrev}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer backdrop-blur-md rtl:rotate-0"
                title="البنر السابق"
                aria-label="البنر السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer backdrop-blur-md rtl:rotate-0"
                title="البنر التالي"
                aria-label="البنر التالي"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Manage Banners / Add Banner Modal Trigger */}
              {canManageBanners && (
                <button
                  onClick={() => setIsManageModalOpen(true)}
                  className="ms-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition-colors cursor-pointer backdrop-blur-md border border-white/20"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>إدارة البنر الرئيسي</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add & Manage Custom Banners */}
      {canManageBanners && isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">إدارة البنر الرئيسي</h3>
                  <p className="text-xs text-slate-500">التعديلات المحفوظة تظهر لكل زوار المنصة</p>
                </div>
              </div>
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Existing Banners List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    البنرات الرئيسية ({banners.length})
                  </h4>
                  <button
                    onClick={handleResetDefaults}
                    className="text-xs text-indigo-600 hover:underline cursor-pointer"
                  >
                    استعادة الافتراضي
                  </button>
                </div>

                <div className="space-y-2.5">
                  {banners.map((b, idx) => (
                    <div
                      key={b.id}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                        currentIndex === idx 
                          ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <img
                        src={b.imageUrl}
                        alt=""
                        className="w-16 h-12 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">{b.title}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                            {b.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{b.subtitle}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setCurrentIndex(idx);
                            setIsManageModalOpen(false);
                          }}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                        >
                          عرض الآن
                        </button>
                        <button
                          onClick={() => handleEditBanner(b)}
                          className="p-1.5 text-slate-500 hover:text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="تعديل البنر"
                          aria-label={`تعديل البنر: ${b.title}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(b.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="حذف البنر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Banner Form */}
              <div id="homepage-banner-editor" className="pt-5 border-t border-slate-200 scroll-mt-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  {editingBannerId ? <Pencil className="w-4 h-4 text-indigo-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
                  {editingBannerId ? 'تعديل البنر الرئيسي' : 'إضافة بنر رئيسي'}
                </h4>

                <form onSubmit={handleSaveBanner} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      عنوان البنر الترويجي <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: خصومات حصرية للمتفوقين في الجامعات الخاصة..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      النص التعريفي / الوصف القصير
                    </label>
                    <textarea
                      rows={2}
                      placeholder="اكتب وصفاً موجزاً وجذاباً للبرنامج أو العرض..."
                      value={newSubtitle}
                      onChange={(e) => setNewSubtitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        شارة البنر (Tag)
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: منحة دراسية، تسجيل مبكر"
                        value={newBadge}
                        onChange={(e) => setNewBadge(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        وسم التمييز / الخصم
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: خصم 20%، مقاعد محدودة"
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      نص زر الإجراء (CTA Button)
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: سجل الآن، استكشف التفاصيل"
                      value={newCtaText}
                      onChange={(e) => setNewCtaText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  {/* Image Selector & Presets */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      صورة البنر <span className="text-rose-500">*</span>
                    </label>
                    
                    {/* Quick Preset Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2.5">
                      {PRESET_IMAGE_OPTIONS.map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setNewImageUrl(opt.url)}
                          className={`relative rounded-xl overflow-hidden border p-1 text-start transition-all cursor-pointer ${
                            newImageUrl === opt.url
                              ? 'border-indigo-600 ring-2 ring-indigo-600/30'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img
                            src={opt.url}
                            alt=""
                            className="w-full h-12 object-cover rounded-lg mb-1"
                          />
                          <span className="block text-[10px] font-medium text-slate-700 truncate px-1">
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>

                    <input
                      type="url"
                      placeholder="أو أدخل رابط صورة مخصص (URL)..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                    />
                  </div>

                  {/* Modal Footer Buttons */}
                  <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBannerId(null);
                        setIsManageModalOpen(false);
                      }}
                      className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      rightIcon={editingBannerId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    >
                      {editingBannerId ? 'حفظ التعديلات للجميع' : 'إضافة البنر الرئيسي'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
