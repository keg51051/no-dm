'use client';

import { useState, type FormEvent } from 'react';
import { parseInstagramUrl } from '@/lib/instagram/url-parser';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError('URL을 입력해주세요.');
      return;
    }

    const parsed = parseInstagramUrl(url);
    if (!parsed.isValid) {
      setError('인스타그램 게시물 URL만 가능해요 (instagram.com/p/... 또는 /reel/...)');
      return;
    }

    onSubmit(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder="instagram.com/p/... 붙여넣기"
            className="w-full px-5 py-4 text-base bg-bg-input border border-border rounded-xl text-text focus:outline-none focus:border-pink focus:glow transition-all placeholder:text-text-muted disabled:opacity-40 font-mono"
            disabled={isLoading}
            autoFocus
          />
          {url && !isLoading && (
            <button
              type="button"
              onClick={() => {
                setUrl('');
                setError(null);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors cursor-pointer text-sm"
              aria-label="지우기"
            >
              ✕
            </button>
          )}
        </div>

        {error && (
          <p className="text-bad text-sm px-1 font-mono">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="w-full py-4 px-6 gradient-bg text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed text-base cursor-pointer transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              분석 중...
            </span>
          ) : (
            '분석하기'
          )}
        </button>
      </div>
    </form>
  );
}
