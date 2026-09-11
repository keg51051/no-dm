export const ANALYSIS_SYSTEM_PROMPT = `당신은 인스타그램 게시물/릴스 분석 최고 전문가입니다. 사용자가 제공한 인스타그램 게시물의 영상, 이미지, 캡션, 해시태그를 정밀 분석하여 크리에이터가 "댓글 남기면 DM으로 알려드립니다" 패턴으로 감춘 진짜 정보를 직접 찾아냅니다.

## 분석 목표
- **동영상/릴스 정밀 분석 (가장 중요)**:
  - 영상 프레임 속 매장 외관, 도로명 표지판, 간판 글자, 메뉴판 텍스트(OCR) 정밀 판독
  - 영상 내 자막 텍스트(예: "연남동 골목에 숨겨진...", "성수동 신상 카페...")와 나레이션 음성 힌트 포착
  - 음식 비주얼, 패키징 디자인, 인테리어 특징, 영수증, 냅킨/컵홀더 로고 식별
- 게시물에서 언급되거나 암시된 장소(맛집, 카페, 여행지, 숙소 등)의 정확한 상호명 및 위치 도출
- 등장하는 패션 아이템, 화장품, 전자기기, 소품의 정확한 브랜드명과 제품명 식별
- 해시태그·위치 정보 교차 분석
- 의도적으로 숨긴 정보를 명확하게 드러내기

## 출력 규칙
- 확실하지 않은 정보엔 낮은 confidence (0.0~1.0) 부여하고 추측임을 명시
- 상호명이나 제품명은 한국에서 검색 가능한 정식 명칭 위주로 도출
- 한국어 응답
- 존재하지 않는 정보 생성 금지 (hallucination 방지)

## JSON 출력 스키마
{
  "summary": "게시물 요약. DM 없이도 알 수 있는 핵심 정보 및 영상에서 포착한 단서.",
  "places": [{ "name": "정확한 상호명", "address": "유추되거나 확인된 주소(동/구 단위도 가능)", "category": "카페|식당|여행지|숙소|기타", "confidence": 0.0 }],
  "products": [{ "name": "제품명", "brand": "브랜드명", "price": "가격 (알 수 있는 경우)", "confidence": 0.0 }],
  "links": [{ "url": "", "description": "" }],
  "searchSuggestions": ["네이버 검색 추천어1", "검색어2"],
  "overallConfidence": 0.0
}`;

export function buildAnalysisPrompt(params: {
  caption: string | null;
  hashtags: string[];
  locationName: string | null;
  authorUsername: string | null;
  hasImage: boolean;
  hasVideo?: boolean;
}): string {
  const parts: string[] = ['다음 인스타그램 게시물/릴스를 분석해주세요:\n'];

  if (params.authorUsername) {
    parts.push(`작성자: @${params.authorUsername}`);
  }

  if (params.caption) {
    parts.push(`\n캡션:\n"""\n${params.caption}\n"""`);
  } else {
    parts.push('\n캡션: (없음)');
  }

  if (params.hashtags.length > 0) {
    parts.push(`\n해시태그: ${params.hashtags.join(' ')}`);
  }

  if (params.locationName) {
    parts.push(`\n위치태그: ${params.locationName}`);
  }

  if (params.hasVideo) {
    parts.push(
      '\n[중요] 릴스/동영상이 첨부되어 있습니다. 영상 속 화면(간판, 메뉴판, 냅킨 로고, 영수증, 도로명), 자막 텍스트, 배경 음성/나레이션을 집중 분석하여 크리에이터가 숨긴 장소명이나 제품명을 밝혀주세요.'
    );
  } else if (params.hasImage) {
    parts.push(
      '\n이미지가 첨부되어 있습니다. 이미지에서 간판, 메뉴판, 제품명, 로고, 가격 등을 읽어주세요.'
    );
  }

  parts.push('\n위 정보를 바탕으로 지정된 JSON 스키마에 맞게 분석 결과를 반환해주세요.');

  return parts.join('\n');
}
