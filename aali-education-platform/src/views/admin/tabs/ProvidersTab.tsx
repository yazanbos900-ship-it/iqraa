import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { usePlatformData } from '../../../firebase/PlatformDataContext';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../components/ui/Table';
import { EducationalProvider } from '../../../types';
import { ProviderProfileCustomizer } from '../../provider/components/ProviderProfileCustomizer';

type ProviderStatus = 'approved' | 'pending' | 'suspended' | 'rejected' | 'unverified';

const getProviderStatus = (provider: EducationalProvider): ProviderStatus => {
  if (provider.verificationStatus === 'pending') return 'pending';
  if (provider.accountStatus === 'suspended') return 'suspended';
  if (provider.accredited || provider.verificationStatus === 'approved') return 'approved';
  if (provider.verificationStatus === 'rejected') return 'rejected';
  return 'unverified';
};

const providerStatusLabel: Record<ProviderStatus, string> = {
  approved: 'معتمدة',
  pending: 'بانتظار المراجعة',
  suspended: 'موقوفة',
  rejected: 'مرفوضة',
  unverified: 'غير معتمدة',
};

const providerStatusVariant: Record<ProviderStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  approved: 'success',
  pending: 'warning',
  suspended: 'danger',
  rejected: 'danger',
  unverified: 'neutral',
};

