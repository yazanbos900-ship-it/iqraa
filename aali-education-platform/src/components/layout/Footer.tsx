import React from 'react';
import { ActiveView } from '../../types';

interface FooterProps {
  onNavigate: (view: ActiveView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-10">
          {/* Brand info */}
          <div className="md:col-span-1">
            <div className="text-white text-lg font-bold flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded bg-indigo-600 text-white inline-flex items-center justify-center text-sm font-black">
                إ
              </span>
              <span>منصة أعالي التعليمية</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              منظومة متكاملة لربط الطلاب وأولياء الأمور بمقدمي الخدمات التعليمية المعتمدين في المدارس والجامعات والمعاهد والمراكز التدريبية.
            </p>
          </div>

          {/* Nav links 1 */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-4">
              الخدمات التعليمية
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('discovery')}
                  className="hover:text-white transition-colors"
                >
                  المدارس الخاصة والدولية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('discovery')}
                  className="hover:text-white transition-colors"
                >
                  الجامعات والكليات المعتمدة
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('discovery')}
                  className="hover:text-white transition-colors"
                >
                  معاهد اللغات والتقنية
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('discovery')}
                  className="hover:text-white transition-colors"
                >
                  المعلمون والمدربون المعتمدون
                </button>
              </li>
            </ul>
          </div>

          {/* Nav links 2 */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-4">
              بوابات المنصة
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('auth-login')}
                  className="hover:text-white transition-colors"
                >
                  بوابة الطالب وولي الأمر
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('auth-register')}
                  className="hover:text-white transition-colors"
                >
                  بوابة المؤسسات ومزودي الخدمة
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('auth-register')}
                  className="hover:text-white transition-colors"
                >
                  تسجيل مؤسسة تعليمية جديدة
                </button>
              </li>
            </ul>
          </div>

          {/* Account access */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-4">
              ابدأ مع أعالي
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              استكشف البرامج التعليمية أو أنشئ حساباً لمتابعة طلباتك وخدماتك.
            </p>
            <button onClick={() => onNavigate('discovery')} className="text-sm font-semibold text-indigo-300 hover:text-white transition-colors">استكشف البرامج التعليمية ←</button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div>
            جميع الحقوق محفوظة © {new Date().getFullYear()} منصة أعالي للخدمات التعليمية.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">الشروط والأحكام</span>
            <span className="hover:text-slate-400 cursor-pointer">سياسة الخصوصية</span>
            <span className="hover:text-slate-400 cursor-pointer">معايير الاعتماد والجودة</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
