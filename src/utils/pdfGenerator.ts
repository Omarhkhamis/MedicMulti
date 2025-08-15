// src/utils/pdfGenerator.ts
import pdfMake from "pdfmake/build/pdfmake";
import type {
  TDocumentDefinitions,
  Content,
  TableCell,
  TableLayout,
  StyleDictionary,
} from "pdfmake/interfaces";

interface BrowserPdfMake {
  vfs?: Record<string, string>;
  fonts?: Record<string, unknown>;
  createPdf: (docDef: TDocumentDefinitions) => {
    getBlob: (cb: (blob: Blob) => void) => void;
  };
}
type PdfMakeStatic = typeof pdfMake;
// Fonts (Roboto only)
import robotoRegularUrl from "../fonts/Roboto-Regular.ttf?url";
import robotoBoldUrl from "../fonts/Roboto-Bold.ttf?url";

// Top/Bottom banners — SVG only (background)
import headerSvgUrl from "../fonts/header.svg?url";
import footerSvgUrl from "../fonts/footer.svg?url";

// Page-content banners (PNG)
import bannerTopUrl from "../fonts/banner.png?url";
import bannerBottomUrl from "../fonts/banner1.png?url";

import { FormData, ServiceEntry } from "../types/form";

/* ========= PDF Language Translations ========= */
const pdfTranslations = {
  en: {
    medicalFormReport: "Medical Form Report",
    personalInformation: "Personal Information",
    consultantName: "Consultant Name",
    patientName: "Patient Name",
    phoneNumber: "Phone Number",
    patientId: "Patient ID",
    entryDate: "Entry Date",
    age: "Age",
    currency: "Currency",
    language: "Language",
    healthCondition: "Health Condition",
    services: "Services",
    firstVisitInformation: "First Visit Information",
    secondVisitInformation: "Second Visit Information",
    visitDate: "Visit Date",
    visitDays: "Visit Days",
    firstVisitServiceEntries: "First Visit Service Entries",
    secondVisitServiceEntries: "Second Visit Service Entries",
    serviceName: "Service Name",
    serviceType: "Service Type",
    price: "Price",
    quantity: "Quantity",
    total: "Total",
    grandTotal: "Grand Total",
    medicalTreatmentPlan: "Medical Treatment Plan",
    medicalNotes: "Medical Notes",
    aboutTheClinic: "About the Clinic",
    uploadedImages: "Uploaded Images",
    aboutClinicText: "At DENTAL CLINIC, we are committed to providing the highest standards of quality, expertise, and healthcare, delivered by the most experienced medical and administrative staff. We offer cosmetic medical services by a team of the best doctors in the field of aesthetic medicine in Turkey."
  },
  ru: {
    medicalFormReport: "Отчет медицинской формы",
    personalInformation: "Личная информация",
    consultantName: "Имя консультанта",
    patientName: "Имя пациента",
    phoneNumber: "Номер телефона",
    patientId: "ID пациента",
    entryDate: "Дата поступления",
    age: "Возраст",
    currency: "Валюта",
    language: "Язык",
    healthCondition: "Состояние здоровья",
    services: "Услуги",
    firstVisitInformation: "Информация о первом визите",
    secondVisitInformation: "Информация о втором визите",
    visitDate: "Дата визита",
    visitDays: "Дни визита",
    firstVisitServiceEntries: "Записи услуг первого визита",
    secondVisitServiceEntries: "Записи услуг второго визита",
    serviceName: "Название услуги",
    serviceType: "Тип услуги",
    price: "Цена",
    quantity: "Количество",
    total: "Итого",
    grandTotal: "Общий итог",
    medicalTreatmentPlan: "План медицинского лечения",
    medicalNotes: "Медицинские заметки",
    aboutTheClinic: "О клинике",
    uploadedImages: "Загруженные изображения",
    aboutClinicText: "В СТОМАТОЛОГИЧЕСКОЙ КЛИНИКЕ мы стремимся предоставить высочайшие стандарты качества, экспертизы и здравоохранения, предоставляемые самым опытным медицинским и административным персоналом. Мы предлагаем косметические медицинские услуги командой лучших врачей в области эстетической медицины в Турции."
  },
  fr: {
    medicalFormReport: "Rapport de formulaire médical",
    personalInformation: "Informations personnelles",
    consultantName: "Nom du consultant",
    patientName: "Nom du patient",
    phoneNumber: "Numéro de téléphone",
    patientId: "ID du patient",
    entryDate: "Date d'entrée",
    age: "Âge",
    currency: "Devise",
    language: "Langue",
    healthCondition: "État de santé",
    services: "Services",
    firstVisitInformation: "Informations sur la première visite",
    secondVisitInformation: "Informations sur la deuxième visite",
    visitDate: "Date de visite",
    visitDays: "Jours de visite",
    firstVisitServiceEntries: "Entrées de service de la première visite",
    secondVisitServiceEntries: "Entrées de service de la deuxième visite",
    serviceName: "Nom du service",
    serviceType: "Type de service",
    price: "Prix",
    quantity: "Quantité",
    total: "Total",
    grandTotal: "Total général",
    medicalTreatmentPlan: "Plan de traitement médical",
    medicalNotes: "Notes médicales",
    aboutTheClinic: "À propos de la clinique",
    uploadedImages: "Images téléchargées",
    aboutClinicText: "À la CLINIQUE DENTAIRE, nous nous engageons à fournir les plus hauts standards de qualité, d'expertise et de soins de santé, dispensés par le personnel médical et administratif le plus expérimenté. Nous offrons des services médicaux cosmétiques par une équipe des meilleurs médecins dans le domaine de la médecine esthétique en Turquie."
  }
};

