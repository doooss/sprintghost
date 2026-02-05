# 👻 SprintGhost

> _The invisible teammate for your sprints_

[![GitHub Actions](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Next.js](https://img.shields.io/badge/Next.js-16+-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11+-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3+-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**SprintGhost**는 GitHub + Jira + Slack을 연동하여 스크럼 마스터 역할을 자동화하는 Self-Hosted 도구입니다.

유령처럼 조용히 뒤에서 스프린트를 지켜보며, PR 리뷰 · 데일리 스크럼 · 이슈 상태 관리를 자동으로 처리합니다.

---

## ✨ 주요 기능

| 기능                      | 설명                                                              |
| ------------------------- | ----------------------------------------------------------------- |
| 🔍 **PR 스크럼 리뷰**     | PR 생성 시 연관된 Jira 이슈를 분석하고, AI가 스크럼 관점에서 리뷰 |
| 📅 **데일리 스크럼**      | 매일 아침 Slack으로 어제 완료 / 오늘 TODO / 블로커 요약 발송      |
| 🔄 **자동 상태 업데이트** | PR 머지 시 Jira 이슈를 자동으로 Done 상태로 전환 (설정 가능)      |
| ✅ **DOD 체크리스트**     | PR 생성 시 Jira 이슈의 DOD/Acceptance Criteria 검증               |

---

## 🚀 빠른 시작 (Docker)

### 1. 환경 변수 설정

```bash
cp .env.example .env
```

```env
# 필수
REDIS_URL=redis://localhost:6379
ENCRYPTION_SECRET=your-64-hex-character-key  # openssl rand -hex 32

# 선택 (AI Provider - 프로젝트별 설정 가능)
# OPENAI_API_KEY=sk-...
```

### 2. Docker Compose 실행

```bash
docker-compose up -d
```

### 3. 프로젝트 등록

1. `http://localhost:8080` 접속
2. **GitHub PAT 입력** ([발급 방법](https://github.com/settings/tokens) - `repo`, `workflow` 권한 필요)
3. **Jira 정보 입력**
   - Base URL: `https://your-team.atlassian.net`
   - Email: Jira 계정 이메일
   - API Token: [발급 방법](https://id.atlassian.com/manage-profile/security/api-tokens)
4. **Slack Webhook URL 입력** ([발급 방법](https://api.slack.com/messaging/webhooks))
5. **👻 활성화** 클릭

✅ GitHub Action이 자동으로 생성됩니다!

---

## 📸 Slack 메시지 예시

### PR 리뷰

```
👻 [SprintGhost] PR 분석 완료

📌 PR: #42 - 로그인 기능 구현
🎫 Jira: PROJ-123 (로그인 페이지 개발)
👤 작성자: @developer

✅ 스크럼 분석:
• Jira 이슈와 PR 내용 일치 ✓
• 스프린트 목표 부합 ✓
• 작업 크기: 적절함

📋 DOD Checklist:
• [x] 사용자 로그인 기능 구현
• [x] 입력값 validation 추가
• [ ] ⚠️ 단위 테스트 작성 (미확인)
```

### 데일리 스크럼

```
👻 [SprintGhost] 데일리 스크럼 - 2026-02-05 (수)

📊 스프린트 "Sprint 23" 진행률: 45% (D-5)
━━━━━━━━━━━━━━━━━━━━ 45%

📋 어제 완료 (3):
• PROJ-123: 로그인 API 구현 (@kim)
• PROJ-124: 회원가입 UI 개발 (@lee)

🔄 진행 중 (2):
• PROJ-126: 소셜 로그인 연동 (@kim) - 70%
• PROJ-127: 프로필 페이지 (@lee) - 40%

⚠️ 블로커 (1):
• PROJ-127: 디자인 시안 대기 중

💬 현재 페이스 유지 시 스프린트 목표 달성 가능!
```

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      SprintGhost Server                      │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)  │  API (NestJS)   │  Webhook Handler  │
├─────────────────────────────────────────────────────────────┤
│                        Core Modules                          │
│    ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│    │  Jira   │ │ GitHub  │ │   AI    │ │  Slack  │        │
│    │ Module  │ │ Module  │ │ Module  │ │ Module  │        │
│    └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
├─────────────────────────────────────────────────────────────┤
│   SQLite (Drizzle ORM)   │   Redis (BullMQ 스케줄링)        │
└─────────────────────────────────────────────────────────────┘
         │                │                │
         ▼                ▼                ▼
    [ GitHub ]       [ Jira ]         [ Slack ]
```

---

## 🛠️ 개발 환경 설정

### 사전 요구사항

- Node.js 22+
- pnpm 9+
- Docker (Redis용)

### 로컬 개발

```bash
# 1. 저장소 클론
git clone https://github.com/doooss/sprintghost.git
cd sprintghost

# 2. 의존성 설치
pnpm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일 편집

# 4. Redis 실행
docker-compose -f docker-compose.dev.yml up -d

# 5. DB 마이그레이션
pnpm --filter=api drizzle-kit push

# 6. 개발 서버 실행
pnpm dev
```

### 환경 변수

```env
# 필수
ENCRYPTION_SECRET=       # 64 hex chars (openssl rand -hex 32)

# 선택 (기본값 있음)
# DATABASE_PATH=./data/sprintghost.db
# REDIS_URL=redis://localhost:6379
# PORT=3000              # API 서버 포트
# NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 프로젝트 구조

```
sprintghost/
├── apps/
│   └── web/                 # Frontend (Next.js 15)
├── services/
│   └── api/                 # Backend (NestJS 11)
│       ├── src/
│       │   ├── auth/        # 인증 모듈
│       │   ├── projects/    # 프로젝트 CRUD
│       │   ├── webhook/     # GitHub Webhook 핸들러
│       │   ├── integrations/
│       │   │   ├── github/
│       │   │   ├── jira/
│       │   │   ├── slack/
│       │   │   └── ai/
│       │   └── database/    # Drizzle ORM + SQLite
│       └── drizzle.config.ts
├── packages/
│   ├── types/               # 공유 TypeScript 타입
│   ├── eslint-config/
│   └── prettier-config/
├── docker-compose.yml
├── docker-compose.dev.yml
└── turbo.json
```

---

## 🐳 Docker 배포

```yaml
# docker-compose.yml
services:
  web:
    build:
      context: .
      dockerfile: docker/nextjs.Dockerfile
    ports:
      - '8080:8080'
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3000
    depends_on:
      - api

  api:
    build:
      context: .
      dockerfile: docker/nestjs.Dockerfile
    ports:
      - '3000:3000'
    volumes:
      - ./data:/app/data  # SQLite 영속성
    environment:
      - DATABASE_PATH=/app/data/sprintghost.db
      - REDIS_URL=redis://redis:6379
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      redis:
        condition: service_healthy

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  redis_data:
```

```bash
docker-compose up -d
```

---

## ⚡ 기술 스택

| 영역         | 기술                                           |
| ------------ | ---------------------------------------------- |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **Backend**  | NestJS 11, TypeScript                          |
| **Database** | SQLite + Drizzle ORM                           |
| **Queue**    | Redis + BullMQ                                 |
| **인증**     | GitHub PAT (Self-Hosted)                       |
| **AI**       | OpenAI / Anthropic / Google AI                 |
| **배포**     | Docker (Self-Hosted)                           |
| **모노레포** | Turborepo + pnpm workspace                     |

---

## 📄 License

MIT License - 자유롭게 사용, 수정, 배포할 수 있습니다.

---

<p align="center">
  <sub>Built with 👻 by SprintGhost Team</sub>
  <br/>
  <sub>🎵 Vibe Coded with AI</sub>
</p>
