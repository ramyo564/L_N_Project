import { diagrams } from './diagrams.js';
import { learnMoreLinks } from './learnmore-links.js';

const cardMeta = {
    "backend-spring-hex": { title: "Spring Hexagonal", description: "Controller, Application, Domain, and Adapter layers are separated by ports to keep domain logic clean and replaceable." },
    "backend-spring-auth": { title: "Spring Auth Flow", description: "Login and refresh issue JWT tokens, refresh session cookies are stored in Redis, and JwtAuthenticationFilter validates bearer tokens per request." },
    "backend-spring-packages": { title: "Spring Package Map", description: "Domain modules (`auth`, `project`, `task_mvc`, `subtask_mvc`, `user`) share a common platform package for security, cache, messaging, and observability." },
    "backend-spring-domain-rules": { title: "Spring Domain Rules", description: "Project ownership is verified through pending-cache-first access checks, then domain guards enforce delete-state immutability, duplicate reorder prevention, and idempotent delete behavior." },
    "backend-spring-state-management": { title: "Spring State Management", description: "Task, Project, and SubTask transitions are controlled in domain models with explicit completion timestamp rules and deleted-entity transition blocking." },
    "backend-spring-api-write": { title: "Spring API Write Path", description: "TaskController returns 202 quickly, writes optimistic Redis cache, and publishes task events to RabbitMQ." },
    "backend-spring-worker-consume": { title: "Spring Worker Consume Path", description: "TaskEventListener batch-consumes queue messages, executes command handlers, persists to PostgreSQL, and triggers cache eviction events." },
    "backend-spring-troubleshooting": { title: "Spring Troubleshooting", description: "Resolved major bottlenecks including MVC+WebFlux context overhead, Redis connection contention, race conditions after async writes, and RabbitMQ channel conflicts through staged architecture tuning." },
    "backend-fastapi-analyze": { title: "FastAPI Analyze Path", description: "Failure analysis verifies JWT via Spring, stores AI session state in Redis, queries Qdrant context, and generates recommendations with LLM." },
    "backend-fastapi-auth": { title: "FastAPI Auth Flow", description: "All protected AI endpoints validate bearer tokens by calling Spring verify API through shared httpx client and map verified user context for services." },
    "backend-fastapi-packages": { title: "FastAPI Package Map", description: "API router, dependency graph, services, domain interfaces, and infrastructure clients are split for testability and runtime flexibility." },
    "backend-fastapi-domain-rules": { title: "FastAPI Domain Rules", description: "Recommendations are normalized with JSON parsing and fallback rules, while feedback submission enforces session validity, index bounds, and recommendation mapping integrity." },
    "backend-fastapi-state-management": { title: "FastAPI State Management", description: "AI session lifecycle is persisted in Redis from analyzing to completed state, with category/recommendation snapshots and feedback metadata updates after task creation." },
    "backend-fastapi-feedback": { title: "FastAPI Feedback Path", description: "Selected recommendation indexes are resolved from Redis session snapshot and sent to Spring task API through SpringClient.create_tasks." },
    "backend-fastapi-troubleshooting": { title: "FastAPI Troubleshooting", description: "Hardened AI flow by handling token/verify failures, recommendation parsing fallbacks, invalid feedback selections, mapping mismatches, and cache/vector errors with resilient degradation paths." },
    "frontend-monorepo-architecture": { title: "Frontend Monorepo Architecture", description: "Apps, platform adapters, and core packages are split by dependency direction to keep business logic platform-independent and reusable across Web/RN/Electron." },
    "frontend-api-bridge": { title: "Frontend Auth & API Bridge", description: "Spring requests use `fetchBaseQuery` with reauth, while FastAPI AI requests use token-manager-backed codegen clients via `fakeBaseQuery` queryFn integration." },
    "frontend-package-map": { title: "Frontend Package Map", description: "Core modules (`api`, `store`, `domain`, `hooks`, `services`, `usecases`, `types`, `utils`) are organized to enforce predictable layering and import boundaries." },
    "frontend-rtk-single-source": { title: "RTK Single Source", description: "RTK Query is the single source of truth for server state. Query cache, optimistic patches, and rollback logic are centralized in API services." },
    "frontend-di-composition": { title: "DI Composition Flow", description: "`CoreServicesProvider` assembles hook-factory services, orchestration services, and usecases on top of a shared store for consistent feature wiring." },
    "frontend-troubleshooting-patterns": { title: "Troubleshooting Patterns", description: "Cache sync, 202-empty-body handling, optimistic consistency, field mapping, and infinite-render guards are documented and reflected in current implementation patterns." },
    "devops-ci-change-detection": { title: "CI Change Detection", description: "`dorny/paths-filter` routes PR changes into selective Spring, FastAPI, Frontend, Nginx, and Monitoring jobs so unchanged stacks skip expensive builds." },
    "devops-ci-integration-gate": { title: "CI Integration Gate", description: "`docker-compose.dev-CI.yml` brings up app plus dependencies, validates health/proxy paths, and blocks promotion until integration checks and Trivy scans pass." },
    "devops-cd-wireguard": { title: "CD via WireGuard", description: "Push to `main` or `dev` triggers temporary WireGuard tunnel, remote compose sync, branch-specific env injection, controlled deployment, then guaranteed VPN teardown." },
    "devops-image-promotion": { title: "Image Promotion Flow", description: "Built SHA tags are resolved to immutable digests and promoted with `imagetools create` into stable branch tags (`--dev`, `--prod`) for deterministic deploys." },
    "devops-compose-topology": { title: "Compose Runtime Topology", description: "`dev`, `database`, `network-utils`, and `monitoring` compose layers build one networked runtime with health-gated dependencies across API, data, cert, and telemetry stacks." },
    "devops-docker-build-map": { title: "Docker Build Map", description: "Spring Gradle cache mounts, FastAPI uv multi-stage sync, and Nginx+Frontend image assembly are separated into optimized stages with non-root runtime defaults." },
    "devops-nginx-runtime-validation": { title: "Nginx Runtime Validation", description: "Entrypoint pipeline renders templates, verifies unresolved variables, performs `nginx -t`, and fails fast before serving traffic when configuration is unsafe." },
    "devops-edge-security": { title: "Edge Security Model", description: "Cloudflare Tunnel hides origin IP via outbound-only edge path, while Certbot DNS-01, DDClient, and WireGuard-only SSH keep external attack surface minimized." },
    "devops-observability-pipeline": { title: "Observability Pipeline", description: "Prometheus scrapes app/exporter metrics, Grafana visualizes metrics/logs, and Alertmanager routes severity-based incidents to Slack with secret-backed webhooks." },
    "devops-k6-load-architecture": { title: "k6 Load Architecture", description: "Scenario suites share auth refresh/backoff utilities, profile-based ramping (`fast_test`, `stress2000`, `spike`), and optional CDN bypass paths for origin-only analysis." },
    "devops-stress-mode-lifecycle": { title: "Stress Mode Lifecycle", description: "Dedicated workflows toggle stress mode on/refresh/down by composing isolated `.env.stress`, test database stack, and controlled teardown for safe repeatable load tests." },
    "devops-troubleshooting-patterns": { title: "DevOps Troubleshooting", description: "Known incidents include Cloudflare tunnel protocol mismatch, OAuth redirect proto loss, k6 summary rounding blind spots, and high-VU host freeze mitigations." },
};

const mapCards = (ids) => ids.map((id) => ({
    mermaidId: id,
    title: cardMeta[id]?.title ?? id,
    description: cardMeta[id]?.description ?? '',
    learnMore: learnMoreLinks[id] ?? '#'
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
