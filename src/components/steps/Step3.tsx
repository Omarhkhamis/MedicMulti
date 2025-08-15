import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { StepProps } from "../../types/form";
import FormInput from "../FormInput";
import { Upload, X, Image } from "lucide-react";

const MAX_IMAGES = 4;

/** تعريفات لأنواع هذه الخطوة */
type Step3FormData = {
  uploadedImages?: File[];
  medicalTreatmentPlan?: string;
  medicalNotes?: string;
  pdfLanguage?: string;
  // لو عندك حقول إضافية عامة بالـ formData احتفظنا بإمكانية وجودها:
  [key: string]: unknown;
};

type Step3Errors = {
  medicalTreatmentPlan?: string;
  medicalNotes?: string;
  pdfLanguage?: string;
  [key: string]: string | undefined;
};

/** نشتق Props خاصة بهذه الخطوة من StepProps مع ضبط الأنواع */
type Step3Props = Omit<
  StepProps,
  "formData" | "errors" | "onChange" | "onBlur"
> & {
  formData: Step3FormData;
  errors: Step3Errors;
  onChange: <K extends keyof Step3FormData>(
    field: K,
    value: Step3FormData[K]
  ) => void;
  onBlur: (field: keyof Step3FormData) => void;
};

const Step3: React.FC<Step3Props> = ({
  formData,
  errors,
  onChange,
  onBlur,
}) => {
  const { t } = useLanguage();

  const pdfLanguageOptions = [
    { value: "en", label: "🇺🇸 English" },
    { value: "ru", label: "🇷🇺 Русский" },
    { value: "fr", label: "🇫🇷 Français" },
    { value: "ar", label: "🇸🇦 العربية" },
  ];

  const handleImagesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const validFiles: File[] = [];

    const current = formData.uploadedImages ?? [];
    const remainingSlots = Math.max(0, MAX_IMAGES - current.length);

    if (remainingSlots === 0) {
      alert(t('jpg_png_only').replace('{{max}}', MAX_IMAGES.toString()));
      event.target.value = "";
      return;
    }

    for (
      let i = 0;
      i < files.length && validFiles.length < remainingSlots;
      i++
    ) {
      const file = files[i];
      if (allowedTypes.includes(file.type)) validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onChange("uploadedImages", [...current, ...validFiles]);
    }

    const skippedByType = Array.from(files).filter(
      (f) => !allowedTypes.includes(f.type)
    ).length;
    const skippedByLimit = Math.max(
      0,
      files.length - validFiles.length - skippedByType
    );

    if (skippedByType > 0) {
      alert(
        t('jpg_png_only').replace('{{max}}', MAX_IMAGES.toString())
      );
    }
    if (skippedByLimit > 0) {
      alert(
        t('jpg_png_only').replace('{{max}}', MAX_IMAGES.toString())
      );
    }

    event.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = (formData.uploadedImages ?? []).filter(
      (_, i) => i !== index
    );
    onChange("uploadedImages", updatedImages);
  };

  const uploadedCount = formData.uploadedImages?.length ?? 0;
  const remaining = Math.max(0, MAX_IMAGES - uploadedCount);
  const uploadDisabled = uploadedCount >= MAX_IMAGES;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-200 mb-2">
          {t('additional_information')}
        </h2>
        <p className="text-gray-400">
          {t('additional_info_desc')}
        </p>
      </div>

      {/* Multiple Images Upload Section */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <label className="block text-sm font-semibold text-gray-300">
            {t('upload_images')}
          </label>
          <span className="text-xs text-gray-400">
            {uploadedCount}/{MAX_IMAGES} {t('uploaded')}
            {remaining > 0 ? ` · ${remaining} ${t('remaining')}` : ` · ${t('limit_reached')}`}
          </span>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            uploadDisabled
              ? "border-gray-600 bg-gray-700 cursor-not-allowed opacity-75"
              : "border-gray-500 hover:border-gray-400 bg-gray-700"
          }`}
        >
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleImagesUpload}
            multiple
            className="hidden"
            id="images-upload"
            disabled={uploadDisabled}
          />
          <label
            htmlFor="images-upload"
            className={`flex flex-col items-center gap-4 ${
              uploadDisabled ? "pointer-events-none" : "cursor-pointer"
            }`}
          >
            <Upload className="w-12 h-12 text-gray-500" />
            <div>
              <p className="text-lg font-medium text-gray-300">
                {uploadDisabled
                  ? t('upload_limit_reached')
                  : t('click_to_upload')}
              </p>
              <p className="text-sm text-gray-400">
                {t('jpg_png_only').replace('{{max}}', MAX_IMAGES.toString())}
              </p>
            </div>
          </label>
        </div>

        {/* Images Preview */}
        {uploadedCount > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-200">
              {t('uploaded_images')} ({uploadedCount}/{MAX_IMAGES})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(formData.uploadedImages ?? []).map((image, index) => (
                <div
                  key={index}
                  className="relative bg-gray-700 rounded-lg p-4 space-y-3 border border-gray-600"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 z-10 flex items-center justify-center w-8 h-8 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-full transition-all duration-200"
                    title="Remove image"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X size={16} />
                  </button>

                  <div className="flex items-center gap-2 pr-10">
                    <Image className="w-5 h-5 text-blue-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-200 truncate">
                        {image.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {(image.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="mt-1">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PDF Language Selection */}
      <div className="bg-slate-700 border border-slate-600 rounded-lg p-6 space-y-4">
        <h4 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
          📄 {t('pdf_export_language')}
        </h4>
        <p className="text-sm text-gray-300">
          {t('pdf_language_description')}
        </p>
        <FormInput
          label={t('select_pdf_language')}
          type="select"
          value={formData.pdfLanguage ?? "en"}
          onChange={(value: string | number) =>
            onChange("pdfLanguage", String(value))
          }
          onBlur={() => onBlur("pdfLanguage")}
          options={pdfLanguageOptions}
          error={errors.pdfLanguage}
        />
      </div>

      {/* Medical treatment plan */}
      <FormInput
        label={t('medical_treatment_plan')}
        type="textarea"
        value={formData.medicalTreatmentPlan ?? ""}
        onChange={(value: string | number) =>
          onChange("medicalTreatmentPlan", String(value))
        }
        onBlur={() => onBlur("medicalTreatmentPlan")}
        error={errors.medicalTreatmentPlan}
        placeholder={t('treatment_plan_placeholder')}
      />

      {/* Medical notes */}
      <FormInput
        label={t('medical_notes')}
        type="textarea"
        value={formData.medicalNotes ?? ""}
        onChange={(value: string | number) =>
          onChange("medicalNotes", String(value))
        }
        onBlur={() => onBlur("medicalNotes")}
        error={errors.medicalNotes}
        placeholder={t('medical_notes_placeholder')}
      />
    </div>
  );
};

export default Step3;
