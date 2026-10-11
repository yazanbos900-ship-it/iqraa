import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { usePlatformData } from '../../../firebase/PlatformDataContext';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../../components/ui/Table';
import { ProviderVerification } from '../../../types';

export const VerificationsTab: React.FC = () => {
  const { providers, categories, updateProvider, catalogLoading, catalogError } = usePlatformData();
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const verifications: ProviderVerification[] = providers
    .filter((provider) => provider.verificationStatus === 'pending')
    .map((provider) => ({
      id: provider.id,
      institutionName: provider.name,
      category: provider.category,
      licenseNumber: provider.licenseNumber || '',
      submissionDate: provider.submittedAt || provider.createdAt || '',
      status: 'pending',
      city: provider.city,
    }));

  const handleUpdateStatus = (id: string, newStatus: 'approved' | 'rejected') => {
    const item = verifications.find((verification) => verification.id === id);
    void updateProvider(id, { verificationStatus: newStatus, accredited: newStatus === 'approved' })
      .then(() => {
        setActionNotice(newStatus === 'approved'
          ? `تم اعتماد «${item?.institutionName}» وتفعيل ظهورها في الدليل.`
          : `تم رفض طلب «${item?.institutionName}».`);
        setTimeout(() => setActionNotice(null), 5000);
      })
      .catch((error) => setActionNotice(error instanceof Error ? error.message : 'تعذر تحديث طلب الاعتماد.'));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">قائمة تدقيق تراخيص مزودي الخدمات الجدد</h2>
        <p className="text-xs text-slate-500">التأكد من التراخيص الرسمية قبل منح شارة الاعتماد للمؤسسة</p>
      </div>

      {actionNotice && <Alert type="info" onClose={() => setActionNotice(null)}>{actionNotice}</Alert>}
      {catalogError && <Alert type="error">تعذر تحميل بيانات Firestore: {catalogError}</Alert>}
      {catalogLoading && <LoadingSpinner label="جارٍ تحميل طلبات الاعتماد" />}

      {!catalogLoading && !catalogError && verifications.length === 0 && (
        <EmptyState title="لا توجد طلبات اعتماد معلقة" description="ستظهر هنا طلبات المؤسسات التي تنتظر مراجعة التراخيص." />
      )}

      {!catalogLoading && !catalogError && verifications.length > 0 && (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>اسم المؤسسة / المركز</TableHeaderCell>
              <TableHeaderCell>التصنيف</TableHeaderCell>
              <TableHeaderCell>رقم الترخيص</TableHeaderCell>
              <TableHeaderCell>المدينة</TableHeaderCell>
              <TableHeaderCell>تاريخ التقديم</TableHeaderCell>
              <TableHeaderCell>الحالة</TableHeaderCell>
              <TableHeaderCell>إجراء المشرف</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {verifications.map((verification) => (
              <TableRow key={verification.id}>
                <TableCell className="font-semibold text-slate-900">{verification.institutionName}</TableCell>
                <TableCell className="text-xs text-slate-600">{categories.find((category) => category.id === verification.category)?.nameAr}</TableCell>
                <TableCell className="font-mono text-xs text-slate-600">{verification.licenseNumber}</TableCell>
                <TableCell className="text-xs text-slate-600">{verification.city}</TableCell>
                <TableCell className="text-xs text-slate-500">{verification.submissionDate}</TableCell>
                <TableCell><Badge variant="warning">قيد التدقيق</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs py-1 px-2.5 bg-emerald-700 hover:bg-emerald-800"
                      onClick={() => handleUpdateStatus(verification.id, 'approved')}
                      leftIcon={<Check className="w-3 h-3" />}
                    >
                      اعتماد
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="text-xs py-1 px-2.5"
                      onClick={() => handleUpdateStatus(verification.id, 'rejected')}
                      leftIcon={<X className="w-3 h-3" />}
                    >
                      رفض
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};