export const ProvidersTab: React.FC = () => {
  const { providers, services, categories, updateProvider, catalogLoading, catalogError } = usePlatformData();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [commissionProvider, setCommissionProvider] = useState<EducationalProvider | null>(null);
  const [customizingProvider, setCustomizingProvider] = useState<EducationalProvider | null>(null);
  const [commissionRate, setCommissionRate] = useState('10');
  const [commissionError, setCommissionError] = useState('');
  const [suspendProviderTarget, setSuspendProviderTarget] = useState<EducationalProvider | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [suspendError, setSuspendError] = useState('');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredProviders = useMemo(() => providers.filter((provider) => {
    const matchesStatus = statusFilter === 'all' || getProviderStatus(provider) === statusFilter;
    const matchesName = provider.name.toLocaleLowerCase('ar').includes(search.trim().toLocaleLowerCase('ar'));
    return matchesStatus && matchesName;
  }), [providers, search, statusFilter]);

  const openCommissionModal = (provider: EducationalProvider) => {
    setCommissionProvider(provider);
    setCommissionRate(String(provider.commissionRate ?? 10));
    setCommissionError('');
  };

  const saveCommission = async () => {
    const value = Number(commissionRate);
    if (!commissionRate.trim() || !Number.isFinite(value) || value < 0 || value > 100) {
      setCommissionError('أدخل نسبة عمولة من 0 إلى 100.');
      return;
    }
    if (!commissionProvider) return;
    setIsSaving(true);
    try {
      await updateProvider(commissionProvider.id, { commissionRate: value });
      setActionNotice({ type: 'success', message: `تم تحديث عمولة «${commissionProvider.name}».` });
      setCommissionProvider(null);
    } catch (error) {
      setCommissionError(error instanceof Error ? error.message : 'تعذر حفظ نسبة العمولة.');
    } finally {
      setIsSaving(false);
    }
  };

  const suspendProvider = async () => {
    if (!suspendProviderTarget) return;
    if (confirmName !== suspendProviderTarget.name) {
      setSuspendError('اكتب اسم المؤسسة تماماً لتأكيد الإيقاف.');
      return;
    }
    setIsSaving(true);
    try {
      await updateProvider(suspendProviderTarget.id, { accountStatus: 'suspended', accredited: false });
      setActionNotice({ type: 'success', message: `تم إيقاف «${suspendProviderTarget.name}».` });
      setSuspendProviderTarget(null);
      setConfirmName('');
    } catch (error) {
      setSuspendError(error instanceof Error ? error.message : 'تعذر إيقاف المؤسسة.');
    } finally {
      setIsSaving(false);
    }
  };

  const reactivateProvider = async (provider: EducationalProvider) => {
    if (provider.verificationStatus !== 'approved') {
      setActionNotice({ type: 'error', message: `لا يمكن إعادة تفعيل «${provider.name}» قبل اعتماد طلبها.` });
      return;
    }
    try {
      await updateProvider(provider.id, { accountStatus: 'active', accredited: true });
      setActionNotice({ type: 'success', message: `تمت إعادة تفعيل «${provider.name}».` });
    } catch (error) {
      setActionNotice({ type: 'error', message: error instanceof Error ? error.message : 'تعذر إعادة تفعيل المؤسسة.' });
    }
  };

  if (catalogLoading) return <LoadingSpinner label="جارٍ تحميل المؤسسات" />;
  if (catalogError) return <Alert type="error">تعذر تحميل بيانات Firestore: {catalogError}</Alert>;
  if (customizingProvider) {
    const selectedProvider = providers.find((provider) => provider.id === customizingProvider.id) || customizingProvider;
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">تعديل الصفحة العامة للمؤسسة</h1>
          <p className="mt-1 text-sm text-slate-600">التعديلات ستظهر على الصفحة نفسها التي يراها زوار المنصة.</p>
        </div>
        <ProviderProfileCustomizer
          key={selectedProvider.id}
          provider={selectedProvider}
          onSave={(details) => updateProvider(selectedProvider.id, details)}
          onShowMessage={(message, type = 'success') => setActionNotice({ type, message })}
          onCancel={() => setCustomizingProvider(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">المؤسسات</h1>
        <p className="mt-1 text-sm text-slate-600">إدارة حالة المؤسسة ونسبة العمولة من بيانات Firestore.</p>
      </div>

      {actionNotice && <Alert type={actionNotice.type} onClose={() => setActionNotice(null)}>{actionNotice.message}</Alert>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="بحث بالاسم" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="اكتب اسم المؤسسة" rightIcon={<Search className="h-4 w-4" />} />
        <Select
          label="الحالة"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          options={[
            { value: 'all', label: 'كل الحالات' },
            { value: 'approved', label: 'معتمدة' },
            { value: 'pending', label: 'بانتظار المراجعة' },
            { value: 'suspended', label: 'موقوفة' },
            { value: 'rejected', label: 'مرفوضة' },
            { value: 'unverified', label: 'غير معتمدة' },
          ]}
        />
      </div>

      {filteredProviders.length === 0 ? (
        <EmptyState title="لا توجد مؤسسات مطابقة" description="غيّر البحث أو فلتر الحالة لعرض المؤسسات." />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>المؤسسة</TableHeaderCell>
              <TableHeaderCell>القطاع</TableHeaderCell>
              <TableHeaderCell>المدينة</TableHeaderCell>
              <TableHeaderCell>الحالة</TableHeaderCell>
              <TableHeaderCell>العمولة</TableHeaderCell>
              <TableHeaderCell>دورات فعّالة</TableHeaderCell>
              <TableHeaderCell>دورات موقوفة</TableHeaderCell>
              <TableHeaderCell>الإجراءات</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProviders.map((provider) => {
              const providerServices = services.filter((service) => service.providerId === provider.id);
              const status = getProviderStatus(provider);
              return (
                <TableRow key={provider.id}>
                  <TableCell className="font-semibold text-slate-900">{provider.name}</TableCell>
                  <TableCell>{categories.find((category) => category.id === provider.category)?.nameAr || provider.category}</TableCell>
                  <TableCell>{provider.city || '—'}</TableCell>
                  <TableCell><Badge variant={providerStatusVariant[status]}>{providerStatusLabel[status]}</Badge></TableCell>
                  <TableCell>{provider.commissionRate ?? 10}%</TableCell>
                  <TableCell>{providerServices.filter((service) => service.status === 'active').length}</TableCell>
                  <TableCell>{providerServices.filter((service) => service.status === 'closed').length}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openCommissionModal(provider)}>تعديل العمولة</Button>
                      <Button variant="outline" size="sm" onClick={() => setCustomizingProvider(provider)}>تخصيص الصفحة</Button>
                      {provider.accountStatus === 'suspended' ? (
                        <Button variant="primary" size="sm" onClick={() => void reactivateProvider(provider)}>إعادة التفعيل</Button>
                      ) : (
                        <Button variant="danger" size="sm" onClick={() => {
                          setSuspendProviderTarget(provider);
                          setConfirmName('');
                          setSuspendError('');
                        }}>إيقاف</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={commissionProvider !== null}
        onClose={() => setCommissionProvider(null)}
        title="تعديل نسبة العمولة"
        description={commissionProvider?.name}
        footer={(
          <>
            <Button variant="outline" onClick={() => setCommissionProvider(null)}>إلغاء</Button>
            <Button variant="primary" onClick={() => void saveCommission()} disabled={isSaving}>حفظ</Button>
          </>
        )}
      >
        <Input
          label="نسبة العمولة (%)"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={commissionRate}
          onChange={(event) => setCommissionRate(event.target.value)}
          error={commissionError}
          required
        />
      </Modal>

      <Modal
        isOpen={suspendProviderTarget !== null}
        onClose={() => setSuspendProviderTarget(null)}
        title="تأكيد إيقاف المؤسسة"
        description="سيؤدي الإيقاف إلى إزالة الاعتماد ومنع التسجيلات الجديدة."
        footer={(
          <>
            <Button variant="outline" onClick={() => setSuspendProviderTarget(null)}>إلغاء</Button>
            <Button variant="danger" onClick={() => void suspendProvider()} disabled={isSaving}>تأكيد الإيقاف</Button>
          </>
        )}
      >
        <Input
          label={`اكتب اسم المؤسسة: ${suspendProviderTarget?.name || ''}`}
          value={confirmName}
          onChange={(event) => setConfirmName(event.target.value)}
          error={suspendError}
          autoComplete="off"
        />
      </Modal>
    </div>
  );
};