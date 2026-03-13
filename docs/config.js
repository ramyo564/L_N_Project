import { diagrams } from './diagrams.js';
import { learnMoreLinks } from './learnmore-links.js';

const cardMeta = {
    "backend-spring-hex": { title: "Spring Hexagonal", description: "Controller, Application, Domain, and Adapter layers are separated by ports to keep domain logic clean and replaceable.", why: "도메인 규칙을 프레임워크 변경과 분리해 장기 리팩토링 비용을 낮추기 위해 계층 경계를 고정했습니다." },
    "backend-spring-auth": { title: "Spring Auth Flow", description: "Login and refresh issue JWT tokens, refresh session cookies are stored in Redis, and JwtAuthenticationFilter validates bearer tokens per request.", why: "인증 정책/경계를 Spring verify 단일 전략으로 고정해 정책 드리프트를 줄였고, FastAPI 인증 독립성 저하를 감수했습니다." },
    "backend-spring-packages": { title: "Spring Package Map", description: "Domain modules (`auth`, `project`, `task_mvc`, `subtask_mvc`, `user`) share a common platform package for security, cache, messaging, and observability.", why: "기능 증가 시 모듈 단위로 영향 범위를 제한해 1인 개발에서도 변경 리스크를 관리하기 위해 분리했습니다." },
    "backend-spring-domain-rules": { title: "Spring Domain Rules", description: "Project ownership is verified through pending-cache-first access checks, then domain guards enforce delete-state immutability, duplicate reorder prevention, and idempotent delete behavior.", why: "인라인 검증 분산으로 생기는 규칙 누락을 막기 위해 도메인 규칙을 중앙화했고, 초기 설계/구현 속도 저하를 감수했습니다." },
    "backend-spring-state-management": { title: "Spring State Management", description: "Task, Project, and SubTask transitions are controlled in domain models with explicit completion timestamp rules and deleted-entity transition blocking.", why: "상태 전이 규칙을 엔티티 내부에 고정해 비동기 처리 중에도 불변 조건을 유지하기 위해서입니다." },
    "backend-spring-api-write": { title: "Spring API Write Path", description: "TaskController returns 202 quickly, writes optimistic Redis cache, and publishes task events to RabbitMQ.", why: "동기 DB 저장으로 응답 지연이 커지는 문제를 줄이기 위해 202 즉시응답+Pending+MQ 비동기 경로를 택했고, 정합성 리스크는 DLQ·재처리 운영 복잡도를 감수해 관리합니다." },
    "backend-spring-worker-consume": { title: "Spring Worker Consume Path", description: "TaskEventListener batch-consumes queue messages, executes command handlers, persists to PostgreSQL, and triggers cache eviction events.", why: "API 서버와 Worker 역할을 분리해 부하 급증 시에도 사용자 응답성을 보호했습니다." },
    "backend-spring-troubleshooting": { title: "Spring Troubleshooting", description: "Resolved major bottlenecks including MVC+WebFlux context overhead, Redis connection contention, race conditions after async writes, and RabbitMQ channel conflicts through staged architecture tuning.", why: "실운영 전에 k6로 병목을 재현해 단계적으로 제거하는 방식을 택했고, 테스트 구축·분석 시간과 저트래픽 구간 과투자 위험을 감수했습니다." },
    "backend-fastapi-analyze": { title: "FastAPI Analyze Path", description: "Failure analysis verifies JWT via Spring, stores AI session state in Redis, queries Qdrant context, and generates recommendations with LLM.", why: "AI 분석 품질과 복구 가능성을 높이기 위해 Spring 검증·Redis 세션·Qdrant 컨텍스트를 선행한 Analyze 경로를 택했고, 서비스 경계 증가와 외부 의존성을 감수했습니다." },
    "backend-fastapi-auth": { title: "FastAPI Auth Flow", description: "All protected AI endpoints validate bearer tokens by calling Spring verify API through shared httpx client and map verified user context for services.", why: "FastAPI 요청 단위에서 Spring verify를 호출해 인증 정책을 실행으로 강제했고, 추가 네트워크 hop을 감수했습니다." },
    "backend-fastapi-packages": { title: "FastAPI Package Map", description: "API router, dependency graph, services, domain interfaces, and infrastructure clients are split for testability and runtime flexibility.", why: "Flat 구조의 초기 속도 대신 계층 분리로 테스트성·교체 용이성을 택했고, 초기 설계 비용과 디버깅·장애 추적 경로 증가를 감수했습니다." },
    "backend-fastapi-domain-rules": { title: "FastAPI Domain Rules", description: "Recommendations are normalized with JSON parsing and fallback rules, while feedback submission enforces session validity, index bounds, and recommendation mapping integrity.", why: "LLM 출력 오염이 후속 생성으로 전파되는 위험을 막기 위해 JSON 정규화·fallback·매핑 검증 규칙을 넣었고, 구현 복잡도와 일부 지연 증가를 감수했습니다." },
    "backend-fastapi-state-management": { title: "FastAPI State Management", description: "AI session lifecycle is persisted in Redis from analyzing to completed state, with category/recommendation snapshots and feedback metadata updates after task creation.", why: "분석→피드백→생성 단계의 상태 불일치를 막기 위해 Redis 세션 수명주기를 고정했고, 세션 만료/정리 운영 비용을 감수했습니다." },
    "backend-fastapi-feedback": { title: "FastAPI Feedback Path", description: "Selected recommendation indexes are resolved from Redis session snapshot and sent to Spring task API through SpringClient.create_tasks.", why: "잘못된 추천 인덱스로 task가 생성되는 오류를 막기 위해 세션 스냅샷 매핑 후 Spring 생성 API로 위임했고, 경로 복잡도와 추가 네트워크 hop을 감수했습니다." },
    "backend-fastapi-troubleshooting": { title: "FastAPI Troubleshooting", description: "Hardened AI flow by handling token/verify failures, recommendation parsing fallbacks, invalid feedback selections, mapping mismatches, and cache/vector errors with resilient degradation paths.", why: "외부 의존 장애가 전체 기능으로 번지는 것을 막기 위해 verify/fallback/유효성 분기 기반 안전 저하 전략을 적용했고, 코드 분기 증가와 디버깅 난이도 상승을 감수했습니다." },
    "frontend-monorepo-architecture": { title: "Frontend Monorepo Architecture", description: "Apps, platform adapters, and core packages are split by dependency direction to keep business logic platform-independent and reusable across Web/RN/Electron.", why: "Web/RN/Electron 간 중복 구현을 줄이고 플랫폼 교체 시 비즈니스 로직 재사용률을 높이기 위해 모노레포 경계를 고정했습니다." },
    "frontend-api-bridge": { title: "Frontend Auth & API Bridge", description: "Spring requests use `fetchBaseQuery` with reauth, while FastAPI AI requests use token-manager-backed codegen clients via `fakeBaseQuery` queryFn integration.", why: "Spring/FastAPI 인증 실패 패턴이 달라 경로를 분리해 토큰 재발급·오류 처리 책임을 명확히 하기 위해서입니다." },
    "frontend-package-map": { title: "Frontend Package Map", description: "Core modules (`api`, `store`, `domain`, `hooks`, `services`, `usecases`, `types`, `utils`) are organized to enforce predictable layering and import boundaries.", why: "레이어별 import 경계를 강제해 순환 의존과 기능 확장 시 결합도 상승을 사전에 막기 위해서입니다." },
    "frontend-rtk-single-source": { title: "RTK Single Source", description: "RTK Query is the single source of truth for server state. Query cache, optimistic patches, and rollback logic are centralized in API services.", why: "낙관적 업데이트와 롤백 규칙을 한곳에 모아 비동기 202 흐름에서도 화면-서버 상태 불일치를 줄이기 위해서입니다." },
    "frontend-di-composition": { title: "DI Composition Flow", description: "`CoreServicesProvider` assembles hook-factory services, orchestration services, and usecases on top of a shared store for consistent feature wiring.", why: "서비스 조립 지점을 단일화해 테스트 더블 주입과 기능별 교체 비용을 낮추기 위해 구성했습니다." },
    "frontend-troubleshooting-patterns": { title: "Troubleshooting Patterns", description: "Cache sync, 202-empty-body handling, optimistic consistency, field mapping, and infinite-render guards are documented and reflected in current implementation patterns.", why: "반복된 장애 패턴을 공통 구현 규칙으로 고정해 회귀 버그와 디버깅 시간을 줄이기 위해 정리했습니다." },
    "devops-ci-change-detection": { title: "CI Change Detection", description: "`dorny/paths-filter` routes PR changes into selective Spring, FastAPI, Frontend, Nginx, and Monitoring jobs so unchanged stacks skip expensive builds.", why: "모노레포 전체 재빌드 비용을 줄이고 변경 범위만 검증해 피드백 시간을 단축하기 위해서입니다." },
    "devops-ci-integration-gate": { title: "CI Integration Gate", description: "`docker-compose.dev-CI.yml` brings up app plus dependencies, validates health/proxy paths, and blocks promotion until integration checks and Trivy scans pass.", why: "단위 테스트 통과만으로 배포하지 않고 실제 통합 기동 상태를 게이트로 검증해 릴리즈 리스크를 낮추기 위해서입니다." },
    "devops-cd-wireguard": { title: "CD via WireGuard", description: "Push to `main` or `dev` triggers temporary WireGuard tunnel, remote compose sync, branch-specific env injection, controlled deployment, then guaranteed VPN teardown.", why: "홈서버 배포를 공인 포트 개방 없이 수행하고 배포 종료 후 접근 경로를 자동 회수하기 위해 채택했습니다." },
    "devops-image-promotion": { title: "Image Promotion Flow", description: "Built SHA tags are resolved to immutable digests and promoted with `imagetools create` into stable branch tags (`--dev`, `--prod`) for deterministic deploys.", why: "태그 재사용으로 인한 드리프트를 막고 동일 digest 재배포를 보장해 롤백/재현성을 확보하기 위해서입니다." },
    "devops-compose-topology": { title: "Compose Runtime Topology", description: "`dev`, `database`, `network-utils`, and `monitoring` compose layers build one networked runtime with health-gated dependencies across API, data, cert, and telemetry stacks.", why: "서비스 의존성과 기동 순서를 컴포즈 계층으로 명시해 환경별 실행 편차를 줄이기 위해 구성했습니다." },
    "devops-docker-build-map": { title: "Docker Build Map", description: "Spring Gradle cache mounts, FastAPI uv multi-stage sync, and Nginx+Frontend image assembly are separated into optimized stages with non-root runtime defaults.", why: "이미지별 병목 구간을 분리 최적화해 빌드 시간과 이미지 크기를 함께 줄이기 위해 빌드 경로를 분해했습니다." },
    "devops-nginx-runtime-validation": { title: "Nginx Runtime Validation", description: "Entrypoint pipeline renders templates, verifies unresolved variables, performs `nginx -t`, and fails fast before serving traffic when configuration is unsafe.", why: "런타임 환경변수 누락이나 잘못된 라우팅 설정을 트래픽 수신 전에 차단하기 위해 fail-fast 검증을 넣었습니다." },
    "devops-edge-security": { title: "Edge Security Model", description: "Cloudflare Tunnel hides origin IP via outbound-only edge path, while Certbot DNS-01, DDClient, and WireGuard-only SSH keep external attack surface minimized.", why: "원본 서버 노출을 줄이고 원격 접근 경로를 제한해 홈서버 운영의 기본 공격면을 최소화하기 위해서입니다." },
    "devops-observability-pipeline": { title: "Observability Pipeline", description: "Prometheus scrapes app/exporter metrics, Grafana visualizes metrics/logs, and Alertmanager routes severity-based incidents to Slack with secret-backed webhooks.", why: "장애 인지 시간을 줄이고 원인 추적 경로를 일원화하기 위해 메트릭·로그·알림 파이프라인을 통합했습니다." },
    "devops-k6-load-architecture": { title: "k6 Load Architecture", description: "Scenario suites share auth refresh/backoff utilities, profile-based ramping (`fast_test`, `stress2000`, `spike`), and optional CDN bypass paths for origin-only analysis.", why: "튜닝 결과 신뢰도를 높이기 위해 동일 조건의 재현 가능한 부하 프로파일을 유지했습니다." },
    "devops-stress-mode-lifecycle": { title: "Stress Mode Lifecycle", description: "Dedicated workflows toggle stress mode on/refresh/down by composing isolated `.env.stress`, test database stack, and controlled teardown for safe repeatable load tests.", why: "운영 데이터 오염을 방지하기 위해 테스트 환경을 독립 생명주기로 분리했습니다." },
    "devops-troubleshooting-patterns": { title: "DevOps Troubleshooting", description: "Known incidents include Cloudflare tunnel protocol mismatch, OAuth redirect proto loss, k6 summary rounding blind spots, and high-VU host freeze mitigations.", why: "반복 장애를 줄이기 위해 원인-대응-검증 로그를 런북 형태로 누적했습니다." },
};

