import React from 'react';
import { Card } from '../../../components/ui/Card';

export const ComplianceTab: React.FC = () => (
  <Card className="!rounded-xl !shadow-none space-y-4 p-6 text-xs text-slate-600">
    <h2 className="mb-1 text-base font-semibold text-slate-900">سياسات الامتثال والجودة الأكاديمية</h2>
    <p>توفر منصة أعالي آليات لحماية الطلاب والمؤسسات من خلال:</p>
    <ul className="list-inside list-disc space-y-1 text-slate-700">
      <li>التحقق من صحة التراخيص الصادرة عن وزارات التربية والتعليم والتعليم العالي.</li>
      <li>منع نشر أي إعلانات مضللة أو شهادات غير معترف بها.</li>
      <li>ضمان خصوصية بيانات الطلاب وأولياء الأمور وعدم مشاركتها مع أطراف ثالثة دون إذن.</li>
    </ul>
  </Card>
);