/* ========= config ========= */
const SQUARE_SIDE = 220; // حجم الصور المربعة في الجاليري
const GALLERY_MAX = 4; // أقصى عدد صور للمعرض في الصفحة الأخيرة
const GALLERY_SIDE = 215;

const HEADER_IMG_H = 70; // اضبطها حسب ارتفاع الـ header.svg
const FOOTER_IMG_H = 120; // اضبطها حسب ارتفاع الـ footer.svg
const CONTENT_WIDTH = 515; // عرض مساحة المحتوى الافتراضي داخل A4 مع الهوامش

/* ========= options & label mappers ========= */
const currencyOptions = [
  { value: "EUR", label: "Euro (€)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "CAD", label: "Canadian Dollar (C$)" },
];

const languageOptions = [
  { value: "arabic", label: "Arabic" },
  { value: "english", label: "English" },
  { value: "french", label: "French" },
  { value: "spanish", label: "Spanish" },
  { value: "turkish", label: "Turkish" },
  { value: "russian", label: "Russian" },
  { value: "other", label: "Other" },
];

const healthConditionOptions = [
  { value: "good", label: "Good" },
  { value: "requires_report", label: "Requires medical report" },
];

// خدمات Step1 + خدمات Step2 الإضافية (للاستخدام في الجداول)
const servicesOptionsAll = [
  { value: "dental", label: "Dental" },
  { value: "hollywood_smile", label: "Hollywood Smile" },
  { value: "dental_implant", label: "Dental Implant" },
  { value: "zirconium_crown", label: "Zirconium Crown" },
  { value: "open_sinus_lift", label: "Open Sinus Lift" },
  { value: "close_sinus_lift", label: "Close Sinus Lift" },
  { value: "veneer_lens", label: "Veneer Lens" },
  { value: "hotel_accommodation", label: "Hotel Accommodation" },
  { value: "transport", label: "Transport" },
];

function mapLabel(
  options: { value: string; label: string }[],
  value?: string | number | ""
) {
  const v = value == null ? "" : String(value);
  const found = options.find((o) => o.value === v);
  return found ? found.label : v;
}

/* ========= helpers ========= */
const isEmpty = (v?: string | number | "") =>
  v === "" || v === undefined || v === null;
const asText = (v?: string | number | "") => (isEmpty(v) ? "-" : String(v));

function toBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function fetchAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return toBase64(await res.arrayBuffer());
  } catch {
    return null;
  }
}

async function fetchAsText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

const fileToDataURL = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(f);
  });

/** قصّ مركزي لمربع مع تغيير الحجم إلى side×side */
function toSquareDataURL(src: string, side = SQUARE_SIDE): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = side;
        canvas.height = side;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(src);

        const ratio = img.width / img.height;
        let sx = 0,
          sy = 0,
          sw = img.width,
          sh = img.height;
        if (ratio > 1) {
          sh = img.height;
          sw = sh;
          sx = (img.width - sw) / 2;
        } else if (ratio < 1) {
          sw = img.width;
          sh = sw;
          sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, side, side);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(src);
      }
    };
    img.onerror = reject;
    img.src = src;
  });
}

