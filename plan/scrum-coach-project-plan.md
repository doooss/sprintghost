# 👻 SprintGhost

> _The invisible teammate for your sprints_

## 📋 프로젝트 개요

**SprintGhost**는 GitHub + Jira + Slack을 연동하여 스크럼 마스터 역할을 자동화하는 AI SaaS입니다.
유령처럼 조용히 뒤에서 스프린트를 지켜보며, PR 리뷰 · 데일리 스크럼 · 이슈 상태 관리를 자동으로 처리합니다.

### 핵심 기능

1. **PR 스크럼 리뷰**: PR 생성 시 연관된 Jira 이슈 분석 → AI가 스크럼 관점에서 리뷰
2. **데일리 스크럼**: 매일 아침 Slack으로 어제 완료 / 오늘 TODO / 블로커 요약 발송
3. **자동 상태 업데이트**: PR 머지 시 Jira 이슈를 Done 상태로 자동 전환

---

## 🎯 사용자 등록 플로우

```
┌─────────────────────────────────────────────────────────────┐
│                  SprintGhost 프로젝트 등록                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1️⃣ GitHub 연동                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [🔗 GitHub 계정 연결하기]                           │   │
│  │                    ↓ 클릭                            │   │
│  │  GitHub OAuth 로그인 + 권한 승인                     │   │
│  │                    ↓                                 │   │
│  │  ✅ 연결됨: @username                                │   │
│  │  Repository: [ my-org/my-project          ▼ ]       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  2️⃣ Jira 연동                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Base URL:   [ https://team.atlassian.net         ] │   │
│  │  Email:      [ user@company.com                   ] │   │
│  │  API Token:  [ ****                               ] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  3️⃣ Slack 연동                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Webhook URL: [ https://hooks.slack.com/...       ] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                  [ 👻 SprintGhost 활성화 ]                   │
│                                                             │
│                          ↓ 클릭 시 자동 처리                 │
│                                                             │
│     ✅ .github/workflows/sprint-ghost.yml 자동 생성됨       │
│     ✅ Repository Secret 자동 등록됨                        │
│     ✅ 프로젝트 활성화 완료!                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### GitHub OAuth 권한 (Scope)

| Scope       | 용도                                           |
| ----------- | ---------------------------------------------- |
| `repo`      | 저장소 읽기/쓰기 (Action 파일 생성, PR 코멘트) |
| `workflow`  | GitHub Actions 워크플로우 수정 권한            |
| `read:user` | 사용자 프로필 정보 읽기                        |

---

## 🏗️ 시스템 아키텍처

```
┌──────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
└──────────────────────────────────────────────────────────────────┘
                    │                              ▲
                    │ 1. OAuth Login               │ 6. 완료 화면
                    ▼                              │
┌──────────────────────────────────────────────────────────────────┐
│                      SprintGhost Server                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │   Frontend     │  │   REST API     │  │   Webhook      │    │
│  │   (Next.js)    │  │   (NestJS)     │  │   Controller   │    │
│  │                │  │                │  │                │    │
│  │  - 대시보드    │  │  - /auth       │  │  - /webhook    │    │
│  │  - 프로젝트    │  │  - /projects   │  │                │    │
│  │    등록 화면   │  │  - /settings   │  │                │    │
│  │                │  │                │  │                │    │
│  │  Port: 8080    │  │  Port: 3000    │  │                │    │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘    │
│          │                   │                   │              │
│          └───────────────────┼───────────────────┘              │
│                              ▼                                  │
│                    ┌──────────────────┐                         │
│                    │   Core Modules   │                         │
│                    │                  │                         │
│                    │  ┌────────────┐  │                         │
│                    │  │ JiraModule │  │                         │
│                    │  └────────────┘  │                         │
│                    │  ┌────────────┐  │                         │
│                    │  │ AiModule   │  │                         │
│                    │  │ (multi)    │  │                         │
│                    │  └────────────┘  │                         │
│                    │  ┌────────────┐  │                         │
│                    │  │SlackModule │  │                         │
│                    │  └────────────┘  │                         │
│                    │  ┌────────────┐  │                         │
│                    │  │GitHubModule│  │                         │
│                    │  └────────────┘  │                         │
│                    └────────┬─────────┘                         │
│                             │                                   │
│                             ▼                                   │
│                    ┌──────────────────┐                         │
│                    │   SQLite         │                         │
│                    │   (Drizzle ORM)  │                         │
│                    │                  │                         │
│                    │  - users         │                         │
│                    │  - projects      │                         │
│                    │  - tokens (암호화)│                         │
│                    └──────────────────┘                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
          │                    │                    │
          │ 2. Workflow 생성   │ 4. API 호출        │ 5. PR 이벤트
          │ 3. Secret 등록     │                    │    수신
          ▼                    ▼                    │
   ┌─────────────┐      ┌─────────────┐            │
   │   GitHub    │      │ Jira / AI   │            │
   │ Repository  │──────│   / Slack   │────────────┘
   └─────────────┘      └─────────────┘
