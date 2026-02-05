# SprintGhost 프로젝트 현황

> 마지막 업데이트: 2026-02-06

---

## 구현 완료 (Sprint 1 MVP)

### Backend (services/api)

| 이슈 | 제목 | 상태 |
|------|------|------|
| BE-001 | Database 스키마 및 Drizzle + Redis | ✅ 완료 |
| BE-002 | 공통 모듈 (Crypto, Config) | ✅ 완료 |
| BE-004 | Projects CRUD API | ✅ 완료 |
| BE-005 | GitHub API 연동 (PAT 기반) | ✅ 완료 |
| BE-006 | Jira API 클라이언트 | ✅ 완료 |
| BE-007 | Slack Webhook 클라이언트 | ✅ 완료 |
| BE-008 | AI 클라이언트 (Multi-Provider) | ✅ 완료 |
| BE-009 | Webhook 수신 및 라우팅 | ✅ 완료 |
| BE-010 | PR 생성 시 스크럼 리뷰 핸들러 | ✅ 완료 |
| BE-011 | 데일리 스크럼 핸들러 (BullMQ) | ✅ 완료 |
| BE-012 | PR 머지 핸들러 | ✅ 완료 |
| BE-013 | PR DOD 체크리스트 검증 | ✅ 완료 |
| BE-014 | Activity Log 저장 및 조회 | ✅ 완료 |

### Frontend (apps/web)

| 이슈 | 제목 | 상태 |
|------|------|------|
| FE-001 | 기본 레이아웃 및 라우팅 | ✅ 완료 |
| FE-003 | 프로젝트 등록 Wizard UI | ✅ 완료 |
| FE-004 | 프로젝트 목록 및 상세 페이지 | ✅ 완료 |
| FE-007 | 에러 처리 및 토스트 | ✅ 완료 |

### Infrastructure

| 이슈 | 제목 | 상태 |
|------|------|------|
| INFRA-001 | Docker 설정 | ✅ 완료 |
| - | nextjs.Dockerfile | ✅ 완료 |
| - | nestjs.Dockerfile | ✅ 완료 |
| - | docker-compose.yml | ✅ 완료 |
| - | docker-compose.dev.yml | ✅ 완료 |

---

## 미구현 / 스킵

### 스킵된 항목 (MVP에서 불필요)

| 이슈 | 제목 | 이유 |
|------|------|------|
| BE-003 | 로컬 인증 (Single-User) | Self-hosted MVP에서 인증 없이 사용 |
| FE-002 | 로그인 UI | 인증 스킵으로 불필요 |

### 향후 구현 예정 (Sprint 2)

| 이슈 | 제목 | 우선순위 |
|------|------|---------|
| FE-005 | 대시보드 활동 로그 UI | P2 |
| FE-006 | 설정 페이지 (수정 기능) | P2 |
| BE-015 | 단위 테스트 | P1 |
| BE-016 | E2E 테스트 | P2 |
| INFRA-002 | 마이그레이션 자동화 | P1 |

---

## 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| **Frontend** | Next.js | 16.1.6 |
| | React | 19.x |
| | Tailwind CSS | 4.x |
| | SWR | 2.4.0 |
| **Backend** | NestJS | 11.x |
| | Drizzle ORM | - |
| | BullMQ | - |
| **Database** | SQLite | better-sqlite3 |
| **Cache/Queue** | Redis | 7-alpine |
| **AI** | OpenAI / Anthropic / Google AI | Multi-provider |
| **Monorepo** | Turborepo | 2.8.3 |
| | pnpm | 9.15.0 |

---

## 프로젝트 구조

```
sprintghost/
├── apps/
│   └── web/                    # Next.js 16 Frontend
│       └── src/
│           ├── app/            # App Router 페이지
│           ├── components/     # React 컴포넌트
│           ├── hooks/          # SWR 훅
│           └── lib/            # API 클라이언트, 유틸
├── services/
│   └── api/                    # NestJS Backend
│       └── src/
│           ├── ai/             # AI 멀티 프로바이더
│           ├── database/       # Drizzle ORM + SQLite
│           ├── integrations/   # GitHub, Jira, Slack
│           ├── projects/       # 프로젝트 CRUD
│           ├── scheduler/      # BullMQ 스케줄러
│           └── webhook/        # GitHub Webhook 핸들러
├── packages/
│   ├── ui/                     # 공유 UI 컴포넌트
│   ├── types/                  # 공유 TypeScript 타입
│   └── config/                 # ESLint, Prettier, Tailwind, TS
├── docker/
│   ├── nextjs.Dockerfile
│   └── nestjs.Dockerfile
├── docker-compose.yml
└── docker-compose.dev.yml
```

---

## 실행 방법

### 개발 환경

```bash
# 의존성 설치
pnpm install

# 환경변수 설정
cp .env.example .env

# Redis 실행 (Docker)
docker-compose -f docker-compose.dev.yml up -d

# 개발 서버 실행
pnpm dev
```

- Frontend: http://localhost:8080
- Backend: http://localhost:3000

### Docker 배포

```bash
# 환경변수 설정
cp .env.example .env
# ENCRYPTION_SECRET 설정 필수

# 빌드 및 실행
docker-compose up -d
```

---

## 핵심 기능 흐름

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub PR 생성                                              │
│  └─ Webhook → SprintGhost API                               │
│      ├─ AI 코드 리뷰 생성 → GitHub 코멘트                    │
│      ├─ DOD 체크리스트 검증                                  │
│      └─ Slack 알림                                          │
├─────────────────────────────────────────────────────────────┤
│  GitHub PR 머지                                              │
│  └─ Webhook → SprintGhost API                               │
│      ├─ Jira 이슈 상태 → Done 자동 전환                      │
│      ├─ Jira 코멘트 추가                                     │
│      └─ Slack 알림                                          │
├─────────────────────────────────────────────────────────────┤
│  Daily Scrum (스케줄)                                        │
│  └─ BullMQ Cron Job                                         │
│      ├─ Jira "In Progress" 이슈 조회                        │
│      ├─ AI 요약 생성                                         │
│      └─ Slack 알림                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-02-06 | FE 토큰 취득 가이드 링크 추가 |
| 2026-02-06 | Docker 빌드 에러 수정 (standalone, turbo.json) |
| 2026-02-06 | React 타입 충돌 해결 (pnpm overrides) |
| 2026-02-05 | Backend API 구현 완료 |
| 2026-02-05 | Frontend API 연동 완료 |
