import React, { useState } from 'react';
import { EducationalService } from '../../../types';
import { ProviderTypeOption } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../../components/ui/Table';
import { 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  LayoutGrid, 
  List, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Users, 
  DollarSign, 
  Sparkles,
  ExternalLink,
  ChevronDown,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

interface ProgramsTabProps {
  currentType: ProviderTypeOption;
  services: EducationalService[];
  onOpenAddModal: () => void;
  onEditService: (service: EducationalService) => void;
  onToggleStatus: (serviceId: string) => void;
  onDeleteService: (serviceId: string) => void;
  onQuickUpdateSeats: (serviceId: string, addedSeats: number) => void;
}

export const ProgramsTab: React.FC<ProgramsTabProps> = ({
  currentType,
  services,
  onOpenAddModal,
  onEditService,
  onToggleStatus,
  onDeleteService,
  onQuickUpdateSeats,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'closed'>('all');
  const [modeFilter, setModeFilter] = useState<'all' | 'on-campus' | 'online' | 'hybrid'>('all');

  const filteredServices = services.filter((srv) => {
    const matchesSearch = 
      srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || srv.status === statusFilter;
    const matchesMode = modeFilter === 'all' || srv.mode === modeFilter;
    return matchesSearch && matchesStatus && matchesMode;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Tab Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              إدارة البرامج والخدمات التعليمية
            </h2>
            <Badge variant="info">
              {services.length} برنامج مسجل
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            تحكم بالطاقة الاستيعابية، رسوم التسجيل، وحالة النشر الخاصة بـ {currentType.institutionName}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-indigo-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="عرض كبطاقات شبكية"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-indigo-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="عرض كجدول بيانات"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenAddModal}
            className="text-xs gap-1.5 shadow-2xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة برنامج لـ {currentType.categoryTag}</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالعنوان أو المرحلة أو الوصف..."
            className="w-full ps-9 pe-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 text-xs">
          {/* Status filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px]">الحالة:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">كافة الحالات</option>
              <option value="active">نشط (التسجيل مفتوح)</option>
              <option value="draft">مسودة</option>
              <option value="closed">ممتلئ / مغلق</option>
            </select>
          </div>

          {/* Mode filter */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px]">طريقة التدريس:</span>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">الكل</option>
              <option value="on-campus">حضوري بالمقر</option>
              <option value="online">عن بُعد (Online)</option>
              <option value="hybrid">مدمج (Hybrid)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Empty State if no programs found */}
      {filteredServices.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">لا توجد برامج مطابقة لبحثك</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            جرّب تغيير فلاتر البحث أو إضافة برنامج تعليمي جديد يناسب هذا القطاع.
          </p>
          <Button variant="primary" size="sm" onClick={onOpenAddModal} className="text-xs">
            إضافة برنامج جديد الآن
          </Button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredServices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((srv) => {
            const occPercent = Math.round(((srv.totalSeats - srv.seatsAvailable) / srv.totalSeats) * 100);
            return (
              <Card key={srv.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {srv.level}
                    </span>
                    <Badge variant={srv.status === 'active' ? 'success' : srv.status === 'closed' ? 'danger' : 'neutral'}>
                      {srv.status === 'active' ? 'مفتوح للتسجيل' : srv.status === 'closed' ? 'مكتمل المقاعد' : 'مسودة'}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                    {srv.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3 flex-1">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {srv.description}
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">طريقة الدراسة:</span>
                      <span className="font-medium text-slate-800">
                        {srv.mode === 'on-campus' ? 'حضوري' : srv.mode === 'online' ? 'عن بُعد' : 'مدمج'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">المدة الأكاديمية:</span>
                      <span className="font-medium text-slate-800">{srv.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">الرسوم المعتمدة:</span>
                      <span className="font-bold text-emerald-700">{srv.priceNote}</span>
                    </div>
                  </div>

                  {/* Seat Capacity Progress */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">الطاقة الاستيعابية:</span>
                      <span className="font-semibold text-slate-800">
                        {srv.seatsAvailable > 0 ? `${srv.seatsAvailable} مقعداً متاحاً` : 'لا توجد مقاعد شاغرة'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${occPercent > 90 ? 'bg-rose-500' : occPercent > 70 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                        style={{ width: `${occPercent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 text-end">
                      المحجوز: {srv.totalSeats - srv.seatsAvailable} من {srv.totalSeats} ({occPercent}%)
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditService(srv)}
                      className="text-xs px-2.5 py-1"
                      title="تعديل بيانات البرنامج"
                    >
                      <Edit3 className="w-3.5 h-3.5 me-1 text-slate-500" />
                      تعديل
                    </Button>
                    <button
                      onClick={() => onToggleStatus(srv.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 text-xs transition-colors cursor-pointer"
                      title="تبديل حالة النشر"
                    >
                      {srv.status === 'active' ? 'إيقاف' : 'تفعيل'}
                    </button>
                    <button
                      onClick={() => onQuickUpdateSeats(srv.id, 5)}
                      className="text-[11px] text-indigo-700 hover:text-indigo-800 hover:underline px-1 cursor-pointer"
                      title="إضافة 5 مقاعد شاغرة سريعاً"
                    >
                      +5 مقاعد
                    </button>
                  </div>

                  <button
                    onClick={() => onDeleteService(srv.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                    title="حذف البرنامج"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredServices.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>عنوان البرنامج التعليمي</TableHeaderCell>
                <TableHeaderCell>المرحلة / المستوى</TableHeaderCell>
                <TableHeaderCell>الرسوم الأكاديمية</TableHeaderCell>
                <TableHeaderCell>المقاعد المتبقية</TableHeaderCell>
                <TableHeaderCell>طريقة التدريس</TableHeaderCell>
                <TableHeaderCell>حالة النشر</TableHeaderCell>
                <TableHeaderCell>الإجراءات</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredServices.map((srv) => (
                <TableRow key={srv.id}>
                  <TableCell className="font-semibold text-slate-900 max-w-xs">
                    <div>{srv.title}</div>
                    <div className="text-[11px] text-slate-400 font-normal truncate">{srv.duration}</div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">{srv.level}</TableCell>
                  <TableCell className="text-xs font-semibold text-emerald-700">{srv.priceNote}</TableCell>
                  <TableCell className="text-xs">
                    <span className="font-semibold text-slate-800">{srv.seatsAvailable}</span>
                    <span className="text-slate-400"> / {srv.totalSeats}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {srv.mode === 'on-campus' ? 'حضوري' : srv.mode === 'online' ? 'عن بُعد' : 'مدمج'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={srv.status === 'active' ? 'success' : srv.status === 'closed' ? 'danger' : 'neutral'}>
                      {srv.status === 'active' ? 'مفتوح' : srv.status === 'closed' ? 'مغلق' : 'مسودة'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditService(srv)}
                        className="text-xs px-2 py-1"
                      >
                        تعديل
                      </Button>
                      <button
                        onClick={() => onQuickUpdateSeats(srv.id, 5)}
                        className="text-xs text-indigo-600 hover:underline cursor-pointer"
                      >
                        + مقاعد
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
