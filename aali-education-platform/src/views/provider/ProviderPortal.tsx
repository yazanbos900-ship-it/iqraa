import React, { useEffect, useState } from 'react';
import { ActiveView, EducationalService } from '../../types';
import { useAuth } from '../../firebase/AuthContext';
import { usePlatformData } from '../../firebase/PlatformDataContext';
import { useNotifications } from '../../firebase/NotificationContext';
import { 
  ProviderTypeOption, 
  ExtendedInquiry, 
  EnrolledStudent, 
  ProviderReviewItem, 
  StaffMember 
} from './types';
import { PROVIDER_TYPE_OPTIONS } from './providerTypes';
import { ProviderHeader } from './components/ProviderHeader';
import { AddEditProgramModal } from './components/AddEditProgramModal';
import { OverviewTab } from './tabs/OverviewTab';
import { ProgramsTab } from './tabs/ProgramsTab';
import { InquiriesTab } from './tabs/InquiriesTab';
import { StudentsTab } from './tabs/StudentsTab';
import { AccreditationTab } from './tabs/AccreditationTab';
import { ReviewsTab } from './tabs/ReviewsTab';
import { SettingsTab } from './tabs/SettingsTab';
import { 
  LayoutDashboard, 
  Layers, 
  Inbox, 
  Users, 
  FileCheck, 
  Star, 
  Settings, 
  CheckCircle2, 
  BookOpen,
  Compass,
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

interface ProviderPortalProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

export const ProviderPortal: React.FC<ProviderPortalProps> = ({
  activeView,
  onNavigate,
}) => {
  const { user, userProfile, signOutUser } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const {
    services: allServices,
    providers,
    inquiries: storedInquiries,
    enrollments,
    reviews: allReviews,
    saveService,
    removeService,
    updateService,
    updateInquiry,
    submitProviderVerification,
    saveProviderProfile,
    saveProviderOrganizationDetails,
    saveProviderBranding,
    getPayoutInfo,
    savePayoutInfo,
    catalogLoading,
    teamMembers,
    addTeamMember,
    replyToReview,
  } = usePlatformData();
  // Provider Type (Default: Schools with dynamic switcher across all 10 types)
  const [currentType, setCurrentType] = useState<ProviderTypeOption>(PROVIDER_TYPE_OPTIONS[0]);
  
  // Active Tab State
  const [activeTab, setActiveTab] = useState<string>('overview');

  const inquiries: ExtendedInquiry[] = storedInquiries.map((inquiry) => ({
    ...inquiry,
    phone: inquiry.phone || '',
    email: inquiry.studentEmail || '',
  }));
  const students: EnrolledStudent[] = enrollments.map((enrollment) => ({
    id: enrollment.id,
    name: enrollment.studentName,
    programTitle: enrollment.courseTitle,
    enrollDate: enrollment.bookingDate,
    paymentStatus: enrollment.paymentStatus || 'pending',
    phone: enrollment.studentPhone || '',
    email: enrollment.studentEmail || '',
    enrollmentStatus: enrollment.status,
    amount: enrollment.amount,
  }));
  const reviews = allReviews.filter((review) => review.providerId === user?.uid);

  // Staff Members State

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<EducationalService | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [payoutInfo, setPayoutInfo] = useState<Awaited<ReturnType<typeof getPayoutInfo>>>(null);
  const [payoutInfoLoaded, setPayoutInfoLoaded] = useState(false);

  // Mobile sidebar state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      onNavigate('auth-login');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'تعذر تسجيل الخروج.');
    }
  };

  useEffect(() => {
    if (!userProfile) return;
    const categoryId = userProfile.providerCategory === 'institutes'
      ? 'institutes_lang'
      : userProfile.providerCategory === 'training_centers'
      ? 'institutes_tech'
      : userProfile.providerCategory;
    const category = PROVIDER_TYPE_OPTIONS.find((item) => item.id === categoryId)
      || PROVIDER_TYPE_OPTIONS[0];
    setCurrentType({ ...category, institutionName: userProfile.institutionName || userProfile.displayName });
  }, [userProfile]);

  // Only show services owned by this signed-in provider account.
  const currentServices = allServices.filter((service) => service.providerId === user?.uid);
  const currentProvider = providers.find((provider) => provider.id === user?.uid);
  const displayProviderName = currentProvider?.name || userProfile?.institutionName || userProfile?.displayName || 'مزود الخدمة';
  const missingProfileFields = [
    ...(!currentProvider?.name?.trim() ? ['اسم الجهة'] : []),
    ...(!currentProvider?.city?.trim() ? ['المدينة'] : []),
    ...(!currentProvider?.contactPerson?.trim() ? ['الشخص المسؤول'] : []),
    ...(!currentProvider?.landline?.trim() ? ['الهاتف الأرضي'] : []),
    ...(!currentProvider?.contactPhone?.trim() ? ['الجوال'] : []),
    ...(!currentProvider?.workingHours?.trim() ? ['ساعات الدوام'] : []),
    ...(!currentProvider?.addressDetails?.country?.trim() ? ['الدولة'] : []),
    ...(!currentProvider?.addressDetails?.city?.trim() ? ['مدينة العنوان'] : []),
    ...(!currentProvider?.addressDetails?.district?.trim() ? ['الحي'] : []),
    ...(!currentProvider?.addressDetails?.street?.trim() ? ['الشارع'] : []),
    ...(!currentProvider?.addressDetails?.number?.trim() ? ['رقم العنوان'] : []),
    ...(!currentProvider?.category ? ['نوع الخدمة التعليمية'] : []),
    ...(!payoutInfo?.accountType || !payoutInfo.accountNumber.trim() || !payoutInfo.accountHolderName.trim() ? ['حساب استلام المبالغ'] : []),
  ];
  const profileComplete = missingProfileFields.length === 0;

  useEffect(() => {
    if (!user || userProfile?.role !== 'provider') {
      setPayoutInfo(null);
      setPayoutInfoLoaded(false);
      return;
    }
    let active = true;
    setPayoutInfoLoaded(false);
    void getPayoutInfo()
      .then((info) => {
        if (active) setPayoutInfo(info);
      })
      .catch((error) => {
        if (active) showToast(error instanceof Error ? error.message : 'تعذر تحميل بيانات الاستلام.');
      })
      .finally(() => {
        if (active) setPayoutInfoLoaded(true);
      });
    return () => { active = false; };
  }, [getPayoutInfo, user, userProfile?.role]);

  // Add / Edit service handler
  const handleSaveService = async (serviceData: Partial<EducationalService>) => {
    try {
      const category: EducationalService['category'] = serviceData.category
        || (currentType.id === 'institutes_lang' ? 'institutes' : currentType.id === 'institutes_tech' ? 'training_centers' : currentType.id === 'universities' ? 'universities' : currentType.id === 'tutors' ? 'tutors' : currentType.id === 'libraries' ? 'libraries' : 'schools');
      const payload = {
        ...serviceData,
        providerName: displayProviderName,
        category,
        rating: editingService?.rating || 0,
        reviewsCount: editingService?.reviewsCount || 0,
      };
      if (payload.status === 'active' && !profileComplete) {
        showToast(`لا يمكن تفعيل الدورة قبل استكمال: ${missingProfileFields.join('، ')}. يمكنك حفظها كمسودة.`);
        return;
      }
      const savedId = await saveService(payload, editingService?.id);
      showToast(!currentProvider?.accredited && serviceData.status === 'active'
        ? `حُفظ البرنامج ${serviceData.title || savedId} كمسودة إلى حين اعتماد المؤسسة.`
        : `${editingService ? 'تم تحديث' : 'تم حفظ'} البرنامج: ${serviceData.title || savedId}`);
      setEditingService(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'تعذر حفظ البرنامج في Firestore.');
    }
  };

  // Toggle status (active/draft/closed)
  const handleToggleStatus = async (serviceId: string) => {
    const service = currentServices.find((item) => item.id === serviceId);
    if (!service) return;
    const activating = service.status !== 'active';
    if (service.status !== 'active' && !profileComplete) {
      showToast(`لا يمكن تفعيل الدورة قبل استكمال: ${missingProfileFields.join('، ')}.`);
      return;
    }
    if (service.pausedByAdmin) {
      showToast('هذه الدورة موقوفة من الإدارة. يرجى التواصل مع الإدارة.');
      return;
    }
    if (activating) {
      const errors: string[] = [];
      const today = new Date();
      const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
      if (!service.title.trim()) errors.push('عنوان الدورة');
      if (!service.mode) errors.push('نمط التدريس');
      if (!service.startDate || service.startDate < localToday) errors.push('تاريخ بدء غير ماضٍ');
      if (!Number.isInteger(service.totalSeats) || service.totalSeats <= 0) errors.push('عدد مقاعد صحيح');
      if (!Number.isInteger(service.minStudents) || (service.minStudents ?? 0) <= 0 || (service.minStudents ?? 0) > service.totalSeats) {
        errors.push('حد أدنى صحيح لا يتجاوز عدد المقاعد');
      }
      if (!Number.isFinite(service.numericPrice) || service.numericPrice < 0) errors.push('سعر صالح');
      if (!service.paymentMethods?.some((method) => method === 'cash' || method === 'online')) errors.push('طريقة دفع واحدة على الأقل');
      if (!Number.isInteger(service.freeLessonsCount) || (service.freeLessonsCount ?? 0) < 1) errors.push('درس تجريبي مجاني واحد على الأقل');
      if (errors.length) {
        showToast(`لا يمكن نشر الدورة؛ تحقق من: ${errors.join('، ')}.`);
        return;
      }
    }
    try {
      await updateService(serviceId, { status: activating ? 'active' : 'draft' });
      showToast('تم تحديث حالة نشر البرنامج.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'تعذر تحديث البرنامج.');
    }
  };

  // Delete service
  const handleDeleteService = async (serviceId: string) => {
    try {
      await removeService(serviceId);
      showToast('تم حذف البرنامج التعليمي من Firestore.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'تعذر حذف البرنامج.');
    }
  };

  // Quick seat capacity update (+5)
  const handleQuickUpdateSeats = async (serviceId: string, addedSeats: number) => {
    const service = currentServices.find((item) => item.id === serviceId);
    if (!service) return;
    try {
      await updateService(serviceId, { seatsAvailable: service.seatsAvailable + addedSeats, totalSeats: service.totalSeats + addedSeats });
      showToast(`تمت زيادة الطاقة الاستيعابية بـ ${addedSeats} مقاعد.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'تعذر تحديث عدد المقاعد.');
    }
  };

  // Inquiries update
  const handleUpdateInquiryStatus = (
    id: string,
    newStatus: ExtendedInquiry['status'],
    responseNote?: string,
    interviewDate?: string
  ) => {
    void updateInquiry(id, {
      status: newStatus,
      ...(responseNote ? { responseNote, internalNotes: responseNote } : {}),
      ...(interviewDate ? { interviewDate } : {}),
    }).then(() => showToast('تم حفظ رد المؤسسة وتحديث حالة الطلب الأكاديمي.'))
      .catch((error) => showToast(error instanceof Error ? error.message : 'تعذر تحديث الاستفسار.'));
  };

  // Review reply
  const handleReplyReview = (reviewId: string, replyText: string) => {
    void replyToReview(reviewId, replyText, `إدارة ${displayProviderName}`)
      .then(() => showToast('تم حفظ الرد على التقييم في Firebase.'))
      .catch((error) => showToast(error instanceof Error ? error.message : 'تعذر حفظ الرد.'));
  };

  // Sidebar navigation items
  const sidebarItems = [
    {
      id: 'overview',
      label: 'الرئيسية / نظرة عامة',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'services',
      label: 'البرامج والخدمات التعليمية',
      icon: <Layers className="w-4 h-4" />,
      badge: currentServices.length,
    },
    {
      id: 'inquiries',
      label: 'طلبات واستفسارات الطلاب',
      icon: <Inbox className="w-4 h-4" />,
      badge: inquiries.filter((i) => i.status === 'pending').length,
      badgeColor: 'bg-rose-600 text-white',
    },
    {
      id: 'students',
      label: 'شؤون الطلاب والملتحقين',
      icon: <Users className="w-4 h-4" />,
      badge: students.length,
    },
    {
      id: 'accreditation',
      label: 'ملف الاعتماد والترخيص',
      icon: <FileCheck className="w-4 h-4" />,
    },
    {
      id: 'reviews',
      label: 'التقييمات والآراء',
      icon: <Star className="w-4 h-4" />,
      badge: reviews.length,
    },
    {
      id: 'settings',
      label: 'الإعدادات وفريق العمل',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const currentTabObj = sidebarItems.find((item) => item.id === activeTab) || sidebarItems[0];
  const pendingInquiriesCount = inquiries.filter((i) => i.status === 'pending').length;

  return (
    <div className="aali-app min-h-screen flex flex-col md:flex-row">
      {/* Toast Alert */}
      {toastMessage && (
        <div 
          role="status" 
          aria-live="polite"
          className="fixed bottom-6 start-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Top Navigation */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-bold text-xs">
            إ
          </div>
          <div>
            <div className="font-bold text-slate-900 text-xs">بوابة مزودي الخدمة</div>
            <div className="text-[10px] text-slate-500 line-clamp-1">{displayProviderName}</div>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="القائمة الجانبية"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Layout */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } aali-sidebar md:block w-full md:w-64 border-e shrink-0 flex flex-col justify-between z-30`}
      >
        <div>
          {/* Platform Branding */}
          <div className="p-5 border-b border-slate-100">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2.5 text-start w-full group mb-3 cursor-pointer"
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
                لوحة مزوّد الخدمة
              </span>
              <p className="aali-sidebar-muted text-sm line-clamp-1">{displayProviderName}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="aali-sidebar-muted px-3 py-2 text-xs font-semibold">
              أقسام لوحة التحكم
            </div>
            {sidebarItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`aali-nav-item w-full text-start flex items-center justify-between px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'text-white'
                      : 'aali-sidebar-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-indigo-200' : 'text-current'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.badgeColor
                          ? item.badgeColor
                          : isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
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
          <div className="space-y-1 text-xs">
            <button
              onClick={() => onNavigate('landing')}
              className="w-full text-start py-2 px-2 rounded-lg hover:bg-white/5 text-sm aali-sidebar-muted flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                الصفحة الرئيسية
              </span>
            </button>
            <button
              onClick={() => onNavigate('discovery')}
              className="w-full text-start py-2 px-2 rounded-lg hover:bg-white/5 text-sm aali-sidebar-muted flex items-center justify-between cursor-pointer"
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
              className="w-full text-start text-sm text-rose-300 hover:text-rose-200 flex items-center gap-2 px-1 py-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Provider account status and notifications */}
        <ProviderHeader
          currentType={currentType}
          provider={currentProvider}
          onOpenAddModal={() => {
            setEditingService(null);
            setIsAddModalOpen(true);
          }}
          onNavigate={onNavigate}
          activeTabLabel={currentTabObj.label}
          pendingInquiriesCount={pendingInquiriesCount}
          onOpenInquiries={() => setActiveTab('inquiries')}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkNotificationRead={markAsRead}
        />

        {/* Tab Content Rendering */}
        <main className="w-full max-w-[1600px] mx-auto p-5 sm:p-7 lg:p-10 flex-1">
          {!catalogLoading && payoutInfoLoaded && !profileComplete && (
            <div role="alert" className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              <strong>ملف المؤسسة غير مكتمل.</strong>
              <span> أكمل البيانات التالية من الإعدادات لتتمكن من تفعيل الدورات: {missingProfileFields.join('، ')}.</span>
            </div>
          )}
          {activeTab === 'overview' && (
            <OverviewTab
              currentType={currentType}
              provider={currentProvider}
              services={currentServices}
              inquiries={inquiries}
              students={students}
              onOpenAddModal={() => {
                setEditingService(null);
                setIsAddModalOpen(true);
              }}
              onNavigateTab={setActiveTab}
              onRespondInquiry={(inq) => {
                setActiveTab('inquiries');
              }}
            />
          )}

          {activeTab === 'services' && (
            <ProgramsTab
              currentType={currentType}
              services={currentServices}
              onOpenAddModal={() => {
                setEditingService(null);
                setIsAddModalOpen(true);
              }}
              onEditService={(srv) => {
                setEditingService(srv);
                setIsAddModalOpen(true);
              }}
              onToggleStatus={handleToggleStatus}
              onDeleteService={handleDeleteService}
              onQuickUpdateSeats={handleQuickUpdateSeats}
              canActivate={profileComplete}
            />
          )}

          {activeTab === 'inquiries' && (
            <InquiriesTab
              inquiries={inquiries}
              onUpdateStatus={handleUpdateInquiryStatus}
            />
          )}

          {activeTab === 'students' && (
            <StudentsTab
              students={students}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'accreditation' && (
            <AccreditationTab
              currentType={currentType}
              provider={currentProvider}
              onSubmitVerification={submitProviderVerification}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsTab
              reviews={reviews}
              onReplyReview={handleReplyReview}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              currentType={currentType}
              provider={currentProvider}
              staffList={teamMembers}
              onAddStaff={addTeamMember}
              onSaveProfile={saveProviderProfile}
              onSaveOrganizationDetails={saveProviderOrganizationDetails}
              payoutInfo={payoutInfo}
              onSavePayoutInfo={savePayoutInfo}
              onPayoutInfoChange={setPayoutInfo}
              onSaveBranding={saveProviderBranding}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Add / Edit Program Modal */}
      <AddEditProgramModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingService(null);
        }}
        onSave={handleSaveService}
        onOpenSettings={() => {
          setIsAddModalOpen(false);
          setEditingService(null);
          setActiveTab('settings');
        }}
        providerName={displayProviderName}
        currentType={currentType}
        initialService={editingService}
        teamMembers={teamMembers}
        missingProfileFields={missingProfileFields}
        canActivate={profileComplete}
      />
    </div>
  );
};