/* ========= assets ========= */
let headerSvgText: string | null = null;
let footerSvgText: string | null = null;

// PNG banners (data URLs)
let bannerTopDataUrl: string | null = null;
let bannerBottomDataUrl: string | null = null;

type VfsMap = Record<string, string>;
type PdfMakeWithVfs = PdfMakeStatic & {
  vfs?: VfsMap;
  fonts?: Record<string, unknown>;
};

let assetsReady: Promise<void> | null = null;
async function ensureAssets(): Promise<void> {
  if (!assetsReady) {
    assetsReady = (async () => {
      const pm = pdfMake as unknown as PdfMakeWithVfs;
      if (!pm.vfs) pm.vfs = {};

      // Roboto
      const RREG = "Roboto-Regular.ttf";
      const RBLD = "Roboto-Bold.ttf";
      if (!pm.vfs[RREG]) {
        const b64 = await fetchAsBase64(robotoRegularUrl);
        if (!b64) throw new Error("Failed to load Roboto-Regular.ttf");
        pm.vfs[RREG] = b64;
      }
      if (!pm.vfs[RBLD]) {
        const b64 = await fetchAsBase64(robotoBoldUrl);
        if (!b64) throw new Error("Failed to load Roboto-Bold.ttf");
        pm.vfs[RBLD] = b64;
      }

      // SVG banners (background)
      if (headerSvgText == null)
        headerSvgText = await fetchAsText(headerSvgUrl);
      if (footerSvgText == null)
        footerSvgText = await fetchAsText(footerSvgUrl);

      // PNG banners (content)
      if (bannerTopDataUrl == null) {
        const b64 = await fetchAsBase64(bannerTopUrl);
        if (b64) bannerTopDataUrl = `data:image/png;base64,${b64}`;
      }
      if (bannerBottomDataUrl == null) {
        const b64 = await fetchAsBase64(bannerBottomUrl);
        if (b64) bannerBottomDataUrl = `data:image/png;base64,${b64}`;
      }

      pm.fonts = {
        Roboto: { normal: RREG, bold: RBLD, italics: RREG, bolditalics: RBLD },
      };
    })();
  }
  return assetsReady;
}

/* ========= common utils ========= */
function n(v: number | "" | undefined) {
  return typeof v === "number" ? v : Number(v || 0);
}
function lineTotal(s: ServiceEntry) {
  return n(s.price) * n(s.quantity);
}
function money(v: number | "" | undefined, currency: string) {
  return isEmpty(v) ? "-" : `${v} ${currency}`;
}

/* ========= table layout ========= */
function softBoxLayout(): TableLayout {
  return {
    hLineColor: () => "#cfd8dc",
    vLineColor: () => "#cfd8dc",
    hLineWidth: (i: number) => (i === 1 ? 1.2 : 0.6),
    vLineWidth: () => 0.6,
    paddingLeft: () => 6,
    paddingRight: () => 6,
    paddingTop: () => 6,
    paddingBottom: () => 6,
    fillColor: (rowIndex: number) => (rowIndex === 0 ? "#eef6ff" : "#fafafa"),
  };
}

const Label = (t: string): Content => ({ text: t, style: "label" });
const Val = (v: string | number | ""): Content =>
  isEmpty(v)
    ? { text: "-", style: "placeholder" }
    : { text: String(v), style: "value" };

