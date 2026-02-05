# 👻 SprintGhost - BE 작업 순서

> 의존성 기반 Backend 작업 실행 순서

---

## 📊 의존성 다이어그램

```
Phase 1: 기반
┌─────────────────────────────────────────────────────────────┐
│  BE-001: Database + Redis                                    │
│  └─> BE-002: Crypto, Config                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
Phase 2: 프로젝트 + 외부 서비스
┌─────────────────────────────────────────────────────────────┐
│  BE-004: Projects CRUD                                       │
│      │                                                       │
│      ├─> BE-005: GitHub API ──┐                              │
│      ├─> BE-006: Jira API ────┼─── (병렬 가능)               │
│      ├─> BE-007: Slack API ───┤                              │
│      └─> BE-008: AI Client ───┘                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
Phase 3: 핵심 기능
┌─────────────────────────────────────────────────────────────┐
│  BE-009: Webhook Controller                                  │
│      │                                                       │
│      ├─> BE-010: PR Review Handler                           │
│      ├─> BE-011: Daily Scrum Handler (BullMQ)                │
│      ├─> BE-012: PR Merge Handler                            │
│      └─> BE-013: DOD Checklist                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
Phase 4: 부가 기능
┌─────────────────────────────────────────────────────────────┐
│  BE-014: Activity Log                                        │
│  BE-015: Unit Tests                                          │
│  BE-016: E2E Tests                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 상세 작업 순서

| 순서 | Issue      | 작업명                    | 선행 작업       | 예상 시간 |
| :--: | ---------- | ------------------------- | --------------- | :-------: |
|  1   | **BE-001** | Database + Redis 설정     | -               |    2h     |
|  2   | **BE-002** | Crypto, Config 모듈       | BE-001          |   1.5h    |
|  3   | **BE-004** | Projects CRUD API         | BE-001, BE-002  |    3h     |
|  4   | **BE-005** | GitHub API (PAT)          | BE-004          |    3h     |
|  5   | **BE-006** | Jira API Client           | BE-004          |   2.5h    |
|  6   | **BE-007** | Slack Webhook             | BE-004          |    1h     |
|  7   | **BE-008** | AI Client (Multi)         | BE-004          |    3h     |
|  8   | **BE-009** | Webhook Controller        | BE-004          |    2h     |
|  9   | **BE-010** | PR Review Handler         | BE-005~009      |    3h     |
|  10  | **BE-011** | Daily Scrum (BullMQ)      | BE-006~008      |    4h     |
|  11  | **BE-012** | PR Merge Handler          | BE-006, 007, 009 |   3.5h    |
|  12  | **BE-013** | DOD Checklist             | BE-005, 006, 008 |    3h     |
|  13  | **BE-014** | Activity Log              | BE-001          |    2h     |
|      |            | **총 예상 시간 (MVP)**    |                 | **33.5h** |

---

## 🔀 병렬 작업 가능 구간

```
[순차] BE-001 → BE-002 → BE-004

[병렬] BE-004 완료 후:
       ├── BE-005 (GitHub)
       ├── BE-006 (Jira)
       ├── BE-007 (Slack)
       └── BE-008 (AI)

[순차] BE-009 (Webhook Controller)

[병렬] BE-009 완료 후:
       ├── BE-010 (PR Review)
       ├── BE-011 (Daily Scrum)
       ├── BE-012 (PR Merge)
       └── BE-013 (DOD Check)

