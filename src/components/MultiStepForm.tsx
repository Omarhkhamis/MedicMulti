import React, { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { FormData, FormErrors } from "../types/form";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import StepNavigation from "./StepNavigation";
import LanguageSelector from "./LanguageSelector";
import { generatePDF } from "../utils/pdfGenerator";
import { FileText, CheckCircle } from "lucide-react";

const MultiStepForm: React.FC = () => {
  const { t, ui } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    consultantName: "",
    patientName: "",
    phoneNumber: "",
    patientId: "",
    entryDate: "",
    age: "",
    currency: "",
    language: "",
    healthCondition: "",
    services: "",
    firstVisit: {
      visitDate: "",
      visitDays: "",
      serviceEntries: [],
    },
    secondVisit: {
      visitDate: "",
      visitDays: "",
      serviceEntries: [],
    },
    uploadedImages: [],
    externalLink: "",
    medicalTreatmentPlan: "",
    medicalNotes: "",
    pdfLanguage: "en",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleFieldChange = (
    field: keyof FormData,
    value: string | number | File[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field] && (touchedFields.has(field) || hasAttemptedSubmit)) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFieldBlur = (field: keyof FormData) => {
    setTouchedFields((prev) => new Set(prev).add(field));
    const fieldErrors = getStepErrors(currentStep);
    if (fieldErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
    }
  };

  const getStepErrors = (step: number): FormErrors => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.consultantName.trim())
        newErrors.consultantName = t("consultant_name_required");
      if (!formData.patientName.trim())
        newErrors.patientName = t("patient_name_required");
      if (!formData.phoneNumber.trim())
        newErrors.phoneNumber = t("phone_number_required");
      if (!formData.patientId.trim())
        newErrors.patientId = t("patient_id_required");
      if (!formData.entryDate) newErrors.entryDate = t("entry_date_required");
      if (!formData.age) newErrors.age = t("age_required");
      if (!formData.currency) newErrors.currency = t("currency_required");
      if (!formData.language) newErrors.language = t("language_required");
      if (!formData.healthCondition)
        newErrors.healthCondition = t("health_condition_required");
      if (!formData.services) newErrors.services = t("services_required");
    }

    if (step === 2) {
      // First visit is always required
      if (!formData.firstVisit.visitDate)
        newErrors.firstVisitDate = t("first_visit_date_required");
      if (!formData.firstVisit.visitDays)
        newErrors.firstVisitDays = t("first_visit_days_required");

      // Second visit is optional — validate only if it has data
      const hasSecondVisitData =
        formData.secondVisit.visitDate ||
        formData.secondVisit.visitDays ||
        (formData.secondVisit.serviceEntries?.length ?? 0) > 0;

      if (hasSecondVisitData) {
        if (!formData.secondVisit.visitDate)
          newErrors.secondVisitDate = t("second_visit_date_required");
        if (!formData.secondVisit.visitDays)
          newErrors.secondVisitDays = t("second_visit_days_required");
      }
    }

    return newErrors;
  };

  useEffect(() => {
    if (hasAttemptedSubmit) {
      const stepErrors = getStepErrors(currentStep);
      setErrors(stepErrors);
    } else {
      const stepErrors = getStepErrors(currentStep);
      const filteredErrors: FormErrors = {};
      Object.keys(stepErrors).forEach((field) => {
        if (touchedFields.has(field)) {
          filteredErrors[field] = stepErrors[field];
        }
      });
      setErrors(filteredErrors);
    }
  }, [formData, currentStep, touchedFields, hasAttemptedSubmit]);

  const handleNext = () => {
    setHasAttemptedSubmit(true);
    const stepErrors = getStepErrors(currentStep);
    setErrors(stepErrors);

    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep((prev) => prev + 1);
      setHasAttemptedSubmit(false);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
    setHasAttemptedSubmit(false);
  };

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);
    const stepErrors = getStepErrors(currentStep);
    setErrors(stepErrors);

    if (Object.keys(stepErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await generatePDF(formData);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const stepProps = {
      formData,
      errors,
      onChange: handleFieldChange,
      onBlur: handleFieldBlur,
      onValidate: () => Object.keys(errors).length === 0,
    };

    switch (currentStep) {
      case 1:
        return <Step1 {...stepProps} />;
      case 2:
        return <Step2 {...stepProps} />;
      case 3:
        return <Step3 {...stepProps} />;
      default:
        return <Step1 {...stepProps} />;
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t("pdf_generated_success")}
          </h2>
          <p className="text-gray-600">{t("pdf_generated_desc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 py-8 px-4">
      <div
        className={`max-w-4xl mx-auto ${
          ui("app_title").includes("تقارير") ? "rtl" : ""
        }`}
      >
        <div className="bg-gray-800 shadow-2xl border border-gray-700 overflow-hidden rounded-t-2xl">
          <div className="bg-gradient-to-r from-slate-800 to-gray-900 text-white p-8 border-b border-gray-700 rounded-t-2xl">
            <div className="absolute top-4 right-4">
              <LanguageSelector />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8" />
              <h1 className="text-3xl font-bold">{ui("app_title")}</h1>
            </div>
            <p className="text-gray-300">
              {t("step_complete").replace("{{step}}", currentStep.toString())}
            </p>
          </div>

          <div className="p-8 bg-gray-800">
            {renderStep()}
            <StepNavigation
              currentStep={currentStep}
              totalSteps={3}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onSubmit={handleSubmit}
              isValid={Object.keys(errors).length === 0}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-slate-700 to-gray-800 text-white p-4 shadow-lg border-t border-slate-600 mt-0 rounded-b-2xl">
          <div className="text-center">
            <p className="text-sm text-gray-300">
              Made by{" "}
              <a
                href="https://mo7amadalmousa.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
              >
                Blue Medical Plus
              </a>{" "}
              Developer Team
            </p>
          </div>
        </div>

        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 flex items-center gap-4 shadow-2xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <p className="text-gray-200 font-medium">{t("generating_pdf")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiStepForm;
