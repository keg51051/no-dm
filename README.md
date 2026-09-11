# 🙅 no dm (노뎀)

[![Built with Antigravity](https://img.shields.io/badge/Built%20with-Antigravity-4285F4?style=flat-square&logo=google)](https://deepmind.google)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20Native-8E75FF?style=flat-square&logo=googlegemini)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)

> **"DM 안 보내도 됩니다. 노뎀이 알아서 찾아드립니다."**  
> 인스타그램의 정보 게이트키핑("댓글 남겨주세요 → DM 자동발송") 패턴을 소비자 관점에서 해결하는 **Gemini Native 멀티모달 AI 오픈소스 서비스**

---

## 📌 기획 배경 & 문제 정의

인스타그램에서 맛집, 카페, 여행지, 제품을 소개하면서 **"궁금하면 댓글 남겨주세요 → DM 자동전송"** 마케팅이 범람하고 있습니다.
- **소비자 피로도 극대화**: 이미 공개된 정보임에도 인게이지먼트를 부풀리기 위해 댓글/팔로우를 강제
- **소비자 측 솔루션 부재**: 기존 도구(ManyChat 등)는 모두 크리에이터/마케터 관점의 마케팅 자동화 도구뿐

**no dm**은 인스타 링크만 붙여넣으면, AI가 영상 화면과 캡션을 직접 분석하여 **진짜 상호명, 주소, 제품명, 네이버 지도 링크**를 단 5초 만에 즉시 찾아줍니다.

---

## ✨ 핵심 기능

1. **릴스/동영상 직접 분석 (Gemini Video Multimodal AI)**
   - Gemini 3.6 Flash를 활용해 릴스 영상(mp4)을 프레임 단위로 분석하여 **매장 간판, 도로명 표지판, 메뉴판(OCR), 자막 텍스트, 나레이션 오디오**까지 종합 판독
2. **토큰리스/무비용 데이터 파이프라인**
   - Meta 공식 토큰리스 oEmbed API + ld+json 구조화 스키마 파서 기반의 안전한 데이터 수집
3. **네이버 지도(Naver Map) 원클릭 연동**
   - 도출된 상호명/주소를 한국 사용자에게 최적인 네이버 지도 검색 화면으로 즉시 연결
4. **글로벌 트래픽 부하 자동 우회 (Failover)**
   - Gemini 서버 일시 과부하(503) 발생 시 `gemini-3.5-flash-lite`로 무중단 자동 폴백

---

## 🤖 Built with Antigravity & Gemini Native

이 프로젝트는 **Google DeepMind의 차세대 에이전트 코딩 어시스턴트인 Antigravity**와 함께 페어 프로그래밍으로 설계 및 구축되었으며, **Gemini 멀티모달 네이티브 기능**을 핵심 코어 엔진으로 탑재하고 있습니다.

- **Agentic Workflow**: Antigravity를 통한 TDD/DDD 기반 고속 풀스택 프로토타이핑
- **Native Video Multimodal**: 외부 무거운 프레임 추출 서버 없이 Gemini API의 네이티브 mp4 인라인 스트리밍 분석 활용
- **Resilient Fallback Architecture**: 503/429 장애 시 지수 백오프 및 Lite 모델 즉시 전환으로 고가용성 보장

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
# 1. 저장소 복제
git clone https://github.com/keg51051/no-dm.git
cd no-dm

# 2. 의존성 설치
pnpm install

# 3. 환경변수 설정 (.env.local)
# https://aistudio.google.com/apikey 에서 무료 발급
echo "GEMINI_API_KEY=your_gemini_api_key" > .env.local

# 4. 개발 서버 실행
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 인스타그램 링크를 분석해보세요.

---

## 📄 라이선스

이 프로젝트는 [MIT License](LICENSE)에 따라 자유롭게 사용, 수정 및 배포할 수 있습니다.