/* ========= sections ========= */
function PersonalInfoBox(data: FormData, lang: string = 'en'): Content {
  const t = pdfTranslations[lang as keyof typeof pdfTranslations] || pdfTranslations.en;
  
  return {
    margin: [0, 6, 0, 10],
    table: {
      widths: ["*", "*"],
      body: [
        [
          { text: t.personalInformation, style: "boxTitle", colSpan: 2 },
          {} as TableCell,
        ],
        [
          {
            columns: [
              Label(t.consultantName),
              { text: ": ", width: 6 },
              Val(data.consultantName),
            ],
            columnGap: 4,
          },
          {
            columns: [Label(t.age), { text: ": ", width: 6 }, Val(data.age)],
            columnGap: 4,
          },
        ],
        [
          {
            columns: [
              Label(t.patientName),
              { text: ": ", width: 6 },
              Val(data.patientName),
            ],
            columnGap: 4,
          },
          {
            columns: [
              Label(t.currency),
              { text: ": ", width: 6 },
              Val(mapLabel(currencyOptions, data.currency)),
            ],
            columnGap: 4,
          },
        ],
        [
          {
            columns: [
              Label(t.phoneNumber),
              { text: ": ", width: 6 },
              Val(data.phoneNumber),
            ],
            columnGap: 4,
          },
          {
            columns: [
              Label(t.language),
              { text: ": ", width: 6 },
              Val(mapLabel(languageOptions, data.language)),
            ],
            columnGap: 4,
          },
        ],
        [
          {
            columns: [
              Label(t.patientId),
              { text: ": ", width: 6 },
              Val(data.patientId),
            ],
            columnGap: 4,
          },
          {
            columns: [
              Label(t.healthCondition),
              { text: ": ", width: 6 },
              Val(mapLabel(healthConditionOptions, data.healthCondition)),
            ],
            columnGap: 4,
          },
        ],
        [
          {
            columns: [
              Label(t.entryDate),
              { text: ": ", width: 6 },
              Val(data.entryDate),
            ],
            columnGap: 4,
          },
          {
            columns: [
              Label(t.services),
              { text: ": ", width: 6 },
              Val(mapLabel(servicesOptionsAll, data.services)),
            ],
            columnGap: 4,
          },
        ],
      ],
    },
    layout: softBoxLayout(),
  };
}

function VisitInfoBox(title: string, date: string, days: number | "", lang: string = 'en'): Content {
  const t = pdfTranslations[lang as keyof typeof pdfTranslations] || pdfTranslations.en;
  
  return {
    margin: [0, 6, 0, 8],
    table: {
      widths: ["*", "*"],
      body: [
        [{ text: title, style: "boxTitle", colSpan: 2 }, {} as TableCell],
        [
          {
            columns: [Label(t.visitDate), { text: ": ", width: 6 }, Val(date)],
            columnGap: 4,
          },
          {
            columns: [Label(t.visitDays), { text: ": ", width: 6 }, Val(days)],
            columnGap: 4,
          },
        ],
      ],
    },
    layout: softBoxLayout(),
  };
}

function ServicesBox(
  title: string,
  entries: ServiceEntry[],
  currency: string,
  lang: string = 'en'
): Content {
  const t = pdfTranslations[lang as keyof typeof pdfTranslations] || pdfTranslations.en;
  
  const header: TableCell[] = [
    { text: t.serviceName, style: "tableHeader", alignment: "center" },
    { text: t.serviceType, style: "tableHeader", alignment: "center" },
    { text: t.price, style: "tableHeader", alignment: "center" },
    { text: t.quantity, style: "tableHeader", alignment: "center" },
    { text: t.total, style: "tableHeader", alignment: "center" },
  ];
  const rows: TableCell[][] = entries.map((s) => [
    {
      text: asText(
        mapLabel(servicesOptionsAll, s.serviceName as string | number | "")
      ),
      alignment: "center",
    },
    { text: asText(s.serviceType), alignment: "center" },
    { text: money(s.price as number, currency), alignment: "center" },
    {
      text: isEmpty(s.quantity) ? "-" : String(s.quantity),
      alignment: "center",
    },
    {
      text:
        isEmpty(s.price) || isEmpty(s.quantity)
          ? "-"
          : `${lineTotal(s)} ${currency}`,
      alignment: "center",
    },
  ]);

  return {
    margin: [0, 4, 0, 8],
    table: {
      widths: ["*", "*", 55, 55, 60],
      body: [
        [
          { text: title, style: "boxTitle", colSpan: 5 },
          {},
          {},
          {},
          {},
        ] as TableCell[],
        header,
        ...rows,
      ],
    },
    layout: softBoxLayout(),
  };
}

/* ========= Notes-like boxes (generic) ========= */
function DocNoteBox(title: string, text?: string): Content {
  const s = asText(text);
  if (!s || s === "-") return { text: "" };
  return {
    margin: [0, 8, 0, 8],
    stack: [
      { text: title, style: "boxTitle", margin: [0, 0, 0, 4] },
      { text: s, style: "value" },
    ],
  };
}

