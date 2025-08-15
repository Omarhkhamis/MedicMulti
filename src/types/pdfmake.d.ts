declare module "pdfmake/build/pdfmake" {
  import type pdfMakeType from "pdfmake";
  const pdfMake: typeof pdfMakeType;
  export = pdfMake;
}

declare module "pdfmake/build/vfs_fonts" {
  const vfsFonts: { pdfMake: { vfs: Record<string, string> } };
  export = vfsFonts;
}
