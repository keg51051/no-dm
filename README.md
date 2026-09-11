# 🙅 no dm (노뎀)

> **"DM 안 보내도 됩니다. 노뎀이 알아서 찾아드립니다."**  
> 인스타그램의 정보 게이트키핑("댓글 남겨주세요 → DM 자동발송") 패턴을 소비자 관점에서 해결하는 멀티모달 AI 서비스

---

## 📌 기획 배경 & 문제 정의

인스타그램에서 맛집, 카페, 여행지, 제품을 소개하면서 **"궁금하면 댓글 남겨주세요 → DM 자동전송"** 마케팅이 범람하고 있습니다.
- **소비자 피로도 극대화**: 이미 공개된 정보임에도 인게이지먼트를 부풀리기 위해 댓글/팔로우를 강제
- **소비자 측 솔루션 부재**: 기존 도구(ManyChat 등)는 모두 크리에이터/마케터 관점의 마케팅 자동화 도구뿐

**no dm**은 인스타 링크만 붙여넣으면, AI가 영상 화면과 캡션을 직접 분석하여 **진짜 상호명, 주소, 제품명, 네이버 지도 링크**를 단 5초 만에 즉시 찾아줍니다.

---

## ✨ 핵심 기능

1. **릴스/동영상 직접 분석 (Video Multimodal AI)**
   - Gemini 3.6 Flash를 활용해 릴스 영상 프레임 속 **매장 간판, 도로명 표지판, 메뉴판(OCR), 자막 텍스트, 나레이션 오디오**까지 종합 분석
2. **토큰리스/무비용 데이터 파이프라인**
   - Meta 공식 토큰리스 oEmbed API + ld+json 구조화 스키마 파서 기반의 안전한 데이터 수집
3. **네이버 지도(Naver Map) 원클릭 연동**
   - 도출된 상호명/주소를 한국 사용자에게 최적인 네이버 지도 검색 화면으로 즉시 연결
4. **글로벌 트래픽 부하 자동 우회 (Failover)**
   - Gemini 서버 일시 과부하(503) 발생 시 `gemini-3.5-flash-lite`로 무중단 자동 폴백

---

## 🛠 기술 스택

- **Frontend / Framework**: Next.js 16 (App Router, Turbopack), TypeScript (Strict)
- **Styling**: Tailwind CSS v4 (Dark Theme & Gradient Accent)
- **State Management**: TanStack Query (React Query v5), Jotai
- **AI Engine**: Google GenAI SDK (`gemini-3.6-flash`, `gemini-3.5-flash-lite`)
- **Package Manager**: pnpm

---

## 🚀 로컬 실행 방법

```bash
# 1. 의존성 설치
pnpm install

# 2. 환경변수 설정 (.env.local)
# GEMINI_API_KEY=your_gemini_api_key_here

# 3. 개발 서버 실행
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 인스타그램 링크를 분석해보세요.
