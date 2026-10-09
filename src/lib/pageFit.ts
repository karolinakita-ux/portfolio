/* ---------------------------------------------------------------------------
   One-page fit check

   A4 is 210 x 297mm; 20mm margins leave a 170 x 257mm text area. When the
   preview's text column is exactly 170mm wide, its line breaks match the PDF,
   so its height tells us whether the letter fits on one page. At narrower
   widths (phones) the check reports nothing rather than guess.
   --------------------------------------------------------------------------- */
const PX_PER_MM = 96 / 25.4;
const TEXT_AREA_MM = { width: 170, height: 257 };

export interface PageFit {
  fits: boolean;
  /** Spare (fits) or overflowing (does not fit) millimetres, rounded. */
  mm: number;
}

/** Fit of a text column measured in CSS px, or null when the column is not at print width (phones). */
export function measurePageFit(widthPx: number, heightPx: number): PageFit | null {
  if (Math.abs(widthPx / PX_PER_MM - TEXT_AREA_MM.width) > 0.5) return null;
  const spareMm = TEXT_AREA_MM.height - heightPx / PX_PER_MM;
  return { fits: spareMm >= 0, mm: Math.abs(Math.round(spareMm)) };
}
