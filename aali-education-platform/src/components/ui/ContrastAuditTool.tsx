import React, { useEffect, useState } from 'react';
import { ActiveView } from '../../types';
import { AlertTriangle, CheckCircle2, Copy, ScanEye, X } from 'lucide-react';

interface ContrastAuditToolProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

interface ContrastFinding {
  element: HTMLElement;
  text: string;
  selector: string;
  foreground: string;
  background: string;
  ratio: number | null;
  minimum: number;
  reason: 'low-contrast' | 'visual-background';
}

const TEXT_ELEMENTS = 'h1,h2,h3,h4,h5,h6,p,a,button,label,li,td,th,span,small,strong,em,summary,legend';
const AUDIT_VIEWS: { id: ActiveView; label: string }[] = [
  { id: 'landing', label: 'الرئيسية' },
  { id: 'discovery', label: 'دليل البرامج' },
  { id: 'auth-login', label: 'تسجيل الدخول' },
  { id: 'auth-register', label: 'إنشاء حساب' },
  { id: 'student', label: 'بوابة الطالب' },
  { id: 'provider', label: 'بوابة مزود الخدمة' },
  { id: 'admin', label: 'بوابة الإدارة' },
];

const parseColor = (value: string) => {
  const channels = value.match(/[\d.]+%?/g)?.map((channel) => {
    const number = Number.parseFloat(channel);
    return channel.endsWith('%') ? number * 2.55 : number;
  });
  if (!channels || channels.length < 3) return null;
  return {
    red: channels[0],
    green: channels[1],
    blue: channels[2],
    alpha: channels.length > 3 ? channels[3] : 1,
  };
};

const composite = (
  foreground: NonNullable<ReturnType<typeof parseColor>>,
  background: NonNullable<ReturnType<typeof parseColor>>,
) => {
  const alpha = foreground.alpha + background.alpha * (1 - foreground.alpha);
  if (alpha === 0) return { red: 255, green: 255, blue: 255, alpha: 1 };
  return {
    red: (foreground.red * foreground.alpha + background.red * background.alpha * (1 - foreground.alpha)) / alpha,
    green: (foreground.green * foreground.alpha + background.green * background.alpha * (1 - foreground.alpha)) / alpha,
    blue: (foreground.blue * foreground.alpha + background.blue * background.alpha * (1 - foreground.alpha)) / alpha,
    alpha,
  };
};

const luminance = (color: NonNullable<ReturnType<typeof parseColor>>) => {
  const linearize = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linearize(color.red) + 0.7152 * linearize(color.green) + 0.0722 * linearize(color.blue);
};

