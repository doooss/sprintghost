# 👻 SprintGhost - Issue Backlog

> FE = Frontend (apps/web) | BE = Backend (services/api)

---

## 🔐 인증 전략 (Self-Hosted)

### MVP: Personal Access Token (PAT) 방식

OAuth App 설정 없이 바로 사용 가능한 단순화된 인증

```
┌─────────────────────────────────────────────────────────────┐
│  Self-Hosted 인증 플로우                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 간단한 로컬 인증 (이메일/비밀번호 또는 Single-User)      │
│                                                             │
│  2. 프로젝트 등록 시 GitHub PAT 입력                         │
│     ┌─────────────────────────────────────────────────┐    │
│     │  GitHub Personal Access Token                   │    │
│     │  [ ghp_xxxxxxxxxxxxxxxxxxxxxxxx              ]  │    │
│     │                                                 │    │
│     │  📝 발급: github.com/settings/tokens            │    │
│     │  필요 권한: repo, workflow                      │    │
│     └─────────────────────────────────────────────────┘    │
│                                                             │
│  3. PAT로 GitHub API 호출 (repo 목록, workflow 생성 등)      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**장점:**

- OAuth App 생성 불필요
- Self-hosting 진입장벽 낮음
- 환경변수 설정 최소화

**향후 확장:**

- Phase 2+: OAuth 옵션 추가 (환경변수로 Client ID/Secret 설정 시)

---

## 🏗️ Phase 1: 프로젝트 기반 구축

### BE-001: Database 스키마 및 Drizzle 설정 + Redis

**Type:** Feature | **Priority:** P0 | **Estimate:** 2h

Drizzle ORM + SQLite 설정, 기본 스키마, Redis 설정

**Tasks:**

- [ ] Drizzle ORM 패키지 설치 (`drizzle-orm`, `drizzle-kit`, `better-sqlite3`)
- [ ] `drizzle.config.ts` 설정 (SQLite)
- [ ] Database Module 생성 (`database.module.ts`, `drizzle.provider.ts`)
- [ ] 스키마 파일 생성
  - [ ] `schema/users.ts` - User 테이블 (로컬 인증용)
  - [ ] `schema/projects.ts` - Project 테이블 (GitHub PAT 포함)
  - [ ] `schema/project-members.ts` - ProjectMember 테이블
  - [ ] `schema/activity-logs.ts` - ActivityLog 테이블
  - [ ] `schema/index.ts` - export
- [ ] 초기 마이그레이션 생성 및 실행
- [ ] `docker-compose.dev.yml` 업데이트 (Redis only)
- [ ] Redis 연결 테스트
- [ ] SQLite DB 파일 경로 설정 (`./data/sprintghost.db`)

**Schema 변경 (PAT 방식):**

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// projects 테이블에 githubToken 추가
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // ... 기존 필드
  githubToken: text('github_token').notNull(), // PAT (암호화 저장)
  githubRepo: text('github_repo').notNull(),
  // Jira 스프린트 fallback 설정
  jiraFallbackEnabled: integer('jira_fallback_enabled', { mode: 'boolean' }).default(true),
  jiraFallbackDays: integer('jira_fallback_days').default(7), // 스프린트 없을 때 조회 기간
  // ...
});
```

**Acceptance Criteria:**

- `pnpm --filter=api drizzle-kit push` 실행 시 테이블 생성됨
- `pnpm --filter=api drizzle-kit studio`로 DB GUI 접근 가능
- SQLite DB 파일이 `./data/` 디렉토리에 생성됨

---

### BE-002: 공통 모듈 구현 (Crypto, Config)

**Type:** Feature | **Priority:** P0 | **Estimate:** 1.5h

암호화 서비스 및 환경설정 모듈 구현

**Tasks:**

- [ ] `@nestjs/config` 설치 및 ConfigModule 설정
- [ ] CryptoService 구현 (AES-256-GCM)
  - [ ] `encrypt(plainText: string): string`
  - [ ] `decrypt(cipherText: string): string`
- [ ] 환경변수 스키마 정의 (`.env.example` 업데이트)

**Acceptance Criteria:**

- 토큰 암호화/복호화 테스트 통과
- `ENCRYPTION_KEY` 환경변수 없으면 서버 시작 실패

---

### FE-001: 프로젝트 기본 레이아웃 및 라우팅

**Type:** Feature | **Priority:** P0 | **Estimate:** 2h

Next.js App Router 기반 레이아웃 및 페이지 구조 설정

**Tasks:**

- [ ] 공통 레이아웃 컴포넌트 (`layout.tsx`)
  - [ ] Header (로고, 네비게이션)
  - [ ] Footer
