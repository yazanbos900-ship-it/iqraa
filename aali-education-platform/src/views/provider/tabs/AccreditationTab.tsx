import React, { useEffect, useState } from 'react';
import { ProviderTypeOption } from '../types';
import { EducationalProvider } from '../../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { 
  FileCheck, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  Upload, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Award,
  Layers,
  Sparkles
} from 'lucide-react';

interface AccreditationTabProps {
  currentType: ProviderTypeOption;
  provider?: EducationalProvider;
  onSubmitVerification: (details: { licenseNumber: string; city: string }) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const AccreditationTab: React.FC<AccreditationTabProps> = ({
  currentType,
  provider,
  onSubmitVerification,
  onShowToast,
}) => {
  const [licenseNumber, setLicenseNumber] = useState(provider?.licenseNumber || '');
  const [city, setCity] = useState(provider?.city || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLicenseNumber(provider?.licenseNumber || '');
    setCity(provider?.city || '');
  }, [provider?.licenseNumber, provider?.city]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!licenseNumber.trim() || !city.trim()) {
      onShowToast('أدخل رقم الترخيص والمدينة قبل إرسال الطلب.');
      return;
    }
    setIsSaving(true);
    try {
      await onSubmitVerification({ licenseNumber, city });
      onShowToast('تم إرسال بيانات الترخيص إلى الإدارة للمراجعة.');
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'تعذر إرسال طلب الاعتماد.');
    } finally {
      setIsSaving(false);
    }
  };

  const verificationStatus = provider?.accredited || provider?.verificationStatus === 'approved'
    ? 'approved'
    : provider?.verificationStatus || 'pending';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              ملف الاعتماد الأكاديمي والتراخيص الرسمية
            </h2>
            <Badge variant={verificationStatus === 'approved' ? 'success' : verificationStatus === 'rejected' ? 'danger' : 'warning'} className="gap-1">
              {verificationStatus === 'approved' ? 'معتمد' : verificationStatus === 'rejected' ? 'بحاجة إلى تعديل' : 'بانتظار المراجعة'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            بيانات الترخيص التي أرسلها مزود الخدمة وحالة مراجعتها في المنصة.
          </p>
        </div>

        <span className="text-xs text-slate-500">ارسل بيانات الترخيص؛ رفع المستندات سيتاح بعد إعداد التخزين السحابي.</span>
      </div>

      {/* Official License Badge Card */}
      <div className="bg-gradient-to-l from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-emerald-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-semibold tracking-wide uppercase">
                  حالة التدقيق والتحقق
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white">{verificationStatus === 'approved' ? 'تم اعتماد مزود الخدمة' : verificationStatus === 'rejected' ? 'يلزم استكمال بيانات الاعتماد' : 'طلب الاعتماد قيد المراجعة'}</h3>
            </div>
          </div>

          <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-end">
            <span className="text-[10px] text-slate-300 block">تاريخ تقديم الطلب:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">{provider?.submittedAt ? new Date(provider.submittedAt).toLocaleDateString('ar') : 'لم يُحدّد'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-slate-400 block mb-1 text-[11px]">رقم الترخيص التعليمي:</span>
            <span className="font-mono font-bold text-white text-sm">{provider?.licenseNumber || 'لم يُقدّم بعد'}</span>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-slate-400 block mb-1 text-[11px]">الجهة المانحة والمشرفة:</span>
            <span className="font-semibold text-white">يُراجع بعد إرسال بيانات الترخيص</span>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-slate-400 block mb-1 text-[11px]">تصنيف المنشأة:</span>
            <span className="font-semibold text-white">{currentType.nameAr}</span>
          </div>
        </div>
      </div>

      {/* Grid: Institutional Data & Uploaded Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Institutional Profile Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-700" />
              بيانات ومقر المؤسسة التعليمية
            </h3>
            <span className="text-xs text-slate-400">حساب المنشأة</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-500 text-[11px]">الاسم الرسمي المسجل:</span>
              <div className="font-bold text-slate-900 text-sm">{provider?.name || 'أكمل اسم المؤسسة من الإعدادات'}</div>
              <div className="text-[11px] text-slate-500">{provider?.description || 'لم تُضف نبذة للمؤسسة بعد.'}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 text-[11px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  المقر والمدينة:
                </span>
                <span className="font-semibold text-slate-800">{provider?.city || 'لم تُحدّد المدينة'}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 text-[11px] flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-400" />
                  الموقع الإلكتروني:
                </span>
                <span className="font-mono text-indigo-700">{provider?.website || 'لم يُضف موقعاً'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 text-[11px] flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  هاتف الإدارة والقبول:
                </span>
                <span className="font-mono text-slate-800">{provider?.contactPhone || 'لم يُضف رقم هاتف'}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-500 text-[11px] flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  البريد الرسمي:
                </span>
                <span className="font-mono text-slate-800">{provider?.contactEmail || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              بيانات طلب الاعتماد
            </h3>
            <p className="text-xs text-slate-500 mt-1">بعد إرسالها، تراجع الإدارة الطلب. اعتماد المنشأة لا يتم تلقائياً.</p>
          </div>
          <label className="block text-xs font-semibold text-slate-700 space-y-1">
            <span>رقم الترخيص الرسمي</span>
            <input value={licenseNumber} onChange={(event) => setLicenseNumber(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono" required />
          </label>
          <label className="block text-xs font-semibold text-slate-700 space-y-1">
            <span>المدينة</span>
            <input value={city} onChange={(event) => setCity(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2" required />
          </label>
          <Button type="submit" variant="primary" disabled={isSaving} className="w-full">
            {isSaving ? 'جارٍ إرسال الطلب…' : 'إرسال بيانات الترخيص للمراجعة'}
          </Button>
          <p className="text-[11px] text-slate-500">إرفاق الملفات غير مفعّل بعد؛ لن تظهر مستندات حتى يُعدّ Firebase Storage.</p>
        </form>
      </div>
    </div>
  );
};
