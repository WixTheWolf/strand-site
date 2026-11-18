/**
 * 2026 Gamble Sands photo gallery — the 16 best golf shots from the shared
 * trip album ("The Strand 2026"), captain-curated down from 101. Files live
 * in `public/gallery/2026/`; add a `caption` to any entry to overlay it.
 */
export interface GalleryPhoto {
  src: string;
  caption?: string;
  /** Wide shots span two columns in the grid */
  wide?: boolean;
}

export const GALLERY_2026: GalleryPhoto[] = [
  { src: "/gallery/2026/strand26-015.jpg", caption: "Walking it in" },
  { src: "/gallery/2026/strand26-017.jpg", caption: "Smoke-season warm-up" },
  { src: "/gallery/2026/strand26-023.jpg" },
  { src: "/gallery/2026/strand26-025.jpg", wide: true, caption: "High desert, all of it" },
  { src: "/gallery/2026/strand26-032.jpg" },
  { src: "/gallery/2026/strand26-033.jpg", caption: "On the tee sheet — 8:30" },
  { src: "/gallery/2026/strand26-036.jpg", caption: "Putts were holed" },
  { src: "/gallery/2026/strand26-039.jpg", caption: "Kick in" },
  { src: "/gallery/2026/strand26-042.jpg" },
  { src: "/gallery/2026/strand26-053.jpg" },
  { src: "/gallery/2026/strand26-054.jpg", caption: "Over the Columbia" },
  { src: "/gallery/2026/strand26-063.jpg", caption: "The 2026 field" },
  { src: "/gallery/2026/strand26-067.jpg" },
  { src: "/gallery/2026/strand26-073.jpg" },
  { src: "/gallery/2026/strand26-076.jpg", caption: "Last light on the green" },
  { src: "/gallery/2026/strand26-078.jpg", caption: "Gamble Sands" },
];