- [ ] 페이지 라우팅 구조 생성
  - [ ] `/` - 랜딩 페이지
  - [ ] `/dashboard` - 대시보드
  - [ ] `/projects` - 프로젝트 목록
  - [ ] `/projects/new` - 프로젝트 등록
  - [ ] `/projects/[id]` - 프로젝트 상세
  - [ ] `/settings` - 설정 (Single-User 모드)
- [ ] Tailwind CSS 기본 테마 설정

**Acceptance Criteria:**

- 모든 라우트 접근 가능
- 반응형 레이아웃 (mobile/desktop)

---

## 🔐 Phase 2: 인증 시스템 (Simple Auth)

### BE-003: 로컬 인증 구현 (Single-User / Simple Auth)

**Type:** Feature | **Priority:** P0 | **Estimate:** 2h

Self-Hosted를 위한 간단한 로컬 인증

**Tasks:**

- [ ] AuthModule 생성
  - [ ] `auth.module.ts`
  - [ ] `auth.controller.ts`
  - [ ] `auth.service.ts`
- [ ] 인증 모드 선택 (환경변수)
  - [ ] `AUTH_MODE=single` - 단일 사용자 (인증 skip)
  - [ ] `AUTH_MODE=local` - 이메일/비밀번호
- [ ] Single-User 모드
  - [ ] 환경변수로 admin 계정 설정 (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
  - [ ] 첫 접근 시 자동 로그인 또는 비밀번호만 입력
- [ ] Local 모드 (선택적)
  - [ ] 회원가입/로그인 API
  - [ ] bcrypt 비밀번호 해싱
- [ ] JWT 토큰 발급
- [ ] AuthGuard 구현

**Acceptance Criteria:**

- Single-User 모드에서 인증 없이 사용 가능
- Local 모드에서 이메일/비밀번호 로그인 동작

---

### FE-002: 로그인 UI (Simple)

**Type:** Feature | **Priority:** P0 | **Estimate:** 1.5h

간단한 로그인 UI

**Tasks:**

- [ ] 로그인 페이지 (`/login`)
  - [ ] Single-User 모드: 비밀번호만 입력 또는 자동 진입
  - [ ] Local 모드: 이메일/비밀번호 폼
- [ ] 인증 상태 관리 (Context 또는 Zustand)
  - [ ] `useAuth` hook
  - [ ] `isAuthenticated`, `user`, `login`, `logout`
- [ ] 인증 필요 페이지 보호 (middleware)

**Acceptance Criteria:**

- AUTH_MODE에 따른 UI 분기
- 로그인 후 대시보드로 이동

---

## 📝 Phase 3: 프로젝트 관리

### BE-004: Projects CRUD API

**Type:** Feature | **Priority:** P0 | **Estimate:** 3h

프로젝트 생성/조회/수정/삭제 API

**Tasks:**

- [ ] ProjectsModule 생성
  - [ ] `projects.module.ts`
  - [ ] `projects.controller.ts`
  - [ ] `projects.service.ts`
- [ ] DTO 정의
  - [ ] `CreateProjectDto`
    - [ ] GitHub: token, repo, targetBranches
    - [ ] Jira: baseUrl, email, apiToken, projectKey
    - [ ] Slack: webhookUrl
    - [ ] Alert: days, time, timezone, actions
    - [ ] PR Merge: slackNotify, jiraComment, jiraTransition
    - [ ] AI: provider, model, apiKey (optional)
  - [ ] `UpdateProjectDto`
- [ ] 엔드포인트 구현
  - [ ] `POST /projects` - 생성
  - [ ] `GET /projects` - 목록
  - [ ] `GET /projects/:id` - 상세
  - [ ] `PATCH /projects/:id` - 수정
  - [ ] `DELETE /projects/:id` - 삭제
- [ ] 민감 정보 암호화 저장 (GitHub PAT, Jira Token, AI API Key)
- [ ] GitHub PAT 유효성 검증 API 호출

**Acceptance Criteria:**

- 프로젝트 CRUD 동작
- GitHub PAT 암호화 저장

---

### BE-005: GitHub API 연동 (PAT 기반)

**Type:** Feature | **Priority:** P0 | **Estimate:** 3h

프로젝트별 GitHub PAT를 사용한 API 연동

**Tasks:**

- [ ] GitHubModule 생성
  - [ ] `github.module.ts`
  - [ ] `github.service.ts`
- [ ] GitHub API 클라이언트 (`@octokit/rest`)
- [ ] 기능 구현 (PAT 기반)
  - [ ] `validateToken(token)` - PAT 유효성 검증
  - [ ] `listRepositories(token)` - 사용자 레포 목록
  - [ ] `listBranches(token, repo)` - 레포 브랜치 목록
  - [ ] `createWorkflowFile(token, repo, content)` - Workflow 파일 생성
  - [ ] `createRepositorySecret(token, repo, name, value)` - Secret 등록
  - [ ] `deleteWorkflowFile(token, repo)` - Workflow 파일 삭제
- [ ] Workflow 템플릿 (`sprint-ghost.yml`)
  - [ ] Target branches 설정 반영
  ```yaml
  on:
    pull_request:
      branches: ${{ env.TARGET_BRANCHES }}  # ['main', 'master']
      types: [opened, synchronize]
    push:
      branches: ${{ env.TARGET_BRANCHES }}
  ```

**Acceptance Criteria:**

- PAT로 GitHub API 호출 성공
- 프로젝트 활성화 시 Workflow 자동 생성
- Target branches 설정이 Workflow에 반영됨

---

### FE-003: 프로젝트 등록 Wizard UI

**Type:** Feature | **Priority:** P0 | **Estimate:** 6h

프로젝트 등록 마법사 UI (PAT 방식)

**Tasks:**

- [ ] Step 1: GitHub 연동 (PAT)
  - [ ] GitHub PAT 입력 필드
  - [ ] PAT 발급 가이드 링크
  - [ ] PAT 유효성 검증 버튼
  - [ ] 검증 성공 시 Repository 선택 드롭다운 표시
  - [ ] Target Branches 선택 (multi-select)
    - [ ] 기본값: `['main', 'master']`
    - [ ] 커스텀 브랜치 추가 기능
- [ ] Step 2: Jira 연동
  - [ ] Base URL 입력
  - [ ] Email 입력
  - [ ] API Token 입력 (password type)
  - [ ] Project Key 입력
  - [ ] 연결 테스트 버튼
  - [ ] 데일리 스크럼 대상 설정
    - [ ] 라디오: "활성 스프린트만" / "활성 스프린트 (없으면 최근 이슈)" (기본값)
    - [ ] Fallback 조회 기간 입력 (기본값: 7일)
- [ ] Step 3: Slack 연동
  - [ ] Webhook URL 입력
  - [ ] 테스트 메시지 발송 버튼
- [ ] Step 4: 알람 설정
  - [ ] 알람 요일 선택 (월~일 체크박스)
  - [ ] 알람 시간 입력 (HH:mm → unix seconds 변환)
  - [ ] 타임존 선택 (IANA timezone)
  - [ ] 알람 액션 선택
    - [ ] 📅 데일리 스크럼 (checkbox)
    - [ ] 🔍 PR 스크럼 리뷰 (checkbox)
    - [ ] 🔄 PR 머지 액션 (expandable)
      - [ ] 📢 Slack 알림 (checkbox, 기본 ON)
      - [ ] 💬 Jira 코멘트 (checkbox, 기본 ON)
      - [ ] 🔄 Jira 상태 변경 (checkbox, 기본 OFF)
        - [ ] 변경 가능 상태 선택 (multi-select)
        - [ ] Target 상태 입력 (기본: Done)
- [ ] Step 5: AI 설정 (Optional)
  - [ ] Provider 선택 (OpenAI/Anthropic/Google)
  - [ ] API Key 입력
- [ ] "활성화" 버튼 → API 호출 → 완료 화면
- [ ] Form validation (react-hook-form + zod)

**Acceptance Criteria:**

- PAT 입력 후 repo 목록 조회 가능
- Target branches 설정 가능
- 단계별 진행 상태 표시
- 활성화 완료 후 프로젝트 상세 페이지로 이동
- 알람 설정이 BullMQ 스케줄로 등록됨

---

### FE-004: 프로젝트 목록 및 상세 페이지

**Type:** Feature | **Priority:** P1 | **Estimate:** 2.5h

프로젝트 목록 및 상세 정보 조회 UI

**Tasks:**

- [ ] 프로젝트 목록 페이지 (`/projects`)
  - [ ] 카드 형태 목록
  - [ ] 상태 표시 (활성/비활성)
  - [ ] 새 프로젝트 버튼
- [ ] 프로젝트 상세 페이지 (`/projects/[id]`)
  - [ ] 기본 정보 표시
  - [ ] 연동 상태 (GitHub, Jira, Slack)
  - [ ] 설정 수정 버튼
  - [ ] 비활성화/삭제 버튼
- [ ] 대시보드 (`/dashboard`)
  - [ ] 프로젝트 요약 카드
  - [ ] 최근 활동 로그 (Phase 6에서 구현)

**Acceptance Criteria:**

- 프로젝트 목록 로딩/에러/빈 상태 처리
- 프로젝트 상세 정보 정확히 표시

---

## 🔗 Phase 4: 외부 서비스 연동

### BE-006: Jira API 클라이언트

**Type:** Feature | **Priority:** P0 | **Estimate:** 3h

Jira REST API 연동 모듈 (스프린트 Fallback 지원)

**Tasks:**

- [ ] JiraModule 생성
  - [ ] `jira.module.ts`
  - [ ] `jira.service.ts`
- [ ] Jira API 클라이언트 (axios + Basic Auth)
- [ ] 기능 구현
  - [ ] `testConnection()` - 연결 테스트
  - [ ] `getIssue(issueKey)` - 이슈 상세 조회
  - [ ] `getActiveSprintIssues(projectKey)` - 활성 스프린트 이슈 (JQL 기반)
  - [ ] `getRecentIssues(projectKey, days)` - 최근 N일 내 업데이트된 이슈 (Fallback)
  - [ ] `getDailyScrumIssues(project)` - 스프린트 또는 Fallback 자동 선택
  - [ ] `transitionIssue(issueKey, transitionId)` - 상태 변경
  - [ ] `addComment(issueKey, comment)` - 코멘트 추가
- [ ] Jira 이슈 키 파싱 유틸 (`extractJiraKeys(text)`)

**JQL 쿼리:**

```typescript
// 활성 스프린트 모드
const sprintJql = `project = ${projectKey} AND sprint in openSprints() ORDER BY updated DESC`;

// Fallback 모드 (최근 N일 내 업데이트된 이슈)
const fallbackJql = `project = ${projectKey}
  AND updated >= -${days}d
  AND status NOT IN (Done, Closed)
  AND issuetype IN (Story, Task, Bug)
  ORDER BY updated DESC`;
```

**getDailyScrumIssues 로직:**

```typescript
async getDailyScrumIssues(project: Project): Promise<{ issues: JiraIssue[]; mode: 'sprint' | 'fallback' }> {
  // 1. 활성 스프린트 이슈 조회 시도
  const sprintIssues = await this.getActiveSprintIssues(project.jiraProjectKey);

  if (sprintIssues.length > 0) {
    return { issues: sprintIssues, mode: 'sprint' };
  }

  // 2. Fallback 모드 (설정 활성화 시)
  if (project.jiraFallbackEnabled) {
    const fallbackIssues = await this.getRecentIssues(
      project.jiraProjectKey,
      project.jiraFallbackDays
    );
    return { issues: fallbackIssues, mode: 'fallback' };
  }

  return { issues: [], mode: 'sprint' };
}
```

**Acceptance Criteria:**

- Jira 이슈 조회 동작
- 활성 스프린트 없을 때 자동 Fallback
- 잘못된 credentials 시 명확한 에러 반환

---

### BE-007: Slack Webhook 클라이언트

**Type:** Feature | **Priority:** P0 | **Estimate:** 1h

Slack Incoming Webhook 연동

**Tasks:**

- [ ] SlackModule 생성
  - [ ] `slack.module.ts`
  - [ ] `slack.service.ts`
- [ ] 기능 구현
  - [ ] `sendMessage(webhookUrl, message)` - 메시지 발송
  - [ ] `sendTestMessage(webhookUrl)` - 테스트 메시지
- [ ] 메시지 템플릿 (Block Kit)
  - [ ] PR 리뷰 결과
  - [ ] 데일리 스크럼
  - [ ] PR 머지 알림

**Acceptance Criteria:**

- Slack 메시지 정상 발송
- Block Kit 포맷 적용

---

### BE-008: AI 클라이언트 (Multi-Provider)

**Type:** Feature | **Priority:** P0 | **Estimate:** 3h

OpenAI / Anthropic / Google AI 통합 클라이언트

**Tasks:**

- [ ] AiModule 생성
  - [ ] `ai.module.ts`
  - [ ] `ai.service.ts` (Factory Pattern)
- [ ] Provider 구현
  - [ ] `providers/openai.provider.ts`
  - [ ] `providers/anthropic.provider.ts`
  - [ ] `providers/google.provider.ts`
- [ ] 공통 인터페이스
  ```typescript
  interface AiProvider {
    analyze(prompt: string, context: string): Promise<string>;
  }
  ```
- [ ] 프롬프트 템플릿 (`prompts/`)
  - [ ] `pr-review.txt` - PR 스크럼 리뷰
  - [ ] `daily-summary.txt` - 데일리 스크럼 요약

**Acceptance Criteria:**

- Provider 교체 시 코드 변경 없이 동작
- 프롬프트 템플릿 외부 파일로 관리

---

## 🎯 Phase 5: 핵심 기능 구현

### BE-009: Webhook 수신 및 라우팅

**Type:** Feature | **Priority:** P0 | **Estimate:** 2h

GitHub Webhook 이벤트 수신 및 핸들러 라우팅

**Tasks:**

- [ ] WebhookModule 생성
  - [ ] `webhook.module.ts`
  - [ ] `webhook.controller.ts`
  - [ ] `webhook.service.ts`
- [ ] ProjectKeyGuard 구현 (X-Project-Key 헤더 검증)
- [ ] 엔드포인트: `POST /webhook`
- [ ] 이벤트 라우팅
  - [ ] `pull_request.opened` → PrOpenedHandler
  - [ ] `pull_request.closed` (merged) → PrMergedHandler
  - [ ] `schedule` → DailyScrumHandler

**Acceptance Criteria:**

- 유효하지 않은 projectKey 시 401 반환
- 이벤트 타입별 올바른 핸들러 호출

---

### BE-010: PR 생성 시 스크럼 리뷰 핸들러

**Type:** Feature | **Priority:** P0 | **Estimate:** 3h

PR 생성 시 Jira 이슈 분석 및 AI 리뷰

**Tasks:**

- [ ] `handlers/pr-opened.handler.ts` 구현
- [ ] 플로우
  1. PR 제목/본문에서 Jira 이슈 키 추출
  2. Jira API로 이슈 상세 조회
  3. AI에 스크럼 관점 분석 요청
  4. GitHub PR에 코멘트 작성 (프로젝트 PAT 사용)
  5. Slack 알림 발송
- [ ] 에러 처리 (Jira 이슈 없음, AI 실패 등)

**Acceptance Criteria:**

- PR 생성 시 자동 리뷰 코멘트
- Slack에 분석 결과 전송

---

### BE-011: 데일리 스크럼 핸들러 (BullMQ)

**Type:** Feature | **Priority:** P0 | **Estimate:** 4.5h

BullMQ 기반 프로젝트별 스케줄링 및 데일리 스크럼 (스프린트 Fallback 지원)

**Tasks:**

- [ ] BullMQ 설정
  - [ ] `@nestjs/bullmq`, `bullmq` 패키지 설치
  - [ ] BullModule 설정 (Redis 연결)
  - [ ] `daily-scrum` Queue 생성
- [ ] SchedulerService 구현
  - [ ] `registerProjectSchedule(projectId)` - Repeatable Job 등록
  - [ ] `updateProjectSchedule(projectId)` - 스케줄 업데이트
  - [ ] `removeProjectSchedule(projectId)` - 스케줄 제거
- [ ] Cron 패턴 생성 유틸
  ```typescript
  buildCronPattern(alertTime: number, alertDays: string[]): string
  // 예: (32400, ['MON','TUE','WED','THU','FRI']) → "0 9 * * 1,2,3,4,5"
  ```
- [ ] DailyScrumProcessor 구현 (`@Processor('daily-scrum')`)
  - [ ] `jiraService.getDailyScrumIssues(project)` 호출 (스프린트/Fallback 자동 선택)
  - [ ] 반환된 mode에 따라 Slack 메시지 헤더 분기
  - [ ] 상태별 집계 (완료/진행중/블로커)
  - [ ] AI 요약 생성
  - [ ] Slack 발송
- [ ] alertActions 분기 처리 (`DAILY_SCRUM` 활성화 시에만 등록)
- [ ] (선택) Bull Board 대시보드 연동

**스케줄 등록 예시:**

```typescript
await this.queue.upsertJobScheduler(
  `daily-scrum-${projectId}`,
  {
    pattern: buildCronPattern(project.alertTime, project.alertDays),
    tz: project.alertTimezone,  // 프로젝트별 타임존
  },
  { name: 'daily-scrum', data: { projectId } }
);
```

**DailyScrumProcessor 플로우:**

```
DailyScrumProcessor.process(job)
    │
    ├─ project 조회
    │
    ├─ jiraService.getDailyScrumIssues(project)
    │   │
    │   ├─ 활성 스프린트 있음 → { issues, mode: 'sprint' }
    │   │
    │   └─ 활성 스프린트 없음
    │       │
    │       ├─ fallbackEnabled: true → { issues, mode: 'fallback' }
    │       │
    │       └─ fallbackEnabled: false → { issues: [], mode: 'sprint' }
    │
    ├─ issues 비어있음? → Slack "이슈 없음" 알림 후 종료
    │
    ├─ 상태별 집계 (Todo/In Progress/Done/Blocked)
    │
    ├─ AI 요약 생성
    │
    └─ Slack 발송 (mode에 따라 헤더 분기)
        │
        ├─ mode: 'sprint'   → "📅 Daily Scrum - Sprint 23"
        │
        └─ mode: 'fallback' → "📅 Daily Scrum - 최근 7일 이슈 현황"
                              + "⚠️ 활성 스프린트 없음"
```

**Acceptance Criteria:**

- 프로젝트별 설정된 시간/요일/타임존에 실행
- 서버 재시작 후에도 스케줄 유지 (Redis 저장)
- 프로젝트 설정 변경 시 스케줄 자동 업데이트
- 활성 스프린트 없을 때 Fallback 모드로 자동 전환
- Slack 메시지에 현재 모드(스프린트/Fallback) 표시

---

### BE-012: PR 머지 핸들러 (세분화된 액션)

**Type:** Feature | **Priority:** P1 | **Estimate:** 3.5h

PR 머지 시 설정에 따른 세분화된 액션 처리

**Tasks:**

- [ ] `handlers/pr-merged.handler.ts` 구현
- [ ] Target Branch 검증
  - [ ] PR의 base branch가 `targetBranches`에 포함되는지 확인
  - [ ] 포함되지 않으면 모든 액션 스킵
- [ ] Jira 이슈 키 추출
  - [ ] PR 제목/본문에서 이슈 키 파싱 (PROJ-123)
  - [ ] 복수 이슈 지원 (PROJ-123, PROJ-124)
  - [ ] 이슈 키 없으면 로그만 남기고 스킵
- [ ] 액션별 처리 (설정에 따라 분기)
  ```typescript
  // 1. Slack 알림 (prMerge.slackNotify)
  if (settings.prMerge.slackNotify) {
    await this.slackService.sendMergeNotification(...);
  }

  // 2. Jira 코멘트 (prMerge.jiraComment)
  if (settings.prMerge.jiraComment) {
    await this.jiraService.addComment(issueKey, prLink);
  }

  // 3. Jira 상태 변경 (prMerge.jiraTransition)
  if (settings.prMerge.jiraTransition?.enabled) {
    await this.handleJiraTransition(issueKey, settings);
  }
  ```
- [ ] Jira 상태 변경 로직
  - [ ] 현재 이슈 상태 조회
  - [ ] 이미 Done이면 스킵
  - [ ] `allowedFromStatuses`에 현재 상태가 포함되어 있는지 확인
  - [ ] 포함되면 `targetStatus`로 전환
  - [ ] 포함 안되면 스킵 (로그 남김)
- [ ] Jira Transition ID 조회 로직
  - [ ] `GET /rest/api/3/issue/{issueKey}/transitions`
  - [ ] `targetStatus` 이름과 매칭되는 transition 찾기
- [ ] 에러 처리
  - [ ] Jira API 실패 시 Slack 에러 알림
  - [ ] 개별 이슈 실패해도 다른 이슈는 계속 처리

**플로우:**

```
PR Merged
    │
    ├─ Target Branch 체크 ─── (미포함) ──▶ SKIP
    │
    ├─ Jira 이슈 키 추출 ─── (없음) ──▶ SKIP (로그)
    │
    ├─ 각 이슈에 대해:
    │   │
    │   ├─ [slackNotify] ──▶ Slack 알림 발송
    │   │
    │   ├─ [jiraComment] ──▶ Jira에 PR 링크 코멘트
    │   │
    │   └─ [jiraTransition]
    │       │
    │       ├─ 현재 상태 조회
    │       │
    │       ├─ Done? ──▶ SKIP
    │       │
    │       ├─ allowedFromStatuses? ──▶ (미포함) ──▶ SKIP (로그)
    │       │
    │       └─ targetStatus로 전환
    │
    └─ Activity Log 저장
```

**Acceptance Criteria:**

- Target Branch가 아닌 경우 모든 액션 스킵
- PR에 여러 Jira 이슈가 있으면 모두 처리
- 각 액션이 설정에 따라 독립적으로 동작
- allowedFromStatuses에 없는 상태의 이슈는 상태 변경 스킵
- 이미 Done인 이슈는 상태 변경 스킵
- Jira 전환 실패 시 Slack 에러 알림

---

### BE-013: PR DOD 체크리스트 검증

**Type:** Feature | **Priority:** P1 | **Estimate:** 3h

PR 생성 시 Jira 이슈의 DOD/Acceptance Criteria를 체크리스트로 검증

**Tasks:**

- [ ] Jira 이슈에서 DOD 추출 로직
  - [ ] Description 파싱 (체크박스/리스트 형식)
  - [ ] Custom Field 지원 (Acceptance Criteria 등)
- [ ] AI에 DOD 충족 여부 분석 요청
  - [ ] PR 변경사항과 DOD 항목 매칭
  - [ ] 각 DOD 항목 충족 여부 판단
- [ ] PR 코멘트에 체크리스트 형태로 작성
  ```markdown
  ## 📋 DOD Checklist (PROJ-123)

  - [x] 사용자 로그인 기능 구현
  - [x] 입력값 validation 추가
  - [ ] ⚠️ 단위 테스트 작성 (미확인)
  ```
- [ ] GitHub Commit Status API로 결과 표시
- [ ] (선택) 필수 DOD 미충족 시 머지 블록

**Acceptance Criteria:**

- PR에 DOD 체크리스트 코멘트 자동 생성
- 미충족 항목 시각적 표시
- alertActions의 `PR_REVIEW` 활성화 시에만 동작

---

### BE-014: Activity Log 저장 및 조회

**Type:** Feature | **Priority:** P2 | **Estimate:** 2h

활동 로그 저장 및 API

**Tasks:**

- [ ] ActivityLogService 구현
  - [ ] `log(projectId, type, data)` - 로그 저장
  - [ ] `getByProject(projectId, limit, offset)` - 프로젝트별 조회
- [ ] 로그 타입 정의
  ```typescript
  type ActivityType =
    | 'PR_REVIEW'      // PR 리뷰 완료
    | 'PR_MERGED'      // PR 머지 처리
    | 'DAILY_SCRUM'    // 데일리 스크럼 발송
    | 'DOD_CHECK'      // DOD 체크리스트 검증
    | 'PROJECT_CREATED'
    | 'PROJECT_UPDATED';
  ```
- [ ] 각 핸들러에서 ActivityLogService 호출
- [ ] API 엔드포인트: `GET /projects/:id/activities`

**Acceptance Criteria:**

- 모든 주요 이벤트 로그 저장
- 프로젝트별 활동 히스토리 조회 가능

---

## 🎨 Phase 6: UI 완성 및 개선

### FE-005: 대시보드 활동 로그

**Type:** Feature | **Priority:** P2 | **Estimate:** 2h

프로젝트 활동 히스토리 표시

**Tasks:**

- [ ] BE-014 Activity Log API 연동
- [ ] 타임라인 UI 컴포넌트
- [ ] 활동 타입별 아이콘/색상
  - [ ] PR_REVIEW: 🔍
  - [ ] PR_MERGED: 🔀
  - [ ] DAILY_SCRUM: 📅
  - [ ] DOD_CHECK: ✅

---

### FE-006: 설정 페이지

**Type:** Feature | **Priority:** P2 | **Estimate:** 2h

프로젝트 설정 수정 UI

**Tasks:**

- [ ] GitHub PAT 수정 (재입력)
- [ ] Jira 설정 수정
- [ ] Slack Webhook 수정
- [ ] AI 설정 수정
- [ ] 프로젝트 비활성화/재활성화
- [ ] 프로젝트 삭제 (확인 모달)

---

### FE-007: 에러 처리 및 토스트

**Type:** Enhancement | **Priority:** P1 | **Estimate:** 1.5h

글로벌 에러 처리 및 알림 시스템

**Tasks:**

- [ ] Toast 컴포넌트 (또는 sonner 라이브러리)
- [ ] API 에러 글로벌 핸들링
- [ ] 로딩 상태 스켈레톤 UI

---

## 🧪 Phase 7: 테스트 및 배포

### BE-015: 단위 테스트

**Type:** Test | **Priority:** P1 | **Estimate:** 4h

핵심 서비스 단위 테스트

**Tasks:**

- [ ] CryptoService 테스트
- [ ] JiraService 테스트 (mock)
- [ ] AiService 테스트 (mock)
- [ ] Webhook 핸들러 테스트
- [ ] SchedulerService 테스트 (BullMQ mock)

---

### BE-016: E2E 테스트

**Type:** Test | **Priority:** P2 | **Estimate:** 3h

API 엔드포인트 E2E 테스트

**Tasks:**

- [ ] Auth 플로우 테스트
- [ ] Projects CRUD 테스트
- [ ] Webhook 수신 테스트

---

### INFRA-001: Docker 및 CI/CD

**Type:** Infrastructure | **Priority:** P1 | **Estimate:** 3h

Docker 이미지 빌드 및 CI/CD 파이프라인

**Tasks:**

- [ ] Dockerfile 최적화 (multi-stage build)
- [ ] GitHub Actions CI 워크플로우
  - [ ] Lint
  - [ ] Test
  - [ ] Build
- [ ] 배포 워크플로우 (선택: Vercel, Railway, Docker)

---

### INFRA-002: Self-Hosted 마이그레이션 자동화

**Type:** Infrastructure | **Priority:** P1 | **Estimate:** 1.5h

Self-Hosted 배포 시 SQLite DB 마이그레이션 자동화

**Tasks:**

- [ ] `docker-entrypoint.sh` 작성
  ```bash
  #!/bin/sh
  set -e
  echo "📂 Ensuring data directory exists..."
  mkdir -p /app/data
  echo "📦 Running migrations..."
  npx drizzle-kit migrate
  echo "🚀 Starting application..."
  exec "$@"
  ```
- [ ] API Dockerfile 업데이트
  - [ ] Entrypoint 스크립트 복사
  - [ ] `drizzle/migrations` 폴더 포함
  - [ ] `/app/data` 볼륨 마운트 포인트 설정
- [ ] `docker-compose.yml` 업데이트
  - [ ] API depends_on: redis (condition: service_healthy)
  - [ ] `./data:/app/data` 볼륨 마운트 (SQLite 영속성)
- [ ] 마이그레이션 파일 관리 전략
  - [ ] `drizzle-kit generate` 로 마이그레이션 생성
  - [ ] `drizzle/migrations` Git 버전 관리

**Docker Compose 예시:**

```yaml
services:
  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    depends_on:
      redis:
        condition: service_healthy
    volumes:
      - ./data:/app/data  # SQLite DB 영속성
    environment:
      DATABASE_PATH: /app/data/sprintghost.db
      REDIS_URL: redis://redis:6379
```

**Acceptance Criteria:**

- `docker-compose up` 만으로 SQLite DB 파일 및 테이블 자동 생성
- 버전 업그레이드 시 마이그레이션 자동 실행
- `./data/` 폴더에 DB 파일이 영속 저장됨

---

## 📊 이슈 요약

| Phase     | BE Issues | FE Issues | Total |
| --------- | --------- | --------- | ----- |
| Phase 1   | 2         | 1         | 3     |
| Phase 2   | 1         | 1         | 2     |
| Phase 3   | 2         | 2         | 4     |
| Phase 4   | 3         | 0         | 3     |
| Phase 5   | 6         | 0         | 6     |
| Phase 6   | 0         | 3         | 3     |
| Phase 7   | 2         | 0         | 2     |
| Infra     | 2         | 0         | 2     |
| **Total** | **18**    | **7**     | **25** |

### 🐳 인프라 요구사항

| 서비스 | 용도 | Docker Image |
|--------|------|--------------|
| SQLite | 메인 DB | (내장, better-sqlite3) |
| Redis | BullMQ 큐, 캐시 | `redis:7-alpine` |

---

## 🏃 Sprint 1 추천 (MVP)

**목표:** 프로젝트 등록 (PAT) → GitHub Workflow 생성 → PR 리뷰 동작

| Issue  | Title                                   | Priority |
| ------ | --------------------------------------- | -------- |
| BE-001 | Database + Redis 설정                   | P0       |
| BE-002 | 공통 모듈 구현 (Crypto, Config)         | P0       |
| BE-003 | 로컬 인증 구현 (Single-User)            | P0       |
| FE-001 | 프로젝트 기본 레이아웃 및 라우팅        | P0       |
| FE-002 | 로그인 UI (Simple)                      | P0       |
| BE-004 | Projects CRUD API                       | P0       |
| BE-005 | GitHub API 연동 (PAT 기반)              | P0       |
| FE-003 | 프로젝트 등록 Wizard UI (PAT 입력)      | P0       |
| BE-006 | Jira API 클라이언트                     | P0       |
| BE-007 | Slack Webhook 클라이언트                | P0       |
| BE-008 | AI 클라이언트                           | P0       |
| BE-009 | Webhook 수신 및 라우팅                  | P0       |
| BE-010 | PR 생성 시 스크럼 리뷰 핸들러           | P0       |
| BE-011 | 데일리 스크럼 핸들러 (BullMQ)           | P0       |

## 🏃 Sprint 2 추천

**목표:** DOD 체크리스트, PR 머지 자동화, 활동 로그, Self-Hosted 배포 준비

| Issue     | Title                                   | Priority |
| --------- | --------------------------------------- | -------- |
| BE-012    | PR 머지 시 Jira 상태 업데이트           | P1       |
| BE-013    | PR DOD 체크리스트 검증                  | P1       |
| BE-014    | Activity Log 저장 및 조회               | P2       |
| FE-004    | 프로젝트 목록 및 상세 페이지            | P1       |
| FE-005    | 대시보드 활동 로그                      | P2       |
| INFRA-001 | Docker 및 CI/CD                         | P1       |
| INFRA-002 | Self-Hosted 마이그레이션 자동화         | P1       |

---

## 🔮 향후 확장 (Phase 2+)

### AUTH-OPT: GitHub OAuth 옵션 추가

환경변수로 OAuth App 설정 시 OAuth 모드 활성화

**환경변수:**

```env
# OAuth 모드 (설정 시 OAuth 활성화, 미설정 시 PAT 모드)
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

---

**작성일:** 2026-02-06
**버전:** 2.5.0 (Self-Hosted PAT + SQLite + BullMQ + DOD + Auto Migration + PR Merge 세분화 + Sprint Fallback)
