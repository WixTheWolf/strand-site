/**
 * 2026 Gamble Sands photo gallery.
 *
 * To publish trip photos: drop image files into `public/gallery/2026/` and
 * add one entry per photo here (src is the public path). The recap page
 * renders styled placeholders until entries exist.
 */
export interface GalleryPhoto {
  src: string;
  caption?: string;
  /** Wide shots can span two columns in the grid */
  wide?: boolean;
}

export const GALLERY_2026: GalleryPhoto[] = [];
