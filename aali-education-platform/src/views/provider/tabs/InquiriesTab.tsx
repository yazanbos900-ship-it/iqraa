import React, { useState } from 'react';
import { ExtendedInquiry } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { 
  Inbox, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Phone, 
  Mail, 
  Calendar, 
  MessageSquare, 
  User, 
  ChevronRight,
  Send,
  CalendarCheck
} from 'lucide-react';

interface InquiriesTabProps {
  inquiries: ExtendedInquiry[];
  onUpdateStatus: (id: string, status: ExtendedInquiry['status'], responseNote?: string, interviewDate?: string) => void;
  selectedInquiryForModal?: ExtendedInquiry | null;
  onCloseModal?: () => void;
}

export const InquiriesTab: React.FC<InquiriesTabProps> = ({
  inquiries,
  onUpdateStatus,
  selectedInquiryForModal,
  onCloseModal,
}) => {
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'pending' | 'responded' | 'confirmed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeInquiry, setActiveInquiry] = useState<ExtendedInquiry | null>(null);

  // Response composer modal state
  const [replyText, setReplyText] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [newStatus, setNewStatus] = useState<ExtendedInquiry['status']>('responded');

  const openRespondModal = (inq: ExtendedInquiry) => {
    setActiveInquiry(inq);
    setNewStatus(inq.status === 'pending' ? 'responded' : inq.status);
    setReplyText('');
    setInterviewDate(inq.interviewDate || '');
  };

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInquiry) return;
    onUpdateStatus(activeInquiry.id, newStatus, replyText, interviewDate);
    setActiveInquiry(null);
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus = activeStatusFilter === 'all' || inq.status === activeStatusFilter;
    const matchesSearch = 
      inq.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inq.phone || '').includes(searchQuery) ||
      inq.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = inquiries.filter((i) => i.status === 'pending').length;
  const respondedCount = inquiries.filter((i) => i.status === 'responded').length;
  const confirmedCount = inquiries.filter((i) => i.status === 'confirmed').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              طلبات واستفسارات الالتحاق الأكاديمي
            </h2>
            <Badge variant="info">
              {inquiries.length} طلب مسجل
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            تفاعل مع استفسارات أولياء الأمور والطلاب وجدولة المقابلات واختبارات المستوى
          </p>
        </div>

        {/* Quick status tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeStatusFilter === 'all' ? 'bg-white text-indigo-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeStatusFilter === 'pending' ? 'bg-white text-rose-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            جديد بحاجة لرد ({pendingCount})
          </button>
          <button
            onClick={() => setActiveStatusFilter('responded')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeStatusFilter === 'responded' ? 'bg-white text-sky-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تم الرد ({respondedCount})
          </button>
          <button
            onClick={() => setActiveStatusFilter('confirmed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeStatusFilter === 'confirmed' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            مؤكد ومقبول ({confirmedCount})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الطالب أو رقم الهاتف أو البرنامج التعليمي..."
            className="w-full ps-9 pe-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Inquiries Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>اسم الطالب / ولي الأمر</TableHeaderCell>
              <TableHeaderCell>البرنامج المطلوب</TableHeaderCell>
              <TableHeaderCell>وسيلة التواصل</TableHeaderCell>
              <TableHeaderCell>تاريخ التقديم</TableHeaderCell>
              <TableHeaderCell>الحالة الحالية</TableHeaderCell>
              <TableHeaderCell>الإجراءات</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                  لا توجد طلبات تطابق الفلتر المحدد حالياً.
                </TableCell>
              </TableRow>
            ) : (
              filteredInquiries.map((inq) => (
                <TableRow key={inq.id} className="hover:bg-slate-50/70 transition-colors">
                  <TableCell className="font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {inq.studentName.slice(0, 1)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{inq.studentName}</div>
                        {inq.studentLevel && (
                          <div className="text-[11px] text-slate-400">{inq.studentLevel}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-slate-700 max-w-xs">
                    <div className="font-medium line-clamp-1">{inq.serviceTitle}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{inq.notes}</div>
                  </TableCell>

                  <TableCell className="text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{inq.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[120px]">{inq.email}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    {inq.date}
                  </TableCell>

                  <TableCell>
                    {inq.status === 'pending' && (
                      <Badge variant="warning" className="gap-1">
                        <Clock className="w-3 h-3" />
                        بانتظار الرد
                      </Badge>
                    )}
                    {inq.status === 'responded' && (
                      <Badge variant="info" className="gap-1">
                        <MessageSquare className="w-3 h-3" />
                        تم الرد
                      </Badge>
                    )}
                    {inq.status === 'confirmed' && (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        مقبول ومؤكد
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant={inq.status === 'pending' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => openRespondModal(inq)}
                        className="text-xs px-2.5 py-1"
                      >
                        {inq.status === 'pending' ? 'الرد الفوري' : 'تفاصيل الطلب'}
                      </Button>
                      {inq.status !== 'confirmed' && (
                        <button
                          onClick={() => onUpdateStatus(inq.id, 'confirmed')}
                          className="text-[11px] text-emerald-700 hover:text-emerald-800 hover:underline px-1 cursor-pointer font-medium"
                          title="تأكيد القبول النهائي مباشرة"
                        >
                          تأكيد القبول
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Response Composer & Details Modal */}
      {activeInquiry && (
        <Modal
          isOpen={true}
          onClose={() => setActiveInquiry(null)}
          title={`تفاصيل ومعالجة طلب: ${activeInquiry.studentName}`}
          maxWidth="lg"
        >
          <form onSubmit={handleSendResponse} className="space-y-5 text-xs text-slate-700">
            {/* Applicant Summary Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{activeInquiry.studentName}</span>
                <Badge variant={activeInquiry.status === 'pending' ? 'warning' : 'success'}>
                  {activeInquiry.status === 'pending' ? 'طلب جديد' : 'تم التواصل مسبقاً'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>البرنامج المطلوب: <strong className="text-indigo-900">{activeInquiry.serviceTitle}</strong></div>
                <div>تاريخ التقديم: <span className="text-slate-500">{activeInquiry.date}</span></div>
                <div>الهاتف: <span className="font-mono text-slate-800">{activeInquiry.phone}</span></div>
                <div>البريد: <span className="text-slate-800">{activeInquiry.email}</span></div>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 block mb-0.5 font-medium">رسالة واستفسار الطالب / ولي الأمر:</span>
                <p className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 leading-relaxed">
                  "{activeInquiry.notes}"
                </p>
              </div>
            </div>

            {/* Quick response templates */}
            <div className="space-y-1.5">
              <span className="text-slate-500 text-[11px] font-medium">قوالب رد سريعة جاهزة:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setReplyText('أهلاً بك، يسعدنا اهتمامك. نود إعلامك بتوفر المقاعد المطلوبة وندعوكم لحضور المقابلة الشخصية واختبار تحديد المستوى.')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-[11px] text-slate-700 cursor-pointer"
                >
                  دعوة للمقابلة واختبار المستوى
                </button>
                <button
                  type="button"
                  onClick={() => setReplyText('تمت مراجعة طلبكم والموافقة المبدئية. نرجو التكرم بتزويدنا ببطاقة الهوية والشهادة السابقة عبر المنصة لإتمام ملف القبول.')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-[11px] text-slate-700 cursor-pointer"
                >
                  طلب استكمال الوثائق
                </button>
                <button
                  type="button"
                  onClick={() => setReplyText('للاستفسار عن الرسوم وخيارات الدفع، يرجى التواصل مع المؤسسة مباشرة. الدفع عبر المنصة غير مفعّل حالياً.')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-[11px] text-slate-700 cursor-pointer"
                >
                  تفاصيل الرسوم وخطة الدفع
                </button>
              </div>
            </div>

            {/* Message input */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                نص الرد الرسمي للطالب / ولي الأمر <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="اكتب رد المؤسسة وتفاصيل الخطوات التالية للتسجيل..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Interview scheduler and Status update */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                  <CalendarCheck className="w-3.5 h-3.5 text-indigo-600" />
                  موعد المقابلة / الاختبار (اختياري)
                </label>
                <input
                  type="text"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  placeholder="مثال: الثلاثاء القادم 10:00 صباحاً"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  تحديث حالة الطلب بعد الرد
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="responded">تم الرد وتحديد الموعد</option>
                  <option value="confirmed">تأكيد القبول والاعتماد النهائي</option>
                  <option value="pending">إبقاء قيد المراجعة</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setActiveInquiry(null)}>
                إغلاق
              </Button>
              <Button type="submit" variant="primary" size="sm" className="gap-1.5 font-semibold">
                <Send className="w-3.5 h-3.5" />
                <span>إرسال الرد وحفظ التحديث</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
