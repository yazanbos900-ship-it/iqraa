import React, { useState } from 'react';
import { ActiveView } from '../../types';
import { Button } from '../ui/Button';
import { useAuth } from '../../firebase/AuthContext';
import { useNotifications } from '../../firebase/NotificationContext';
import { 
  Compass, 
  User, 
  School, 
  ShieldCheck, 
  LogOut,
  ChevronDown,
  Bell,
  Search,
  BookOpen,
  CheckCircle2,
  X,
  CheckCheck,
  Menu
} from 'lucide-react';

interface NavbarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView, extraId?: string) => void;
  dir?: 'rtl' | 'ltr';
  onToggleDir?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
}) => {
  const { user, userProfile, signOutUser } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    syncStatus
  } = useNotifications();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      onNavigate('landing');
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 transition-colors shadow-2xs">
      {/* Main Top Bar Contract: 3 Zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between gap-5">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-xl font-bold tracking-tight text-indigo-950 flex items-center gap-2.5 hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl">
            إ
          </div>
          <div className="flex flex-col text-start">
            <span className="leading-none text-xl font-black text-slate-900 tracking-tight">أعالي</span>
            <span className="text-[10px] text-indigo-600 font-bold tracking-wider">AALI EDUCATION</span>
          </div>
        </button>

        {/* Zone 2: 4-5 Clean Single-Line Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-indigo-600 cursor-pointer py-1 ${
              activeView === 'landing' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600' : ''
            }`}
          >
            الرئيسية
          </button>
          <button
            onClick={() => onNavigate('discovery')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-indigo-600 cursor-pointer py-1 ${
              activeView === 'discovery' || activeView === 'course-details' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600' : ''
            }`}
          >
            دليل البرامج والدورات
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Quick Switcher & Notifications */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen((open) => !open)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            aria-label={isMobileNavOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={isMobileNavOpen}
          >
            {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          {/* Quick Search Shortcut */}
          <button
            onClick={() => onNavigate('discovery')}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer hidden lg:flex items-center gap-1.5 text-xs"
            title="بحث في البرامج"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown Trigger */}
          {user && <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
              aria-label="الإشعارات"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-in zoom-in-75">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
                <div
                className="aali-popover absolute end-0 mt-2 w-[min(92vw,24rem)] p-4 z-50 animate-in fade-in slide-in-from-top-1 text-sm"
              >
                {/* Header with live sync indicator */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">التنبيهات الأكاديمية</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {unreadCount} غير مقروء
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Live Sync Status Indicator */}
                    <span 
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        syncStatus === 'connected'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : syncStatus === 'syncing'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                      title={syncStatus === 'connected' ? 'متزامن لحظياً مع Firestore' : 'حالة المزامنة'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        syncStatus === 'connected'
                          ? 'bg-emerald-500 animate-pulse'
                          : syncStatus === 'syncing'
                          ? 'bg-amber-500 animate-spin'
                          : 'bg-slate-400'
                      }`} />
                      {syncStatus === 'connected' ? 'مزامنة حية' : syncStatus === 'syncing' ? 'مزامنة...' : 'محلي'}
                    </span>

                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer"
                        title="تعيين الكل كمقروء"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>قراءة الكل</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications list */}
                <div className="space-y-2 max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      لا توجد إشعارات حالياً
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          setIsNotifOpen(false);
                          onNavigate('student');
                        }}
                        className={`pt-2 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors space-y-1 text-start ${
                          !n.read ? 'bg-indigo-50/40' : 'bg-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-slate-800 line-clamp-1 flex items-center gap-1.5">
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />}
                            <span>{n.title}</span>
                          </div>
                          <span className="text-slate-400 text-[10px] shrink-0 font-medium">{n.date}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">{n.message}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* Bottom toolbar */}
                <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      onNavigate('student');
                    }}
                    className="text-indigo-600 hover:underline text-[11px] font-bold"
                  >
                    عرض كل الإشعارات ({notifications.length})
                  </button>
                </div>
              </div>
            )}
          </div>}

          {/* Account Actions */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer bg-white shadow-2xs"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {user.displayName ? user.displayName.slice(0, 1) : (user.email ? user.email.slice(0, 1).toUpperCase() : 'م')}
                </div>
                <div className="hidden sm:block text-start leading-tight">
                  <div className="font-bold text-slate-900 line-clamp-1">{user.displayName || user.email?.split('@')[0]}</div>
                  <div className="text-[10px] text-slate-500">
                    {userProfile?.role === 'admin' ? 'مدير المنصة' : userProfile?.role === 'provider' ? 'مزود خدمة' : 'طالب'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isSwitcherOpen && (
                <div
                  className="aali-popover absolute end-0 mt-2 w-64 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 text-sm"
                  onClick={() => setIsSwitcherOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/50">
                    <div className="font-bold text-slate-900 truncate">{user.displayName || 'مستخدم مسجل'}</div>
                    <div className="text-[11px] text-slate-500 truncate" dir="ltr">{user.email}</div>
                  </div>
                  <button
                    onClick={() => onNavigate('landing')}
                    className="w-full text-start px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-slate-400" />
                    الرئيسية العامة
                  </button>
                  <button
                    onClick={() => onNavigate('discovery')}
                    className="w-full text-start px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    دليل البرامج والدورات
                  </button>
                  {userProfile?.role === 'provider' ? (
                    <button
                      onClick={() => onNavigate('provider')}
                      className="w-full text-start px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer font-bold text-indigo-700"
                    >
                      <School className="w-4 h-4 text-indigo-600" />
                      لوحة مزود الخدمة
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate('student')}
                      className="w-full text-start px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer font-bold text-indigo-700"
                    >
                      <User className="w-4 h-4 text-indigo-600" />
                      واجهة الطالب
                    </button>
                  )}
                  {userProfile?.role === 'admin' && (
                    <button
                      onClick={() => onNavigate('admin')}
                      className="w-full text-start px-3.5 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer font-bold text-amber-700"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      لوحة الإدارة
                    </button>
                  )}
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-start px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    تسجيل الخروج (Firebase Auth)
                  </button>
                </div>
              )}
            </div>
          ) : activeView === 'landing' || activeView === 'discovery' || activeView === 'course-details' || activeView === 'provider-profile' || activeView === 'checkout' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('auth-login')}
                className="text-xs font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2 transition-colors hidden sm:inline-block cursor-pointer"
              >
                تسجيل الدخول
              </button>
              <Button
                variant="accent"
                size="sm"
                onClick={() => onNavigate('auth-register')}
                className="shadow-2xs text-xs"
              >
                إنشاء حساب
              </Button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('landing')}
              className="hidden sm:inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              العودة للرئيسية
            </button>
          )}
        </div>
      </div>
      {isMobileNavOpen && (
        <nav className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 grid gap-1 shadow-sm">
          <button onClick={() => { onNavigate('landing'); setIsMobileNavOpen(false); }} className="text-start rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">الرئيسية</button>
          <button onClick={() => { onNavigate('discovery'); setIsMobileNavOpen(false); }} className="text-start rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">دليل البرامج والدورات</button>
          {user && <button onClick={() => { onNavigate(userProfile?.role === 'admin' ? 'admin' : userProfile?.role === 'provider' ? 'provider' : 'student'); setIsMobileNavOpen(false); }} className="text-start rounded-xl px-3 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">لوحة حسابي</button>}
        </nav>
      )}
    </header>
  );
};