function AboutClinicBox(lang: string = 'en'): Content {
  const t = pdfTranslations[lang as keyof typeof pdfTranslations] || pdfTranslations.en;
  
  return {
    margin: [0, 6, 0, 0],
    table: {
      widths: ["*"],
      body: [
        [{ text: t.aboutTheClinic, style: "boxTitle" }],
        [{ text: t.aboutClinicText, style: "value", alignment: "left" }],
      ],
    },
    layout: softBoxLayout(),
  };
}

/** يجعل العنوان + كل الصور (حتى 4 صور) + البانر السفلي في نفس الصفحة وداخل بلوك واحد */
function GalleryWithBottomBanner(
  squareDataUrls: string[],
  bannerDataUrl?: string | null,
  lang: string = 'en'
): Content {
  const t = pdfTranslations[lang as keyof typeof pdfTranslations] || pdfTranslations.en;
  
  const imgs = (squareDataUrls || []).slice(0, GALLERY_MAX);
  if (!imgs.length) return { text: "" };

  const rows: string[][] = [];
  for (let i = 0; i < imgs.length; i += 2) {
    const slice = imgs.slice(i, i + 2);
    if (slice.length === 1) slice.push("");
    rows.push(slice as [string, string]);
  }

  const rowTable = (row: string[]): Content => {
    const bodyRow: TableCell[] = row.map((src) =>
      src
        ? {
            image: src,
            width: GALLERY_SIDE,
            height: GALLERY_SIDE,
            margin: [0, 4, 0, 4],
            alignment: "center",
          }
        : { text: " " }
    );
    return {
      table: { widths: ["*", "*"], body: [bodyRow] },
      layout: "noBorders",
      margin: [0, 0, 0, 0],
    };
  };

  const stack: Content[] = [
    { text: t.uploadedImages, style: "boxTitle", margin: [0, 6, 0, 6] },
    ...rows.map(rowTable),
  ];

  if (bannerDataUrl) {
    stack.push({
      image: bannerDataUrl,
      width: CONTENT_WIDTH,
      alignment: "center",
      margin: [0, 10, 0, 0],
    });
  }

  return {
    margin: [0, 8, 0, 0],
    unbreakable: true,
    stack,
  };
}

/* ========= خلفية SVG بدل header/footer ========= */
function pageBackground(
  _: number,
  pageSize: { width: number; height: number }
): Content[] {
  const elems: Content[] = [];
  if (headerSvgText) {
    elems.push({
      svg: headerSvgText,
      width: pageSize.width,
      absolutePosition: { x: 0, y: 0 },
    } as unknown as Content);
  }
  if (footerSvgText) {
    elems.push({
      svg: footerSvgText,
      width: pageSize.width,
      absolutePosition: { x: 0, y: pageSize.height - FOOTER_IMG_H },
    } as unknown as Content);
  }
  return elems;
}

/* ========= NEW: check if second visit has any data ========= */
function hasSecondVisitData(v?: FormData["secondVisit"]): boolean {
  if (!v) return false;
  const hasDate = !isEmpty(v.visitDate);
  const hasDays = !isEmpty(v.visitDays);
  const hasServices =
    Array.isArray(v.serviceEntries) &&
    v.serviceEntries.some(
      (s) =>
        !isEmpty(s.serviceName as unknown as string | number | "") ||
        !isEmpty(s.serviceType) ||
        !isEmpty(s.price) ||
        !isEmpty(s.quantity)
    );
  return hasDate || hasDays || hasServices;
}

/* ========= MAIN ========= */
type Uploadable = File | string;
interface ExtraFields {
  uploadedImages?: Uploadable[];
  medicalTreatmentPlan?: string;
  medicalNotes?: string;
}

