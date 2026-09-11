import type { AnalysisResult, PlaceInfo, ProductInfo } from '@/types/analysis';

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const percent = Math.round(confidence * 100);
  const color =
    confidence >= 0.8
      ? 'bg-ok-dim text-ok'
      : confidence >= 0.5
        ? 'bg-warn-dim text-warn'
        : 'bg-bad-dim text-bad';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium ${color}`}
    >
      {percent}%
    </span>
  );
}

function PlaceCard({ place }: { place: PlaceInfo }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-semibold text-text flex items-center gap-2">
            <span>📍</span>
            {place.name}
          </h3>
          {place.category && (
            <span className="inline-block text-[11px] text-text-muted bg-bg-input px-2 py-0.5 rounded mt-1.5 font-mono">
              {place.category}
            </span>
          )}
          {place.address && (
            <p className="text-sm text-text-dim mt-1.5">{place.address}</p>
          )}
        </div>
        <ConfidenceBadge confidence={place.confidence} />
      </div>
      {place.mapUrl && (
        <a
          href={place.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#03C75A] hover:underline font-medium"
        >
          <span>🗺️</span>
          네이버 지도에서 보기 ↗
        </a>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: ProductInfo }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-semibold text-text flex items-center gap-2">
            <span>🏷️</span>
            {product.name}
          </h3>
          {product.brand && (
            <span className="inline-block text-[11px] text-text-muted bg-bg-input px-2 py-0.5 rounded mt-1.5 font-mono">
              {product.brand}
            </span>
          )}
          {product.price && (
            <p className="text-sm font-medium text-yellow mt-1.5 font-mono">
              {product.price}
            </p>
          )}
        </div>
        <ConfidenceBadge confidence={product.confidence} />
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-mono text-text-muted uppercase tracking-widest mb-3 px-1">
      {children}
    </h3>
  );
}

export function ResultCard({ result }: { result: AnalysisResult }) {
  const hasPlaces = result.places.length > 0;
  const hasProducts = result.products.length > 0;
  const hasLinks = result.links.length > 0;
  const isEmpty = !hasPlaces && !hasProducts && !hasLinks;

  return (
    <div className="w-full max-w-xl mx-auto space-y-5">
      {/* 요약 */}
      <div className="p-5 rounded-xl border border-border bg-bg-card glow">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold gradient-text text-lg">찾아낸 정보</h2>
          <ConfidenceBadge confidence={result.confidence} />
        </div>
        <p className="text-text-dim leading-relaxed text-[15px]">
          {result.summary}
        </p>
      </div>

      {/* 비어있을 때 */}
      {isEmpty && (
        <div className="text-center py-10 text-text-muted">
          <p className="text-3xl mb-3">¯\_(ツ)_/¯</p>
          <p className="font-medium text-text-dim">
            이 게시물은 숨긴 게 없나봐요
          </p>
          <p className="text-sm mt-1">
            이미 다 공개했거나, AI가 못 찾았어요
          </p>
        </div>
      )}

      {/* 장소 */}
      {hasPlaces && (
        <div>
          <SectionLabel>places</SectionLabel>
          <div className="flex flex-col gap-2">
            {result.places.map((place, i) => (
              <PlaceCard key={`place-${i}`} place={place} />
            ))}
          </div>
        </div>
      )}

      {/* 제품 */}
      {hasProducts && (
        <div>
          <SectionLabel>products</SectionLabel>
          <div className="flex flex-col gap-2">
            {result.products.map((product, i) => (
              <ProductCard key={`product-${i}`} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* 링크 */}
      {hasLinks && (
        <div>
          <SectionLabel>links</SectionLabel>
          <div className="flex flex-col gap-2">
            {result.links.map((link, i) => (
              <a
                key={`link-${i}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl border border-border bg-bg-card hover:bg-bg-card-hover transition-colors block"
              >
                <span className="text-sm text-pink font-medium">
                  {link.description}
                </span>
                <span className="block text-xs text-text-muted mt-1 truncate font-mono">
                  {link.url}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 원본 캡션 */}
      {result.rawCaption && (
        <details className="group">
          <summary className="text-[11px] font-mono text-text-muted cursor-pointer hover:text-text-dim transition-colors px-1 uppercase tracking-widest select-none">
            raw caption ▾
          </summary>
          <div className="mt-2 p-4 rounded-xl border border-border bg-bg-input text-sm text-text-dim whitespace-pre-wrap leading-relaxed font-mono">
            {result.rawCaption}
          </div>
        </details>
      )}

      {/* 원본 링크 */}
      <div className="text-center pt-1">
        <a
          href={result.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-text-muted hover:text-text-dim transition-colors font-mono"
        >
          원본 게시물 ↗
        </a>
      </div>
    </div>
  );
}
