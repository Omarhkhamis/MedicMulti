import React from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { StepProps } from "../../types/form";
import FormInput from "../FormInput";
import PhoneInput from "../PhoneInput";

const Step1: React.FC<StepProps> = ({ formData, errors, onChange, onBlur }) => {
  const { t } = useLanguage();

  const currencyOptions = [
    { value: "EUR", label: t('euro') },
    { value: "USD", label: t('us_dollar') },
    { value: "GBP", label: t('british_pound') },
    { value: "CAD", label: t('canadian_dollar') },
  ];

  const languageOptions = [
    { value: "arabic", label: t('arabic') },
    { value: "english", label: t('english') },
    { value: "french", label: t('french') },
    { value: "spanish", label: t('spanish') },
    { value: "turkish", label: t('turkish') },
    { value: "russian", label: t('russian') },
    { value: "other", label: t('other') },
  ];

  const healthConditionOptions = [
    { value: "good", label: t('good') },
    { value: "requires_report", label: t('requires_report') },
  ];

  const servicesOptions = [
    { value: "dental", label: t('dental') },
    { value: "hollywood_smile", label: t('hollywood_smile') },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t('personal_information')}
        </h2>
        <p className="text-gray-600">
          {t('personal_info_desc')}
        </p>
      </div>

      {/* Row 1: 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormInput
          label={t('consultant_name')}
          value={formData.consultantName}
          onChange={(value) => onChange("consultantName", value)}
          onBlur={() => onBlur("consultantName")}
          error={errors.consultantName}
          required
          placeholder={t('enter_consultant_name')}
        />

        <FormInput
          label={t('patient_name')}
          value={formData.patientName}
          onChange={(value) => onChange("patientName", value)}
          onBlur={() => onBlur("patientName")}
          error={errors.patientName}
          required
          placeholder={t('enter_patient_name')}
        />

        <PhoneInput
          value={formData.phoneNumber}
          onChange={(phone) => onChange("phoneNumber", phone)}
          onBlur={() => onBlur("phoneNumber")}
          error={errors.phoneNumber}
        />
      </div>

      {/* Row 2: 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <FormInput
          label={t('patient_id')}
          value={formData.patientId}
          onChange={(value) => onChange("patientId", value)}
          onBlur={() => onBlur("patientId")}
          error={errors.patientId}
          required
          placeholder={t('enter_patient_id')}
        />

        <FormInput
          label={t('entry_date')}
          type="date"
          value={formData.entryDate}
          onChange={(value) => onChange("entryDate", value)}
          onBlur={() => onBlur("entryDate")}
          error={errors.entryDate}
          required
        />

        <FormInput
          label={t('age')}
          type="number"
          value={formData.age}
          onChange={(value) => onChange("age", value)}
          onBlur={() => onBlur("age")}
          error={errors.age}
          required
          placeholder={t('enter_age')}
        />

        <FormInput
          label={t('currency')}
          type="select"
          value={formData.currency}
          onChange={(value) => onChange("currency", value)}
          onBlur={() => onBlur("currency")}
          options={currencyOptions}
          error={errors.currency}
          required
        />
      </div>

      {/* Row 3: 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormInput
          label={t('language')}
          type="select"
          value={formData.language}
          onChange={(value) => onChange("language", value)}
          onBlur={() => onBlur("language")}
          options={languageOptions}
          error={errors.language}
          required
        />

        <FormInput
          label={t('health_condition')}
          type="select"
          value={formData.healthCondition}
          onChange={(value) => onChange("healthCondition", value)}
          onBlur={() => onBlur("healthCondition")}
          options={healthConditionOptions}
          error={errors.healthCondition}
          required
        />

        <FormInput
          label={t('services')}
          type="select"
          value={formData.services}
          onChange={(value) => onChange("services", value)}
          onBlur={() => onBlur("services")}
          options={servicesOptions}
          error={errors.services}
          required
        />
      </div>
    </div>
  );
};

export default Step1;