```

---

## 📁 프로젝트 구조 (Turborepo Monorepo)

```
sprintghost/
├── apps/
│   └── web/                            # Frontend (Next.js 15)
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx            # 랜딩 페이지
│       │   │   ├── dashboard/          # 대시보드
│       │   │   ├── projects/           # 프로젝트 관리
│       │   │   │   ├── new/            # 프로젝트 등록
│       │   │   │   └── [id]/           # 프로젝트 상세
│       │   │   └── auth/               # 인증
│       │   │       ├── login/
│       │   │       └── callback/       # OAuth 콜백
│       │   └── components/
│       │       ├── GitHubConnect.tsx
│       │       ├── JiraForm.tsx
│       │       └── SlackForm.tsx
│       └── package.json
│
├── services/
│   └── api/                            # Backend (NestJS 11)
│       ├── src/
│       │   ├── main.ts                 # 진입점
│       │   ├── app.module.ts           # 루트 모듈
│       │   │
│       │   ├── auth/                   # 인증 모듈
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   └── strategies/
│       │   │       └── github.strategy.ts
│       │   │
│       │   ├── projects/               # 프로젝트 모듈
│       │   │   ├── projects.module.ts
│       │   │   ├── projects.controller.ts
│       │   │   ├── projects.service.ts
│       │   │   └── dto/
│       │   │
│       │   ├── webhook/                # Webhook 모듈
│       │   │   ├── webhook.module.ts
│       │   │   ├── webhook.controller.ts
│       │   │   ├── webhook.service.ts
│       │   │   └── handlers/
│       │   │       ├── pr-opened.handler.ts
│       │   │       ├── pr-merged.handler.ts
│       │   │       └── daily-scrum.handler.ts
│       │   │
│       │   ├── integrations/           # 외부 서비스 연동
│       │   │   ├── github/
│       │   │   │   ├── github.module.ts
│       │   │   │   └── github.service.ts
│       │   │   ├── jira/
│       │   │   │   ├── jira.module.ts
│       │   │   │   └── jira.service.ts
│       │   │   ├── slack/
│       │   │   │   ├── slack.module.ts
│       │   │   │   └── slack.service.ts
│       │   │   └── ai/
│       │   │       ├── ai.module.ts
│       │   │       ├── ai.service.ts
│       │   │       └── providers/
│       │   │           ├── openai.provider.ts
│       │   │           ├── anthropic.provider.ts
│       │   │           └── google.provider.ts
│       │   │
│       │   ├── database/               # Drizzle ORM
│       │   │   ├── database.module.ts
│       │   │   ├── drizzle.provider.ts
│       │   │   ├── schema/
│       │   │   │   ├── index.ts
│       │   │   │   ├── users.ts
│       │   │   │   ├── projects.ts
│       │   │   │   └── project-members.ts
│       │   │   └── migrations/
│       │   │
│       │   ├── common/                 # 공통 유틸
│       │   │   ├── crypto/
│       │   │   │   └── crypto.service.ts
│       │   │   ├── guards/
│       │   │   │   └── project-key.guard.ts
│       │   │   └── decorators/
│       │   │
│       │   └── prompts/                # AI 프롬프트
│       │       ├── pr-review.txt
│       │       └── daily-summary.txt
│       │
│       ├── drizzle.config.ts
│       └── package.json
│
├── packages/
│   ├── types/                          # 공유 TypeScript 타입
│   │   └── src/
│   │       ├── index.ts
│   │       ├── user.ts
│   │       ├── project.ts
│   │       └── api-response.ts
│   │
│   └── config/                         # 공유 설정
│       ├── eslint/
│       ├── typescript/
│       └── prettier/
│
├── docker/
│   ├── nextjs.Dockerfile
│   └── nestjs.Dockerfile
│
├── docker-compose.yml
├── docker-compose.dev.yml
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 📊 DB 스키마 (SQLite + Drizzle ORM)

