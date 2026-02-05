# 👻 SprintGhost - Frontend Input Specification

프로젝트 등록 시 필요한 입력값 정의

---

## 📋 입력 필드 요약

| 섹션           | 필드                   | 필수 | 타입     |
| -------------- | ---------------------- | ---- | -------- |
| **GitHub**     | PAT                    | ✅   | password |
| **GitHub**     | Repository             | ✅   | select   |
| **GitHub**     | Target Branches        | ✅   | multi-select |
| **Jira**       | Base URL               | ✅   | url      |
| **Jira**       | Email                  | ✅   | email    |
| **Jira**       | API Token              | ✅   | password |
| **Jira**       | Project Key            | ✅   | text     |
| **Slack**      | Webhook URL            | ✅   | url      |
| **Alert**      | 알람 요일              | ✅   | checkbox |
| **Alert**      | 알람 시간              | ✅   | time     |
| **Alert**      | 타임존                 | ✅   | select   |
| **Alert**      | 알람 액션              | ✅   | checkbox |
| **PR Merge**   | Slack 알림             | ❌   | checkbox |
| **PR Merge**   | Jira 코멘트            | ❌   | checkbox |
| **PR Merge**   | Jira 상태 변경         | ❌   | checkbox |
| **PR Merge**   | 변경 가능 상태         | ❌   | multi-select |
| **AI**         | Provider               | ❌   | select   |
| **AI**         | API Key                | ❌   | password |

---

## 1️⃣ GitHub 연동

### Personal Access Token (PAT)

