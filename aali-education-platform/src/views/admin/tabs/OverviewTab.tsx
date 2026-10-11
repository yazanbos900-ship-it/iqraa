import React from 'react';
import { ArrowLeft, BookOpen, Building2, Wallet } from 'lucide-react';
import { usePlatformData } from '../../../firebase/PlatformDataContext';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Card, CardTitle } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../components/ui/Table';

interface OverviewTabProps {
  onSelectTab: (tab: string) => void;
}

const confirmedStatuses = new Set(['confirmed', 'in-progress', 'completed']);

export const OverviewTab: React.FC<OverviewTabProps> = ({ onSelectTab }) => {
  const { providers, services, enrollments, catalogLoading, catalogError } = usePlatformData();

  const approvedProviders = providers.filter((provider) =>
    provider.verificationStatus !== 'pending'
    && provider.accountStatus !== 'suspended'
    && (provider.accredited || provider.verificationStatus === 'approved')
  );
  const pendingProviders = providers.filter((provider) => provider.verificationStatus === 'pending');
  const suspendedProviders = providers.filter((provider) => provider.verificationStatus !== 'pending' && provider.accountStatus === 'suspended');
  const activeServices = services.filter((service) => service.status === 'active');
  const closedServices = services.filter((service) => service.status === 'closed');
  const pendingEnrollments = enrollments.filter((enrollment) => enrollment.status === 'pending');
  const confirmedEnrollments = enrollments.filter((enrollment) => confirmedStatuses.has(enrollment.status));

  const totalsByCurrency = confirmedEnrollments.reduce<Record<string, number>>((totals, enrollment) => {
    const currency = enrollment.currency?.trim() || 'غير محددة';
    totals[currency] = (totals[currency] || 0) + (Number.isFinite(enrollment.amount) ? enrollment.amount : 0);
    return totals;
  }, {});

  const latestPending = [...pendingProviders]
    .sort((first, second) => new Date(second.submittedAt || second.createdAt || 0).getTime() - new Date(first.submittedAt || first.createdAt || 0).getTime())
    .slice(0, 5);

  const MetricCard: React.FC<{ label: string; value: number; tone?: string }> = ({ label, value, tone = 'text-slate-900' }) => (
    <Card className="p-4">
      <p className="text-sm text-slate-600">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${tone}`}>{value.toLocaleString('ar')}</p>
    </Card>
  );

  if (catalogLoading) return <LoadingSpinner label="جارٍ تحميل بيانات لوحة الإدارة" />;
  if (catalogError) return <Alert type="error">تعذر تحميل بيانات Firestore: {catalogError}</Alert>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">الرئيسية</h1>
        <p className="mt-1 text-sm text-slate-600">ملخص مباشر للمؤسسات والدورات والتسجيلات في Firestore.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">المؤسسات</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetricCard label="معتمدة" value={approvedProviders.length} tone="text-emerald-700" />
          <MetricCard label="بانتظار المراجعة" value={pendingProviders.length} tone="text-amber-700" />
          <MetricCard label="موقوفة" value={suspendedProviders.length} tone="text-rose-700" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">الدورات</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MetricCard label="فعّالة" value={activeServices.length} tone="text-emerald-700" />
          <MetricCard label="موقوفة أو مغلقة" value={closedServices.length} tone="text-slate-700" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">التسجيلات</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetricCard label="الإجمالي" value={enrollments.length} />
          <MetricCard label="بانتظار المراجعة" value={pendingEnrollments.length} tone="text-amber-700" />
          <MetricCard label="مؤكدة أو قيد التنفيذ أو مكتملة" value={confirmedEnrollments.length} tone="text-emerald-700" />
        </div>
      </section>

      <Card className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-indigo-700" />
          <CardTitle className="text-base">إجمالي مبالغ التسجيلات المؤكدة</CardTitle>
        </div>
        {Object.keys(totalsByCurrency).length === 0 ? (
          <p className="text-sm text-slate-600">لا توجد تسجيلات مؤكدة حتى الآن.</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(totalsByCurrency).sort(([first], [second]) => first.localeCompare(second)).map(([currency, amount]) => (
              <li key={currency} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 text-sm last:border-0 last:pb-0">
                <span className="text-slate-600">{currency}</span>
                <span className="font-semibold tabular-nums text-slate-900">{amount.toLocaleString('ar', { maximumFractionDigits: 2 })} {currency}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-indigo-700" />
            <CardTitle className="text-base">آخر طلبات الاعتماد بانتظار المراجعة</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => onSelectTab('verifications')} rightIcon={<ArrowLeft className="h-4 w-4" />}>
            فتح طلبات الاعتماد
          </Button>
        </div>
        {latestPending.length === 0 ? (
          <EmptyState icon={<BookOpen className="h-6 w-6" />} title="لا توجد طلبات معلقة" description="طلبات الاعتماد الجديدة ستظهر هنا." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>المؤسسة</TableHeaderCell>
                <TableHeaderCell>المدينة</TableHeaderCell>
                <TableHeaderCell>تاريخ التقديم</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {latestPending.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell className="font-semibold text-slate-900">{provider.name}</TableCell>
                  <TableCell>{provider.city || '—'}</TableCell>
                  <TableCell>{provider.submittedAt || provider.createdAt || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};