```typescript
// services/api/src/database/schema/users.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  githubId: integer('github_id').unique().notNull(),
  githubLogin: text('github_login').notNull(),
  email: text('email'),
  avatarUrl: text('avatar_url'),

  // GitHub OAuth Token (암호화 저장)
  accessToken: text('access_token').notNull(),

  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`).notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

```typescript
// services/api/src/database/schema/projects.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),

  // GitHub 설정
  githubRepo: text('github_repo').notNull(), // "owner/repo" 형식

  // Jira 설정 (암호화 저장)
  jiraBaseUrl: text('jira_base_url').notNull(),
  jiraEmail: text('jira_email').notNull(),
  jiraApiToken: text('jira_api_token').notNull(),

  // Slack 설정
  slackWebhookUrl: text('slack_webhook_url').notNull(),

  // AI 설정 (암호화 저장)
  aiProvider: text('ai_provider').default('openai').notNull(), // openai | anthropic | google
  aiModel: text('ai_model').default('gpt-4o').notNull(),
  aiApiKey: text('ai_api_key'),

  // Webhook 인증용 키 (UUID 문자열)
  projectKey: text('project_key').unique().notNull(),

  // 상태 (SQLite는 boolean 대신 integer 0/1)
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),

  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`).notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
```

```typescript
// services/api/src/database/schema/project-members.ts
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { projects } from './projects';

export const projectMembers = sqliteTable(
  'project_members',
  {
    projectId: integer('project_id')
      .references(() => projects.id)
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id)
      .notNull(),
    role: text('role').default('owner').notNull(), // owner | admin | member
    createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.userId] }),
  }),
);

export type ProjectMember = typeof projectMembers.$inferSelect;
export type NewProjectMember = typeof projectMembers.$inferInsert;
```

```typescript
// services/api/src/database/schema/index.ts
export * from './users';
export * from './projects';
export * from './project-members';
```

```typescript
// services/api/drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/database/schema/index.ts',
  out: './src/database/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_PATH || './data/sprintghost.db',
  },
} satisfies Config;
```

---

## 🔧 NestJS 모듈 구조

### Database Module (Drizzle + SQLite)

```typescript
// services/api/src/database/database.module.ts
import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

export const DRIZZLE = Symbol('DRIZZLE');

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      useFactory: () => {
        const dbPath = process.env.DATABASE_PATH || './data/sprintghost.db';
        const sqlite = new Database(dbPath);
        sqlite.pragma('journal_mode = WAL'); // 성능 최적화
        return drizzle(sqlite, { schema });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DatabaseModule {}
```

> **참고**: NestJS 전용 모듈 `@knaadh/nestjs-drizzle-better-sqlite3` 사용도 가능

### App Module

```typescript
// services/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { WebhookModule } from './webhook/webhook.module';
import { GitHubModule } from './integrations/github/github.module';
import { JiraModule } from './integrations/jira/jira.module';
import { SlackModule } from './integrations/slack/slack.module';
import { AiModule } from './integrations/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    ProjectsModule,
    WebhookModule,
    GitHubModule,
    JiraModule,
    SlackModule,
    AiModule,
  ],
})
export class AppModule {}
```

---

## 🔄 핵심 플로우

### 1️⃣ 프로젝트 등록 플로우

```
사용자: "활성화" 버튼 클릭
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│  SprintGhost API (NestJS)                                    │
│                                                             │
│  1. ProjectsService.create()                                │
│     - Drizzle로 프로젝트 정보 저장                           │
│     - CryptoService로 Jira/AI 토큰 암호화                    │
│     - projectKey 자동 생성 (UUID)                            │
│                                                             │
│  2. GitHubService.createWorkflowFile()                      │
│     PUT /repos/{owner}/{repo}/contents/                     │
│         .github/workflows/sprint-ghost.yml                   │
│                                                             │
│  3. GitHubService.createRepositorySecret()                  │
│     PUT /repos/{owner}/{repo}/actions/secrets/              │
│         SPRINT_GHOST_PROJECT_KEY                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
         완료! 👻