const backendDecisionMeta = {
    "backend-spring-hex": {
        cardId: "BE-C01",
        problem: "도메인 로직이 프레임워크/인프라 변경에 오염될 위험",
        choice: "Hexagonal 포트/어댑터 경계 고정",
        result: "도메인-인프라 분리로 교체/리팩토링 비용 감소",
        tradeOff: "초기 설계 복잡도와 보일러플레이트 증가"
    },
    "backend-spring-auth": {
        cardId: "BE-C02",
        problem: "Spring/FastAPI 인증 정책 드리프트와 키 관리 중복 위험",
        choice: "Spring verify 단일 정책 경계 채택",
        result: "정책 단일화로 인증 기준 일관성 확보",
        tradeOff: "FastAPI 인증 독립성 저하, verify 경로 의존"
    },
    "backend-spring-packages": {
        cardId: "BE-C03",
        problem: "기능 증가 시 변경 영향 범위 확산",
        choice: "도메인/기능 중심 패키지 분리 유지",
        result: "모듈 단위 변경 격리로 유지보수 안정성 강화",
        tradeOff: "초기 개발 속도 저하, 구조 학습 비용 증가"
    },
    "backend-spring-domain-rules": {
        cardId: "BE-C04",
        problem: "API별 인라인 검증에서 규칙 누락/편차 누적",
        choice: "권한/상태/멱등 규칙 도메인 경계 중앙화",
        result: "규칙 일관성과 테스트 가능성 확보",
        tradeOff: "클래스/설계 비용 증가로 초기 속도 저하"
    },
    "backend-spring-state-management": {
        cardId: "BE-C05",
        problem: "비동기 경로에서 상태 불일치 가능",
        choice: "상태 전이를 엔티티 내부 규칙으로 고정",
        result: "상태 불변조건과 전이 규칙 일관성 확보",
        tradeOff: "엔티티 모델 복잡도 증가와 진입장벽 상승을 감수했습니다."
    },
    "backend-spring-api-write": {
        cardId: "BE-C06",
        problem: "동기 DB 저장으로 쓰기 지연/타임아웃 증가",
        choice: "202 + Pending + RabbitMQ 비동기 쓰기 경로",
        result: "WRITE p95 1.9s -> 126ms (@500VU)",
        tradeOff: "정합성 경계 및 DLQ/재처리 운영 복잡도 증가"
    },
    "backend-spring-worker-consume": {
        cardId: "BE-C07",
        problem: "API와 소비 로직 결합 시 고부하에서 응답성 저하",
        choice: "API(발행)/Worker(소비) 역할 분리",
        result: "피크 부하에서 API 응답성 보호 및 확장성 확보",
        tradeOff: "배포/운영 포인트(DLQ/모니터링/장애지점) 증가"
    },
    "backend-spring-troubleshooting": {
        cardId: "BE-C08",
        problem: "병목 원인 불명 상태에서 튜닝 회귀 반복",
        choice: "k6 재현-수정-검증 루프 고정",
        result: "READ p95 975ms -> 141ms, WRITE p95 1.9s -> 126ms",
        tradeOff: "테스트 구축/분석 시간 증가, 저트래픽 구간 과투자 위험"
    },
    "backend-fastapi-analyze": {
        cardId: "BE-C09",
        problem: "단순 추론 호출 시 분석 품질/복구 일관성 저하",
        choice: "Spring verify + Redis 세션 + Qdrant 컨텍스트 선행",
        result: "분석 맥락 보존 및 복구 가능한 경로 확보",
        tradeOff: "외부 의존성/네트워크 hop 증가"
    },
    "backend-fastapi-auth": {
        cardId: "BE-C10",
        problem: "AI 경로에서 인증 실행 누락/정책 불일치 위험",
        choice: "요청 단위 Spring verify 호출로 실행 강제",
        result: "인증 일관성 확보: FastAPI 보호 엔드포인트 정책 실행 경로 단일화",
        tradeOff: "가용성 의존 증가: 네트워크 hop 증가와 Spring verify 의존"
    },
    "backend-fastapi-packages": {
        cardId: "BE-C11",
        problem: "Flat 구조에서 의존성 얽힘/교체 난이도 증가",
        choice: "API/Service/Domain/Infra 계층 분리",
        result: "테스트 더블 주입과 외부의존 교체 용이성 확보",
        tradeOff: "초기 DI/설계 비용 및 디버깅 경로 증가"
    },
    "backend-fastapi-domain-rules": {
        cardId: "BE-C12",
        problem: "LLM 포맷 오염이 생성 경로로 전파될 위험",
        choice: "JSON 정규화 + fallback + 매핑 무결성 검증",
        result: "파싱 실패/오입력의 후속 전파 차단",
        tradeOff: "규칙 분기 코드 증가, 추천 다양성 일부 저하 가능"
    },
    "backend-fastapi-state-management": {
        cardId: "BE-C13",
        problem: "analyze->feedback->create 다단계 상태 불일치 위험",
        choice: "Redis 세션 수명주기/스냅샷 갱신 고정",
        result: "세션 기반 단계 일관성 및 재시도 복구성 확보",
        tradeOff: "세션 만료/정리 운영 부담 증가"
    },
    "backend-fastapi-feedback": {
        cardId: "BE-C14",
        problem: "잘못된 선택 인덱스로 오생성 task 발생 가능",
        choice: "세션 스냅샷 매핑 후 Spring 생성 API 위임",
        result: "유효 인덱스/매핑 검증으로 오생성 차단",
        tradeOff: "경로 복잡도 증가, 추가 hop 발생"
    },
    "backend-fastapi-troubleshooting": {
        cardId: "BE-C15",
        problem: "외부 의존 장애가 전체 기능으로 전파될 위험",
        choice: "verify/fallback/유효성 분기 기반 안전 저하 전략",
        result: "전체 fail-fast 대신 부분 기능 축소로 복구 가능성 확보",
        tradeOff: "오류 분기 코드 증가, 디버깅 난이도 상승"
    }
};

