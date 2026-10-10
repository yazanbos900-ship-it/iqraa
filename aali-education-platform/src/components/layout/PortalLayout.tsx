import React from 'react';
import { ActiveView } from '../../types';
import { BookOpen, Compass, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../firebase/AuthContext';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface PortalLayoutProps {
  roleTitle: string;
  roleSubtitle: string;
  roleBadge: string;
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  sidebarItems: SidebarItem[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  children: React.ReactNode;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  roleTitle,
  roleSubtitle,
  roleBadge,
  onNavigate,
  sidebarItems,
  activeTab,
  onSelectTab,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { signOutUser } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      onNavigate('auth-login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="aali-app min-h-screen flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-bold text-sm">
            إ
          </div>
          <span className="font-bold text-slate-900 text-base">{roleTitle}</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="grid min-h-11 min-w-11 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="القائمة الجانبية"
          aria-expanded={mobileMenuOpen}
          aria-controls="portal-navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        id="portal-navigation"
        aria-label={`التنقل في ${roleTitle}`}
        className={`aali-sidebar ${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-white border-e border-slate-200/90 shrink-0 flex flex-col justify-between`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="p-5 border-b border-slate-100">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2.5 text-start w-full group mb-3"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-sm group-hover:bg-indigo-400 transition-colors">
                إ
              </div>
              <div>
                <div className="text-base font-bold text-slate-900 leading-none">أعالي</div>
                <div className="text-[10px] text-slate-500 font-medium">المنصة التعليمية</div>
              </div>
            </button>

            <div className="pt-2">
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-100 border border-white/10 mb-2">
                {roleBadge}
              </span>
              <p className="aali-sidebar-muted text-sm line-clamp-1">{roleSubtitle}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <div className="aali-sidebar-muted px-3 py-2 text-xs font-semibold">
              أقسام البوابة
            </div>
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`aali-nav-item w-full text-start flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'aali-sidebar-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={isActive ? 'text-indigo-200' : 'text-current'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Public navigation and account action */}
        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="aali-sidebar-muted text-xs font-semibold mb-2">
            استكشاف المنصة
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onNavigate('landing')}
              className="w-full text-start py-2 px-2 rounded-lg hover:bg-white/5 text-sm aali-sidebar-muted flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                الصفحة الرئيسية
              </span>
            </button>
            <button
              onClick={() => onNavigate('discovery')}
              className="w-full text-start py-2 px-2 rounded-lg hover:bg-white/5 text-sm aali-sidebar-muted flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                دليل البرامج
              </span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10">
            <button
              onClick={() => void handleSignOut()}
              className="w-full text-start text-sm text-rose-300 hover:text-rose-200 flex items-center gap-2 px-1 py-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Dynamic Page Content */}
        <div className="w-full max-w-[1600px] mx-auto p-5 sm:p-7 lg:p-10 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};
