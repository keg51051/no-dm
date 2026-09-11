import { useMutation } from '@tanstack/react-query';
import type { AnalyzeResponse } from '@/types/analysis';

async function analyzeUrl(url: string): Promise<AnalyzeResponse> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  const data = (await response.json()) as AnalyzeResponse;

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? '분석 요청에 실패했습니다.');
  }

  return data;
}

export function useAnalyze() {
  return useMutation({
    mutationFn: analyzeUrl,
  });
}
