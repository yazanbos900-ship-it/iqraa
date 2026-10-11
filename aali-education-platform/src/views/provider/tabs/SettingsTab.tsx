import React, { useEffect, useRef, useState } from 'react';
import { ProviderTypeOption, StaffMember } from '../types';
import { EducationalProvider } from '../../../types';
import { ProviderPayoutInfo } from '../../../firebase/PlatformDataContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { 
  Settings, 
  Users, 
  Bell, 
  CreditCard, 
  ShieldCheck, 
  Plus, 
  Save, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Lock,
  Building2
} from 'lucide-react';

interface SettingsTabProps {
  currentType: ProviderTypeOption;
  provider?: EducationalProvider;
  staffList: StaffMember[];
  onAddStaff: (member: Omit<StaffMember, 'id'>) => Promise<void>;
  payoutInfo: ProviderPayoutInfo | null;
  onSaveProfile: (details: { name: string; city: string; description: string; phone: string; email: string }) => Promise<void>;
  onSaveOrganizationDetails: (details: {
    contactPerson: string;
    landline: string;
    workingHours: string;
    addressDetails: NonNullable<EducationalProvider['addressDetails']>;
  }) => Promise<void>;
  onSavePayoutInfo: (details: ProviderPayoutInfo) => Promise<void>;
  onPayoutInfoChange: (details: ProviderPayoutInfo) => void;
  onShowToast: (msg: string) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  currentType,
  provider,
  staffList,
  payoutInfo,
  onAddStaff,
  onSaveProfile,
  onSaveOrganizationDetails,
  onSavePayoutInfo,
  onPayoutInfoChange,
  onShowToast,
}) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'appearance' | 'team' | 'notifications' | 'payment'>('profile');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  // Profile form
  const [instName, setInstName] = useState(provider?.name || currentType.institutionName || '');
  const [city, setCity] = useState(provider?.city || '');
  const [desc, setDesc] = useState(provider?.description || '');
  const [phone, setPhone] = useState(provider?.contactPhone || '');
  const [email, setEmail] = useState(provider?.contactEmail || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [contactPerson, setContactPerson] = useState(provider?.contactPerson || '');
  const [landline, setLandline] = useState(provider?.landline || '');
  const [workingHours, setWorkingHours] = useState(provider?.workingHours || '');
  const [country, setCountry] = useState(provider?.addressDetails?.country || '');
  const [addressCity, setAddressCity] = useState(provider?.addressDetails?.city || '');
  const [district, setDistrict] = useState(provider?.addressDetails?.district || '');
  const [street, setStreet] = useState(provider?.addressDetails?.street || '');
  const [addressNumber, setAddressNumber] = useState(provider?.addressDetails?.number || '');
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [payoutType, setPayoutType] = useState<ProviderPayoutInfo['accountType']>(payoutInfo?.accountType || 'iban');
  const [payoutNumber, setPayoutNumber] = useState(payoutInfo?.accountNumber || '');
  const [accountHolderName, setAccountHolderName] = useState(payoutInfo?.accountHolderName || '');
  const [payoutErrors, setPayoutErrors] = useState<Record<string, string>>({});
  const [isSavingPayout, setIsSavingPayout] = useState(false);
  const [bannerPreview, setBannerPreview] = useState('');
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const mediaPreviewRef = useRef({ banner: '', gallery: [] as string[] });

  // Staff form
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('منسق قبول وتسجيل');
  const [staffDept, setStaffDept] = useState('شؤون الطلاب');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');

  useEffect(() => {
    setInstName(provider?.name || currentType.institutionName || '');
    setCity(provider?.city || '');
    setDesc(provider?.description || '');
    setPhone(provider?.contactPhone || '');
    setEmail(provider?.contactEmail || '');
    setContactPerson(provider?.contactPerson || '');
    setLandline(provider?.landline || '');
    setWorkingHours(provider?.workingHours || '');
    setCountry(provider?.addressDetails?.country || '');
    setAddressCity(provider?.addressDetails?.city || '');
    setDistrict(provider?.addressDetails?.district || '');
    setStreet(provider?.addressDetails?.street || '');
    setAddressNumber(provider?.addressDetails?.number || '');
  }, [provider, currentType]);

  useEffect(() => {
    setPayoutType(payoutInfo?.accountType || 'iban');
    setPayoutNumber(payoutInfo?.accountNumber || '');
    setAccountHolderName(payoutInfo?.accountHolderName || '');
  }, [payoutInfo]);

  useEffect(() => {
    mediaPreviewRef.current = { banner: bannerPreview, gallery: galleryPreviews };
  }, [bannerPreview, galleryPreviews]);

  useEffect(() => () => {
    if (mediaPreviewRef.current.banner) URL.revokeObjectURL(mediaPreviewRef.current.banner);
    mediaPreviewRef.current.gallery.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!instName.trim()) errors.instName = 'اسم الجهة مطلوب.';
    if (!city.trim()) errors.city = 'المدينة مطلوبة.';
    if (!contactPerson.trim()) errors.contactPerson = 'الشخص المسؤول مطلوب.';
    if (!landline.trim()) errors.landline = 'الهاتف الأرضي مطلوب.';
    if (!phone.trim()) errors.phone = 'رقم الجوال مطلوب.';
    if (!workingHours.trim()) errors.workingHours = 'ساعات الدوام مطلوبة.';
    if (!country.trim()) errors.country = 'الدولة مطلوبة.';
    if (!addressCity.trim()) errors.addressCity = 'مدينة العنوان مطلوبة.';
    if (!district.trim()) errors.district = 'الحي مطلوب.';
    if (!street.trim()) errors.street = 'الشارع مطلوب.';
    if (!addressNumber.trim()) errors.addressNumber = 'رقم المبنى مطلوب.';
    setProfileErrors(errors);
    if (Object.keys(errors).length) return;
    setIsSavingProfile(true);
    try {
      await onSaveProfile({ name: instName, city, description: desc, phone, email });
      await onSaveOrganizationDetails({
        contactPerson,
        landline,
        workingHours,
        addressDetails: { country, city: addressCity, district, street, number: addressNumber },
      });
      onShowToast('تم حفظ بيانات المؤسسة في Firebase.');
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'تعذر حفظ بيانات المؤسسة.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePayoutInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!payoutNumber.trim()) errors.payoutNumber = 'رقم الحساب أو الرمز مطلوب.';
    if (!accountHolderName.trim()) errors.accountHolderName = 'اسم صاحب الحساب مطلوب.';
    setPayoutErrors(errors);
    if (Object.keys(errors).length) return;
    setIsSavingPayout(true);
    const details: ProviderPayoutInfo = {
      accountType: payoutType,
      accountNumber: payoutNumber.trim(),
      accountHolderName: accountHolderName.trim(),
    };
    try {
      await onSavePayoutInfo(details);
      onPayoutInfoChange(details);
      onShowToast('تم حفظ بيانات الاستلام في المسار الخاص بالمؤسسة.');
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'تعذر حفظ بيانات الاستلام.');
    } finally {
      setIsSavingPayout(false);
    }
  };

  const setBannerFile = (file?: File) => {
    setBannerPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : '';
    });
  };

  const addGalleryFiles = (files: FileList | null) => {
    if (!files) return;
    setGalleryPreviews((current) => [
      ...current,
      ...Array.from(files).map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) return;

    const newMember: Omit<StaffMember, 'id'> = {
      name: staffName,
      role: staffRole,
      department: staffDept,
      email: staffEmail,
      phone: staffPhone,
      status: 'pending',
    };

    try {
      await onAddStaff(newMember);
      setIsAddStaffOpen(false);
      setStaffName('');
      onShowToast(`تم حفظ جهة الاتصال ${newMember.name} في حساب المؤسسة.`);
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'تعذر حفظ جهة الاتصال.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              إعدادات حساب المؤسسة وفريق العمل
            </h2>
            <Badge variant="info">
              إدارة المنشأة
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            تحديث بيانات المؤسسة وإدارة جهات اتصال الفريق
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveSection('profile')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSection === 'profile' ? 'bg-white text-indigo-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            بيانات المنشأة
          </button>
          <button
            onClick={() => setActiveSection('appearance')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSection === 'appearance' ? 'bg-white text-indigo-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تخصيص الصفحة
          </button>
          <button
            onClick={() => setActiveSection('team')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSection === 'team' ? 'bg-white text-indigo-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            جهات الاتصال ({staffList.length})
          </button>
          <button
            onClick={() => setActiveSection('notifications')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSection === 'notifications' ? 'bg-white text-indigo-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الإشعارات
          </button>
          <button
            onClick={() => setActiveSection('payment')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeSection === 'payment' ? 'bg-white text-indigo-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            بوابات الدفع
          </button>
        </div>
      </div>

      {/* Section 1: Profile */}
      {activeSection === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5 text-xs text-slate-700">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-700" />
              البيانات العامة للمؤسسة التعليمية
            </h3>
            <Button type="submit" variant="primary" size="sm" className="gap-1.5" disabled={isSavingProfile}>
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingProfile ? 'جارٍ الحفظ…' : 'حفظ التعديلات'}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">اسم الجهة <span className="text-rose-600">*</span></label>
              <input
                type="text"
                required
                value={instName}
                onChange={(e) => setInstName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {profileErrors.instName && <p className="mt-1 text-rose-600">{profileErrors.instName}</p>}
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1">المدينة <span className="text-rose-600">*</span></label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {profileErrors.city && <p className="mt-1 text-rose-600">{profileErrors.city}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">الشخص المسؤول <span className="text-rose-600">*</span></label>
              <input type="text" required value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
              {profileErrors.contactPerson && <p className="mt-1 text-rose-600">{profileErrors.contactPerson}</p>}
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1">الهاتف الأرضي <span className="text-rose-600">*</span></label>
              <input type="tel" required value={landline} onChange={(e) => setLandline(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono" />
              {profileErrors.landline && <p className="mt-1 text-rose-600">{profileErrors.landline}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">النبذة التعريفية للمؤسسة</label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">رقم الجوال <span className="text-rose-600">*</span></label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
              {profileErrors.phone && <p className="mt-1 text-rose-600">{profileErrors.phone}</p>}
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1">البريد الإلكتروني للقبول</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">ساعات الدوام <span className="text-rose-600">*</span></label>
            <input type="text" required placeholder="مثال: 8 ص - 4 م" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
            {profileErrors.workingHours && <p className="mt-1 text-rose-600">{profileErrors.workingHours}</p>}
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900">العنوان التفصيلي <span className="text-rose-600">*</span></h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'الدولة', value: country, set: setCountry, error: 'country', message: 'الدولة مطلوبة.' },
                { label: 'المدينة', value: addressCity, set: setAddressCity, error: 'addressCity', message: 'مدينة العنوان مطلوبة.' },
                { label: 'الحي', value: district, set: setDistrict, error: 'district', message: 'الحي مطلوب.' },
                { label: 'الشارع', value: street, set: setStreet, error: 'street', message: 'الشارع مطلوب.' },
                { label: 'الرقم', value: addressNumber, set: setAddressNumber, error: 'addressNumber', message: 'رقم المبنى مطلوب.' },
              ].map((field) => (
                <div key={field.error}>
                  <label className="block font-semibold text-slate-800 mb-1">{field.label} <span className="text-rose-600">*</span></label>
                  <input type="text" required value={field.value} onChange={(e) => field.set(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
                  {profileErrors[field.error] && <p className="mt-1 text-rose-600">{field.message}</p>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">نوع الخدمة التعليمية</label>
            <p className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">{currentType.nameAr} — الفئة الحالية</p>
          </div>
        </form>
      )}

      {activeSection === 'appearance' && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5 text-xs text-slate-700">
          <div>
            <h3 className="text-base font-bold text-slate-900">تخصيص صفحة الجهة</h3>
            <p className="mt-1 text-slate-500">معاينة محلية مؤقتة؛ لن تُحفظ الصور ولن تظهر للطلاب قبل ربط التخزين السحابي لاحقاً.</p>
          </div>
          <div>
            <label className="block font-semibold text-slate-800 mb-2">صورة البنر</label>
            <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0])} className="block w-full text-xs" />
            {bannerPreview && <img src={bannerPreview} alt="معاينة البنر" className="mt-3 h-40 w-full rounded-xl object-cover" />}
          </div>
          <div>
            <label className="block font-semibold text-slate-800 mb-2">صور صفحة الجهة</label>
            <input type="file" accept="image/*" multiple onChange={(e) => addGalleryFiles(e.target.files)} className="block w-full text-xs" />
            {galleryPreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {galleryPreviews.map((src, index) => <img key={`${src}-${index}`} src={src} alt={`معاينة صورة ${index + 1}`} className="h-28 w-full rounded-lg object-cover" />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Section 2: Team */}
      {activeSection === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              جهات اتصال فريق المؤسسة
            </h3>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddStaffOpen(true)}
              className="text-xs gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة جهة اتصال</span>
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>الاسم</TableHeaderCell>
                  <TableHeaderCell>المسمى الوظيفي</TableHeaderCell>
                  <TableHeaderCell>القسم</TableHeaderCell>
                  <TableHeaderCell>البريد الإلكتروني</TableHeaderCell>
                  <TableHeaderCell>رقم الاتصال</TableHeaderCell>
                  <TableHeaderCell>الحالة</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staffList.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-semibold text-slate-900">
                      {member.name}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">{member.role}</TableCell>
                    <TableCell className="text-xs text-slate-500">{member.department}</TableCell>
                    <TableCell className="text-xs font-mono text-slate-600">{member.email}</TableCell>
                    <TableCell className="text-xs font-mono text-slate-600">{member.phone}</TableCell>
                    <TableCell>
                    <Badge variant="neutral">جهة اتصال</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Section 3: Notifications */}
      {activeSection === 'notifications' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 text-xs text-slate-700">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-700" />
            تفضيلات التنبيهات والإشعارات الفورية
          </h3>

          <p className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 leading-relaxed">
            تظهر الاستفسارات وطلبات الالتحاق الجديدة مباشرةً في صندوق المؤسسة عند اتصال الحساب بـFirestore. تنبيهات البريد والرسائل النصية غير مفعّلة حالياً.
          </p>
        </div>
      )}

      {/* Section 4: Payment */}
      {activeSection === 'payment' && (
        <div className="space-y-5">
        <form onSubmit={handleSavePayoutInfo} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 text-xs text-slate-700">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              حساب استلام المبالغ
            </h3>
            <Button type="submit" variant="primary" size="sm" disabled={isSavingPayout}>
              {isSavingPayout ? 'جارٍ الحفظ…' : 'حفظ بيانات الاستلام'}
            </Button>
          </div>
          <p className="text-slate-500">هذه البيانات خاصة ولا تُحفظ في ملف المؤسسة العام.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">نوع الحساب <span className="text-rose-600">*</span></label>
              <select value={payoutType} onChange={(e) => setPayoutType(e.target.value as ProviderPayoutInfo['accountType'])} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <option value="iban">IBAN</option>
                <option value="sham-cash">شام كاش</option>
                <option value="pay-meera">باي ميرا</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1">رقم الحساب أو الرمز <span className="text-rose-600">*</span></label>
              <input required value={payoutNumber} onChange={(e) => setPayoutNumber(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono" />
              {payoutErrors.payoutNumber && <p className="mt-1 text-rose-600">{payoutErrors.payoutNumber}</p>}
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1">اسم صاحب الحساب <span className="text-rose-600">*</span></label>
              <input required value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" />
              {payoutErrors.accountHolderName && <p className="mt-1 text-rose-600">{payoutErrors.accountHolderName}</p>}
            </div>
          </div>
        </form>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 text-xs text-slate-700">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-700" />
            بوابات الدفع والتحصيل
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">سداد ومدى والبطاقات الائتمانية</span>
                <Badge variant="warning">غير مفعّل</Badge>
              </div>
              <p className="text-[11px] text-slate-600">
                Firebase يسجل طلبات الالتحاق فقط. لا توجد بوابة تحصيل إلكتروني مفعّلة حالياً.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">نظام الأقساط الميسرة (3 - 4 دفعات)</span>
                <Badge variant="neutral">غير مفعّل</Badge>
              </div>
              <p className="text-[11px] text-slate-600">
                لا يتم حالياً جدولة الأقساط أو تسجيل دفعات مدفوعة في النظام.
              </p>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddStaffOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddStaffOpen(false)}
          title="إضافة جهة اتصال لفريق المؤسسة"
          maxWidth="md"
        >
          <form onSubmit={handleCreateStaff} className="space-y-4 text-xs text-slate-700">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">الاسم الكامل *</label>
              <input
                type="text"
                required
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="مثال: د. محمد السعيد..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">المسمى الوظيفي</label>
                <input
                  type="text"
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">القسم / الإدارة</label>
                <input
                  type="text"
                  value={staffDept}
                  onChange={(e) => setStaffDept(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="name@academy.edu.sa"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddStaffOpen(false)}>
                إلغاء
              </Button>
              <Button type="submit" variant="primary" size="sm" className="font-semibold">
                حفظ جهة الاتصال
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
