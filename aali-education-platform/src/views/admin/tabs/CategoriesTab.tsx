import React from 'react';
import { usePlatformData } from '../../../firebase/PlatformDataContext';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

export const CategoriesTab: React.FC = () => {
  const { categories, catalogLoading, catalogError } = usePlatformData();

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-slate-900">القطاعات والتصنيفات المفعلة بالمنصة</h2>
      {catalogError && <Alert type="error">تعذر تحميل القطاعات من Firestore: {catalogError}</Alert>}
      {catalogLoading && <LoadingSpinner label="جارٍ تحميل القطاعات" />}
      {!catalogLoading && !catalogError && categories.length === 0 && (
        <EmptyState title="لا توجد قطاعات تعليمية" description="ستظهر هنا القطاعات المحفوظة في Firestore." />
      )}
      {!catalogLoading && !catalogError && categories.length > 0 && (
        <Card className="!rounded-xl !shadow-none space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{category.nameAr}</h3>
                  <p className="font-mono text-xs text-slate-500">{category.nameEn}</p>
                  <p className="mt-1 text-xs text-slate-600">{category.descriptionAr}</p>
                </div>
                <Badge variant="success">مفعل</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};