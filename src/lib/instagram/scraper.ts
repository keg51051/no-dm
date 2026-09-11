import type { InstagramPost, OEmbedResponse } from '@/types/instagram';
import { parseInstagramUrl } from './url-parser';

/**
 * Instagram 데이터 수집 전략 (무료, 토큰 불필요):
 *
 * 1차: oEmbed API (2026.06~ 토큰 없이 사용 가능)
 *      → 캡션, 썸네일, 작성자 확보
 * 2차: 메타태그 파싱 (og:image, og:description)
 *      → oEmbed 실패 시 폴백
 * 3차: Gemini Vision이 이미지에서 나머지 정보 추출
 *      → 두 방법 모두 이미지 URL은 제공하므로 AI 분석 가능
 */

// ─── oEmbed API (무료, 토큰 불필요) ──────────────────────────────

const OEMBED_ENDPOINT = 'https://graph.facebook.com/v25.0/instagram_oembed';

export async function fetchViaOEmbed(postUrl: string): Promise<InstagramPost> {
  const parsed = parseInstagramUrl(postUrl);
  if (!parsed.isValid || !parsed.shortcode) {
    throw new Error('유효하지 않은 Instagram URL');
  }

  const canonicalUrl = `https://www.instagram.com/p/${parsed.shortcode}/`;

  const params = new URLSearchParams({
    url: canonicalUrl,
    omitscript: 'true',
    maxwidth: '658',
  });

  const response = await fetch(`${OEMBED_ENDPOINT}?${params}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(3500),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`oEmbed API 실패 (${response.status}): ${text.slice(0, 150)}`);
  }

  const data = (await response.json()) as OEmbedResponse;

  // HTML에서 캡션 추출
  const caption = extractCaptionFromOEmbed(data.html);
  const hashtags = extractHashtags(caption);

  return {
    url: postUrl,
    shortcode: parsed.shortcode,
    caption,
    imageUrls: data.thumbnail_url ? [data.thumbnail_url] : [],
    thumbnailUrl: data.thumbnail_url ?? null,
    videoUrl: null,
    locationName: null,
    hashtags,
    authorUsername: data.author_name ?? null,
    timestamp: null,
  };
}

function extractCaptionFromOEmbed(html: string): string | null {
  if (!html) return null;

  const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  if (!pMatch) return null;

  return (
    pMatch[1]
      .replace(/<[^>]*>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim() || null
  );
}

// ─── 메타태그 및 ld+json 폴백 ────────────────────────────────────

export async function fetchViaMetaTags(postUrl: string): Promise<InstagramPost> {
  const parsed = parseInstagramUrl(postUrl);
  if (!parsed.isValid || !parsed.shortcode) {
    throw new Error('유효하지 않은 Instagram URL');
  }

  const canonicalUrl = `https://www.instagram.com/p/${parsed.shortcode}/`;

  const userAgents = [
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'facebookexternalhit/1.1',
  ];

  let html = '';

  for (const ua of userAgents) {
    try {
      const response = await fetch(canonicalUrl, {
        headers: {
          'User-Agent': ua,
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'ko-KR,ko;q=0.9',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(3500),
      });

      if (response.ok) {
        html = await response.text();
        if (html.length > 500) break;
      }
    } catch {
      // 타임아웃 또는 차단 시 다음 봇 헤더로 빠르게 이동
      continue;
    }
  }

  if (!html) {
    throw new Error('Instagram 페이지 응답 없음 (타임아웃 또는 차단)');
  }

  return parseHtmlContent(html, postUrl, parsed.shortcode);
}

function parseHtmlContent(html: string, url: string, shortcode: string): InstagramPost {
  // 1. ld+json 스크립트 태그 파싱 시도 (가장 완전한 데이터)
  try {
    const ldJsonMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const match of ldJsonMatches) {
      const data = JSON.parse(match[1]);
      const caption = data.caption || data.articleBody || data.description || null;
      const imageUrl = Array.isArray(data.image) ? data.image[0] : typeof data.image === 'string' ? data.image : null;
      const author = data.author?.name || null;

      const videoUrl =
        data.video?.contentUrl ||
        (Array.isArray(data.video) ? data.video[0]?.contentUrl : null) ||
        null;

      if (caption || imageUrl || videoUrl) {
        return {
          url,
          shortcode,
          caption,
          imageUrls: imageUrl ? [imageUrl] : [],
          thumbnailUrl: imageUrl,
          videoUrl,
          locationName: null,
          hashtags: extractHashtags(caption),
          authorUsername: author,
          timestamp: null,
        };
      }
    }
  } catch {
    // ld+json 파싱 실패 시 메타태그로 계속
  }

  // 2. Open Graph 메타태그 파싱
  const getMeta = (property: string): string | null => {
    const patterns = [
      new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']*?)["'][^>]*property=["']${property}["']`, 'i'),
      new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'),
    ];

    for (const regex of patterns) {
      const match = html.match(regex);
      if (match?.[1]) return match[1];
    }
    return null;
  };

  const description = getMeta('og:description') ?? getMeta('description');
  const imageUrl = getMeta('og:image');
  const videoUrl = getMeta('og:video:secure_url') ?? getMeta('og:video') ?? getMeta('og:video:url');
  const title = getMeta('og:title');

  let caption = description;
  if (description) {
    const captionMatch = description.match(/:\s*[""\u201C]([\s\S]+?)[""\u201D]/);
    if (captionMatch) {
      caption = captionMatch[1];
    }
  }

  let authorUsername: string | null = null;
  if (title) {
    const match = title.match(/@([\w.]+)/);
    if (match) authorUsername = match[1];
  }

  return {
    url,
    shortcode,
    caption,
    imageUrls: imageUrl ? [imageUrl] : [],
    thumbnailUrl: imageUrl ?? null,
    videoUrl: videoUrl ?? null,
    locationName: null,
    hashtags: extractHashtags(caption),
    authorUsername,
    timestamp: null,
  };
}

// ─── 통합 수집 함수 ─────────────────────────────────────────────

/**
 * Instagram 게시물 데이터 수집.
 * oEmbed (무료) → 메타태그 폴백 순서로 시도.
 */
export async function fetchInstagramPost(postUrl: string): Promise<InstagramPost> {
  // 1차: oEmbed API
  try {
    const post = await fetchViaOEmbed(postUrl);
    if (post.caption || post.imageUrls.length > 0) {
      return post;
    }
  } catch (e) {
    console.warn('[oEmbed 실패]', e instanceof Error ? e.message : e);
  }

  // 2차: 메타태그 및 ld+json 파싱 (비디오 포함)
  try {
    return await fetchViaMetaTags(postUrl);
  } catch (e) {
    console.warn('[메타태그 실패]', e instanceof Error ? e.message : e);
  }

  // 둘 다 실패하면 최소 정보로 반환
  const parsed = parseInstagramUrl(postUrl);
  return {
    url: postUrl,
    shortcode: parsed.shortcode ?? 'unknown',
    caption: null,
    imageUrls: [],
    thumbnailUrl: null,
    videoUrl: null,
    locationName: null,
    hashtags: [],
    authorUsername: null,
    timestamp: null,
  };
}

// ─── 유틸 ────────────────────────────────────────────────────────

function extractHashtags(text: string | null): string[] {
  if (!text) return [];
  return text.match(/#[\wㄱ-ㅎㅏ-ㅣ가-힣]+/g) ?? [];
}