[독립] BE-014 (Activity Log) - BE-001 이후 언제든 가능
[후순위] BE-003 (Auth) - 필요시 추가
```

---

## 🎯 권장 일정

### Day 1: 기반 구축 (3.5h)

| 작업   | 내용                      | 시간  |
| ------ | ------------------------- | ----- |
| BE-001 | Database + Redis 설정     | 2h    |
| BE-002 | Crypto, Config 모듈       | 1.5h  |

**산출물:**
- SQLite + Drizzle ORM 설정 완료
- Redis 연결 확인
- AES-256-GCM 암호화 서비스
- 환경설정 검증 모듈

---

### Day 2: 프로젝트 관리 (3h)

| 작업   | 내용              | 시간 |
| ------ | ----------------- | ---- |
| BE-004 | Projects CRUD API | 3h   |

**산출물:**
- 프로젝트 CRUD 엔드포인트
- 민감 정보 암호화 저장
- CreateProjectDto, UpdateProjectDto

---

### Day 3-4: 외부 서비스 연동 (9.5h, 병렬 가능)

| 작업   | 내용              | 시간  |
| ------ | ----------------- | ----- |
| BE-005 | GitHub API (PAT)  | 3h    |
| BE-006 | Jira API Client   | 2.5h  |
| BE-007 | Slack Webhook     | 1h    |
| BE-008 | AI Client (Multi) | 3h    |

**산출물:**
- GitHub: PAT 검증, 레포 목록, Workflow 생성
- Jira: 이슈 조회, 상태 변경, 코멘트
- Slack: Webhook 메시지 발송, Block Kit
- AI: OpenAI/Anthropic/Google 통합 클라이언트

---

### Day 5: 웹훅 컨트롤러 (2h)

| 작업   | 내용               | 시간 |
| ------ | ------------------ | ---- |
| BE-009 | Webhook Controller | 2h   |

**산출물:**
- `POST /webhook` 엔드포인트
- ProjectKeyGuard (X-Project-Key 검증)
- 이벤트 타입별 라우팅

---

### Day 6-8: 핵심 핸들러 (13.5h, 병렬 가능)

| 작업   | 내용                    | 시간  |
| ------ | ----------------------- | ----- |
| BE-010 | PR Review Handler       | 3h    |
| BE-011 | Daily Scrum (BullMQ)    | 4h    |
| BE-012 | PR Merge Handler        | 3.5h  |
| BE-013 | DOD Checklist           | 3h    |

**산출물:**
- PR 생성 시 AI 리뷰 + Slack 알림
- BullMQ 기반 데일리 스크럼 스케줄링
- PR 머지 시 Jira 상태 변경 (조건부)
- DOD 체크리스트 자동 검증

---

### Day 9: 부가 기능 (2h)

| 작업   | 내용         | 시간 |
| ------ | ------------ | ---- |
| BE-014 | Activity Log | 2h   |

**산출물:**
- 활동 로그 저장/조회 API
- 모든 핸들러에서 로그 기록

---

## 📁 생성되는 디렉토리 구조

```
services/api/src/
├── common/
│   ├── crypto/
│   │   └── crypto.service.ts
│   └── config/
│       └── env.validation.ts
│
├── database/
│   ├── database.module.ts
│   ├── drizzle.provider.ts
│   └── schema/
│       ├── index.ts
│       ├── projects.ts
│       └── activity-logs.ts
│
├── projects/
│   ├── projects.module.ts
│   ├── projects.controller.ts
│   ├── projects.service.ts
│   └── dto/
│       ├── create-project.dto.ts
│       └── update-project.dto.ts
│
├── integrations/
│   ├── github/
│   │   ├── github.module.ts
│   │   └── github.service.ts
│   ├── jira/
│   │   ├── jira.module.ts
│   │   └── jira.service.ts
│   ├── slack/
│   │   ├── slack.module.ts
│   │   └── slack.service.ts
│   └── ai/
│       ├── ai.module.ts
│       ├── ai.service.ts
│       └── providers/
│           ├── openai.provider.ts
│           ├── anthropic.provider.ts
│           └── google.provider.ts
│
├── webhook/
│   ├── webhook.module.ts
│   ├── webhook.controller.ts
│   ├── webhook.service.ts
│   ├── guards/
│   │   └── project-key.guard.ts
│   └── handlers/
│       ├── pr-opened.handler.ts
│       ├── pr-merged.handler.ts
│       ├── daily-scrum.handler.ts
│       └── dod-check.handler.ts
│
├── scheduler/
│   ├── scheduler.module.ts
│   ├── scheduler.service.ts
│   └── processors/
│       └── daily-scrum.processor.ts
│
├── activity-log/
│   ├── activity-log.module.ts
│   └── activity-log.service.ts
│
└── prompts/
    ├── pr-review.txt
    ├── daily-summary.txt
    └── dod-check.txt
```

---

## ✅ 체크리스트

### Phase 1: 기반
- [ ] BE-001: Database + Redis 설정
- [ ] BE-002: Crypto, Config 모듈

### Phase 2: 프로젝트 + 외부 서비스
- [ ] BE-004: Projects CRUD API
- [ ] BE-005: GitHub API (PAT)
- [ ] BE-006: Jira API Client
- [ ] BE-007: Slack Webhook
- [ ] BE-008: AI Client (Multi)

### Phase 3: 핵심 기능
- [ ] BE-009: Webhook Controller
- [ ] BE-010: PR Review Handler
- [ ] BE-011: Daily Scrum (BullMQ)
- [ ] BE-012: PR Merge Handler
- [ ] BE-013: DOD Checklist

### Phase 4: 부가 기능
- [ ] BE-014: Activity Log
- [ ] BE-015: Unit Tests
- [ ] BE-016: E2E Tests

### 후순위 (필요시 추가)
- [ ] BE-003: Auth (Single-User) - 외부 접근 허용 시 추가

---

**작성일:** 2026-02-05
**참조:** [issues.md](./issues.md)
