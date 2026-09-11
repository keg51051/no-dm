import type { ParsedInstagramUrl } from '@/types/instagram';

const INSTAGRAM_URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(p|reel|reels)\/([A-Za-z0-9_-]+)/;

export function parseInstagramUrl(url: string): ParsedInstagramUrl {
  const trimmed = url.trim();
  const match = trimmed.match(INSTAGRAM_URL_REGEX);

  if (!match) {
    return { isValid: false, shortcode: null, type: 'unknown' };
  }

  const [, typeStr, shortcode] = match;
  const type: ParsedInstagramUrl['type'] =
    typeStr === 'p' ? 'post' : typeStr === 'reel' || typeStr === 'reels' ? 'reel' : 'unknown';

  return { isValid: true, shortcode, type };
}

export function buildInstagramUrl(shortcode: string): string {
  return `https://www.instagram.com/p/${shortcode}/`;
}
