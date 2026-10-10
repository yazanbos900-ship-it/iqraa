import React, { useState } from 'react';
import { ProviderReviewItem } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  CornerDownLeft, 
  Send, 
  User, 
  Building2,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface ReviewsTabProps {
  reviews: ProviderReviewItem[];
  onReplyReview: (reviewId: string, replyText: string) => void;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({
  reviews,
  onReplyReview,
}) => {
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyInputText, setReplyInputText] = useState('');

  const averageRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);
  const averageAspect = (key: 'teaching' | 'facilities' | 'organization') => reviews.length
    ? reviews.reduce((total, review) => total + (review.aspects?.[key] || 0), 0) / reviews.length
    : 0;
  const teachingRating = averageAspect('teaching');
  const facilitiesRating = averageAspect('facilities');
  const organizationRating = averageAspect('organization');

  const handleSendReply = (reviewId: string) => {
    if (!replyInputText.trim()) return;
    onReplyReview(reviewId, replyInputText.trim());
    setActiveReplyId(null);
    setReplyInputText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              تقييمات وآراء الطلاب وأولياء الأمور
            </h2>
            <Badge variant="info">
              {reviews.length} تقييم
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            استعرض ملاحظات المستفيدين واكتب الردود الرسمية لتعزيز الثقة وسمعة المؤسسة
          </p>
        </div>
      </div>

      {/* Aggregate Satisfaction Score Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Main Score */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            التقييم العام للمؤسسة
          </span>
          <div className="text-4xl font-extrabold text-slate-900 my-1">{reviews.length ? averageRating : '—'}</div>
          <div className="flex items-center gap-1 text-amber-400 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`w-4 h-4 ${reviews.length && Number(averageRating) >= star ? 'fill-amber-400' : ''}`} />
            ))}
          </div>
          <span className="text-[11px] text-slate-400">بناءً على {reviews.length} تقييماً محفوظاً</span>
        </div>

        {/* Dimension 1: Teaching */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <span className="text-xs text-slate-500 font-medium">كفاءة وجودة التدريس</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{teachingRating ? `${teachingRating.toFixed(1)} / 5` : '—'}</div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(teachingRating / 5) * 100}%` }} />
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-2">{reviews.length ? `${Math.round((teachingRating / 5) * 100)}% من التقييم` : 'لا توجد تقييمات بعد'}</span>
        </div>

        {/* Dimension 2: Facilities */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <span className="text-xs text-slate-500 font-medium">المرافق والمعامل والتجهيزات</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{facilitiesRating ? `${facilitiesRating.toFixed(1)} / 5` : '—'}</div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(facilitiesRating / 5) * 100}%` }} />
          </div>
          <span className="text-[11px] text-indigo-700 font-medium mt-2">{reviews.length ? `${Math.round((facilitiesRating / 5) * 100)}% من التقييم` : 'لا توجد تقييمات بعد'}</span>
        </div>

        {/* Dimension 3: Management */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-2xs">
          <div>
            <span className="text-xs text-slate-500 font-medium">الاستجابة والتنظيم الإداري</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{organizationRating ? `${organizationRating.toFixed(1)} / 5` : '—'}</div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-sky-500 h-full rounded-full" style={{ width: `${(organizationRating / 5) * 100}%` }} />
          </div>
          <span className="text-[11px] text-sky-700 font-medium mt-2">{reviews.length ? `${Math.round((organizationRating / 5) * 100)}% من التقييم` : 'لا توجد تقييمات بعد'}</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">لا توجد تقييمات محفوظة لهذا المزود في Firestore.</div>}
        {reviews.map((rev) => (
          <Card key={rev.id} className="shadow-2xs border-slate-200">
            <CardContent className="p-5 space-y-3">
              {/* Reviewer Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                    {rev.avatarInitials || rev.studentName?.slice(0, 1) || 'ط'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{rev.studentName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">• صاحب التقييم</span>
                    </div>
                    <div className="text-xs text-indigo-900 font-medium line-clamp-1">{rev.courseTitle}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">{rev.date}</span>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                "{rev.comment}"
              </p>

              {/* Existing Provider Official Reply */}
              {rev.reply && (
                <div className="ms-4 p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-indigo-950 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-700" />
                      رد رسمي من: {rev.reply.responder}
                    </span>
                    <span className="text-[10px] text-indigo-700 font-normal">{rev.reply.date}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{rev.reply.text}</p>
                </div>
              )}

              {/* Reply Button & Composer */}
              {!rev.reply && (
                <div className="pt-2">
                  {activeReplyId === rev.id ? (
                    <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <label className="block text-xs font-semibold text-slate-800">
                        كتابة رد رسمي من إدارة المؤسسة:
                      </label>
                      <textarea
                        rows={2}
                        value={replyInputText}
                        onChange={(e) => setReplyInputText(e.target.value)}
                        placeholder="اكتب ردك اللبق وشكرك للمستفيد وتوضيح الإجراءات المتخذة..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveReplyId(null)}
                          className="text-xs"
                        >
                          إلغاء
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSendReply(rev.id)}
                          className="text-xs font-semibold gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>نشر الرد الرسمي</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveReplyId(rev.id);
                        setReplyInputText('');
                      }}
                      className="text-xs gap-1.5"
                    >
                      <CornerDownLeft className="w-3.5 h-3.5 text-indigo-600" />
                      <span>الرد على هذا التقييم</span>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