export async function generatePDF(formData: FormData): Promise<void> {
  try {
    await ensureAssets();

    // Get PDF language from form data, default to English
    const pdfLang = formData.pdfLanguage || 'en';
    const t = pdfTranslations[pdfLang as keyof typeof pdfTranslations] || pdfTranslations.en;

    // جهّز صور Step3 كمربعات 220×220 (حسب SQUARE_SIDE)
    const f = formData as FormData & ExtraFields;
    const uploaded = f.uploadedImages;
    let squareUrls: string[] = [];
    if (uploaded && uploaded.length) {
      const dataUrls = await Promise.all(
        uploaded.map((it) =>
          typeof it === "string" ? Promise.resolve(it) : fileToDataURL(it)
        )
      );
      squareUrls = await Promise.all(
        dataUrls.map((u) => toSquareDataURL(u, SQUARE_SIDE))
      );
    }

    const currency = formData.currency || "";

    const t1 = (formData.firstVisit?.serviceEntries || []).reduce(
      (s, e) => s + lineTotal(e),
      0
    );

    const hasSecond = hasSecondVisitData(formData.secondVisit);

    const t2 = hasSecond
      ? (formData.secondVisit?.serviceEntries || []).reduce(
          (s, e) => s + lineTotal(e),
          0
        )
      : 0;

    const all = t1 + t2;

    const docDefinition: TDocumentDefinitions = {
      pageSize: "A4",
      pageMargins: [20, HEADER_IMG_H + 16, 20, FOOTER_IMG_H + 16],
      background: pageBackground,

      content: [
        // الصفحة الأولى
        {
          text: t.medicalFormReport,
          style: "headerEN",
          alignment: "center",
          margin: [0, 0, 0, 6],
        },

        // بانر علوي كمحتوى منفصل في الصفحة الأولى فقط
        ...(bannerTopDataUrl
          ? [
              {
                image: bannerTopDataUrl,
                width: CONTENT_WIDTH,
                alignment: "center",
                margin: [0, 6, 0, 10],
              } as Content,
            ]
          : []),

        PersonalInfoBox(formData, pdfLang),

        // ابدأ First Visit من الصفحة الثانية
        { text: "", pageBreak: "before" },

        // First visit (صفحة 2) — حماية الوصول
        VisitInfoBox(
          t.firstVisitInformation,
          formData.firstVisit?.visitDate || "",
          formData.firstVisit?.visitDays ?? "",
          pdfLang
        ),
        ServicesBox(
          t.firstVisitServiceEntries,
          formData.firstVisit?.serviceEntries || [],
          currency,
          pdfLang
        ),

        // Second visit (اختياري بالكامل)
        ...(hasSecond
          ? [
              VisitInfoBox(
                t.secondVisitInformation,
                formData.secondVisit?.visitDate || "",
                formData.secondVisit?.visitDays ?? "",
                pdfLang
              ),
              ServicesBox(
                t.secondVisitServiceEntries,
                formData.secondVisit?.serviceEntries || [],
                currency,
                pdfLang
              ),
            ]
          : []),

        {
          columns: [
            { text: t.grandTotal, style: "label", alignment: "right" },
            { text: `${all} ${currency}`, style: "value", alignment: "right" },
          ],
          columnGap: 8,
          margin: [0, 6, 0, 6],
        },

        // صناديق ملاحظات/خطة العلاج
        DocNoteBox(t.medicalTreatmentPlan, f.medicalTreatmentPlan),
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: CONTENT_WIDTH,
              y2: 0,
              lineWidth: 0.5,
              lineColor: "#ccc",
            },
          ],
          margin: [0, 4, 0, 4],
        },
        DocNoteBox(t.medicalNotes, f.medicalNotes),

        AboutClinicBox(pdfLang),

        // المعرض + العنوان + البانر السفلي كبلوك واحد
        GalleryWithBottomBanner(squareUrls, bannerBottomDataUrl, pdfLang),
      ],

      defaultStyle: { font: "Roboto", fontSize: 9, alignment: "left" },
      styles: {
        headerEN: { fontSize: 16, bold: true },
        boxTitle: { fontSize: 11, bold: true },
        tableHeader: { bold: true, fillColor: "#e3f2fd" },
        label: { bold: true, fontSize: 9 },
        value: { fontSize: 9 },
        placeholder: { bold: true, color: "#999", fontSize: 9 },
      } as StyleDictionary,
    };

    const pm = pdfMake as unknown as BrowserPdfMake;
    await new Promise<void>((resolve) => {
      pm.createPdf(docDefinition).getBlob((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const win = window.open(url, "_blank");
        if (!win) {
          const a = document.createElement("a");
          a.href = url;
          a.download = "medical-report.pdf";
          a.click();
        }
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        resolve();
      });
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    alert("Error generating PDF. Check console for details.");
  }
}