```

### 생성되는 Workflow 파일

```yaml
# .github/workflows/sprint-ghost.yml
name: 👻 SprintGhost

on:
  pull_request:
    types: [opened, reopened, closed]
  schedule:
    - cron: '0 0 * * 1-5' # UTC 00:00 = KST 09:00, 평일만
  workflow_dispatch: # 수동 실행 가능

jobs:
  sprint-ghost:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger SprintGhost
        env:
          PROJECT_KEY: ${{ secrets.SPRINT_GHOST_PROJECT_KEY }}
        run: |
          curl -X POST \
            -H "Content-Type: application/json" \
            -H "X-Project-Key: $PROJECT_KEY" \
            -H "X-GitHub-Event: ${{ github.event_name }}" \
            -d '${{ toJson(github.event) }}' \
            https://sprintghost.com/api/webhook
```

---

### 2️⃣ PR 생성 시 스크럼 리뷰 플로우

```
GitHub Action 실행 → SprintGhost Webhook 수신
                          │
                          ▼
              ┌─────────────────────────────────┐
              │ WebhookController.handleEvent() │
              │              │                  │
              │              ▼                  │
              │ ProjectKeyGuard (projectKey 검증)│
              │              │                  │
              │              ▼                  │
              │ PrOpenedHandler.handle()        │
              │   1. JiraService.getIssue()     │
              │   2. AiService.analyzePr()      │
              │   3. GitHubService.createComment()│
              │   4. SlackService.sendMessage() │
              └─────────────────────────────────┘
```

**Slack 메시지 예시:**

```
👻 [SprintGhost] PR 분석 완료

📌 PR: #123 - 로그인 기능 구현
🎫 Jira: PROJ-456 (로그인 페이지 개발)
👤 작성자: @doyounglee

✅ 스크럼 분석:
• Jira 이슈와 PR 내용 일치 ✓
• 스프린트 목표 부합 ✓
• 작업 크기: 적절함 (예상 3SP, 실제 유사)

💡 제안:
• 테스트 코드 추가 권장
• @reviewer1 리뷰 추천
```

---

### 3️⃣ 데일리 스크럼 메시지 플로우

```
@Cron('0 0 * * 1-5') → DailyScrumHandler.handleCron()
                          │
                          ▼
              ┌─────────────────────────────────┐
              │ 활성화된 모든 프로젝트 조회       │
              │ (ProjectsService.findActive())  │
              │              │                  │
              │              ▼                  │
              │ 각 프로젝트별:                   │
              │   1. JiraService.getSprintIssues()│
              │   2. AiService.summarizeSprint() │
              │   3. SlackService.sendMessage()  │
              └─────────────────────────────────┘
```

**Slack 메시지 예시:**

```
👻 [SprintGhost] 데일리 스크럼 - 2026-02-05 (수)

📊 스프린트 "Sprint 23" 진행률: 45% (D-5)
━━━━━━━━━━━━━━━━━━━━ 45%

📋 어제 완료 (3):
• PROJ-123: 로그인 API 구현 (@kim)
• PROJ-124: 회원가입 UI 개발 (@lee)
• PROJ-125: 비밀번호 재설정 (@park)

🔄 진행 중 (4):
• PROJ-126: 소셜 로그인 연동 (@kim) - 70%
• PROJ-127: 프로필 페이지 (@lee) - 40%
• PROJ-128: 이메일 인증 (@park) - 30%
• PROJ-129: 권한 관리 (@choi) - 20%

🎯 오늘 TODO:
• PROJ-130: 비밀번호 정책 검증 (@kim)
• PROJ-131: 세션 관리 (@lee)

⚠️ 블로커 (1):
• PROJ-127: 디자인 시안 대기 중

💬 AI 코멘트:
스프린트 중반 진입! 현재 페이스 유지 시 목표 달성 가능.
PROJ-127 블로커 조기 해결 필요.
```

---

### 4️⃣ PR 머지 시 Jira 상태 업데이트 플로우

```
PR 머지 → GitHub Action → WebhookController
                               │
                               ▼
                  ┌─────────────────────────────┐
                  │ PrMergedHandler.handle()    │
                  │   1. JiraService.transitionIssue()│
                  │      (상태 → Done)          │
                  │   2. JiraService.addComment()│
                  │      (PR 링크 첨부)         │
                  │   3. SlackService.sendMessage()│
                  └─────────────────────────────┘