const mapCards = (ids) => ids.map((id) => {
    const baseMeta = cardMeta[id] ?? {};
    const decisionMeta = backendDecisionMeta[id];
    return {
        mermaidId: id,
        title: baseMeta.title ?? id,
        subtitle: decisionMeta?.cardId ?? '',
        description: decisionMeta ? `Problem: ${decisionMeta.problem}` : (baseMeta.description ?? ''),
        highlights: decisionMeta ? [
            `Choice: ${decisionMeta.choice}`,
            `Result: ${decisionMeta.result}`,
            `Trade-off: ${decisionMeta.tradeOff}`
        ] : [],
        why: baseMeta.why ?? '',
        links: [
            { label: 'EVIDENCE', href: `./evidence/l_n_project/index.html#${id}`, variant: 'primary' },
            { label: 'README', href: learnMoreLinks[id] ?? '#', variant: 'ghost' }
        ]
    };
});

export const templateConfig = {
    system: {
        documentTitle: 'Yohan | Life Navigation Architecture Dashboard',
        systemName: 'LIFE_NAVIGATION_ARCHITECTURE_V.3.2'
    },

    hero: {
        sectionId: 'system-architecture',
        panelTitle: 'SYSTEM_OVERVIEW',
        panelUid: 'ID: LIFE-NAV-01',
        diagramId: 'architecture-simple',
        metrics: [
            'POSITION: Backend-first System Architect (Life Navigation backend)',
            'PROBLEM: 고부하 요청에서 지연 급증과 정합성 리스크가 누적되었습니다.',
            'CHOICE: Spring Hexagonal + API/Worker 분리 + FastAPI AI 경계 분리를 적용했습니다.',
            'RESULT: READ p95 975ms -> 141ms, WRITE p95 1.9s -> 126ms (@500VU).',
            'TRADE-OFF: DLQ/재처리 파이프라인과 서비스 간 verify로 인한 운영 복잡도를 감수했습니다.'
        ],
        actions: [
            {
                label: 'SYSTEM DETAIL ARCHITECTURE 보기',
                openLabel: 'SYSTEM DETAIL ARCHITECTURE 닫기',
                action: 'toggle_panel',
                target: '#system-architecture-detail'
            }
        ]
    },

    topPanels: [
        {
            sectionId: 'system-architecture-detail',
            panelTitle: 'SYSTEM_ARCHITECTURE_DETAIL',
            panelUid: 'ID: LIFE-NAV-02',
            navLabel: 'ARCH_DETAIL',
            showInNav: false,
            defaultHidden: true,
            diagramId: 'architecture',
            metrics: [
                'DETAIL: 인증/비동기 쓰기/AI 추천 경로를 분리한 전체 런타임 구현도입니다.',
                'GUIDE: SYSTEM_OVERVIEW의 토글 버튼으로 열고 닫을 수 있습니다.'
            ]
        }
    ],

    skills: {
        sectionId: 'skill-set',
        panelTitle: 'SKILL_SET',
        panelUid: 'ID: SKILL-SET',
        items: [
            { title: 'BACKEND', stack: 'Java 21, Spring Boot 3, Python 3.11, FastAPI' },
            { title: 'DATA', stack: 'PostgreSQL 15, Redis, RabbitMQ, Qdrant' },
            { title: 'FRONTEND', stack: 'React 19, TypeScript 5, RTK Query, Turborepo' },
            { title: 'DEVOPS', stack: 'Docker Compose, GitHub Actions, WireGuard, Cloudflare, Nginx' },
            { title: 'OBSERVABILITY', stack: 'Prometheus, Grafana, Loki, Alertmanager, k6' }
        ]
    },

    serviceSections: [
        {
            id: 'backend-services',
            title: 'BACKEND_SERVICES',
            navLabel: 'BACKEND_SERVICES',
            summary: '기본 노출은 대표 3개 결정(BE-C06/BE-C05/BE-C10)만 유지합니다. 나머지 Backend Inventory는 토글로 확장해 확인할 수 있습니다.',
            theme: 'blue',
            cardVisualHeight: '290px',
            cardClass: 'backend-card',
            groups: [
                {
                    title: 'BACKEND CORE DECISIONS (FEATURED 3)',
                    desc: 'Default Open: BE-C06 / BE-C05 / BE-C10',
                    cards: mapCards(["backend-spring-api-write", "backend-spring-state-management", "backend-fastapi-auth"])
                },
                {
                    title: 'SPRING STACK (REMAINING INVENTORY)',
                    desc: 'Collapsed by default: BE-C01 / BE-C02 / BE-C03 / BE-C04 / BE-C07 / BE-C08',
                    collapsible: true,
                    defaultCollapsed: true,
                    cards: mapCards(["backend-spring-hex", "backend-spring-auth", "backend-spring-packages", "backend-spring-domain-rules", "backend-spring-worker-consume", "backend-spring-troubleshooting"])
                },
                {
                    title: 'FASTAPI STACK (REMAINING INVENTORY)',
                    desc: 'Collapsed by default: BE-C09 / BE-C11 / BE-C12 / BE-C13 / BE-C14 / BE-C15',
                    collapsible: true,
                    defaultCollapsed: true,
                    cards: mapCards(["backend-fastapi-analyze", "backend-fastapi-packages", "backend-fastapi-domain-rules", "backend-fastapi-state-management", "backend-fastapi-feedback", "backend-fastapi-troubleshooting"])
                }
            ]
        },
        {
            id: 'load-reliability-services',
            title: 'LOAD_AND_RELIABILITY',
            navLabel: 'LOAD_RELIABILITY',
            summary: 'PROBLEM: 스케일 테스트 중 튜닝 회귀와 숨은 실패 모드가 반복되었습니다. CHOICE: 재현 가능한 k6 프로파일 + 분리된 stress lifecycle + 반복 검증 흐름을 구축했습니다. RESULT: READ p95 975ms -> 141ms, stress 검증 재현성을 확보했습니다.',
            theme: 'orange',
            cardVisualHeight: '265px',
            cardClass: 'devops-card',
            groups: [
                {
                    title: 'PERFORMANCE & INCIDENT OPERATIONS',
                    desc: 'k6 Profiles / Stress Mode Lifecycle / Troubleshooting',
                    cards: mapCards(["devops-k6-load-architecture", "devops-stress-mode-lifecycle", "devops-troubleshooting-patterns"])
                }
            ]
        },
        {
            id: 'devops-services',
            title: 'DEVOPS_SERVICES (OPTIONAL)',
            navLabel: 'DEVOPS_OPTIONAL',
            summary: '보조 섹션: Selective CI + WireGuard CD + runtime validation + observability pipeline 요약입니다.',
            theme: 'orange',
            cardVisualHeight: '265px',
            cardClass: 'devops-card',
            collapsible: true,
            defaultCollapsed: true,
            toggleLabel: 'OPTIONAL DETAILS: DEVOPS',
            toggleHint: '펼쳐서 상세 보기',
            groups: [
                {
                    title: 'DELIVERY PIPELINE',
                    desc: 'Selective CI / Integration Gate / Secure CD / Image Promotion',
                    cards: mapCards(["devops-ci-change-detection", "devops-ci-integration-gate", "devops-cd-wireguard", "devops-image-promotion"])
                },
                {
                    title: 'RUNTIME INFRA',
                    desc: 'Compose Topology / Build Strategy / Nginx Validation / Edge Security / Observability',
                    cards: mapCards(["devops-compose-topology", "devops-docker-build-map", "devops-nginx-runtime-validation", "devops-edge-security", "devops-observability-pipeline"])
                }
            ]
        },
        {
            id: 'frontend-services',
            title: 'FRONTEND_SERVICES (OPTIONAL)',
            navLabel: 'FRONTEND_OPTIONAL',
            summary: '보조 섹션: Monorepo 경계 + RTK Query 단일 상태원 + DI composition 요약입니다.',
            theme: 'green',
            cardVisualHeight: '260px',
            cardClass: 'frontend-card',
            collapsible: true,
            defaultCollapsed: true,
            toggleLabel: 'OPTIONAL DETAILS: FRONTEND',
            toggleHint: '펼쳐서 상세 보기',
            cards: mapCards(["frontend-monorepo-architecture", "frontend-api-bridge", "frontend-package-map", "frontend-rtk-single-source", "frontend-di-composition", "frontend-troubleshooting-patterns"])
        }
    ],

    contact: {
        sectionId: 'contact',
        panelTitle: 'CONTACT',
        panelUid: 'ID: COMMS-01',
        description: 'Submit transmission to initiate collaboration.',
        actions: [
            { label: 'SEND_EMAIL', href: 'mailto:yohan032yohan@gmail.com' },
            { label: 'GITHUB', href: 'https://github.com/ramyo564' },
            { label: 'EVIDENCE', href: './evidence/l_n_project/index.html' },
            { label: 'YOUTUBE', href: 'https://www.youtube.com/@yohanjang-xe9td' }
        ]
    },

    mermaid: {
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: 'Inter',
        flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'linear'
        }
    },

    diagrams
};
