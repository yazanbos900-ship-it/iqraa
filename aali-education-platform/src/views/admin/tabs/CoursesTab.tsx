import React, { useMemo, useState } from 'react';
import { usePlatformData } from '../../../firebase/PlatformDataContext';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Select } from '../../../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../components/ui/Table';

export const CoursesTab: React.FC = () => {
  const { services, providers, updateService, clearAdminServicePause, catalogLoading, catalogError } = usePlatformData();
  const [providerFilter, setProviderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredServices = useMemo(() => services.filter((service) => {
    const matchesProvider = providerFilter === 'all' || service.providerId === providerFilter;
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    const matchesTitle = service.title.toLocaleLowerCase('ar').includes(search.trim().toLocaleLowerCase('ar'));
    return matchesProvider && matchesStatus && matchesTitle;
  }), [services, providerFilter, statusFilter, search]);

  const handlePause = async (serviceId: string) => {
    const service = services.find((item) => item.id === serviceId);
    if (!service || service.status === 'closed') return;
    setUpdatingId(serviceId);
    try {
      await updateService(service.id, {
        status: 'closed',
        statusBeforePause: service.status,
        pausedByAdmin: true,
      });
      setActionNotice({ type: 'success', message: `تم إيقاف «${service.title}» من الإدارة.` });
    } catch (error) {
      setActionNotice({ type: 'error', message: error instanceof Error ? error.message : 'تعذر إيقاف الدورة.' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResume = async (serviceId: string) => {
    const service = services.find((item) => item.id === serviceId);
    if (!service || !service.pausedByAdmin) return;
    setUpdatingId(serviceId);
    try {
      await updateService(service.id, {
        status: service.statusBeforePause || 'active',
      });
      await clearAdminServicePause(service.id);
      setActionNotice({ type: 'success', message: `تم استئناف «${service.title}».` });
    } catch (error) {
      setActionNotice({ type: 'error', message: error instanceof Error ? error.message : 'تعذر استئناف الدورة.' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (catalogLoading) return <LoadingSpinner label="جارٍ تحميل الدورات" />;
  if (catalogError) return <Alert type="error">تعذر تحميل بيانات Firestore: {catalogError}</Alert>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">الدورات</h1>
        <p className="mt-1 text-sm text-slate-600">إيقاف واستئناف نشر الدورات من بيانات Firestore.</p>
      </div>

      {actionNotice && <Alert type={actionNotice.type} onClose={() => setActionNotice(null)}>{actionNotice.message}</Alert>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input label="بحث بعنوان الدورة" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="اكتب عنوان الدورة" />
        <Select
          label="المؤسسة"
          value={providerFilter}
          onChange={(event) => setProviderFilter(event.target.value)}
          options={[
            { value: 'all', label: 'كل المؤسسات' },
            ...providers.map((provider) => ({ value: provider.id, label: provider.name })),
          ]}
        />
        <Select
          label="الحالة"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          options={[
            { value: 'all', label: 'كل الحالات' },
            { value: 'active', label: 'فعّالة' },
            { value: 'draft', label: 'مسودة' },
            { value: 'closed', label: 'موقوفة أو مغلقة' },
          ]}
        />
      </div>

      {filteredServices.length === 0 ? (
        <EmptyState title="لا توجد دورات مطابقة" description="غيّر البحث أو فلاتر المؤسسة والحالة لعرض الدورات." />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>عنوان الدورة</TableHeaderCell>
              <TableHeaderCell>المؤسسة</TableHeaderCell>
              <TableHeaderCell>السعر</TableHeaderCell>
              <TableHeaderCell>المقاعد المتاحة</TableHeaderCell>
              <TableHeaderCell>الحالة</TableHeaderCell>
              <TableHeaderCell>إجراء الإدارة</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredServices.map((service) => {
              const isAdminPaused = service.pausedByAdmin === true;
              const statusLabel = isAdminPaused
                ? 'موقوفة من الإدارة'
                : service.status === 'active' ? 'فعّالة' : service.status === 'draft' ? 'مسودة' : 'مغلقة';
              const statusVariant = isAdminPaused || service.status === 'closed'
                ? 'danger'
                : service.status === 'active' ? 'success' : 'neutral';
              return (
                <TableRow key={service.id}>
                  <TableCell className="font-semibold text-slate-900">{service.title}</TableCell>
                  <TableCell>{service.providerName || '—'}</TableCell>
                  <TableCell>{service.numericPrice.toLocaleString('ar')} {service.currency}</TableCell>
                  <TableCell>{service.seatsAvailable} من {service.totalSeats}</TableCell>
                  <TableCell><Badge variant={statusVariant}>{statusLabel}</Badge></TableCell>
                  <TableCell>
                    {isAdminPaused ? (
                      <Button variant="outline" size="sm" disabled={updatingId === service.id} onClick={() => void handleResume(service.id)}>
                        {updatingId === service.id ? 'جارٍ الاستئناف...' : 'استئناف'}
                      </Button>
                    ) : service.status !== 'closed' ? (
                      <Button variant="danger" size="sm" disabled={updatingId === service.id} onClick={() => void handlePause(service.id)}>
                        {updatingId === service.id ? 'جارٍ الإيقاف...' : 'إيقاف'}
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-500">مغلقة</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
};