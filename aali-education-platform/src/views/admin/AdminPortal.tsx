import React, { useState } from 'react';
import { ActiveView } from '../../types';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { LayoutDashboard, Building, BookOpen, FileCheck2, Layers, Database, ShieldCheck } from 'lucide-react';
import { OverviewTab } from './tabs/OverviewTab';
import { ProvidersTab } from './tabs/ProvidersTab';
import { CoursesTab } from './tabs/CoursesTab';
import { VerificationsTab } from './tabs/VerificationsTab';
import { CategoriesTab } from './tabs/CategoriesTab';
import { DatabaseTab } from './tabs/DatabaseTab';
import { ComplianceTab } from './tabs/ComplianceTab';

interface AdminPortalProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

type AdminTab = 'overview' | 'providers' | 'courses' | 'verifications' | 'categories' | 'database' | 'compliance';

export const AdminPortal: React.FC<AdminPortalProps> = ({ activeView, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const sidebarItems = [
    { id: 'overview', label: 'الرئيسية', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'providers', label: 'المؤسسات', icon: <Building className="h-4 w-4" /> },
    { id: 'courses', label: 'الدورات', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'verifications', label: 'طلبات الاعتماد', icon: <FileCheck2 className="h-4 w-4" /> },
    { id: 'categories', label: 'القطاعات', icon: <Layers className="h-4 w-4" /> },
    { id: 'database', label: 'قاعدة البيانات', icon: <Database className="h-4 w-4" /> },
    { id: 'compliance', label: 'الحوكمة', icon: <ShieldCheck className="h-4 w-4" /> },
  ];

  const selectTab = (tabId: string) => {
    if (sidebarItems.some((item) => item.id === tabId)) setActiveTab(tabId as AdminTab);
  };

  return (
    <PortalLayout
      roleTitle="بوابة الإدارة والحوكمة"
      roleSubtitle="الإشراف العام وتدقيق المنصة"
      roleBadge="المشرف العام"
      activeView={activeView}
      onNavigate={onNavigate}
      sidebarItems={sidebarItems}
      activeTab={activeTab}
      onSelectTab={selectTab}
    >
      {activeTab === 'overview' && <OverviewTab onSelectTab={selectTab} />}
      {activeTab === 'providers' && <ProvidersTab />}
      {activeTab === 'courses' && <CoursesTab />}
      {activeTab === 'verifications' && <VerificationsTab />}
      {activeTab === 'categories' && <CategoriesTab />}
      {activeTab === 'database' && <DatabaseTab />}
      {activeTab === 'compliance' && <ComplianceTab />}
    </PortalLayout>
  );
};