```

---

## 🔐 보안 고려사항

| 항목             | 처리 방식                                          |
| ---------------- | -------------------------------------------------- |
| **토큰 저장**    | AES-256-GCM 암호화 후 DB 저장 (CryptoService)      |
| **Token 갱신**   | GitHub OAuth Token 만료 시 재인증 플로우           |
| **권한 취소**    | 사용자가 GitHub에서 권한 취소 시 프로젝트 비활성화 |
| **Webhook 인증** | ProjectKeyGuard로 요청 검증                        |
| **Rate Limit**   | GitHub API 5000/hour 제한 고려 (ThrottlerModule)   |

---

## ⚡ 기술 스택

| 영역         | 기술                                           |
| ------------ | ---------------------------------------------- |
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend**  | NestJS 11, TypeScript                          |
| **Database** | SQLite (better-sqlite3) + **Drizzle ORM**      |
| **Queue**    | Redis + BullMQ (스케줄링)                      |
| **인증**     | GitHub PAT / Local Auth (JWT)                  |
| **AI**       | OpenAI / Anthropic / Google AI (선택 가능)     |
| **배포**     | Docker (Self-Hosted)                           |
| **모노레포** | Turborepo + pnpm workspace                     |
| **빌드**     | Turbopack (Next.js)                            |

---

## 📦 주요 의존성

### services/api (NestJS)

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/config": "^3.3.0",
    "@nestjs/bullmq": "^10.0.0",
    "bullmq": "^5.0.0",
    "drizzle-orm": "^0.38.0",
    "better-sqlite3": "^11.0.0",
    "@anthropic-ai/sdk": "^0.32.0",
    "openai": "^4.77.0",
    "@google/generative-ai": "^0.21.0",
    "@octokit/rest": "^21.0.0",
    "axios": "^1.7.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0"
  },
  "devDependencies": {
    "drizzle-kit": "^0.30.0",
    "@types/better-sqlite3": "^7.6.0"
  }
}
```

---

## 🚀 배포 전략

### Self-Hosting (Docker) - 권장

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Web      │     │    API      │     │   Redis     │
│  (Next.js)  │────▶│  (NestJS)   │────▶│  (BullMQ)   │
│  Port: 8080 │     │  Port: 3000 │     │  Port: 6379 │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   SQLite    │
                    │ (파일 기반)  │
                    └─────────────┘
```

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
      - ./data:/app/data  # SQLite DB 영속성
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

---

## 📝 Drizzle 마이그레이션 명령어

```bash
# 스키마 변경 후 마이그레이션 생성
pnpm --filter=api drizzle-kit generate

# 마이그레이션 실행
pnpm --filter=api drizzle-kit migrate

# DB Push (개발 환경)
pnpm --filter=api drizzle-kit push

# Drizzle Studio (GUI)
pnpm --filter=api drizzle-kit studio
```

---

## 🔮 향후 확장 가능 기능

1. **스프린트 회고 자동화**: 스프린트 종료 시 회고 리포트 생성
2. **번다운 차트 이미지**: 데일리 메시지에 시각적 차트 첨부
3. **팀 벨로시티 분석**: 과거 스프린트 데이터 기반 예측
4. **GitHub Discussions 연동**: 기술 논의 내용 스크럼에 반영
5. **Confluence 연동**: 스프린트 문서 자동 생성
6. **멀티 Jira 프로젝트**: 하나의 GitHub Repo에 여러 Jira 프로젝트 연동
7. **커스텀 AI 프롬프트**: 팀별 스크럼 스타일에 맞춘 프롬프트 설정

---

## 📚 참고 자료

- [NestJS Documentation](https://docs.nestjs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [GitHub REST API - Contents](https://docs.github.com/en/rest/repos/contents)
- [GitHub REST API - Secrets](https://docs.github.com/en/rest/actions/secrets)
- [Jira REST API 문서](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)

---

**작성일**: 2026-02-05
**버전**: 4.0.0 (Self-Hosted + SQLite + BullMQ + PAT Auth)
