import React, { useMemo, useState } from 'react';
import { Download, Search, Users } from 'lucide-react';
import { EnrolledStudent } from '../types';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

interface StudentsTabProps {
  students: EnrolledStudent[];
  onShowToast: (msg: string) => void;
}

const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

export const StudentsTab: React.FC<StudentsTabProps> = ({ students, onShowToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'installments' | 'pending'>('all');

  const filteredStudents = useMemo(() => students.filter((student) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || [student.name, student.programTitle, student.phone, student.email]
      .some((value) => value.toLowerCase().includes(query));
    const matchesPayment = paymentFilter === 'all' || student.paymentStatus === paymentFilter;
    return matchesSearch && matchesPayment;
  }), [students, searchQuery, paymentFilter]);

  const handleExportCSV = () => {
    const rows = [
      ['اسم الطالب', 'البرنامج', 'تاريخ الطلب', 'قيمة الطلب', 'حالة الطلب', 'حالة الدفع', 'الهاتف', 'البريد الإلكتروني'],
      ...filteredStudents.map((student) => [
        student.name,
        student.programTitle,
        student.enrollDate,
        student.amount ?? '',
        student.enrollmentStatus || '',
        student.paymentStatus,
        student.phone,
        student.email,
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'enrollments.csv';
    link.click();
    URL.revokeObjectURL(url);
    onShowToast(`تم تنزيل ${filteredStudents.length} سجل تسجيل بصيغة CSV.`);
  };

  const pendingPaymentCount = students.filter((student) => student.paymentStatus === 'pending').length;
  const paidCount = students.filter((student) => student.paymentStatus === 'paid').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">طلبات التسجيل</h2>
            <Badge variant="info">{students.length} سجل</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">تظهر هنا طلبات التسجيل المحفوظة في Firestore لهذا المزود.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs gap-1.5" disabled={!filteredStudents.length}>
          <Download className="w-3.5 h-3.5" /><span>تنزيل CSV</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
          <div><span className="text-slate-500 text-xs">كل الطلبات</span><div className="text-xl font-bold text-slate-900 mt-0.5">{students.length}</div></div>
          <Users className="w-5 h-5 text-indigo-700" />
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
          <div><span className="text-slate-500 text-xs">بانتظار الدفع</span><div className="text-xl font-bold text-amber-700 mt-0.5">{pendingPaymentCount}</div></div>
          <Badge variant="warning">معلق</Badge>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
          <div><span className="text-slate-500 text-xs">مسجل كمدفوع</span><div className="text-xl font-bold text-emerald-700 mt-0.5">{paidCount}</div></div>
          <Badge variant="success">من Firestore</Badge>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="ابحث باسم الطالب أو الهاتف أو البرنامج..." className="w-full ps-9 pe-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div className="flex items-center gap-2 text-xs w-full sm:w-auto shrink-0">
          <span className="text-slate-400 text-[11px]">حالة الدفع:</span>
          <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value as typeof paymentFilter)} className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none">
            <option value="all">كل الحالات</option><option value="paid">مدفوع</option><option value="installments">أقساط</option><option value="pending">بانتظار الدفع</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-2xs">
        <table className="w-full text-start text-xs">
          <thead className="bg-slate-50 text-slate-500"><tr>
            <th className="px-4 py-3 font-semibold">الطالب</th><th className="px-4 py-3 font-semibold">البرنامج</th><th className="px-4 py-3 font-semibold">تاريخ الطلب</th><th className="px-4 py-3 font-semibold">القيمة</th><th className="px-4 py-3 font-semibold">حالة الطلب</th><th className="px-4 py-3 font-semibold">حالة الدفع</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((student) => <tr key={student.id} className="hover:bg-slate-50/70">
              <td className="px-4 py-3"><div className="font-semibold text-slate-900">{student.name}</div><div className="text-[11px] text-slate-500">{student.email || student.phone || 'لا توجد وسيلة تواصل محفوظة'}</div></td>
              <td className="px-4 py-3 text-slate-700">{student.programTitle}</td>
              <td className="px-4 py-3 text-slate-600">{student.enrollDate || '—'}</td>
              <td className="px-4 py-3 text-slate-700">{typeof student.amount === 'number' ? `${student.amount.toLocaleString('ar-SA')} ر.س` : '—'}</td>
              <td className="px-4 py-3"><Badge variant={student.enrollmentStatus === 'confirmed' || student.enrollmentStatus === 'completed' ? 'success' : student.enrollmentStatus === 'cancelled' ? 'danger' : 'warning'}>{student.enrollmentStatus || 'قيد المراجعة'}</Badge></td>
              <td className="px-4 py-3"><Badge variant={student.paymentStatus === 'paid' ? 'success' : student.paymentStatus === 'failed' || student.paymentStatus === 'overdue' ? 'danger' : student.paymentStatus === 'refunded' ? 'neutral' : 'warning'}>{student.paymentStatus === 'paid' ? 'مدفوع' : student.paymentStatus === 'failed' ? 'فشل الدفع' : student.paymentStatus === 'overdue' ? 'متأخر' : student.paymentStatus === 'installments' ? 'أقساط' : student.paymentStatus === 'refunded' ? 'مسترد' : 'بانتظار الدفع'}</Badge></td>
            </tr>)}
          </tbody>
        </table>
        {filteredStudents.length === 0 && <div className="p-10 text-center text-sm text-slate-500">{students.length ? 'لا توجد نتائج مطابقة للبحث.' : 'ما في طلبات تسجيل بعد. أي طلب جديد من الطلاب رح يظهر هون بعد حفظه في Firebase.'}</div>}
      </div>
    </div>
  );
};
