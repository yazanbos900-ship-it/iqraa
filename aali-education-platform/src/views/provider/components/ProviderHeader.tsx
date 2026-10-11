import React, { useEffect, useState } from 'react';
import { Bell, BookOpen, Building2, CheckCircle2, Plus } from 'lucide-react';
import { EducationalProvider, StudentNotification, ActiveView } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { ProviderTypeOption } from '../types';

interface ProviderHeaderProps {
  currentType: ProviderTypeOption;
  provider?: EducationalProvider;
  onOpenAddModal: () => void;
  onNavigate: (view: ActiveView) => void;
  activeTabLabel: string;
  pendingInquiriesCount: number;
  onOpenInquiries: () => void;
  notifications: StudentNotification[];
  unreadCount: number;
  onMarkNotificationRead: (id: string) => Promise<void>;
}

export const ProviderHeader: React.FC<ProviderHeaderProps> = ({
  currentType,
  provider,
  onOpenAddModal,
  onNavigate,
  activeTabLabel,
  pendingInquiriesCount,
  onOpenInquiries,
  notifications,
  unreadCount,
  onMarkNotificationRead,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [failedLogoUrl, setFailedLogoUrl] = useState('');
  const [failedBannerUrl, setFailedBannerUrl] = useState('');
  const verificationStatus = provider?.accredited || provider?.verificationStatus === 'approved'
    ? 'approved'
    : provider?.verificationStatus || 'pending';
  const statusLabel = verificationStatus === 'approved' ? 'معتمد' : verificationStatus === 'rejected' ? 'بحاجة إلى استكمال' : 'بانتظار المراجعة';
  const institutionName = provider?.name || currentType.institutionName || 'مزود الخدمة';
  const logoUrl = provider?.logoUrl || '';
  const bannerUrl = provider?.bannerUrl || provider?.bannerImageUrl || '';

  useEffect(() => {
    setFailedLogoUrl('');
    setFailedBannerUrl('');
  }, [logoUrl, bannerUrl]);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 border-b border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">لوحة مزود الخدمة</span><span>/</span>
          <span className="font-semibold text-slate-800">{activeTabLabel}</span>
        </div>
        <span className="text-[11px] text-slate-500">بيانات الحساب من Firebase</span>
      </div>

      <div className="relative isolate max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {bannerUrl && failedBannerUrl !== bannerUrl && (
          <img
            src={bannerUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-10"
            onError={() => setFailedBannerUrl(bannerUrl)}
          />
        )}
        <div className="relative z-10 flex items-center gap-3 sm:gap-4 min-w-0">
          <div className={`w-12 h-12 overflow-hidden rounded-xl ${currentType.avatarBg} text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0`}>
            {logoUrl && failedLogoUrl !== logoUrl
              ? <img src={logoUrl} alt={`شعار ${institutionName}`} className="h-full w-full object-cover" onError={() => setFailedLogoUrl(logoUrl)} />
              : institutionName.trim().slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight truncate">{institutionName}</h1>
              <Badge variant={verificationStatus === 'approved' ? 'success' : verificationStatus === 'rejected' ? 'danger' : 'warning'} className="gap-1">
                {verificationStatus === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                {statusLabel}
              </Badge>
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{currentType.categoryTag}</span>
            </div>
            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>{provider?.city || 'لم تُضف المدينة بعد'}</span>
              {provider?.licenseNumber && <><span>•</span><span>رقم الترخيص: <span className="font-mono">{provider.licenseNumber}</span></span></>}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 relative transition-colors"
              aria-label="الإشعارات المحفوظة"
              title="الإشعارات المحفوظة في حسابك"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && <span className="absolute -top-1 -end-1 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">{unreadCount}</span>}
            </button>
            {isNotifOpen && (
              <div className="absolute end-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="font-bold text-slate-900">إشعارات الحساب</span>
                  <button onClick={() => { setIsNotifOpen(false); onOpenInquiries(); }} className="text-indigo-600 hover:underline text-[11px]">
                    الطلبات الجديدة ({pendingInquiriesCount})
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-slate-500">لا توجد إشعارات محفوظة لهذا الحساب.</p>
                ) : (
                  <div className="space-y-1 max-h-72 overflow-y-auto">
                    {notifications.slice(0, 8).map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => {
                          if (!notification.read) void onMarkNotificationRead(notification.id).catch(() => undefined);
                          setIsNotifOpen(false);
                        }}
                        className={`w-full text-start p-2 rounded-lg border ${notification.read ? 'bg-white border-slate-100' : 'bg-indigo-50/70 border-indigo-100'}`}
                      >
                        <span className="font-semibold text-slate-800 block">{notification.title}</span>
                        <span className="text-slate-600 block mt-0.5">{notification.message}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">{notification.date}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={() => onNavigate('discovery')} className="text-xs hidden sm:flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /><span>استعراض الدليل</span>
          </Button>
          <Button variant="primary" size="sm" onClick={onOpenAddModal} className="text-xs shadow-xs font-semibold gap-1.5">
            <Plus className="w-4 h-4" /><span>إضافة برنامج</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