```
┌─────────────────────────────────────────────────────────────┐
│  GitHub Personal Access Token                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PAT *                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx          │   │
│  └─────────────────────────────────────────────────────┘   │
│  📝 발급 방법: github.com/settings/tokens/new              │
│  필요 권한: repo, workflow                                  │
│                                                             │
│  [ 🔍 토큰 검증 ]                                           │
│                                                             │
│  ✅ 검증 완료 - @username                                   │
│                                                             │
│  Repository *                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  my-org/my-project                              ▼   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| 필드       | 설명                      | Validation                            |
| ---------- | ------------------------- | ------------------------------------- |
| PAT        | GitHub Personal Access Token | `ghp_` 또는 `github_pat_` 로 시작    |
| Repository | 연동할 저장소 (owner/repo)   | PAT 검증 후 목록에서 선택            |

### Target Branches (PR 감지 대상)

```
┌─────────────────────────────────────────────────────────────┐
│  PR/Merge 감지 대상 브랜치                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  어떤 브랜치로의 PR을 감지할까요? *                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [✓] main                                            │   │
│  │ [✓] master                                          │   │
│  │ [ ] develop                                         │   │
│  │ [ ] release/*                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  커스텀 브랜치 추가                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  staging                                        [+] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ℹ️ 선택한 브랜치로의 PR 생성/머지 시에만 액션이 실행됩니다  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| 필드            | 설명                          | 기본값                |
| --------------- | ----------------------------- | --------------------- |
| Target Branches | PR 감지 대상 브랜치           | `['main', 'master']`  |

---

## 2️⃣ Jira 연동

```
┌─────────────────────────────────────────────────────────────┐
│  Jira Cloud 연동                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Base URL *                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  https://your-team.atlassian.net                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Email *                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  user@company.com                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  API Token *                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ••••••••••••••••••••••••                          │   │
│  └─────────────────────────────────────────────────────┘   │
│  📝 발급: id.atlassian.com/manage-profile/security/api-tokens│
│                                                             │
│  Project Key *                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PROJ                                              │   │
│  └─────────────────────────────────────────────────────┘   │
│  예: PROJ-123 이슈의 경우 "PROJ"                            │
│                                                             │
│  [ 🔍 연결 테스트 ]                                         │
│                                                             │
│  ✅ 연결 성공 - 프로젝트 "My Project" 확인됨                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| 필드        | 설명                           | Validation                          |
| ----------- | ------------------------------ | ----------------------------------- |
| Base URL    | Jira Cloud 인스턴스 URL        | `https://*.atlassian.net` 형식      |
| Email       | Jira 계정 이메일               | 이메일 형식                         |
| API Token   | Jira API 토큰                  | 필수                                |
| Project Key | Jira 프로젝트 키 (예: PROJ)    | 대문자 알파벳 + 숫자, 2-10자        |

---

## 3️⃣ Slack 연동

```
┌─────────────────────────────────────────────────────────────┐
│  Slack Webhook 연동                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Webhook URL *                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  https://hooks.slack.com/services/T00/B00/xxxx     │   │
│  └─────────────────────────────────────────────────────┘   │
│  📝 설정: api.slack.com/messaging/webhooks                 │
│                                                             │
│  [ 📤 테스트 메시지 발송 ]                                  │
│                                                             │
│  ✅ 발송 완료 - #general 채널 확인                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| 필드        | 설명                        | Validation                              |
| ----------- | --------------------------- | --------------------------------------- |
| Webhook URL | Slack Incoming Webhook URL  | `https://hooks.slack.com/services/` 시작 |

---

## 4️⃣ 알람 설정

```
┌─────────────────────────────────────────────────────────────┐
│  알람 스케줄 설정                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  알람 요일 *                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [✓] 월  [✓] 화  [✓] 수  [✓] 목  [✓] 금  [ ] 토  [ ] 일 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  알람 시간 *                                                │
│  ┌──────────────┐                                          │
│  │  09:00       │                                          │
│  └──────────────┘                                          │
│                                                             │
│  타임존 *                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Asia/Seoul (UTC+9)                             ▼   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| 필드      | 설명                | 옵션 / Validation              |
| --------- | ------------------- | ------------------------------ |
| 알람 요일 | 데일리 스크럼 요일  | 월~일 중 복수 선택             |
| 알람 시간 | 데일리 스크럼 시간  | HH:mm 형식 (00:00 ~ 23:59)     |
| 타임존    | 기준 타임존         | IANA 타임존 (예: Asia/Seoul)   |

### 타임존 옵션 (주요)

```typescript
const timezones = [
  { value: 'Asia/Seoul', label: 'Asia/Seoul (UTC+9)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+9)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (UTC+8)' },
  { value: 'America/New_York', label: 'America/New_York (UTC-5/-4)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC-8/-7)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+0/+1)' },
  { value: 'UTC', label: 'UTC (UTC+0)' },
];
```

---

## 5️⃣ 알람 액션

```
┌─────────────────────────────────────────────────────────────┐
│  알람 액션 설정                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  활성화할 알람 기능을 선택하세요 *                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [✓] 📅 데일리 스크럼                                │   │
│  │     매일 지정된 시간에 스프린트 현황 요약 발송       │   │
│  │     - 어제 완료 이슈                                │   │
│  │     - 오늘 진행 예정 이슈                           │   │
│  │     - 블로커 이슈                                   │   │
│  │     - AI 코멘트                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [✓] 🔍 PR 스크럼 리뷰                               │   │
│  │     PR 생성 시 Jira 이슈 연동 분석                  │   │
│  │     - Jira 이슈와 PR 내용 일치 여부                 │   │
│  │     - DOD 체크리스트 검증                           │   │
│  │     - 스프린트 목표 부합 여부                       │   │
│  │     - AI 기반 리뷰 제안                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [✓] 🔄 PR 머지 액션                                 │   │
│  │     PR 머지 시 실행할 액션을 선택하세요             │   │
│  │                                                     │   │
│  │     ┌─────────────────────────────────────────┐    │   │
│  │     │ [✓] 📢 Slack 알림                       │    │   │
│  │     │     PR 머지 완료 알림 발송              │    │   │
│  │     │                                         │    │   │
│  │     │ [✓] 💬 Jira 코멘트                      │    │   │
│  │     │     Jira 이슈에 PR 링크 코멘트 추가     │    │   │
│  │     │                                         │    │   │
│  │     │ [ ] 🔄 Jira 상태 변경                   │    │   │
│  │     │     Jira 이슈 상태를 Done으로 변경      │    │   │
│  │     │     ⚠️ 워크플로우에 따라 예기치 않은    │    │   │
│  │     │        결과가 발생할 수 있습니다        │    │   │
│  │     └─────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| 액션 코드           | 이름                         | 설명                                   |
| ------------------- | ---------------------------- | -------------------------------------- |
| `DAILY_SCRUM`       | 📅 데일리 스크럼             | 매일 스프린트 현황 요약 Slack 발송     |
| `PR_REVIEW`         | 🔍 PR 스크럼 리뷰            | PR 생성 시 Jira 연동 분석 및 DOD 검증  |
| `PR_MERGE_NOTIFY`   | 📢 PR 머지 Slack 알림        | PR 머지 시 Slack 알림 발송             |
| `PR_MERGE_COMMENT`  | 💬 PR 머지 Jira 코멘트       | PR 머지 시 Jira에 PR 링크 코멘트       |
| `PR_MERGE_TRANSITION` | 🔄 PR 머지 Jira 상태 변경  | PR 머지 시 Jira 이슈 Done 처리         |

---

## 5️⃣-1 Jira 상태 전환 설정 (PR_MERGE_TRANSITION 선택 시)

```
┌─────────────────────────────────────────────────────────────┐
│  Jira 상태 전환 규칙                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  어떤 상태에서 Done으로 변경할 수 있나요?                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [✓] In Progress                                     │   │
│  │ [✓] In Review / Code Review                         │   │
│  │ [ ] To Do (⚠️ 주의: 작업하지 않은 이슈)             │   │
│  │ [ ] Backlog                                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ℹ️ 이미 Done 상태인 이슈는 무시됩니다                      │
│  ℹ️ 선택하지 않은 상태의 이슈는 상태 변경 없이              │
│     Slack 알림과 Jira 코멘트만 추가됩니다                   │
│                                                             │
│  Target 상태 (Done으로 전환할 상태)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Done                                           ▼   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ℹ️ Jira 워크플로우에 정의된 상태명을 입력하세요           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| 필드                   | 설명                              | 기본값                           |
| ---------------------- | --------------------------------- | -------------------------------- |
| allowedTransitionFrom  | Done으로 변경 가능한 현재 상태    | `['In Progress', 'In Review']`   |
| targetStatus           | 전환할 목표 상태명                | `'Done'`                         |

---

## 6️⃣ AI 설정 (Optional)

```
┌─────────────────────────────────────────────────────────────┐
│  AI 설정 (선택)                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AI Provider                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  OpenAI (GPT-4o)                                ▼   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  API Key                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  sk-••••••••••••••••••••••••                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ℹ️ 미입력 시 환경변수의 기본 AI 설정 사용                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| 필드     | 옵션                                      |
| -------- | ----------------------------------------- |
| Provider | `openai`, `anthropic`, `google`           |
| Model    | OpenAI: `gpt-4o`, `gpt-4o-mini`           |
|          | Anthropic: `claude-3-5-sonnet`, `claude-3-5-haiku` |
|          | Google: `gemini-2.0-flash`, `gemini-1.5-pro` |

---

## 📦 TypeScript 타입 정의

```typescript
// packages/types/src/project.ts

export interface CreateProjectInput {
  // GitHub
  githubToken: string; // PAT
  githubRepo: string; // "owner/repo"
  targetBranches: string[]; // ['main', 'master']

  // Jira
  jiraBaseUrl: string;
  jiraEmail: string;
  jiraApiToken: string;
  jiraProjectKey: string;

  // Slack
  slackWebhookUrl: string;

  // Alert Schedule
  alertDays: AlertDay[]; // ['MON', 'TUE', 'WED', 'THU', 'FRI']
  alertTime: number; // Unix seconds from midnight (e.g., 32400 = 09:00)
  alertTimezone: string; // "Asia/Seoul"

  // Alert Actions
  alertActions: AlertActions;

  // AI (Optional)
  aiProvider?: 'openai' | 'anthropic' | 'google';
  aiModel?: string;
  aiApiKey?: string;
}

export type AlertDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

// Alert Actions (세분화)
export interface AlertActions {
  dailyScrum: boolean;
  prReview: boolean;
  prMerge: PrMergeActions;
}

export interface PrMergeActions {
  enabled: boolean;
  slackNotify: boolean; // 📢 Slack 알림
  jiraComment: boolean; // 💬 Jira 코멘트
  jiraTransition: JiraTransitionSettings | null; // 🔄 Jira 상태 변경
}

export interface JiraTransitionSettings {
  enabled: boolean;
  allowedFromStatuses: string[]; // ['In Progress', 'In Review']
  targetStatus: string; // 'Done'
}

// 기본값
export const DEFAULT_ALERT_ACTIONS: AlertActions = {
  dailyScrum: true,
  prReview: true,
  prMerge: {
    enabled: true,
    slackNotify: true,
    jiraComment: true,
    jiraTransition: {
      enabled: false, // 기본값은 비활성화 (안전)
      allowedFromStatuses: ['In Progress', 'In Review'],
      targetStatus: 'Done',
    },
  },
};

export const DEFAULT_TARGET_BRANCHES = ['main', 'master'];
```

---

## 🔐 보안 고려사항

| 필드                | 저장 방식              |
| ------------------- | ---------------------- |
| GitHub PAT          | AES-256-GCM 암호화     |
| Jira API Token      | AES-256-GCM 암호화     |
| Slack Webhook URL   | AES-256-GCM 암호화     |
| AI API Key          | AES-256-GCM 암호화     |

---

## ⚠️ 엣지 케이스 처리

| 상황 | 처리 방안 |
|------|-----------|
| PR에 여러 Jira 이슈 키 (PROJ-123, PROJ-124) | 모든 이슈에 대해 각각 처리 |
| PR에 Jira 이슈 키 없음 | 무시 (Activity Log에 기록) |
| 이미 Done 상태인 Jira 이슈 | 스킵 (중복 처리 방지) |
| allowedFromStatuses에 없는 상태 | 상태 변경 스킵, 알림/코멘트만 처리 |
| Jira Transition 실패 (권한/워크플로우) | 에러 로그 + Slack 에러 알림 |
| Target Branch가 아닌 브랜치로 PR | 모든 액션 스킵 |
| Draft PR | PR_REVIEW 스킵 (설정 가능) |
| PR 다시 열기 (Reopen) | 재처리 없음 (merged 이벤트만 처리) |

---

**작성일:** 2026-02-05
**버전:** 2.0.0 (PR/Merge 세분화)
