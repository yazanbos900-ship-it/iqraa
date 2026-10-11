import React, { useState, useEffect } from 'react';
import { EducationalService } from '../../../types';
import { ProviderTypeOption, ProviderCategoryType } from '../types';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { 
  Plus, 
  Sparkles, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  DollarSign, 
  Users, 
  GraduationCap, 
  Clock, 
  BookOpen,
  Info
} from 'lucide-react';

interface AddEditProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: Partial<EducationalService>) => void;
  providerName: string;
  currentType: ProviderTypeOption;
  initialService?: EducationalService | null;
  canActivate: boolean;
}

export const AddEditProgramModal: React.FC<AddEditProgramModalProps> = ({
  isOpen,
  onClose,
  onSave,
  providerName,
  currentType,
  initialService,
  canActivate,
}) => {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('');
  const [duration, setDuration] = useState('');
  const [priceNote, setPriceNote] = useState('');
  const [numericPrice, setNumericPrice] = useState(0);
  const [seats, setSeats] = useState(1);
  const [mode, setMode] = useState<'on-campus' | 'online' | 'hybrid'>('on-campus');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'draft'>('active');
  const [startDate, setStartDate] = useState('');
  const [minStudents, setMinStudents] = useState(1);
  const [canStartBelowMin, setCanStartBelowMin] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<('cash' | 'online')[]>(['cash']);
  const [freeLessonsCount, setFreeLessonsCount] = useState(1);
  const [instructorName, setInstructorName] = useState('');
  const [validationError, setValidationError] = useState('');

  // Custom provider-specific dynamic fields state
  const [customField1, setCustomField1] = useState('');
  const [customField2, setCustomField2] = useState('');
  const [customField3, setCustomField3] = useState('');

  useEffect(() => {
    if (initialService) {
      setTitle(initialService.title);
      setLevel(initialService.level);
      setDuration(initialService.duration);
      setPriceNote(initialService.priceNote);
      setNumericPrice(initialService.numericPrice ?? 0);
      setSeats(initialService.totalSeats || 1);
      setMode(initialService.mode);
      setDescription(initialService.description);
      setStatus(initialService.status === 'draft' ? 'draft' : 'active');
      setStartDate(initialService.startDate || '');
      setMinStudents(initialService.minStudents ?? 1);
      setCanStartBelowMin(initialService.canStartBelowMin ?? false);
      setPaymentMethods(initialService.paymentMethods?.filter((method) => method === 'cash' || method === 'online') || ['cash']);
      setFreeLessonsCount(initialService.freeLessonsCount ?? 1);
      setInstructorName(initialService.instructorName || '');
    } else {
      setTitle('');
      setLevel('');
      setDuration('');
      setPriceNote('');
      setNumericPrice(0);
      setCustomField1('');
      setCustomField2('');
      setCustomField3('');
      setSeats(1);
      setMode('on-campus');
      setDescription('');
      setStatus(canActivate ? 'active' : 'draft');
      setStartDate('');
      setMinStudents(1);
      setCanStartBelowMin(false);
      setPaymentMethods(['cash']);
      setFreeLessonsCount(1);
      setInstructorName('');
    }
    setValidationError('');
  }, [initialService, currentType, isOpen, canActivate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!Number.isInteger(minStudents) || minStudents <= 0 || minStudents > seats) {
      setValidationError('الحد الأدنى للطلاب يجب أن يكون عدداً صحيحاً أكبر من صفر ولا يتجاوز الطاقة الاستيعابية.');
      return;
    }
    if (!Number.isInteger(freeLessonsCount) || freeLessonsCount < 1) {
      setValidationError('عدد الدروس المجانية يجب أن يكون عدداً صحيحاً لا يقل عن 1.');
      return;
    }
    if (paymentMethods.length === 0) {
      setValidationError('اختر طريقة دفع واحدة على الأقل.');
      return;
    }
    if (status === 'active' && !canActivate) {
      setValidationError('أكمل ملف المؤسسة وحساب استلام المبالغ قبل تفعيل الدورة. يمكنك حفظها كمسودة.');
      return;
    }
    if (initialService?.pausedByAdmin && status !== initialService.status) {
      setValidationError('هذه الدورة موقوفة من الإدارة. يرجى التواصل مع الإدارة.');
      return;
    }
    setValidationError('');

    let enrichedDesc = description;
    if (customField1 || customField2) {
      enrichedDesc += `\n• المميزات: ${[customField1, customField2, customField3].filter(Boolean).join(' | ')}`;
    }

    onSave({
      title,
      level,
      duration,
      priceNote: priceNote || `${numericPrice} ر.س`,
      numericPrice: Number(numericPrice) || 0,
      currency: 'ر.س',
      description: enrichedDesc.trim(),
      seatsAvailable: seats,
      totalSeats: seats,
      mode,
      status,
      startDate,
      minStudents,
      canStartBelowMin,
      paymentMethods,
      freeLessonsCount,
      instructorName,
      category: currentType.id === 'institutes_lang' ? 'institutes' : ['institutes_tech', 'vocational'].includes(currentType.id) ? 'training_centers' : currentType.id === 'universities' ? 'universities' : currentType.id === 'tutors' ? 'tutors' : currentType.id === 'libraries' ? 'libraries' : 'schools',
      providerName,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialService ? 'تعديل البرنامج التعليمي' : `إضافة برنامج تعليمي جديد لـ ${currentType.categoryTag}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-700">
        {/* Dynamic Provider Type Banner */}
        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${currentType.avatarBg} text-white font-bold flex items-center justify-center text-xs`}>
              {currentType.avatarText.slice(0, 2)}
            </div>
            <div>
              <span className="font-bold text-indigo-950 block">{providerName}</span>
              <span className="text-[11px] text-indigo-800">نوع المؤسسة: {currentType.nameAr} ({currentType.categoryTag})</span>
            </div>
          </div>
          <Badge variant="info">نموذج ذكي متكيف</Badge>
        </div>

        {/* Basic Fields */}
        <div className="space-y-4">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              عنوان البرنامج / الدورة التعليمية <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: برنامج الدبلوما الأمريكية، دبلوم الذكاء الاصطناعي، إلخ..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                المرحلة / الفئة المستهدفة
              </label>
              <input
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="مثال: المرحلة الثانوية، روضة أطفال، مبتدئ..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                طريقة ووسيلة التدريس
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="on-campus">حضوري بالمقر والمختبرات</option>
                <option value="online">عن بُعد (Online جلسات مباشرة ومسجلة)</option>
                <option value="hybrid">مدمج (حضوري وعن بُعد)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                المدة الدراسية
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="عام دراسي، 8 أسابيع، فصل..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">تاريخ البدء</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="block font-semibold text-slate-800 mb-1">الحد الأدنى للطلاب</label>
                <input type="number" min={1} step={1} max={seats} value={minStudents} onChange={(e) => setMinStudents(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono" />
                <span className="mt-1 block text-[10px] text-slate-500">الحد الأقصى هو الطاقة الاستيعابية ({seats}).</span>
              </div>
              <div>
                <label className="block font-semibold text-slate-800 mb-1">عدد الدروس المجانية</label>
                <input type="number" min={1} step={1} value={freeLessonsCount} onChange={(e) => setFreeLessonsCount(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono" />
              </div>
              <div>
                <label className="block font-semibold text-slate-800 mb-1">المدرّس المسؤول</label>
                <input type="text" value={instructorName} onChange={(e) => setInstructorName(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <input type="checkbox" checked={canStartBelowMin} onChange={(e) => setCanStartBelowMin(e.target.checked)} />
              تبدأ الدورة حتى إن لم يصل العدد إلى الحد الأدنى
            </label>

            <fieldset className="space-y-2">
              <legend className="font-semibold text-slate-800">طرق الدفع المقبولة <span className="text-rose-600">*</span></legend>
              <div className="flex items-center gap-5">
                {([
                  ['cash', 'نقداً'],
                  ['online', 'إلكترونياً'],
                ] as const).map(([method, label]) => (
                  <label key={method} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={paymentMethods.includes(method)}
                      onChange={(e) => setPaymentMethods((current) => e.target.checked
                        ? [...current, method]
                        : current.filter((item) => item !== method))}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                الرسوم المقدرة (ر.س)
              </label>
              <input
                type="number"
                value={numericPrice}
                onChange={(e) => {
                  setNumericPrice(Number(e.target.value));
                  setPriceNote(`${e.target.value} ر.س`);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                الطاقة الاستيعابية (المقاعد)
              </label>
              <input
                type="number"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                min={1}
                max={500}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* DYNAMIC SECTOR FIELDS (The core requirement of Phase 3) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                حقول ومزايا مخصصة لقطاع ({currentType.nameAr})
              </span>
              <span className="text-[10px] text-slate-500">ميزة نموذج مرن</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  {currentType.id === 'kindergartens'
                    ? 'نظام التغذية والوجبات'
                    : currentType.id === 'institutes_lang'
                    ? 'اختبار تحديد المستوى'
                    : currentType.id === 'institutes_tech'
                    ? 'التقنيات والمشاريع'
                    : currentType.id === 'tutors'
                    ? 'منصة وطريقة البث'
                    : 'المنهاج والاعتماد'}
                </label>
                <input
                  type="text"
                  value={customField1}
                  onChange={(e) => setCustomField1(e.target.value)}
                  placeholder="بيان الميزة الأولى..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  {currentType.id === 'kindergartens'
                    ? 'ساعات وفترة الدوام'
                    : currentType.id === 'institutes_lang'
                    ? 'طاقم التدريب واللغة'
                    : currentType.id === 'institutes_tech'
                    ? 'الإرشاد المهني للوظائف'
                    : currentType.id === 'tutors'
                    ? 'الحقائب والملخصات'
                    : 'خيارات النقل المدرسي'}
                </label>
                <input
                  type="text"
                  value={customField2}
                  onChange={(e) => setCustomField2(e.target.value)}
                  placeholder="بيان الميزة الثانية..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  {currentType.id === 'kindergartens'
                    ? 'أنشطة مونتيسوري الحركية'
                    : currentType.id === 'institutes_lang'
                    ? 'الشهادة الممنوحة'
                    : currentType.id === 'institutes_tech'
                    ? 'مشروع التخرج'
                    : currentType.id === 'tutors'
                    ? 'المتابعة والتواصل'
                    : 'تسهيلات سداد الرسوم'}
                </label>
                <input
                  type="text"
                  value={customField3}
                  onChange={(e) => setCustomField3(e.target.value)}
                  placeholder="بيان الميزة الثالثة..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              الوصف التفصيلي والأهداف التعليمية
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب نبذة عن مفردات البرنامج، المخرجات التعليمية، والمهارات المكتسبة..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="font-semibold text-slate-900 block">حالة نشر البرنامج</span>
              <span className="text-[11px] text-slate-500">اختر إذا كان البرنامج متاحاً للتقديم الفوري أو كمسودة</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatus('active')}
                disabled={!canActivate || Boolean(initialService?.pausedByAdmin)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${canActivate && !initialService?.pausedByAdmin ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} ${
                  status === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                مفتوح للتسجيل
              </button>
              <button
                type="button"
                onClick={() => setStatus('draft')}
                disabled={Boolean(initialService?.pausedByAdmin)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${initialService?.pausedByAdmin ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${
                  status === 'draft' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                حفظ كمسودة
              </button>
            </div>
          </div>
          {!canActivate && <p className="text-amber-700 text-[11px]">أكمل بيانات المؤسسة وحساب استلام المبالغ لتفعيل الدورة؛ حفظ المسودة متاح.</p>}
          {initialService?.pausedByAdmin && <p className="text-amber-700 text-[11px]">هذه الدورة موقوفة من الإدارة. يرجى التواصل مع الإدارة.</p>}
          {validationError && <p role="alert" className="text-rose-600">{validationError}</p>}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            إلغاء
          </Button>
          <Button type="submit" variant="primary" size="sm" className="text-xs font-semibold">
            {initialService ? 'حفظ التعديلات' : 'نشر البرنامج في المنصة'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
