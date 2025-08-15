// src/utils/pdfGenerator.ts
import pdfMake from "pdfmake/build/pdfmake";
import {
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

// Fonts - Arabic support with Amiri
import robotoRegularUrl from "../fonts/Roboto-Regular.ttf?url";
import robotoBoldUrl from "../fonts/Roboto-Bold.ttf?url";
// Add Arial font URLs
import arialRegularUrl from "../fonts/Arial-Regular.ttf?url";
import arialBoldUrl from "../fonts/Arial-Bold.ttf?url";

// Top/Bottom banners — SVG only (background)
import headerSvgUrl from "../fonts/header.svg?url";
import footerSvgUrl from "../fonts/footer.svg?url";

// Page-content banners (PNG)
import bannerTopUrl from "../fonts/banner.png?url";
import bannerBottomUrl from "../fonts/banner1.png?url";

import { FormData, ServiceEntry } from "../types/form";

// استيراد ملف الترجمات العربية
import arabicTranslations from "../locales/ar.json";

/* ========= config ========= */
const SQUARE_SIDE = 220; // حجم الصور المربعة في الجاليري
const GALLERY_MAX = 4; // أقصى عدد صور للمعرض في الصفحة الأخيرة
const GALLERY_SIDE = 215;

const HEADER_IMG_H = 70; // اضبطها حسب ارتفاع الـ header.svg
const FOOTER_IMG_H = 120; // اضبطها حسب ارتفاع الـ footer.svg
const CONTENT_WIDTH = 515; // عرض مساحة المحتوى الافتراضي داخل A4 مع الهوامش

/* ========= تحويل البيانات من JSON إلى تنسيق الخيارات ========= */
const currencyOptions = Object.entries(arabicTranslations.currencies).map(
  ([value, label]) => ({
    value,
    label,
  })
);

const languageOptions = Object.entries(arabicTranslations.languages).map(
  ([value, label]) => ({
    value,
    label,
  })
);

const healthConditionOptions = Object.entries(
  arabicTranslations.health_conditions
).map(([value, label]) => ({
  value,
  label,
}));

const servicesOptionsAll = Object.entries(arabicTranslations.services).map(
  ([value, label]) => ({
    value,
    label,
  })
);

/* ========= دالة الترجمة المحدثة ========= */
function getTranslation(key: string): string {
  // البحث في جميع أقسام الترجمة
  const allTranslations = {
    ...arabicTranslations.headers,
    ...arabicTranslations.fields,
    ...arabicTranslations.table,
  };

  return allTranslations[key as keyof typeof allTranslations] || key;
}

function mapLabel(
  options: { value: string; label: string }[],
  value?: string | number | ""
) {
  const v = value == null ? "" : String(value);
  const found = options.find((o) => o.value === v);
  const result = found ? found.label : v;
  return processArabicText(result);
}

function t(key: string): string {
  const text = getTranslation(key);
  return processArabicText(text);
}

// دالة لمعالجة النصوص العربية
function processArabicText(text: string | number | undefined | null): string {
  if (!text) return "-";
  const str = String(text);

  // فحص إذا كان النص يحتوي على أحرف عربية
  const hasArabic = /[\u0600-\u06FF]/.test(str);

  if (hasArabic) {
    // عكس ترتيب الكلمات للنصوص العربية مع الحفاظ على المسافات
    const words = str
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0); // إزالة الكلمات الفارغة
    const reversedWords = words.reverse();
    return reversedWords.join("  "); // ربط بمسافتين لضمان الوضوح
  }

  return str;
}

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

      // Roboto (for English fallback)
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

      // Arial font
      const AREG = "Arial-Regular.ttf";
      const ABLD = "Arial-Bold.ttf";
      if (!pm.vfs[AREG]) {
        const b64 = await fetchAsBase64(arialRegularUrl);
        if (!b64) throw new Error("Failed to load Arial-Regular.ttf");
        pm.vfs[AREG] = b64;
      }
      if (!pm.vfs[ABLD]) {
        const b64 = await fetchAsBase64(arialBoldUrl);
        if (!b64) throw new Error("Failed to load Arial-Bold.ttf");
        pm.vfs[ABLD] = b64;
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
        Arial: { normal: AREG, bold: ABLD, italics: AREG, bolditalics: ABLD },
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

function isEmpty(v: any): boolean {
  return v == null || v === "" || v === undefined;
}

function asText(v: any): string {
  return isEmpty(v) ? "-" : String(v);
}

/* ========= table layout ========= */
function softBoxLayoutRTL(): TableLayout {
  return {
    hLineColor: () => "#475569",
    vLineColor: () => "#475569",
    hLineWidth: (i: number) => (i === 1 ? 1.2 : 0.6),
    vLineWidth: () => 0.6,
    paddingLeft: () => 6,
    paddingRight: () => 6,
    paddingTop: () => 6,
    paddingBottom: () => 6,
    fillColor: (rowIndex: number) => (rowIndex === 0 ? "#504035" : "#f8fafc"),
  };
}

function visitBoxLayoutRTL(): TableLayout {
  return {
    hLineColor: () => "#475569",
    vLineColor: () => "#475569",
    hLineWidth: (i: number) => (i === 1 ? 1.2 : 0.6),
    vLineWidth: () => 0.6,
    paddingLeft: () => 6,
    paddingRight: () => 6,
    paddingTop: () => 6,
    paddingBottom: () => 6,
    fillColor: (rowIndex: number) =>
      rowIndex === 0 || rowIndex === 1 ? "#504035" : "#f8fafc",
  };
}

const Label = (text: string): Content => ({
  text: t(text),
  style: "label",
});

const Val = (v: string | number | ""): Content =>
  isEmpty(v)
    ? { text: "-", style: "placeholder" }
    : { text: processArabicText(v), style: "value" };

/* ========= sections ========= */
function PersonalInfoBox(data: FormData): Content {
  return {
    margin: [0, 6, 0, 10],
    table: {
      widths: ["*", "*"],
      body: [
        [
          { text: t("Personal Information"), style: "boxTitle", colSpan: 2 },
          {} as TableCell,
        ],
        [
          {
            columns: [Val(data.age), { text: " :", width: 6 }, Label("Age")],
            columnGap: 4,
          },
          {
            columns: [
              Val(data.consultantName),
              { text: " :", width: 6 },
              Label("Consultant Name"),
            ],
            columnGap: 4,
          },
        ],
        [
          {
            columns: [
              Val(mapLabel(currencyOptions, data.currency)),
              { text: " :", width: 6 },
              Label("Currency"),
            ],
            columnGap: 4,
          },
          {
            columns: [
              Val(data.patientName),
              { text: " :", width: 6 },
              Label("Patient Name"),
            ],
            columnGap: 4,
          },
        ],
        [
          {
            columns: [
              Val(mapLabel(languageOptions, data.language)),
              { text: " :", width: 6 },
              Label("Language"),
            ],
            columnGap: 4,
          },
          {
            columns: [
              Val(data.phoneNumber),
              { text: " :", width: 6 },
              Label("Phone Number"),
            ],
            columnGap: 4,
          },
        ],
        [
          {
            columns: [
              Val(mapLabel(healthConditionOptions, data.healthCondition)),
              { text: " :", width: 6 },
              Label("Health Condition"),
            ],
            columnGap: 4,
          },

          {
            columns: [
              Val(data.patientId),
              { text: " :", width: 6 },
              Label("Patient ID"),
            ],
            columnGap: 4,
          },
        ],
        [
          {
            columns: [
              Val(mapLabel(servicesOptionsAll, data.services)),
              { text: " :", width: 6 },
              Label("Services"),
            ],
            columnGap: 4,
          },
          {
            columns: [
              Val(data.entryDate),
              { text: " :", width: 6 },
              Label("Entry Date"),
            ],
            columnGap: 4,
          },
        ],
      ],
    },
    layout: softBoxLayoutRTL(),
  };
}

function VisitInfoBox(title: string, date: string, days: number | ""): Content {
  return {
    margin: [0, 6, 0, 8],
    table: {
      widths: ["*", "*"],
      body: [
        [{ text: t(title), style: "boxTitle", colSpan: 2 }, {} as TableCell],
        [
          {
            columns: [
              {
                text: isEmpty(days) ? "-" : String(days),
                style: "value",
                color: "#ffffff",
              },
              { text: " :", width: 6, color: "#ffffff" },
              { text: t("Visit Days"), style: "label", color: "#ffffff" },
            ],
            columnGap: 4,
          },
          {
            columns: [
              {
                text: processArabicText(date),
                style: "value",
                color: "#ffffff",
              },
              { text: " :", width: 6, color: "#ffffff" },
              { text: t("Visit Date"), style: "label", color: "#ffffff" },
            ],
            columnGap: 4,
          },
        ],
      ],
    },
    layout: visitBoxLayoutRTL(),
  };
}

function ServicesBox(
  title: string,
  entries: ServiceEntry[],
  currency: string
): Content {
  const header: TableCell[] = [
    {
      text: t("Total"),
      alignment: "center",
      bold: true,
      color: "#ffffff",
      fontSize: 10,
    },
    {
      text: t("Quantity"),
      alignment: "center",
      bold: true,
      color: "#ffffff",
      fontSize: 10,
    },
    {
      text: t("Price"),
      alignment: "center",
      bold: true,
      color: "#ffffff",
      fontSize: 10,
    },
    {
      text: t("Service Type"),
      alignment: "center",
      bold: true,
      color: "#ffffff",
      fontSize: 10,
    },
    {
      text: t("Service Name"),
      alignment: "center",
      bold: true,
      color: "#ffffff",
      fontSize: 10,
    },
  ];

  const rows: TableCell[][] = entries.map((s) => [
    {
      text:
        isEmpty(s.price) || isEmpty(s.quantity)
          ? "-"
          : `${lineTotal(s)} ${currency}`,
      alignment: "center",
    },
    {
      text: isEmpty(s.quantity) ? "-" : String(s.quantity),
      alignment: "center",
    },
    { text: money(s.price as number, currency), alignment: "center" },
    { text: asText(s.serviceType), alignment: "center" },
    {
      text: asText(
        mapLabel(servicesOptionsAll, s.serviceName as string | number | "")
      ),
      alignment: "center",
    },
  ]);

  return {
    margin: [0, 4, 0, 8],
    table: {
      widths: ["*", "*", 55, 55, 60],
      body: [
        [
          { text: t(title), style: "boxTitle", colSpan: 5 },
          {},
          {},
          {},
          {},
        ] as TableCell[],
        header,
        ...rows,
      ],
    },
    layout: visitBoxLayoutRTL(),
  };
}

/* ========= Notes-like boxes (generic) ========= */
function DocNoteBox(title: string, text?: string): Content {
  const s = processArabicText(text);
  if (!s || s === "-") return { text: "" };
  return {
    margin: [0, 8, 0, 8],
    table: {
      widths: ["*"],
      body: [
        [{ text: t(title), style: "boxTitle", fillColor: "#504035" }],
        [{ text: s, style: "value", margin: [6, 6, 6, 6] }],
      ],
    },
    layout: {
      hLineColor: () => "#475569",
      vLineColor: () => "#475569",
      hLineWidth: (i: number) => (i === 1 ? 1.2 : 0.6),
      vLineWidth: () => 0.6,
      paddingLeft: () => 6,
      paddingRight: () => 6,
      paddingTop: () => 6,
      paddingBottom: () => 6,
      fillColor: (rowIndex: number) => (rowIndex === 0 ? "#504035" : "#f8fafc"),
    },
  };
}

function AboutClinicBox(): Content {
  const aboutText = arabicTranslations.clinic_about;

  return {
    margin: [0, 6, 0, 0],
    table: {
      widths: ["*"],
      body: [
        [{ text: t("About the Clinic"), style: "boxTitle" }],
        [
          {
            text: processArabicText(aboutText),
            style: "value",
            alignment: "right",
          },
        ],
      ],
    },
    layout: {
      hLineColor: () => "#475569",
      vLineColor: () => "#475569",
      hLineWidth: (i: number) => (i === 1 ? 1.2 : 0.6),
      vLineWidth: () => 0.6,
      paddingLeft: () => 6,
      paddingRight: () => 6,
      paddingTop: () => 6,
      paddingBottom: () => 6,
      fillColor: (rowIndex: number) => (rowIndex === 0 ? "#504035" : "#f8fafc"),
    },
  };
}

/** يجعل العنوان + كل الصور (حتى 4 صور) + البانر السفلي في نفس الصفحة وداخل بلوك واحد */
function GalleryWithBottomBanner(
  squareDataUrls: string[],
  bannerDataUrl?: string | null
): Content {
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
    { text: t("Uploaded Images"), style: "boxTitle", margin: [0, 6, 0, 6] },
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
          text: t("Medical Form Report"),
          style: "headerAR",
          alignment: "center",
          margin: [0, 0, 0, 6],
          decoration: "underline",
          decorationStyle: "solid",
          decorationColor: "#504035",
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

        PersonalInfoBox(formData),

        // ابدأ First Visit من الصفحة الثانية
        { text: "", pageBreak: "before" },

        // First visit (صفحة 2) — حماية الوصول
        VisitInfoBox(
          "First Visit Information",
          formData.firstVisit?.visitDate || "",
          formData.firstVisit?.visitDays ?? ""
        ),
        ServicesBox(
          "First Visit Service Entries",
          formData.firstVisit?.serviceEntries || [],
          currency
        ),

        // Second visit (اختياري بالكامل)
        ...(hasSecond
          ? [
              VisitInfoBox(
                "Second Visit Information",
                formData.secondVisit?.visitDate || "",
                formData.secondVisit?.visitDays ?? ""
              ),
              ServicesBox(
                "Second Visit Service Entries",
                formData.secondVisit?.serviceEntries || [],
                currency
              ),
            ]
          : []),

        {
          margin: [0, 6, 0, 6],
          table: {
            widths: ["*"],
            body: [
              [
                {
                  columns: [
                    {
                      text: processArabicText(`${all} ${currency}`),
                      bold: true,
                      fontSize: 11,
                      color: "#ffffff",
                      alignment: "left",
                    },
                    { text: " : ", width: 6 },
                    {
                      text: t("Grand Total"),
                      bold: true,
                      fontSize: 11,
                      color: "#ffffff",
                      alignment: "right",
                    },
                  ],
                  columnGap: 4,
                },
              ],
            ],
          },
          layout: softBoxLayoutRTL(),
        },

        // صناديق ملاحظات/خطة العلاج
        DocNoteBox("Medical Treatment Plan", f.medicalTreatmentPlan),
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
        DocNoteBox("Medical Notes", f.medicalNotes),

        AboutClinicBox(),

        // المعرض + العنوان + البانر السفلي كبلوك واحد
        GalleryWithBottomBanner(squareUrls, bannerBottomDataUrl),
      ],

      defaultStyle: {
        font: "Arial",
        fontSize: 10,
        alignment: "right",
      },

      styles: {
        headerAR: {
          fontSize: 16,
          bold: true,
          font: "Arial",
          alignment: "center",
        },
        boxTitle: {
          fontSize: 11,
          bold: true,
          font: "Arial",
          color: "#ffffff",
        },
        tableHeader: {
          bold: true,
          fillColor: "#334155",
          color: "#ffffff",
          font: "Arial",
          fontSize: 10,
        },
        label: {
          bold: true,
          fontSize: 9,
          font: "Arial",
          alignment: "right",
        },
        value: {
          fontSize: 9,
          font: "Arial",
          alignment: "right",
        },
        placeholder: {
          bold: true,
          color: "#999",
          fontSize: 9,
          font: "Arial",
          alignment: "right",
        },
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
          a.download = "medical-report-arabic.pdf";
          a.click();
        }
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        resolve();
      });
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    alert("حدث خطأ في توليد ملف PDF. تحقق من وحدة التحكم للحصول على التفاصيل.");
  }
}
