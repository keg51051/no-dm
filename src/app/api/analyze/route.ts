import { NextRequest } from 'next/server';
import type { AnalyzeRequest, AnalyzeResponse } from '@/types/analysis';
import { parseInstagramUrl } from '@/lib/instagram/url-parser';
import { fetchInstagramPost } from '@/lib/instagram/scraper';
import { analyzePost } from '@/lib/ai/analyzer';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = (await request.json()) as AnalyzeRequest;
    const { url } = body;

    if (!url) {
      return Response.json(
        { success: false, error: 'URL이 필요합니다.' } satisfies AnalyzeResponse,
        { status: 400 }
      );
    }

    const parsed = parseInstagramUrl(url);
    if (!parsed.isValid) {
      return Response.json(
        {
          success: false,
          error: '유효한 인스타그램 게시물 URL을 입력해주세요. (예: instagram.com/p/xxx)',
        } satisfies AnalyzeResponse,
        { status: 400 }
      );
    }

    // Instagram 데이터 수집: oEmbed (토큰리스) → 메타태그 폴백
    const post = await fetchInstagramPost(url);

    // AI 분석
    const result = await analyzePost(post);

    return Response.json(
      { success: true, data: result } satisfies AnalyzeResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : '분석 중 오류가 발생했습니다.',
      } satisfies AnalyzeResponse,
      { status: 500 }
    );
  }
}
