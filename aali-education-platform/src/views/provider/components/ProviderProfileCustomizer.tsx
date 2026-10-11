import React, { useEffect, useRef, useState } from 'react';
import { EducationalProvider } from '../../../types';
import { ProviderProfileView } from '../../student/ProviderProfileView';

interface ProviderProfileCustomizerProps {
  provider: EducationalProvider;
  onSave: (details: Partial<EducationalProvider>) => Promise<void>;
  onShowMessage: (message: string, type?: 'success' | 'error') => void;
  onCancel?: () => void;
}

export const ProviderProfileCustomizer: React.FC<ProviderProfileCustomizerProps> = ({
  provider,
  onSave,
  onShowMessage,
  onCancel,
}) => {
  const [draft, setDraft] = useState(provider);
  const [isSaving, setIsSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const objectUrls = useRef(new Set<string>());

  useEffect(() => () => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.current.clear();
  }, []);

  const changeProfile = (changes: Partial<EducationalProvider>) => {
    setDraft((current) => ({ ...current, ...changes }));
  };

  const previewImage = (file: File | undefined, key: 'logoUrl' | 'bannerImageUrl') => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    changeProfile({ [key]: url });
  };

  const previewGalleryImages = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.add(url);
      return url;
    });
    changeProfile({ galleryImageUrls: [...(draft.galleryImageUrls || []), ...urls] });
  };

  const saveChanges = async () => {
    const galleryImageUrls = (draft.galleryImageUrls || []).filter((url) => !url.startsWith('blob:'));
    const details: Partial<EducationalProvider> = {
      name: draft.name.trim(),
      nameEn: draft.nameEn.trim(),
      category: draft.category,
      coverColor: draft.coverColor,
      city: draft.city.trim(),
      description: draft.description.trim(),
      contactPerson: draft.contactPerson?.trim() || '',
      contactEmail: draft.contactEmail.trim(),
      contactPhone: draft.contactPhone.trim(),
      landline: draft.landline?.trim() || '',
      workingHours: draft.workingHours?.trim() || '',
      website: draft.website?.trim() || '',
      address: draft.address?.trim() || '',
      ...(draft.addressDetails ? { addressDetails: draft.addressDetails } : {}),
      ...(typeof draft.establishedYear === 'number' ? { establishedYear: draft.establishedYear } : {}),
      accreditationBody: draft.accreditationBody?.trim() || '',
      verifiedLicenseNumber: draft.verifiedLicenseNumber?.trim() || '',
      servicesOffered: draft.servicesOffered,
      tags: draft.tags,
      logoUrl: draft.logoUrl?.startsWith('blob:') ? provider.logoUrl || '' : draft.logoUrl?.trim() || '',
      bannerImageUrl: draft.bannerImageUrl?.startsWith('blob:') ? provider.bannerImageUrl || '' : draft.bannerImageUrl?.trim() || '',
      galleryImageUrls,
      socialLinks: Object.fromEntries(
        Object.entries(draft.socialLinks || {}).map(([network, url]) => [network, url?.trim() || '']),
      ),
    };

    setIsSaving(true);
    setSaveNotice(null);
    try {
      await onSave(details);
      setDraft((current) => ({
        ...current,
        ...details,
        ...(current.logoUrl?.startsWith('blob:') ? { logoUrl: current.logoUrl } : {}),
        ...(current.bannerImageUrl?.startsWith('blob:') ? { bannerImageUrl: current.bannerImageUrl } : {}),
        ...(current.galleryImageUrls?.some((url) => url.startsWith('blob:'))
          ? { galleryImageUrls: [...(details.galleryImageUrls || []), ...current.galleryImageUrls.filter((url) => url.startsWith('blob:'))] }
          : {}),
      }));
      const message = 'تم حفظ تعديلات الصفحة. الصور المختارة من الجهاز للمعاينة فقط، أما روابط الصور فتم حفظها.';
      setSaveNotice({ type: 'success', message });
      onShowMessage(message, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'تعذر حفظ تعديلات الصفحة.';
      setSaveNotice({ type: 'error', message });
      onShowMessage(message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {onCancel && (
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-indigo-700 hover:text-indigo-900">
          العودة إلى لوحة المؤسسات
        </button>
      )}
      <ProviderProfileView
        providerId={provider.id}
        providerOverride={draft}
        editMode
        isSaving={isSaving}
        saveNotice={saveNotice}
        onProviderChange={changeProfile}
        onPreviewImage={previewImage}
        onPreviewGalleryImages={previewGalleryImages}
        onSaveChanges={() => void saveChanges()}
        onCancelEdit={onCancel}
        onNavigate={() => undefined}
        onSelectCourse={() => undefined}
      />
    </div>
  );
};
