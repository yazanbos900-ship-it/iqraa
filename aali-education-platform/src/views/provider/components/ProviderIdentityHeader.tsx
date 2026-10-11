import React, { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { EducationalProvider } from '../../../types';
import { ProviderTypeOption } from '../types';

type BrandingImageField = 'logoUrl' | 'bannerUrl';

interface ProviderIdentityHeaderProps {
  provider?: EducationalProvider;
  currentType: ProviderTypeOption;
  onSaveImage: (field: BrandingImageField, url: string | null) => Promise<void>;
  onShowMessage: (message: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const resizeImage = async (file: File, field: BrandingImageField): Promise<Blob> => {
  const image = await createImageBitmap(file);
  const maxDimension = field === 'logoUrl' ? 512 : 1600;
  const scale = Math.min(1, maxDimension / (field === 'logoUrl' ? Math.max(image.width, image.height) : image.width));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    image.close();
    throw new Error('تعذر تجهيز الصورة للرفع على هذا المتصفح.');
  }

  context.drawImage(image, 0, 0, width, height);
  image.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob
        ? resolve(blob)
        : reject(new Error('تعذر تصغير الصورة قبل رفعها.')),
      file.type,
      0.9,
    );
  });
};

const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء تحديث الصورة.';

export const ProviderIdentityHeader: React.FC<ProviderIdentityHeaderProps> = ({
  provider,
  currentType,
  onSaveImage,
  onShowMessage,
}) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();
  const logoInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState(provider?.logoUrl || '');
  const [bannerUrl, setBannerUrl] = useState(provider?.bannerUrl || provider?.bannerImageUrl || '');
  const [failedImages, setFailedImages] = useState<Record<BrandingImageField, boolean>>({
    logoUrl: false,
    bannerUrl: false,
  });
  const [uploading, setUploading] = useState<BrandingImageField | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [configurationError, setConfigurationError] = useState(() => (
    cloudName && uploadPreset
      ? ''
      : 'إعداد Cloudinary ناقص. أضف VITE_CLOUDINARY_CLOUD_NAME وVITE_CLOUDINARY_UPLOAD_PRESET إلى .env ثم أعد تشغيل التطبيق.'
  ));

  useEffect(() => {
    setLogoUrl(provider?.logoUrl || '');
    setBannerUrl(provider?.bannerUrl || provider?.bannerImageUrl || '');
    setFailedImages({ logoUrl: false, bannerUrl: false });
  }, [provider?.logoUrl, provider?.bannerUrl, provider?.bannerImageUrl]);

  const report = (message: string, type: 'success' | 'error' = 'error') => {
    setFeedback({ type, message });
    onShowMessage(message);
  };

  const uploadImage = async (file: File, field: BrandingImageField) => {
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      report('نوع الصورة غير مدعوم. اختر JPG أو PNG أو WebP.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      report('حجم الصورة يتجاوز 5 ميغابايت.');
      return;
    }

    if (!cloudName || !uploadPreset) {
      const message = 'إعداد Cloudinary ناقص. أضف VITE_CLOUDINARY_CLOUD_NAME وVITE_CLOUDINARY_UPLOAD_PRESET إلى .env ثم أعد تشغيل التطبيق.';
      setConfigurationError(message);
      report(message);
      return;
    }

    setConfigurationError('');
    setFeedback(null);
    setUploading(field);
    const previousUrl = field === 'logoUrl' ? logoUrl : bannerUrl;
    const previewUrl = URL.createObjectURL(file);
    if (field === 'logoUrl') setLogoUrl(previewUrl);
    else setBannerUrl(previewUrl);
    setFailedImages((current) => ({ ...current, [field]: false }));

    try {
      const resizedImage = await resizeImage(file, field);
      const uploadData = new FormData();
      uploadData.append('file', resizedImage, file.name);
      uploadData.append('upload_preset', uploadPreset);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
        method: 'POST',
        body: uploadData,
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const cloudinaryMessage = typeof result === 'object' && result !== null
          && 'error' in result
          && typeof result.error === 'object' && result.error !== null
          && 'message' in result.error && typeof result.error.message === 'string'
          ? result.error.message
          : '';
        throw new Error(cloudinaryMessage || 'تعذر رفع الصورة إلى Cloudinary.');
      }
      const uploadedUrl = typeof result === 'object' && result !== null && 'secure_url' in result
        && typeof result.secure_url === 'string'
        ? result.secure_url
        : '';
      if (!uploadedUrl.startsWith('https://res.cloudinary.com/') || uploadedUrl.length >= 500) {
        throw new Error('أعاد Cloudinary رابط صورة غير صالح.');
      }

      await onSaveImage(field, uploadedUrl);
      if (field === 'logoUrl') setLogoUrl(uploadedUrl);
      else setBannerUrl(uploadedUrl);
      report('تم التحديث', 'success');
    } catch (error) {
      if (field === 'logoUrl') setLogoUrl(previousUrl);
      else setBannerUrl(previousUrl);
      report(getErrorMessage(error));
    } finally {
      URL.revokeObjectURL(previewUrl);
      setUploading(null);
    }
  };

  const removeImage = async (field: BrandingImageField) => {
    const previousUrl = field === 'logoUrl' ? logoUrl : bannerUrl;
    if (!previousUrl) return;
    setFeedback(null);
    setUploading(field);
    if (field === 'logoUrl') setLogoUrl('');
    else setBannerUrl('');
    setFailedImages((current) => ({ ...current, [field]: false }));
    try {
      await onSaveImage(field, null);
      report('تم التحديث', 'success');
    } catch (error) {
      if (field === 'logoUrl') setLogoUrl(previousUrl);
      else setBannerUrl(previousUrl);
      report(getErrorMessage(error));
    } finally {
      setUploading(null);
    }
  };

  const imageControls = (
    field: BrandingImageField,
    inputRef: React.RefObject<HTMLInputElement | null>,
    label: string,
    hasImage: boolean,
    compact = false,
    canRemove = true,
  ) => (
    <div className="flex items-center gap-1.5">
      {hasImage && (
        <button
          type="button"
          onClick={() => void removeImage(field)}
          disabled={uploading !== null || !canRemove}
          className={`${compact ? 'h-8 w-8 justify-center rounded-full' : 'gap-1 rounded-lg px-2.5 py-1.5'} flex items-center bg-slate-950/70 text-xs font-semibold text-white hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60`}
          aria-label={`إزالة ${label}`}
          title={canRemove ? `إزالة ${label}` : `${label} القديم للعرض فقط ولا يمكن تعديله`}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {!compact && 'إزالة الصورة'}
        </button>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading !== null}
        className={`${compact ? 'h-8 w-8 justify-center rounded-full bg-indigo-700' : 'gap-1.5 rounded-lg bg-slate-950/70 px-2.5 py-1.5'} flex items-center text-xs font-semibold text-white hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-60`}
        aria-label={`تغيير ${label}`}
        title={`تغيير ${label}`}
      >
        {uploading === field ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
        {!compact && `تغيير ${label}`}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.currentTarget.value = '';
          if (file) void uploadImage(file, field);
        }}
      />
    </div>
  );

  const institutionInitials = provider?.name.trim().slice(0, 2) || currentType.avatarText.slice(0, 2);

  return (
    <section aria-label="هوية المؤسسة" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
      <div className="relative aspect-[4/1] min-h-28 max-h-56 bg-slate-200">
        {bannerUrl && !failedImages.bannerUrl ? (
          <img
            src={bannerUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setFailedImages((current) => ({ ...current, bannerUrl: true }))}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-r ${provider?.coverColor || 'from-indigo-900 to-indigo-700'}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
        <div className="absolute end-3 top-3">
          {imageControls(
            'bannerUrl',
            bannerInput,
            'الغلاف',
            Boolean(bannerUrl),
            false,
            Boolean(provider?.bannerUrl),
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-4 sm:flex-row sm:items-end sm:gap-5 sm:px-6">
        <div className="-mt-10 shrink-0 sm:-mt-12">
          <div className="relative h-24 w-24 sm:h-28 sm:w-28">
            <div className="h-full w-full overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
              {logoUrl && !failedImages.logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`شعار ${provider?.name || currentType.institutionName}`}
                  className="h-full w-full object-cover"
                  onError={() => setFailedImages((current) => ({ ...current, logoUrl: true }))}
                />
              ) : (
                <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${currentType.avatarBg} text-2xl font-bold text-white`}>
                  {institutionInitials}
                </div>
              )}
            </div>
            <div className="absolute bottom-0 end-0">
              {imageControls('logoUrl', logoInput, 'الشعار', Boolean(logoUrl), true)}
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 pb-1">
          <h3 className="truncate text-lg font-bold text-slate-900">{provider?.name || currentType.institutionName}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
            <span>{currentType.nameAr}</span>
            {provider?.city?.trim() && (
              <>
                <span aria-hidden="true">·</span>
                <span>{provider.city}</span>
              </>
            )}
          </p>
        </div>
      </div>
      {configurationError && (
        <p role="alert" className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 sm:px-6">
          {configurationError}
        </p>
      )}
      {provider?.bannerImageUrl && !provider.bannerUrl && (
        <p className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500 sm:px-6">
          الغلاف الحالي محفوظ بالحقل القديم للعرض فقط؛ يمكنك استبداله برفع غلاف جديد.
        </p>
      )}
      {feedback && (
        <p
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`border-t px-4 py-3 text-xs sm:px-6 ${feedback.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}
        >
          {feedback.message}
        </p>
      )}
    </section>
  );
};
