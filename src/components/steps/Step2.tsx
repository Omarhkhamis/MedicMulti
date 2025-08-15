/* eslint-disable react-refresh/only-export-components */
import React, { useMemo, useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { StepProps, ServiceEntry } from "../../types/form";
import FormInput from "../FormInput";
import { Plus, X } from "lucide-react";

/* --------------------------------------------------
   ✅ أنواع مضبوطـة بدون any
-------------------------------------------------- */
export type Visit = {
  visitDate: string;
  visitDays: number | "";
  serviceEntries?: ServiceEntry[];
};

export type Step2FormData = {
  firstVisit: Visit;
  secondVisit: Visit;
  currency?: string;
};

export type Step2Errors = {
  firstVisitDate?: string;
  firstVisitDays?: string;
  secondVisitDate?: string;
  secondVisitDays?: string;
};

/** خصائص هذه الخطوة (نخصص StepProps لتكون Typed) */
type Step2Props = Omit<
  StepProps,
  "formData" | "errors" | "onChange" | "onBlur"
> & {
  formData: Step2FormData;
  errors: Step2Errors;
  onChange: <K extends keyof Step2FormData>(
    field: K,
    value: Step2FormData[K]
  ) => void;
};

/* --------------------------------------------------
   أدوات مساعدة
-------------------------------------------------- */
const isEmpty = (v: unknown) =>
  v === undefined ||
  v === null ||
  v === "" ||
  (typeof v === "number" && isNaN(v));

export function validateStep2Data(data: Step2FormData): {
  errors: Step2Errors;
  isValid: boolean;
} {
  const errors: Step2Errors = {};

  // أول زيارة: مطلوبة دائمًا
  if (isEmpty(data.firstVisit?.visitDate))
    errors.firstVisitDate = "First visit date is required";
  const fvDays = data.firstVisit?.visitDays;
  if (fvDays === "" || Number(fvDays) <= 0)
    errors.firstVisitDays = "First visit days must be > 0";

  // الزيارة الثانية: مطلوبة فقط إذا فيها بيانات
  const sv = data.secondVisit ?? ({} as Visit);
  const hasSecondData =
    !!sv.visitDate || !!sv.visitDays || (sv.serviceEntries?.length ?? 0) > 0;

  if (hasSecondData) {
    if (isEmpty(sv.visitDate))
      errors.secondVisitDate = "Second visit date is required";
    const svDays = sv.visitDays;
    if (svDays === "" || Number(svDays) <= 0)
      errors.secondVisitDays = "Second visit days must be > 0";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}

/* تحويل رقمية آمنة */
const toNumberOrEmpty = (v: string | number | ""): number | "" =>
  v === "" ? "" : Number(v);

/* --------------------------------------------------
   مكوّن Step2
-------------------------------------------------- */
const Step2: React.FC<Step2Props> = ({ formData, errors, onChange }) => {
  const { t } = useLanguage();

  const [firstVisitEntry, setFirstVisitEntry] = useState<{
    serviceName: string;
    serviceType: string;
    price: number | "";
    quantity: number | "";
  }>({
    serviceName: "",
    serviceType: "",
    price: "",
    quantity: "",
  });

  const [secondVisitEntry, setSecondVisitEntry] = useState<{
    serviceName: string;
    serviceType: string;
    price: number | "";
    quantity: number | "";
  }>({
    serviceName: "",
    serviceType: "",
    price: "",
    quantity: "",
  });

  // فعّل الزيارة الثانية تلقائيًا إذا فيها بيانات مسبقًا
  const initiallyEnabled = useMemo(() => {
    const v = formData.secondVisit;
    return Boolean(
      v?.visitDate ||
        v?.visitDays ||
        (v?.serviceEntries && v.serviceEntries.length > 0)
    );
  }, [formData.secondVisit]);

  const [secondVisitEnabled, setSecondVisitEnabled] =
    useState<boolean>(initiallyEnabled);

  useEffect(() => {
    setSecondVisitEnabled(initiallyEnabled);
  }, [initiallyEnabled]);

  // خيارات الخدمة
  const serviceNameOptions = [
    { value: "dental_implant", label: t('dental_implant') },
    { value: "zirconium_crown", label: t('zirconium_crown') },
    { value: "open_sinus_lift", label: t('open_sinus_lift') },
    { value: "close_sinus_lift", label: t('close_sinus_lift') },
    { value: "veneer_lens", label: t('veneer_lens') },
    { value: "hotel_accommodation", label: t('hotel_accommodation') },
    { value: "transport", label: t('transport') },
  ];

  const handleFirstVisitChange = (
    field: "visitDate" | "visitDays",
    value: string | number
  ) => {
    const updatedFirstVisit: Visit = {
      ...formData.firstVisit,
      ...(field === "visitDate"
        ? { visitDate: String(value) }
        : { visitDays: toNumberOrEmpty(value) }),
    };
    onChange("firstVisit", updatedFirstVisit);
  };

  const handleSecondVisitChange = (
    field: "visitDate" | "visitDays",
    value: string | number
  ) => {
    const updatedSecondVisit: Visit = {
      ...formData.secondVisit,
      ...(field === "visitDate"
        ? { visitDate: String(value) }
        : { visitDays: toNumberOrEmpty(value) }),
    };
    onChange("secondVisit", updatedSecondVisit);
  };

  const handleFirstVisitEntryChange = (
    field: "serviceName" | "serviceType" | "price" | "quantity",
    value: string | number
  ) => {
    setFirstVisitEntry((prev) => ({
      ...prev,
      [field]:
        field === "price" || field === "quantity"
          ? toNumberOrEmpty(value)
          : String(value),
    }));
  };

  const handleSecondVisitEntryChange = (
    field: "serviceName" | "serviceType" | "price" | "quantity",
    value: string | number
  ) => {
    setSecondVisitEntry((prev) => ({
      ...prev,
      [field]:
        field === "price" || field === "quantity"
          ? toNumberOrEmpty(value)
          : String(value),
    }));
  };

  const handleAddFirstVisitEntry = () => {
    const hasData =
      firstVisitEntry.serviceName ||
      firstVisitEntry.serviceType ||
      firstVisitEntry.price !== "" ||
      firstVisitEntry.quantity !== "";

    if (hasData) {
      const newEntry: ServiceEntry = {
        id: Date.now().toString(),
        ...firstVisitEntry,
      };

      const updatedFirstVisit: Visit = {
        ...formData.firstVisit,
        serviceEntries: [
          ...(formData.firstVisit?.serviceEntries ?? []),
          newEntry,
        ],
      };
      onChange("firstVisit", updatedFirstVisit);
      setFirstVisitEntry({
        serviceName: "",
        serviceType: "",
        price: "",
        quantity: "",
      });
    }
  };

  const handleAddSecondVisitEntry = () => {
    const hasData =
      secondVisitEntry.serviceName ||
      secondVisitEntry.serviceType ||
      secondVisitEntry.price !== "" ||
      secondVisitEntry.quantity !== "";

    if (hasData) {
      const newEntry: ServiceEntry = {
        id: Date.now().toString(),
        ...secondVisitEntry,
      };

      const updatedSecondVisit: Visit = {
        ...formData.secondVisit,
        serviceEntries: [
          ...(formData.secondVisit?.serviceEntries ?? []),
          newEntry,
        ],
      };
      onChange("secondVisit", updatedSecondVisit);
      setSecondVisitEntry({
        serviceName: "",
        serviceType: "",
        price: "",
        quantity: "",
      });
    }
  };

  const handleRemoveFirstVisitEntry = (id: string) => {
    const updatedFirstVisit: Visit = {
      ...formData.firstVisit,
      serviceEntries: (formData.firstVisit?.serviceEntries ?? []).filter(
        (entry) => entry.id !== id
      ),
    };
    onChange("firstVisit", updatedFirstVisit);
  };

  const handleRemoveSecondVisitEntry = (id: string) => {
    const updatedSecondVisit: Visit = {
      ...formData.secondVisit,
      serviceEntries: (formData.secondVisit?.serviceEntries ?? []).filter(
        (entry) => entry.id !== id
      ),
    };
    onChange("secondVisit", updatedSecondVisit);
  };

  const formatPrice = (price: number | "", currency?: string) => {
    if (price === "" || price === 0) return "-";
    return `${price} ${currency ?? ""}`;
  };

  const renderVisitSection = (
    title: string,
    visitData: {
      visitDate: string;
      visitDays: number | "";
      serviceEntries: ServiceEntry[];
    },
    currentEntry: {
      serviceName: string;
      serviceType: string;
      price: number | "";
      quantity: number | "";
    },
    onVisitChange: (
      field: "visitDate" | "visitDays",
      value: string | number
    ) => void,
    onEntryChange: (
      field: "serviceName" | "serviceType" | "price" | "quantity",
      value: string | number
    ) => void,
    onAddEntry: () => void,
    onRemoveEntry: (id: string) => void,
    visitDateError?: string,
    visitDaysError?: string,
    isRequired: boolean = true
  ) => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">{title}</h3>

      {/* Visit Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput
          label={t('visit_date')}
          type="date"
          value={visitData.visitDate}
          onChange={(value) => onVisitChange("visitDate", value)}
          error={visitDateError}
          required={isRequired}
        />

        <FormInput
          label={t('visit_days')}
          type="number"
          value={visitData.visitDays}
          onChange={(value) => onVisitChange("visitDays", value)}
          error={visitDaysError}
          required={isRequired}
          placeholder={t('days_until_visit')}
        />
      </div>

      {/* Service Entry Form */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-6">
        <h4 className="text-lg font-medium text-gray-800">{t('add_service_entry')}</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label={t('service_name')}
            type="select"
            value={currentEntry.serviceName}
            onChange={(value) => onEntryChange("serviceName", value)}
            options={serviceNameOptions}
            placeholder={t('select_service')}
          />

          <FormInput
            label={t('service_type')}
            value={currentEntry.serviceType}
            onChange={(value) => onEntryChange("serviceType", value)}
            placeholder={t('enter_service_type')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label={t('price')}
            type="number"
            value={currentEntry.price}
            onChange={(value) => onEntryChange("price", value)}
            placeholder={t('enter_price')}
          />

          <FormInput
            label={t('quantity')}
            type="number"
            value={currentEntry.quantity}
            onChange={(value) => onEntryChange("quantity", value)}
            placeholder={t('enter_quantity')}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onAddEntry}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 hover:shadow-lg hover:shadow-blue-200"
          >
            <Plus size={20} />
            {t('add_entry')}
          </button>
        </div>
      </div>

      {/* Service Entries List */}
      {(visitData.serviceEntries ?? []).length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-800">{t('service_entries')}</h4>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
                <div className="col-span-3">{t('service_name')}</div>
                <div className="col-span-3">{t('service_type')}</div>
                <div className="col-span-2">{t('price')}</div>
                <div className="col-span-2">{t('quantity')}</div>
                <div className="col-span-2 text-center">{t('action')}</div>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {(visitData.serviceEntries ?? []).map((entry) => (
                <div
                  key={entry.id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="grid grid-cols-12 gap-4 items-center text-sm">
                    <div className="col-span-3 text-gray-900">
                      {entry.serviceName || "-"}
                    </div>
                    <div className="col-span-3 text-gray-900">
                      {entry.serviceType || "-"}
                    </div>
                    <div className="col-span-2 text-gray-900">
                      {formatPrice(entry.price, formData.currency)}
                    </div>
                    <div className="col-span-2 text-gray-900">
                      {entry.quantity || "-"}
                    </div>
                    <div className="col-span-2 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveEntry(entry.id)}
                        className="inline-flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200"
                        title="Remove entry"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {t('total_entries')}: {(visitData.serviceEntries ?? []).length}
          </div>
        </div>
      )}
    </div>
  );

  // عند تفعيل/إلغاء تفعيل الزيارة الثانية
  const toggleSecondVisit = (enabled: boolean) => {
    setSecondVisitEnabled(enabled);
    if (!enabled) {
      onChange("secondVisit", {
        visitDate: "",
        visitDays: "",
        serviceEntries: [],
      });
      setSecondVisitEntry({
        serviceName: "",
        serviceType: "",
        price: "",
        quantity: "",
      });
    }
  };

  // --- لزوم مشروط لإظهار الأخطاء فقط عند الحاجة داخل الواجهة ---
  const secondVisitHasAnyData = Boolean(
    formData.secondVisit?.visitDate ||
      formData.secondVisit?.visitDays ||
      (formData.secondVisit?.serviceEntries?.length ?? 0) > 0
  );
  const secondVisitRequireFields = secondVisitEnabled && secondVisitHasAnyData;

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t('medical_visits')}
        </h2>
        <p className="text-gray-600">
          {t('medical_visits_desc')}
        </p>
      </div>

      {/* First Visit Section (Required) */}
      {renderVisitSection(
        t('first_visit'),
        {
          ...formData.firstVisit,
          serviceEntries: formData.firstVisit?.serviceEntries ?? [],
        },
        firstVisitEntry,
        handleFirstVisitChange,
        handleFirstVisitEntryChange,
        handleAddFirstVisitEntry,
        handleRemoveFirstVisitEntry,
        errors.firstVisitDate,
        errors.firstVisitDays,
        true
      )}

      {/* Toggle for Second Visit */}
      <div className="flex items-center gap-3">
        <input
          id="enable-second-visit"
          type="checkbox"
          checked={secondVisitEnabled}
          onChange={(e) => toggleSecondVisit(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label
          htmlFor="enable-second-visit"
          className="text-sm font-medium text-gray-700 select-none"
        >
          {t('enable_second_visit')}
        </label>
      </div>

      {/* Second Visit Section (Optional + شرطية الأخطاء في الواجهة) */}
      {secondVisitEnabled &&
        renderVisitSection(
          t('second_visit'),
          {
            ...formData.secondVisit,
            serviceEntries: formData.secondVisit?.serviceEntries ?? [],
          },
          secondVisitEntry,
          handleSecondVisitChange,
          handleSecondVisitEntryChange,
          handleAddSecondVisitEntry,
          handleRemoveSecondVisitEntry,
          secondVisitRequireFields ? errors.secondVisitDate : undefined,
          secondVisitRequireFields ? errors.secondVisitDays : undefined,
          false
        )}
    </div>
  );
};

export default Step2;
