/**
 * Manifest of real brand imagery present in /public/brand.
 * Everything is `false` until the file is added (step-5 asset pass):
 * drop the file into public/brand/, flip its entry to `true`, and <Media>
 * swaps the toned placeholder for a real next/image automatically.
 *
 * Keys are the paths <Media slot="..."> is called with.
 */
export const BRAND_ASSETS: Record<string, boolean> = {
  "brand/hero.jpg": true,
  "brand/daytime.jpg": true,
  "brand/gallery-1.jpg": false,
  "brand/gallery-2.jpg": false,
  "brand/model.png": false,
};

export const hasAsset = (slot: string) => BRAND_ASSETS[slot] === true;
