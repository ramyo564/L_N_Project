import { diagrams } from './diagrams.js';
import { learnMoreLinks } from './learnmore-links.js';

const cardMeta = {
    "backend-spring-hex": { title: "Spring Hexagonal", description: "Controller, Application, Domain, and Adapter layers are separated by ports to keep domain logic clean and replaceable.", why: "도메인 규칙을 프레임워크 변경과 분리해 장기 리팩토링 비용을 낮추기 위해 계층 경계를 고정했습니다." },
    "backend-spring-auth": { title: "Spring Auth Flow", description: "Login and refresh issue JWT tokens, refresh session cookies are stored in Redis, and JwtAuthenticationFilter validates bearer tokens per request.", why: "인증 실패 처리와 토큰 수명 정책을 한 경로로 일관화해 보안 예외 케이스를 줄이기 위해서입니다." },
    "backend-spring-packages": { title: "Spring Package Map", description: "Domain modules (`auth`, `project`, `task_mvc`, `subtask_mvc`, `user`) share a common platform package for security, cache, messaging, and observability.", why: "기능 증가 시 모듈 단위로 영향 범위를 제한해 1인 개발에서도 변경 리스크를 관리하기 위해 분리했습니다." },
    "backend-spring-domain-rules": { title: "Spring Domain Rules", description: "Project ownership is verified through pending-cache-first access checks, then domain guards enforce delete-state immutability, duplicate reorder prevention, and idempotent delete behavior.", why: "권한·삭제·중복 규칙을 도메인 경계에 모아 API 레벨 분기 누락을 방지하기 위해서입니다." },
    "backend-spring-state-management": { title: "Spring State Management", description: "Task, Project, and SubTask transitions are controlled in domain models with explicit completion timestamp rules and deleted-entity transition blocking.", why: "상태 전이 규칙을 엔티티 내부에 고정해 비동기 처리 중에도 불변 조건을 유지하기 위해서입니다." },
    "backend-spring-api-write": { title: "Spring API Write Path", description: "TaskController returns 202 quickly, writes optimistic Redis cache, and publishes task events to RabbitMQ.", why: "사용자 응답 지연을 줄이기 위해 쓰기 처리와 실제 저장 타이밍을 분리했습니다." },
    "backend-spring-worker-consume": { title: "Spring Worker Consume Path", description: "TaskEventListener batch-consumes queue messages, executes command handlers, persists to PostgreSQL, and triggers cache eviction events.", why: "API 서버와 Worker 역할을 분리해 부하 급증 시에도 사용자 응답성을 보호했습니다." },
    "backend-spring-troubleshooting": { title: "Spring Troubleshooting", description: "Resolved major bottlenecks including MVC+WebFlux context overhead, Redis connection contention, race conditions after async writes, and RabbitMQ channel conflicts through staged architecture tuning.", why: "성능 개선은 단일 튜닝보다 병목 원인별 검증과 단계적 교정이 재현성이 높기 때문입니다." },
    "backend-fastapi-analyze": { title: "FastAPI Analyze Path", description: "Failure analysis verifies JWT via Spring, stores AI session state in Redis, queries Qdrant context, and generates recommendations with LLM.", why: "LLM 추론 전에 인증·컨텍스트·유사사례를 선행해 응답 품질과 실패 복구 가능성을 높이기 위해서입니다." },
    "backend-fastapi-auth": { title: "FastAPI Auth Flow", description: "All protected AI endpoints validate bearer tokens by calling Spring verify API through shared httpx client and map verified user context for services.", why: "인증 경로를 단일화해 정책 중복과 보안 불일치를 줄였습니다." },
    "backend-fastapi-packages": { title: "FastAPI Package Map", description: "API router, dependency graph, services, domain interfaces, and infrastructure clients are split for testability and runtime flexibility.", why: "AI 의존성과 외부 API 변동을 서비스 핵심 로직과 분리해 테스트와 교체 비용을 낮추기 위해서입니다." },
    "backend-fastapi-domain-rules": { title: "FastAPI Domain Rules", description: "Recommendations are normalized with JSON parsing and fallback rules, while feedback submission enforces session validity, index bounds, and recommendation mapping integrity.", why: "LLM 출력의 불확실성을 도메인 규칙으로 정규화해 잘못된 추천 전파를 막기 위해서입니다." },
    "backend-fastapi-state-management": { title: "FastAPI State Management", description: "AI session lifecycle is persisted in Redis from analyzing to completed state, with category/recommendation snapshots and feedback metadata updates after task creation.", why: "분석-피드백-생성의 다단계 요청을 세션 상태로 고정해 일관성을 보장하기 위해서입니다." },
    "backend-fastapi-feedback": { title: "FastAPI Feedback Path", description: "Selected recommendation indexes are resolved from Redis session snapshot and sent to Spring task API through SpringClient.create_tasks.", why: "사용자 선택 인덱스를 세션 스냅샷과 매핑해 잘못된 task 생성을 방지하기 위해서입니다." },
    "backend-fastapi-troubleshooting": { title: "FastAPI Troubleshooting", description: "Hardened AI flow by handling token/verify failures, recommendation parsing fallbacks, invalid feedback selections, mapping mismatches, and cache/vector errors with resilient degradation paths.", why: "AI 기능은 외부 의존성이 많아 실패 전파를 막는 안전한 저하 전략이 필수입니다." },
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

const mapCards = (ids) => ids.map((id) => ({
    mermaidId: id,
    title: cardMeta[id]?.title ?? id,
    description: cardMeta[id]?.description ?? '',
    why: cardMeta[id]?.why ?? '',
    links: [
        { label: 'EVIDENCE', href: `./evidence/l_n_project/index.html#${id}`, variant: 'primary' },
        { label: 'README', href: learnMoreLinks[id] ?? '#', variant: 'ghost' }
    ]
}));

export const templateConfig = {
    system: {
        documentTitle: 'Yohan | System Architect',
        systemName: 'YOHAN_SYSTEM_V.3.2'
    },

    hero: {
        sectionId: 'system-architecture',
        panelTitle: 'SYSTEM_ARCHITECTURE',
        panelUid: 'ID: LIFE-NAV-01',
        diagramId: 'architecture',
        metrics: [
            'READ p95: 975ms -> 141ms (-86%) @500VU',
            'WRITE p95: 1.9s -> 126ms (-93%) @500VU',
            'READ/WRITE RPS: 972 -> 3,680 (+279%), 373 -> 916 (+146%)',
            'FASTAPI IMG/BUILD: 26GB -> 1GB (-96%), 1004s -> 98s (-90%)',
            'FRONTEND BUILD/SETUP: 4m10s -> 45s (-82%), 30m -> 2m (-95%)'
        ]
    },

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
            theme: 'blue',
            cardVisualHeight: '290px',
            cardClass: 'backend-card',
            groups: [
                {
                    title: 'SPRING STACK',
                    desc: 'Architecture / Auth / Package / Domain / State / Write-Worker / Troubleshooting',
                    cards: mapCards(["backend-spring-hex", "backend-spring-auth", "backend-spring-packages", "backend-spring-domain-rules", "backend-spring-state-management", "backend-spring-api-write", "backend-spring-worker-consume", "backend-spring-troubleshooting"])
                },
                {
                    title: 'FASTAPI STACK',
                    desc: 'Analyze / Auth / Package / Domain / State / Feedback / Troubleshooting',
                    cards: mapCards(["backend-fastapi-analyze", "backend-fastapi-auth", "backend-fastapi-packages", "backend-fastapi-domain-rules", "backend-fastapi-state-management", "backend-fastapi-feedback", "backend-fastapi-troubleshooting"])
                }
            ]
        },
        {
            id: 'frontend-services',
            title: 'FRONTEND_SERVICES',
            navLabel: 'FRONTEND_SERVICES',
            theme: 'green',
            cardVisualHeight: '260px',
            cardClass: 'frontend-card',
            cards: mapCards(["frontend-monorepo-architecture", "frontend-api-bridge", "frontend-package-map", "frontend-rtk-single-source", "frontend-di-composition", "frontend-troubleshooting-patterns"])
        },
        {
            id: 'devops-services',
            title: 'DEVOPS_SERVICES',
            navLabel: 'DEVOPS_SERVICES',
            theme: 'orange',
            cardVisualHeight: '265px',
            cardClass: 'devops-card',
            groups: [
                {
                    title: 'DELIVERY PIPELINE',
                    desc: 'Selective CI / Integration Gate / Secure CD / Image Promotion',
                    cards: mapCards(["devops-ci-change-detection", "devops-ci-integration-gate", "devops-cd-wireguard", "devops-image-promotion"])
                },
                {
                    title: 'RUNTIME INFRA',
                    desc: 'Compose Topology / Build Strategy / Edge Security / Observability',
                    cards: mapCards(["devops-compose-topology", "devops-docker-build-map", "devops-nginx-runtime-validation", "devops-edge-security", "devops-observability-pipeline"])
                },
                {
                    title: 'LOAD & RELIABILITY',
                    desc: 'k6 Profiles / Stress Mode Switch / Operational Troubleshooting',
                    cards: mapCards(["devops-k6-load-architecture", "devops-stress-mode-lifecycle", "devops-troubleshooting-patterns"])
                }
            ]
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
