import React, { useEffect, useState } from 'react';
import { ProviderTypeOption, StaffMember } from '../types';
import { EducationalProvider } from '../../../types';
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
  onSaveProfile: (details: { name: string; city: string; description: string; phone: string; email: string }) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  currentType,
  provider,
  staffList,
  onAddStaff,
  onSaveProfile,
  onShowToast,
}) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'team' | 'notifications' | 'payment'>('profile');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  // Profile form
  const [instName, setInstName] = useState(provider?.name || currentType.institutionName || '');
  const [city, setCity] = useState(provider?.city || '');
  const [desc, setDesc] = useState(provider?.description || '');
  const [phone, setPhone] = useState(provider?.contactPhone || '');
  const [email, setEmail] = useState(provider?.contactEmail || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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
  }, [provider, currentType]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await onSaveProfile({ name: instName, city, description: desc, phone, email });
      onShowToast('تم حفظ بيانات المؤسسة في Firebase.');
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'تعذر حفظ بيانات المؤسسة.');
    } finally {
      setIsSavingProfile(false);
    }
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
              <label className="block font-semibold text-slate-800 mb-1">اسم المؤسسة بالعربية</label>
              <input
                type="text"
                value={instName}
                onChange={(e) => setInstName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1">المدينة والموقع</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
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
              <label className="block font-semibold text-slate-800 mb-1">رقم الهاتف الرسمي</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
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
        </form>
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
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 text-xs text-slate-700">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-700" />
            حالة الدفع والتحصيل
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
