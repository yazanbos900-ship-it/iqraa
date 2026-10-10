/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveView, EducationalService, CourseBooking } from './types';
import { usePlatformData } from './firebase/PlatformDataContext';
import { useAuth } from './firebase/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './views/LandingPage';
import { DiscoveryView } from './views/student/DiscoveryView';
import { CourseDetailsView } from './views/student/CourseDetailsView';
import { ProviderProfileView } from './views/student/ProviderProfileView';
import { CheckoutView } from './views/student/CheckoutView';
import { StudentPortal } from './views/student/StudentPortal';
import { ProviderPortal } from './views/provider/ProviderPortal';
import { AdminPortal } from './views/admin/AdminPortal';
import { AuthView } from './views/auth/AuthView';
import { ContrastAuditTool } from './components/ui/ContrastAuditTool';

const PortalAccessRequired: React.FC<{ onNavigate: (view: ActiveView) => void; roleName: string }> = ({ onNavigate, roleName }) => (
  <main className="aali-app flex-1 grid place-items-center p-6 sm:p-10">
    <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 text-center shadow-soft-card">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-700 text-xl font-bold">إ</div>
      <h1 className="text-2xl font-bold text-slate-900">بوابة {roleName}</h1>
      <p className="mt-3 text-base leading-7 text-slate-600">سجّل الدخول بالحساب المناسب لعرض لوحة التحكم ومتابعة أعمالك.</p>
      <button onClick={() => onNavigate('auth-login')} className="mt-7 min-h-11 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">تسجيل الدخول</button>
    </div>
  </main>
);

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('landing');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [dir, setDir] = useState<'rtl' | 'ltr'>('rtl');
  const { services } = usePlatformData();
  const { userProfile, loading: authLoading } = useAuth();

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = dir === 'rtl' ? 'ar' : 'en';
  }, [dir]);

  const handleNavigate = (view: ActiveView, extraId?: string) => {
    if (extraId) {
      if (view === 'course-details' || view === 'checkout') {
        setSelectedCourseId(extraId);
      } else if (view === 'provider-profile') {
        setSelectedProviderId(extraId);
      }
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    handleNavigate('course-details', courseId);
  };

  const handleSelectProvider = (providerId: string) => {
    setSelectedProviderId(providerId);
    handleNavigate('provider-profile', providerId);
  };

  const handleEnrollCourse = (course: EducationalService) => {
    setSelectedCourseId(course.id);
    handleNavigate('checkout', course.id);
  };

  const handleBookingCompleted = (_newBooking: CourseBooking) => undefined;

  const handleToggleDir = () => {
    setDir((prev) => (prev === 'rtl' ? 'ltr' : 'rtl'));
  };

  const activeCourse = services.find((s) => s.id === selectedCourseId) || services[0];

  return (
    <div className="aali-app min-h-screen flex flex-col font-sans" dir={dir}>
      {/* 
        Views with standard Top Navigation and Footer:
        - Landing
        - Discovery
        - Course Details
        - Provider Profile
        - Checkout
        - Auth
      */}
      {activeView === 'landing' && (
        <>
          <Navbar
            activeView={activeView}
            onNavigate={handleNavigate}
            dir={dir}
            onToggleDir={handleToggleDir}
          />
          <main className="flex-1">
            <LandingPage
              onNavigate={handleNavigate}
              onSelectCourse={handleSelectCourse}
              onSelectProvider={handleSelectProvider}
              onEnroll={handleEnrollCourse}
            />
          </main>
          <Footer onNavigate={handleNavigate} />
        </>
      )}

      {activeView === 'discovery' && (
        <>
          <Navbar
            activeView={activeView}
            onNavigate={handleNavigate}
            dir={dir}
            onToggleDir={handleToggleDir}
          />
          <main className="flex-1">
            <DiscoveryView
              onNavigate={handleNavigate}
              onSelectCourse={handleSelectCourse}
              onEnroll={handleEnrollCourse}
            />
          </main>
          <Footer onNavigate={handleNavigate} />
        </>
      )}

      {activeView === 'course-details' && (
        <>
          <Navbar
            activeView={activeView}
            onNavigate={handleNavigate}
            dir={dir}
            onToggleDir={handleToggleDir}
          />
          <main className="flex-1">
            <CourseDetailsView
              courseId={selectedCourseId}
              onNavigate={handleNavigate}
              onEnroll={handleEnrollCourse}
            />
          </main>
          <Footer onNavigate={handleNavigate} />
        </>
      )}

      {activeView === 'provider-profile' && (
        <>
          <Navbar
            activeView={activeView}
            onNavigate={handleNavigate}
            dir={dir}
            onToggleDir={handleToggleDir}
          />
          <main className="flex-1">
            <ProviderProfileView
              providerId={selectedProviderId}
              onNavigate={handleNavigate}
              onSelectCourse={handleSelectCourse}
            />
          </main>
          <Footer onNavigate={handleNavigate} />
        </>
      )}

      {activeView === 'checkout' && (
        <>
          <Navbar
            activeView={activeView}
            onNavigate={handleNavigate}
            dir={dir}
            onToggleDir={handleToggleDir}
          />
          <main className="flex-1">
            {activeCourse ? (
              <CheckoutView
                course={activeCourse}
                onNavigate={handleNavigate}
                onBookingCompleted={handleBookingCompleted}
              />
            ) : (
              <div className="flex-1 p-12 text-center text-slate-600">لا يوجد برنامج محدد. اختر برنامجاً من قائمة البرامج أولاً.</div>
            )}
          </main>
          <Footer onNavigate={handleNavigate} />
        </>
      )}

      {/* Standalone Dashboard Layouts */}
      {activeView === 'student' && (
        authLoading ? <main className="flex-1 grid place-items-center text-slate-500">جارٍ التحقق من الحساب…</main>
          : userProfile?.role === 'student'
            ? <StudentPortal activeView={activeView} onNavigate={handleNavigate} onSelectCourse={handleSelectCourse} />
            : <PortalAccessRequired onNavigate={handleNavigate} roleName="الطلاب" />
      )}

      {activeView === 'provider' && (
        authLoading ? <main className="flex-1 grid place-items-center text-slate-500">جارٍ التحقق من الحساب…</main>
          : userProfile?.role === 'provider'
            ? <ProviderPortal activeView={activeView} onNavigate={handleNavigate} />
            : <PortalAccessRequired onNavigate={handleNavigate} roleName="مزودي الخدمة" />
      )}

      {activeView === 'admin' && (
        authLoading ? <main className="flex-1 grid place-items-center text-slate-500">جارٍ التحقق من الحساب…</main>
          : userProfile?.role === 'admin'
            ? <AdminPortal activeView={activeView} onNavigate={handleNavigate} />
            : <PortalAccessRequired onNavigate={handleNavigate} roleName="الإدارة" />
      )}

      {(activeView === 'auth-login' || activeView === 'auth-register' || activeView === 'auth-recovery') && (
        <>
          <Navbar
            activeView={activeView}
            onNavigate={handleNavigate}
            dir={dir}
            onToggleDir={handleToggleDir}
          />
          <main className="flex-1">
            <AuthView
              initialMode={activeView === 'auth-login' ? 'login' : activeView === 'auth-register' ? 'register' : 'recovery'}
              onNavigate={handleNavigate}
            />
          </main>
          <Footer onNavigate={handleNavigate} />
        </>
      )}

      {userProfile?.role === 'admin' && (
        <ContrastAuditTool activeView={activeView} onNavigate={handleNavigate} />
      )}
    </div>
  );
}