const contrastRatio = (first: NonNullable<ReturnType<typeof parseColor>>, second: NonNullable<ReturnType<typeof parseColor>>) => {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

const directText = (element: HTMLElement) => Array.from(element.childNodes)
  .filter((node) => node.nodeType === Node.TEXT_NODE)
  .map((node) => node.textContent || '')
  .join(' ')
  .replace(/\s+/g, ' ')
  .trim();

const describeElement = (element: HTMLElement) => {
  if (element.id) return `${element.tagName.toLowerCase()}#${element.id}`;
  const className = typeof element.className === 'string'
    ? element.className.split(/\s+/).filter(Boolean).slice(0, 2).join('.')
    : '';
  return `${element.tagName.toLowerCase()}${className ? `.${className}` : ''}`;
};

const scanPage = (): ContrastFinding[] => {
  const candidates = Array.from(document.body.querySelectorAll<HTMLElement>(TEXT_ELEMENTS));
  const findings: ContrastFinding[] = [];

  for (const element of candidates) {
    if (element.closest('[data-contrast-audit="ignore"]')) continue;
    const text = directText(element);
    if (!text || !element.getClientRects().length) continue;

    const styles = getComputedStyle(element);
    if (styles.display === 'none' || styles.visibility === 'hidden' || Number(styles.opacity) === 0) continue;

    const foreground = parseColor(styles.color);
    if (!foreground) continue;

    let background = { red: 255, green: 255, blue: 255, alpha: 1 };
    let hasVisualBackground = Boolean(element.closest('.landing-hero'));
    const ancestors: HTMLElement[] = [];
    let current: HTMLElement | null = element;
    while (current) {
      ancestors.push(current);
      const ancestorStyles = getComputedStyle(current);
      if (ancestorStyles.backgroundImage !== 'none') hasVisualBackground = true;
      if (current !== element && current.querySelector(':scope > img[alt=""]')) hasVisualBackground = true;
      current = current.parentElement;
    }

    for (const ancestor of ancestors.reverse()) {
      const color = parseColor(getComputedStyle(ancestor).backgroundColor);
      if (color) background = composite(color, background);
    }

    const size = Number.parseFloat(styles.fontSize);
    const weight = Number.parseInt(styles.fontWeight, 10) || 400;
    const minimum = size >= 24 || (size >= 18.66 && weight >= 700) ? 3 : 4.5;
    const ratio = contrastRatio(composite(foreground, background), background);
    const reason = hasVisualBackground ? 'visual-background' : ratio < minimum ? 'low-contrast' : null;
    if (!reason) continue;

    findings.push({
      element,
      text: text.length > 90 ? `${text.slice(0, 87)}...` : text,
      selector: describeElement(element),
      foreground: styles.color,
      background: hasVisualBackground ? 'صورة أو تدرج' : `rgb(${Math.round(background.red)}, ${Math.round(background.green)}, ${Math.round(background.blue)})`,
      ratio: hasVisualBackground ? null : ratio,
      minimum,
      reason,
    });
  }

  return findings;
};

export const ContrastAuditTool: React.FC<ContrastAuditToolProps> = ({ activeView, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [findings, setFindings] = useState<ContrastFinding[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [copied, setCopied] = useState(false);

  const runAudit = () => {
    setFindings(scanPage());
    setHasScanned(true);
  };

  useEffect(() => {
    const timer = window.setTimeout(runAudit, 80);
    return () => window.clearTimeout(timer);
  }, [activeView]);

  const copyReport = async () => {
    const report = findings.length === 0
      ? `فحص التباين: لم تظهر مشاكل في الصفحة الحالية (${activeView}).`
      : findings.map((finding) => [
          `[${finding.reason === 'low-contrast' ? 'تباين منخفض' : 'خلفية متغيرة'}]`,
          `النص: ${finding.text}`,
          `العنصر: ${finding.selector}`,
          `لون النص: ${finding.foreground}`,
          `الخلفية: ${finding.background}`,
          finding.ratio === null ? 'نسبة التباين: تحتاج فحصاً بصرياً' : `نسبة التباين: ${finding.ratio.toFixed(2)}:1 (المطلوب ${finding.minimum}:1)`,
        ].join('\n')).join('\n\n');
    try {
      await navigator.clipboard.writeText(`الصفحة: ${activeView}\n${report}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const focusFinding = (finding: ContrastFinding) => {
    finding.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const previousOutline = finding.element.style.outline;
    const previousOffset = finding.element.style.outlineOffset;
    finding.element.style.outline = '3px solid #f59e0b';
    finding.element.style.outlineOffset = '3px';
    window.setTimeout(() => {
      finding.element.style.outline = previousOutline;
      finding.element.style.outlineOffset = previousOffset;
    }, 2200);
  };

  return (
    <div data-contrast-audit="ignore" className="fixed bottom-4 start-4 z-[70]" dir="rtl">
      {isOpen && (
        <section className="mb-3 flex max-h-[min(72vh,36rem)] w-[min(92vw,25rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl" aria-label="فحص تباين الواجهة">
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">فحص وضوح النصوص</h2>
              <p className="mt-0.5 text-xs text-slate-600">الصفحة الحالية · {activeView}</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="grid h-10 w-10 place-items-center rounded-lg text-slate-600 hover:bg-slate-100" aria-label="إغلاق الفحص">
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex items-center gap-2 border-b border-slate-100 p-3">
            <label htmlFor="contrast-audit-view" className="sr-only">انتقل إلى صفحة لفحصها</label>
            <select
              id="contrast-audit-view"
              value={activeView}
              onChange={(event) => onNavigate(event.target.value as ActiveView)}
              className="min-h-10 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-800"
            >
              {AUDIT_VIEWS.map((view) => <option key={view.id} value={view.id}>{view.label}</option>)}
            </select>
            <button onClick={runAudit} className="min-h-10 rounded-lg bg-indigo-700 px-3 text-sm font-semibold text-white hover:bg-indigo-800">
              افحص الآن
            </button>
          </div>

          <div className="overflow-y-auto p-3">
            {!hasScanned ? (
              <p className="py-6 text-center text-sm text-slate-600">اختر صفحة، ثم ابدأ الفحص.</p>
            ) : findings.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                لم تُكتشف مشاكل تباين في النصوص ذات الخلفية الثابتة.
              </div>
            ) : (
              <>
                <p className="mb-2 text-xs text-slate-600">
                  {findings.filter((item) => item.reason === 'low-contrast').length} تباين منخفض · {findings.filter((item) => item.reason === 'visual-background').length} فوق صور أو تدرجات للمراجعة
                </p>
                <ul className="space-y-2">
                  {findings.map((finding, index) => (
                    <li key={`${finding.selector}-${index}`}>
                      <button onClick={() => focusFinding(finding)} className="w-full rounded-lg border border-amber-200 bg-amber-50 p-3 text-start hover:bg-amber-100">
                        <span className="flex items-start gap-2">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-slate-900">{finding.text}</span>
                            <span className="mt-1 block text-xs text-slate-700">
                              {finding.reason === 'low-contrast'
                                ? `${finding.ratio?.toFixed(2)}:1 · المطلوب ${finding.minimum}:1`
                                : 'خلفية صورة أو تدرج؛ تحتاج مراجعة بصرية'}
                            </span>
                            <span className="mt-0.5 block truncate font-mono text-[11px] text-slate-600">{finding.selector}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <footer className="flex items-center justify-between gap-2 border-t border-slate-200 p-3">
            <span className="text-[11px] text-slate-500">فحص بصري أولي وفق WCAG AA</span>
            <button onClick={copyReport} disabled={!hasScanned} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
              <Copy className="h-4 w-4" />
              {copied ? 'تم النسخ' : 'نسخ التقرير'}
            </button>
          </footer>
        </section>
      )}

      <button
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-slate-900 px-3.5 text-sm font-semibold text-white shadow-lg hover:bg-slate-800"
        aria-expanded={isOpen}
        aria-label="فتح فحص تباين الواجهة"
      >
        <ScanEye className="h-4 w-4" />
        فحص الواجهة
      </button>
    </div>
  );
};