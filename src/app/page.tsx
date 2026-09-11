'use client';

import { useState } from 'react';
import { UrlInput } from '@/components/UrlInput';
import { ResultCard } from '@/components/ResultCard';
import { useAnalyze } from '@/lib/hooks/use-analyze';
import type { AnalysisResult } from '@/types/analysis';

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { mutate, isPending, error, reset } = useAnalyze();

  const handleSubmit = (url: string) => {
    setResult(null);
    reset();
    mutate(url, {
      onSuccess: (response) => {
        if (response.success && response.data) {
          setResult(response.data);
        }
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* 헤더 */}
      <header className="w-full border-b border-border bg-bg/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight font-mono">
            <span className="gradient-text">no dm</span>
          </h1>
          <span className="text-[10px] text-text-muted border border-border px-2 py-0.5 rounded font-mono uppercase tracking-widest">
            beta
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4">
        {/* 히어로 */}
        <section className="w-full max-w-xl pt-20 sm:pt-28 pb-8 text-center">
          <p className="text-text-muted text-sm mb-6 tracking-wide">
            &ldquo;궁금하면 댓글 남겨주세요&rdquo; 에 지쳤다면
          </p>

          <h2 className="text-5xl sm:text-6xl font-black tracking-tight mb-2 leading-[1.1]">
            <span className="strike-anim text-text-dim">DM 보내지 마</span>
          </h2>
          <h2 className="text-5xl sm:text-6xl font-black tracking-tight mb-8 leading-[1.1]">
            <span className="gradient-text">그냥 알려줄게</span>
          </h2>

          <p className="text-text-dim text-base mb-10 leading-relaxed max-w-md mx-auto">
            인스타 게시물 URL 하나면 충분해요.
            <br />
            AI가 이미지랑 캡션 뒤져서 숨은 정보 꺼내드림.
          </p>

          <UrlInput onSubmit={handleSubmit} isLoading={isPending} />

          {/* 사용법 */}
          {!result && !isPending && !error && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-text-muted font-mono">
              <span>URL 복사</span>
              <span className="hidden sm:block text-border">→</span>
              <span>여기 붙여넣기</span>
              <span className="hidden sm:block text-border">→</span>
              <span className="text-text-dim">끝. DM 필요 없음</span>
            </div>
          )}
        </section>

        {/* 로딩 */}
        {isPending && (
          <section className="w-full max-w-xl py-16 text-center">
            <div className="inline-block w-10 h-10 border-2 border-border border-t-pink rounded-full animate-spin mb-6" />
            <p className="text-text font-medium">게시물 뜯어보는 중</p>
            <p className="text-sm text-text-muted mt-2 font-mono">
              간판 읽고, 캡션 분석하고, 해시태그 파고드는 중...
            </p>
          </section>
        )}

        {/* 에러 */}
        {error && (
          <section className="w-full max-w-xl py-8">
            <div className="p-5 rounded-xl bg-bad-dim border border-bad/20 text-center">
              <p className="text-bad font-semibold mb-1">실패 🫠</p>
              <p className="text-sm text-text-dim">
                {error instanceof Error
                  ? error.message
                  : '뭔가 잘못됐어요.'}
              </p>
              <button
                onClick={() => {
                  reset();
                  setResult(null);
                }}
                className="mt-4 text-sm text-pink hover:underline font-medium cursor-pointer"
              >
                다시 해보기
              </button>
            </div>
          </section>
        )}

        {/* 결과 */}
        {result && (
          <section className="w-full max-w-xl pb-16">
            <ResultCard result={result} />
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setResult(null);
                  reset();
                }}
                className="text-sm text-text-muted hover:text-text transition-colors cursor-pointer font-mono"
              >
                ← 다른 거 분석
              </button>
            </div>
          </section>
        )}
      </main>

      {/* 푸터 */}
      <footer className="w-full border-t border-border py-6">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs text-text-muted font-mono">
            <span className="gradient-text font-bold">no dm</span>
            {' · '}Powered by Gemini
          </p>
        </div>
      </footer>
    </div>
  );
}
