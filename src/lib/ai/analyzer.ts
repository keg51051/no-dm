import { GoogleGenAI } from '@google/genai';
import type { InstagramPost } from '@/types/instagram';
import type { AnalysisResult } from '@/types/analysis';
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt } from './prompts';

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
  }
  return new GoogleGenAI({ apiKey });
}

interface GeminiAnalysisResponse {
  summary: string;
  places: Array<{
    name: string;
    address?: string;
    category?: string;
    confidence: number;
  }>;
  products: Array<{
    name: string;
    brand?: string;
    price?: string;
    confidence: number;
  }>;
  links: Array<{
    url: string;
    description: string;
  }>;
  searchSuggestions?: string[];
  overallConfidence: number;
}

async function fetchMediaAsBase64(
  mediaUrl: string,
  fallbackMime: string,
  maxBytes: number = 15 * 1024 * 1024
): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const response = await fetch(mediaUrl, {
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || fallbackMime;
    const buffer = await response.arrayBuffer();

    // 용량 초과 체크 (15MB 초과 시 제외)
    if (buffer.byteLength > maxBytes) {
      console.warn(`[미디어 용량 초과: ${Math.round(buffer.byteLength / 1024 / 1024)}MB, 건너뜀]`);
      return null;
    }

    const base64 = Buffer.from(buffer).toString('base64');
    return { base64, mimeType: contentType.split(';')[0] };
  } catch (e) {
    console.warn('[미디어 로드 실패]:', e instanceof Error ? e.message : e);
    return null;
  }
}

export async function analyzePost(post: InstagramPost): Promise<AnalysisResult> {
  const ai = getGenAIClient();

  const parts: Array<
    | { text: string }
    | { inlineData: { data: string; mimeType: string } }
  > = [];

  let hasVideoAttached = false;

  // 1. 릴스/동영상(mp4)이 있는 경우 영상 우선 주입
  if (post.videoUrl) {
    console.log('[릴스 동영상 감지: 비디오 데이터 로드 중...]');
    const videoData = await fetchMediaAsBase64(post.videoUrl, 'video/mp4');
    if (videoData) {
      parts.push({
        inlineData: {
          data: videoData.base64,
          mimeType: videoData.mimeType,
        },
      });
      hasVideoAttached = true;
      console.log('[Gemini에 릴스 동영상 멀티모달 주입 완료]');
    }
  }

  // 2. 이미지가 있는 경우 (동영상이 없거나 추가 썸네일 필요 시)
  if (!hasVideoAttached && post.imageUrls.length > 0) {
    for (const imageUrl of post.imageUrls.slice(0, 3)) {
      const imageData = await fetchMediaAsBase64(imageUrl, 'image/jpeg', 5 * 1024 * 1024);
      if (imageData) {
        parts.push({
          inlineData: {
            data: imageData.base64,
            mimeType: imageData.mimeType,
          },
        });
      }
    }
  }

  const userPrompt = buildAnalysisPrompt({
    caption: post.caption,
    hashtags: post.hashtags,
    locationName: post.locationName,
    authorUsername: post.authorUsername,
    hasImage: post.imageUrls.length > 0,
    hasVideo: hasVideoAttached,
  });

  parts.push({ text: userPrompt });

  const CANDIDATE_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash-lite'];
  let parsed: GeminiAnalysisResponse | null = null;
  let lastError: unknown = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction: ANALYSIS_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error(`모델 ${model}이 빈 응답을 반환했습니다.`);
      }

      parsed = JSON.parse(text) as GeminiAnalysisResponse;
      break;
    } catch (err: unknown) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[Gemini ${model} 실패, 다음 모델로 폴백 시도]:`, errMsg);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!parsed) {
    throw new Error(
      `모든 Gemini 모델 요청에 실패했습니다: ${lastError instanceof Error ? lastError.message : String(lastError)}`
    );
  }

  const id = `${post.shortcode}-${Date.now().toString(36)}`;

  return {
    id,
    postUrl: post.url,
    summary: parsed.summary,
    places: (parsed.places ?? []).map((p) => {
      // 네이버 지도 검색 URL 우선 생성
      const query = p.name || p.address;
      const naverMapUrl = query
        ? `https://map.naver.com/p/search/${encodeURIComponent(query)}`
        : null;

      return {
        name: p.name,
        address: p.address ?? null,
        category: p.category ?? null,
        confidence: p.confidence,
        mapUrl: naverMapUrl,
        phone: null,
        businessHours: null,
      };
    }),
    products: (parsed.products ?? []).map((p) => ({
      name: p.name,
      brand: p.brand ?? null,
      price: p.price ?? null,
      purchaseUrl: null,
      confidence: p.confidence,
    })),
    links: parsed.links ?? [],
    rawCaption: post.caption,
    analyzedAt: new Date().toISOString(),
    confidence: parsed.overallConfidence,
  };
}
