import React, { useEffect, useState } from 'react';
import { EducationalService } from '../../../types';
import { ProviderTypeOption, StaffMember } from '../types';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Calendar, Clock, Users } from 'lucide-react';

interface AddEditProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: Partial<EducationalService>) => void;
  onOpenSettings: () => void;
  providerName: string;
  currentType: ProviderTypeOption;
  initialService?: EducationalService | null;
  teamMembers: StaffMember[];
  missingProfileFields: string[];
  canActivate: boolean;
}

interface ProgramFieldErrors {
  title?: string;
  mode?: string;
  startDate?: string;
  seats?: string;
  minStudents?: string;
  price?: string;
  paymentMethods?: string;
  freeLessonsCount?: string;
}

const getTodayDate = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  return new Date(today.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const getSectorFields = (sector: ProviderTypeOption['id']) => {
  switch (sector) {
    case 'schools':
      return [
        { key: 'curriculum', label: 'المنهاج والاعتماد', placeholder: 'مثال: المنهاج الوطني، البكالوريا الدولية' },
        { key: 'transport', label: 'خيارات النقل', placeholder: 'مثال: باصات من الأحياء الرئيسية' },
        { key: 'fees', label: 'تسهيلات الرسوم', placeholder: 'مثال: تقسيط على 3 دفعات' },
      ];
    case 'kindergartens':
      return [
        { key: 'meals', label: 'نظام التغذية والوجبات', placeholder: 'مثال: وجبة صحية يومية' },
        { key: 'schedule', label: 'ساعات وفترة الدوام', placeholder: 'مثال: دوام صباحي من 8 ص إلى 1 ظ' },
        { key: 'activities', label: 'الأنشطة التعليمية', placeholder: 'مثال: أنشطة مونتيسوري وحركية' },
      ];
    case 'institutes_lang':
      return [
        { key: 'placement', label: 'اختبار تحديد المستوى', placeholder: 'مثال: اختبار تحديد مستوى قبل بدء الدورة' },
        { key: 'staff', label: 'طاقم التدريب واللغة', placeholder: 'مثال: مدربون ناطقون باللغة' },
        { key: 'certificate', label: 'الشهادة الممنوحة', placeholder: 'مثال: شهادة إتمام معتمدة' },
      ];
    case 'institutes_tech':
      return [
        { key: 'technology', label: 'التقنيات والمشاريع', placeholder: 'مثال: تطبيقات عملية على أدوات حديثة' },
        { key: 'career', label: 'الإرشاد المهني', placeholder: 'مثال: جلسات إرشاد وتجهيز لسوق العمل' },
        { key: 'graduation', label: 'مشروع التخرج', placeholder: 'مثال: مشروع تطبيقي نهائي' },
      ];
    case 'tutors':
      return [
        { key: 'platform', label: 'منصة وطريقة البث', placeholder: 'مثال: دروس مباشرة عبر منصة تعليمية' },
        { key: 'materials', label: 'الحقائب والملخصات', placeholder: 'مثال: ملخصات وتمارين بعد كل درس' },
        { key: 'followUp', label: 'المتابعة والتواصل', placeholder: 'مثال: متابعة أسبوعية مع الطالب' },
      ];
    default:
      return [];
  }
};

const splitDescription = (description: string) => {
  const match = description.match(/(?:\r?\n)?• المميزات: ([^\r\n]*)$/);
  if (!match) return { description, customValues: ['', '', ''] };
  const values = match[1].split('|').map((value) => value.trim());
  return {
    description: description.slice(0, match.index).trimEnd(),
    customValues: [values[0] || '', values[1] || '', values[2] || ''],
  };
};

export const AddEditProgramModal: React.FC<AddEditProgramModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onOpenSettings,
  providerName,
  currentType,
  initialService,
  teamMembers,
  missingProfileFields,
  canActivate,
}) => {
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('');
  const [duration, setDuration] = useState('');
  const [numericPrice, setNumericPrice] = useState('');
  const [currency, setCurrency] = useState('ر.س');
  const [isFree, setIsFree] = useState(false);
  const [seats, setSeats] = useState('');
  const [mode, setMode] = useState<EducationalService['mode'] | ''>('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [minStudents, setMinStudents] = useState('');
  const [canStartBelowMin, setCanStartBelowMin] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<('cash' | 'online')[]>([]);
  const [freeLessonsCount, setFreeLessonsCount] = useState('1');
  const [instructorId, setInstructorId] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [customValues, setCustomValues] = useState(['', '', '']);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  useEffect(() => {
    if (initialService) {
      const parsedDescription = splitDescription(initialService.description || '');
      setTitle(initialService.title || '');
      setLevel(initialService.level || '');
      setDuration(initialService.duration || '');
      setNumericPrice(String(initialService.numericPrice ?? ''));
      setCurrency(initialService.currency || 'ر.س');
      setIsFree(initialService.numericPrice === 0);
      setSeats(initialService.totalSeats ? String(initialService.totalSeats) : '');
      setMode(initialService.mode || '');
      setDescription(parsedDescription.description);
      setStartDate(initialService.startDate || '');
      setMinStudents(initialService.minStudents ? String(initialService.minStudents) : '');
      setCanStartBelowMin(initialService.canStartBelowMin ?? false);
      setPaymentMethods(initialService.paymentMethods?.filter((method) => method === 'cash' || method === 'online') || []);
      setFreeLessonsCount(initialService.freeLessonsCount ? String(initialService.freeLessonsCount) : '');
      setInstructorId(initialService.instructorId || (initialService.instructorName ? 'legacy' : ''));
      setInstructorName(initialService.instructorName || '');
      setCustomValues(parsedDescription.customValues);
    } else {
      setTitle('');
      setLevel('');
      setDuration('');
      setNumericPrice('');
      setCurrency('ر.س');
      setIsFree(false);
      setSeats('');
      setMode('');
      setDescription('');
      setStartDate('');
      setMinStudents('');
      setCanStartBelowMin(false);
      setPaymentMethods([]);
      setFreeLessonsCount('1');
      setInstructorId('');
      setInstructorName('');
      setCustomValues(['', '', '']);
    }
    setShowValidationErrors(false);
  }, [initialService, currentType, isOpen]);

  const validationErrors: ProgramFieldErrors = {};
  const numericSeats = Number(seats);
  const numericMinStudents = Number(minStudents);
  const numericFreeLessons = Number(freeLessonsCount);
  const numericCoursePrice = Number(numericPrice);
  if (!title.trim()) validationErrors.title = 'عنوان الدورة مطلوب.';
  if (!mode) validationErrors.mode = 'نمط التدريس مطلوب.';
  if (!startDate) validationErrors.startDate = 'تاريخ البدء مطلوب.';
  else if (!initialService && startDate < getTodayDate()) validationErrors.startDate = 'تاريخ البدء لا يمكن أن يكون في الماضي.';
  if (!Number.isInteger(numericSeats) || numericSeats <= 0) validationErrors.seats = 'عدد المقاعد يجب أن يكون عدداً صحيحاً أكبر من صفر.';
  if (!Number.isInteger(numericMinStudents) || numericMinStudents <= 0) {
    validationErrors.minStudents = 'الحد الأدنى يجب أن يكون عدداً صحيحاً أكبر من صفر.';
  } else if (Number.isInteger(numericSeats) && numericMinStudents > numericSeats) {
    validationErrors.minStudents = 'الحد الأدنى لا يمكن أن يتجاوز عدد المقاعد.';
  }
  if (!isFree && (!Number.isFinite(numericCoursePrice) || numericCoursePrice <= 0)) {
    validationErrors.price = 'سعر الدورة يجب أن يكون أكبر من صفر، أو اختر دورة مجانية.';
  }
  if (paymentMethods.length === 0) validationErrors.paymentMethods = 'اختر طريقة دفع واحدة على الأقل.';
  if (!Number.isInteger(numericFreeLessons) || numericFreeLessons < 1) {
    validationErrors.freeLessonsCount = 'عدد الدروس المجانية يجب أن يكون عدداً صحيحاً لا يقل عن 1.';
  }

  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const hasStartedEditing = Boolean(
    title || mode || startDate || seats || minStudents || numericPrice || paymentMethods.length
      || freeLessonsCount !== (initialService?.freeLessonsCount ? String(initialService.freeLessonsCount) : '1'),
  );
  const selectedInstructor = teamMembers.find((member) => member.id === instructorId);
  const instructorOptionIsMissing = Boolean(
    instructorId && !selectedInstructor && instructorName,
  );
  const sectorFields = getSectorFields(currentType.id);
  const publishDisabled = !canActivate || hasValidationErrors || Boolean(initialService?.pausedByAdmin);
  const publishReason = initialService?.pausedByAdmin
    ? 'هذه الدورة موقوفة من الإدارة. يرجى التواصل مع الإدارة.'
    : !canActivate
      ? `أكمل: ${missingProfileFields.join('، ') || 'بيانات المؤسسة وحساب الاستلام'}.`
      : Object.values(validationErrors)[0];

  const updateCustomValue = (index: number, value: string) => {
    setCustomValues((current) => current.map((item, itemIndex) => itemIndex === index ? value : item));
  };

  const saveProgram = (status: EducationalService['status']) => {
    const selectedInstructorMember = teamMembers.find((member) => member.id === instructorId);
    const featureLines = customValues
      .map((value) => value.trim())
      .filter(Boolean);
    const enrichedDescription = [
      description.trim(),
      featureLines.length ? `• المميزات: ${featureLines.join(' | ')}` : '',
    ].filter(Boolean).join('\n');
    const parsedPrice = isFree ? 0 : Number(numericPrice);
    const parsedSeats = Number(seats);
    const parsedMinStudents = Number(minStudents);
    const parsedFreeLessons = Number(freeLessonsCount);

    onSave({
      title: title.trim(),
      level: level.trim(),
      duration: duration.trim(),
      priceNote: isFree ? 'مجانية' : `${parsedPrice} ${currency}`,
      numericPrice: Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : 0,
      currency,
      description: enrichedDescription,
      seatsAvailable: initialService?.seatsAvailable ?? (Number.isFinite(parsedSeats) ? parsedSeats : 0),
      totalSeats: Number.isFinite(parsedSeats) ? parsedSeats : 0,
      mode: mode || 'on-campus',
      status,
      ...(startDate ? { startDate } : {}),
      ...(Number.isFinite(parsedMinStudents) && minStudents.trim() ? { minStudents: parsedMinStudents } : {}),
      canStartBelowMin,
      ...(paymentMethods.length ? { paymentMethods } : {}),
      ...(Number.isFinite(parsedFreeLessons) && freeLessonsCount.trim() ? { freeLessonsCount: parsedFreeLessons } : {}),
      ...(selectedInstructorMember
        ? { instructorId: selectedInstructorMember.id, instructorName: selectedInstructorMember.name }
        : { instructorId: '', instructorName: instructorOptionIsMissing ? instructorName : '' }),
      category: currentType.id === 'institutes_lang'
        ? 'institutes'
        : ['institutes_tech', 'vocational'].includes(currentType.id)
          ? 'training_centers'
          : currentType.id === 'universities'
            ? 'universities'
            : currentType.id === 'tutors'
              ? 'tutors'
              : currentType.id === 'libraries'
                ? 'libraries'
                : 'schools',
      providerName,
    });
    onClose();
  };

  const handlePublish = () => {
    setShowValidationErrors(true);
    if (publishDisabled) return;
    saveProgram('active');
  };

  const showError = (error?: string) => showValidationErrors || hasStartedEditing ? error : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialService ? 'تعديل الدورة' : 'إضافة دورة جديدة'}
      maxWidth="lg"
    >
      <form onSubmit={(event) => event.preventDefault()} className="space-y-5 text-sm text-slate-700">
        {!canActivate && (
          <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 space-y-2">
            <p className="font-bold">ملف المؤسسة غير مكتمل؛ لن تتمكن من نشر الدورة الآن.</p>
            <p>البيانات الناقصة: {missingProfileFields.join('، ') || 'بيانات المؤسسة وحساب استلام المبالغ'}.</p>
            <button type="button" onClick={onOpenSettings} className="font-bold text-indigo-700 underline underline-offset-2">
              الانتقال إلى الإعدادات
            </button>
          </div>
        )}
        {initialService?.pausedByAdmin && (
          <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
            موقوفة من الإدارة. يرجى التواصل مع الإدارة.
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-indigo-50/60 p-3">
          <span className="block font-bold text-indigo-950">{providerName}</span>
          <span className="text-xs text-indigo-800">نوع المؤسسة: {currentType.nameAr}</span>
        </div>

        <section className="space-y-4">
          <h3 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-900">المعلومات الأساسية</h3>
          <div>
            <label htmlFor="program-title" className="mb-1 block font-semibold text-slate-800">
              عنوان الدورة <span className="text-rose-600">*</span>
            </label>
            <input
              id="program-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="مثال: دورة اللغة الإنجليزية للمبتدئين"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {showError(validationErrors.title) && <p className="mt-1 text-xs text-rose-600">{validationErrors.title}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="program-mode" className="mb-1 block font-semibold text-slate-800">
                نمط التدريس <span className="text-rose-600">*</span>
              </label>
              <select
                id="program-mode"
                value={mode}
                onChange={(event) => setMode(event.target.value as EducationalService['mode'] | '')}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">اختر نمط التدريس</option>
                <option value="on-campus">حضوري</option>
                <option value="online">عن بُعد</option>
                <option value="hybrid">مدمج</option>
              </select>
              {showError(validationErrors.mode) && <p className="mt-1 text-xs text-rose-600">{validationErrors.mode}</p>}
            </div>
            <div>
              <label htmlFor="program-level" className="mb-1 block font-semibold text-slate-800">الفئة المستهدفة</label>
              <input
                id="program-level"
                type="text"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                placeholder="مثال: المرحلة الثانوية، مبتدئ"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="program-description" className="mb-1 block font-semibold text-slate-800">
              وصف الدورة وما سيتعلمه الطالب
            </label>
            <textarea
              id="program-description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="اكتب نبذة عن محتوى الدورة والمهارات التي سيكتسبها الطالب..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-900">الموعد والمدة</h3>
          <div>
            <label htmlFor="program-start-date" className="mb-1 block font-semibold text-slate-800">
              تاريخ البدء <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="program-start-date"
                type="date"
                value={startDate}
                min={!initialService ? getTodayDate() : undefined}
                onChange={(event) => setStartDate(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pe-3 ps-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {showError(validationErrors.startDate) && <p className="mt-1 text-xs text-rose-600">{validationErrors.startDate}</p>}
          </div>
          <div>
            <label htmlFor="program-duration" className="mb-1 block font-semibold text-slate-800">المدة الدراسية</label>
            <div className="relative">
              <Clock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="program-duration"
                type="text"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                placeholder="مثال: 8 أسابيع، فصل دراسي"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pe-3 ps-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-900">المقاعد</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="program-seats" className="mb-1 block font-semibold text-slate-800">
                عدد المقاعد (الحد الأقصى للطلاب) <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Users className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="program-seats"
                  type="number"
                  min={1}
                  max={500}
                  step={1}
                  value={seats}
                  onChange={(event) => setSeats(event.target.value)}
                  placeholder="مثال: 20"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pe-3 ps-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {showError(validationErrors.seats) && <p className="mt-1 text-xs text-rose-600">{validationErrors.seats}</p>}
            </div>
            <div>
              <label htmlFor="program-min-students" className="mb-1 block font-semibold text-slate-800">
                الحد الأدنى للطلاب <span className="text-rose-600">*</span>
              </label>
              <input
                id="program-min-students"
                type="number"
                min={1}
                step={1}
                value={minStudents}
                onChange={(event) => setMinStudents(event.target.value)}
                placeholder="مثال: 5"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-slate-500">يجب ألا يتجاوز العدد الأقصى للطلاب.</p>
              {showError(validationErrors.minStudents) && <p className="mt-1 text-xs text-rose-600">{validationErrors.minStudents}</p>}
            </div>
          </div>
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={canStartBelowMin}
              onChange={(event) => setCanStartBelowMin(event.target.checked)}
              className="mt-0.5 accent-indigo-600"
            />
            <span>تبدأ الدورة حتى لو لم يصل العدد للحد الأدنى</span>
          </label>
        </section>

        <section className="space-y-4">
          <h3 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-900">السعر والدفع</h3>
          <div>
            <label htmlFor="program-price" className="mb-1 block font-semibold text-slate-800">
              سعر الدورة <span className="text-rose-600">*</span> <span className="font-normal text-slate-500">({currency})</span>
            </label>
            <input
              id="program-price"
              type="number"
              min={isFree ? 0 : 0.01}
              step="any"
              value={numericPrice}
              disabled={isFree}
              onChange={(event) => setNumericPrice(event.target.value)}
              placeholder="أدخل سعر الدورة"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
            />
            {showError(validationErrors.price) && <p className="mt-1 text-xs text-rose-600">{validationErrors.price}</p>}
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setIsFree(checked);
                  setNumericPrice(checked ? '0' : '');
                }}
                className="accent-indigo-600"
              />
              دورة مجانية
            </label>
          </div>
          <fieldset>
            <legend className="mb-2 font-semibold text-slate-800">
              طرق الدفع المقبولة <span className="text-rose-600">*</span>
            </legend>
            <div className="flex flex-wrap gap-5">
              {([
                ['cash', 'نقداً'],
                ['online', 'إلكترونياً'],
              ] as const).map(([method, label]) => (
                <label key={method} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={paymentMethods.includes(method)}
                    onChange={(event) => setPaymentMethods((current) => event.target.checked
                      ? [...current, method]
                      : current.filter((item) => item !== method))}
                    className="accent-indigo-600"
                  />
                  {label}
                </label>
              ))}
            </div>
            {showError(validationErrors.paymentMethods) && <p className="mt-1 text-xs text-rose-600">{validationErrors.paymentMethods}</p>}
          </fieldset>
        </section>

        <section className="space-y-4">
          <h3 className="border-b border-slate-200 pb-2 text-base font-bold text-slate-900">المدرّس</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="program-instructor" className="mb-1 block font-semibold text-slate-800">المدرّس المسؤول</label>
              <select
                id="program-instructor"
                value={instructorId}
                onChange={(event) => {
                  const nextId = event.target.value;
                  setInstructorId(nextId);
                  setInstructorName(teamMembers.find((member) => member.id === nextId)?.name || (nextId === 'legacy' ? instructorName : ''));
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">بدون مدرّس محدد</option>
                {instructorOptionIsMissing && <option value="legacy">{instructorName}</option>}
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
              {teamMembers.length === 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span>لا يوجد موظفون بعد.</span>
                  <button type="button" onClick={onOpenSettings} className="font-semibold text-indigo-700 underline underline-offset-2">
                    الانتقال إلى الإعدادات
                  </button>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="program-free-lessons" className="mb-1 block font-semibold text-slate-800">
                عدد الدروس التجريبية المجانية
              </label>
              <input
                id="program-free-lessons"
                type="number"
                min={1}
                step={1}
                value={freeLessonsCount}
                onChange={(event) => setFreeLessonsCount(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-slate-500">عدد الدروس التي يحضرها الطالب مجاناً قبل الدفع.</p>
              {showError(validationErrors.freeLessonsCount) && <p className="mt-1 text-xs text-rose-600">{validationErrors.freeLessonsCount}</p>}
            </div>
          </div>
        </section>

        {sectorFields.length > 0 && (
          <details className="rounded-xl border border-slate-200 bg-slate-50">
            <summary className="cursor-pointer list-none px-4 py-3 font-bold text-slate-900">
              تفاصيل إضافية (اختياري)
            </summary>
            <div className="grid grid-cols-1 gap-4 border-t border-slate-200 p-4 sm:grid-cols-2">
              {sectorFields.map((field, index) => (
                <div key={field.key}>
                  <label htmlFor={`program-extra-${field.key}`} className="mb-1 block font-semibold text-slate-800">{field.label}</label>
                  <input
                    id={`program-extra-${field.key}`}
                    type="text"
                    value={customValues[index] || ''}
                    onChange={(event) => updateCustomValue(index, event.target.value)}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          </details>
        )}

        <div className="space-y-2 border-t border-slate-200 pt-4">
          {!initialService && (
            <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => saveProgram('draft')}>
                حفظ كمسودة
              </Button>
              <Button type="button" variant="primary" size="sm" disabled={publishDisabled} onClick={handlePublish}>
                نشر الدورة
              </Button>
            </div>
          )}
          {initialService && (
            <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button type="button" variant="primary" size="sm" onClick={() => saveProgram(initialService.status)}>
                حفظ التعديلات
              </Button>
            </div>
          )}
          {!initialService && publishReason && (
            <p className="text-end text-xs text-amber-800">
              {publishReason}
              {!canActivate && (
                <>
                  {' '}
                  <button type="button" onClick={onOpenSettings} className="font-bold text-indigo-700 underline underline-offset-2">
                    أكمل بيانات الإعدادات
                  </button>
                </>
              )}
            </p>
          )}
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="px-2 py-1 text-sm text-slate-600 hover:text-slate-900">
              إلغاء
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
