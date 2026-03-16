import { diagrams } from './diagrams.js';
import { learnMoreLinks } from './learnmore-links.js';

const cardMeta = {
    "backend-spring-core": { title: "Spring Boot Core Architecture", description: "전체적인 Hexagonal Architecture 구조와 API/Worker 분리, 외부 인프라 연동 흐름을 도식화했습니다.", cardClass: "backend-card" },
    "backend-spring-hex": { title: "BE-C01: Hexagonal Architecture", description: "Controller, Application, Domain, Adapter 계층을 포트로 분리하여 도메인 로직을 프레임워크로부터 보호했습니다.", cardClass: "backend-card" },
    "backend-spring-auth": { title: "BE-C02: 통합 인증 (Spring Auth)", description: "Redis 기반의 Refresh Session 관리와 JwtAuthenticationFilter를 통한 단일 인증 정책을 수립했습니다.", cardClass: "backend-card" },
    "backend-spring-oauth2": { title: "BE-C16: OAuth2 소셜 로그인 통합", description: "구글, 카카오, 네이버 소셜 로그인을 인터페이스 기반으로 통합하여 채널 확장성을 확보했습니다.", cardClass: "backend-card" },
    "backend-spring-packages": { title: "BE-C03: 패키지/모듈 분리", description: "도메인별 모듈화를 통해 기능 추가 시 영향 범위를 제한하고 독립적인 유지보수가 가능하게 설계했습니다.", cardClass: "backend-card" },
    "backend-spring-api-write": { title: "BE-C06: 비동기 쓰기 (API Write Path)", description: "202 Accepted 응답 후 RabbitMQ를 통한 비동기 처리를 도입하여 쓰기 지연을 획기적으로 개선했습니다.", cardClass: "backend-card" },
    "backend-spring-worker-consume": { title: "BE-C07: 워커 역할 분리", description: "API 서버와 워커 서버의 역할을 분리하여 부하 급증 시에도 사용자 응답성을 최우선으로 보호합니다.", cardClass: "backend-card" },
    "backend-spring-state-management": { title: "BE-C05: 상태 관리 (State Management)", description: "엔티티 내부의 명확한 상태 전이 규칙을 통해 비동기 처리 중에도 데이터 정합성을 유지합니다.", cardClass: "backend-card" },
    "backend-spring-troubleshooting": { title: "BE-C08: 병목 재현 및 검증", description: "k6를 활용해 실제 병목 구간을 재현하고 단계적으로 튜닝하여 성능 한계를 확장했습니다.", cardClass: "backend-card" },
    "backend-fastapi-analyze": { title: "BE-C09: AI 세션 복구", description: "Redis 세션과 Qdrant 컨텍스트를 활용해 AI 분석 도중 장애가 발생해도 맥락을 유지하며 복구합니다.", cardClass: "backend-card" },
    "backend-fastapi-auth": { title: "BE-C10: AI 보안 인증", description: "FastAPI 요청마다 Spring Auth를 검증하는 구조를 통해 분산 환경에서도 일관된 보안 수준을 유지합니다.", cardClass: "backend-card" },
    "backend-fastapi-packages": { title: "BE-C11: AI 구조 설계", description: "계층화된 구조 설계를 통해 AI 로직의 테스트 가능성과 인프라 교체 용이성을 확보했습니다.", cardClass: "backend-card" },
    "backend-fastapi-domain-rules": { title: "BE-C12: LLM 응답 정규화", description: "LLM의 비정형 응답을 JSON으로 정규화하고 매핑 무결성을 검증하는 안전 장치를 마련했습니다.", cardClass: "backend-card" },
    "backend-fastapi-state-management": { title: "BE-C13: AI 상태 생명주기", description: "분석부터 생성까지의 AI 작업 단계를 Redis 기반 세션으로 관리하여 단계별 일관성을 보장합니다.", cardClass: "backend-card" },
    "backend-fastapi-feedback": { title: "BE-C14: 매핑 검증 오류 방지", description: "사용자 피드백과 AI 추천 항목 간의 인덱스 매핑을 검증하여 잘못된 태스크 생성을 차단합니다.", cardClass: "backend-card" },
    "backend-fastapi-troubleshooting": { title: "BE-C15: 외부 API 장애 격리", description: "외부 AI 서비스 장애가 메인 비즈니스 로직으로 전파되지 않도록 서킷 브레이커와 폴백 전략을 적용했습니다.", cardClass: "backend-card" },
    "frontend-monorepo-architecture": { title: "Frontend Monorepo", description: "Turborepo를 활용해 Web, App 간 공용 로직을 패키지화하고 플랫폼 독립적인 아키텍처를 구축했습니다.", cardClass: "frontend-card" },
    "frontend-rtk-single-source": { title: "RTK Single Source", description: "RTK Query를 단일 상태원으로 활용하여 서버-클라이언트 간의 데이터 동기화와 낙관적 업데이트를 구현했습니다.", cardClass: "frontend-card" },
    "frontend-api-bridge": { title: "Frontend API Bridge", description: "Spring과 FastAPI 간의 서로 다른 인증 체계를 프론트엔드 레벨에서 투명하게 연결했습니다.", cardClass: "frontend-card" },
    "frontend-di-composition": { title: "DI Composition Flow", description: "서비스 조립 지점을 단일화하여 기능 교체와 테스트가 용이한 의존성 주입 구조를 설계했습니다.", cardClass: "frontend-card" },
    "devops-ci-change-detection": { title: "Selective CI Pipeline", description: "변경 범위에 따라 필요한 스택만 빌드하도록 최적화하여 CI 피드백 시간을 단축했습니다.", cardClass: "devops-card" },
    "devops-cd-wireguard": { title: "Secure CD via VPN", description: "포트 개방 없이 WireGuard VPN 터널을 통해 안전하게 홈서버로 배포하는 파이프라인을 구축했습니다.", cardClass: "devops-card" },
    "devops-compose-topology": { title: "Compose Runtime Topology", description: "API, Data, Monitoring 레이어를 컴포즈 계층으로 분리하여 환경별 실행 편차를 제거했습니다.", cardClass: "devops-card" },
    "devops-observability-pipeline": { title: "Observability Pipeline", description: "Prometheus, Grafana, Loki를 통합하여 장애 감지부터 원인 분석까지의 경로를 일원화했습니다.", cardClass: "devops-card" },
    "devops-k6-load-architecture": { title: "k6 Load Architecture", description: "재현 가능한 부하 테스트 시나리오를 통해 아키텍처 개선 전후의 성능 지표를 객관적으로 증명했습니다.", cardClass: "devops-card" },
};

const mapCards = (ids) => ids.map((id) => ({
    mermaidId: id,
    title: cardMeta[id]?.title ?? id,
    description: cardMeta[id]?.description ?? '',
    links: [
        { label: 'EVIDENCE', href: `./evidence/l_n_project/index.html#${id}`, variant: 'primary' },
        { label: 'README', href: learnMoreLinks[id] ?? '#', variant: 'ghost' }
    ],
    cardClass: cardMeta[id]?.cardClass ?? ''
}));

export const templateConfig = {
    system: {
        documentTitle: 'Yohan | Life Navigation Full-stack Architect',
        systemName: 'LIFE_NAVIGATION_ARCHITECTURE_V.2026'
    },

    hero: {
        sectionId: 'system-overview',
        panelTitle: 'SYSTEM_OVERVIEW',
        panelUid: 'ID: LIFE-NAV-00',
        diagramId: 'architecture',
        metrics: [
            'Architecture: Hexagonal (Ports & Adapters) for Domain Protection',
            'Core: High-Performance Async Architecture & AI Pipeline',
            'Result: Read RPS 3,680 달성, Write p95 126ms (15배 개선)',
            'Baseline: 500VU 실측 증거 기반',
            'Security: JWT + Redis-based Unified Authentication Filter',
            'Stability: Explicit API/Worker Separation for Load Balancing'
        ],
        quickLinks: [
            { label: 'GITHUB_REPO', href: 'https://github.com/ramyo564/L_N_Project', variant: 'primary' },
            { label: 'PROBLEM_SOLVING', href: 'https://ramyo564.github.io/L_N_Project-portfolio/', variant: 'secondary' },
            { label: 'PORTFOLIO_HUB', href: 'https://ramyo564.github.io/Portfolio/', variant: 'ghost' }
        ]
    },

    topPanels: [],

    skills: {
        sectionId: 'skill-set',
        panelTitle: 'SKILL_SET',
        panelUid: 'ID: STACK-MAP',
        items: [
            { title: 'BACKEND', stack: 'Java 21, Spring Boot 3, Python 3.11, FastAPI' },
            { title: 'DATA', stack: 'PostgreSQL 15, Redis, RabbitMQ, Qdrant' },
            { title: 'FRONTEND', stack: 'React 19, TypeScript 5, RTK Query, Turborepo' },
            { title: 'DEVOPS', stack: 'Docker Compose, GitHub Actions, WireGuard, Cloudflare' },
            { title: 'OPS', stack: 'Prometheus, Grafana, Loki, Alertmanager, k6' }
        ]
    },

    serviceSections: [
        {
            id: 'architecture-quick-scan',
            title: 'ARCHITECTURE_QUICK_SCAN',
            navLabel: 'QUICK_SCAN',
            theme: 'blue',
            recruiterBrief: {
                kicker: 'CORE_SYSTEM_PILLARS',
                title: '시스템 설계 핵심 요약 (Architecture Overview)',
                cases: [
                    {
                        id: 'Backend',
                        title: 'Java Spring & Python FastAPI (Hybrid)',
                        problem: '고부하 트래픽 처리(Core)와 리소스 집중형 분석 로직(AI)의 성능 상충',
                        action: 'Spring(비즈니스)과 FastAPI(AI)의 물리적 분리 및 RabbitMQ를 통한 비동기 서비스 연동',
                        impact: '영역별 독립적 스케일링 및 장애 격리 확보 (Read RPS 3,680 / Write p95 126ms)',
                        links: [{ label: 'SHOW_BACKEND_DETAILS', href: '#backend-overview' }]
                    },
                    {
                        id: 'DevOps',
                        title: '보안 배포 및 성능 검증 체계',
                        problem: '홈서버 환경의 보안 제약(IP 노출) 및 정량적인 성능 임계치 미파악',
                        action: 'WireGuard VPN 기반 CD 구축 및 k6 시나리오 자동화를 통한 반복 검증 루프',
                        impact: '외부 공격면 최소화 및 500VU 고부하 환경에서의 시스템 신뢰성 최종 입증',
                        links: [{ label: 'SHOW_DEVOPS_DETAILS', href: '#devops-services' }]
                    },
                    {
                        id: 'Frontend',
                        title: '확장 가능한 모노레포 구조',
                        problem: '다양한 플랫폼 지원 시 발생하는 코드 중복 및 비동기 응답 처리의 데이터 불일치',
                        action: 'Turborepo 기반 패키지화 및 RTK Query 단일 상태원(SSOT) 적용',
                        impact: '비즈니스 로직 재사용성 극대화 및 비동기 환경에서의 데이터 정합성 유지',
                        links: [{ label: 'SHOW_FRONTEND_DETAILS', href: '#frontend-services' }]
                    }
                ]
            }
        },
        {
            id: 'backend-overview',
            title: 'BACKEND_ARCHITECTURE_OVERVIEW',
            navLabel: 'BACKEND_OVERVIEW',
            theme: 'blue',
            recruiterBrief: {
                kicker: 'SYSTEM_COMPOSITION',
                title: '백엔드 엔진 구성 (Spring & FastAPI)',
                cases: [
                    {
                        id: 'Spring Boot',
                        title: '비즈니스 로직 및 고성능 트랜잭션 엔진',
                        problem: '대규모 트래픽 처리와 복잡한 비즈니스 규칙의 안정적 관리 필요',
                        action: 'Hexagonal Architecture 기반 도메인 보호 및 비동기 쓰기 최적화',
                        impact: '시스템 코어 엔진으로서 데이터 무결성 및 고가용성 보장',
                        links: [{ label: 'SHOW_SPRING_DESIGN', href: '#backend-spring-core-summary' }]
                    },
                    {
                        id: 'FastAPI',
                        title: 'AI 추천 및 데이터 분석 파이프라인',
                        problem: '실시간 AI 분석 부하로부터 메인 비즈니스 런타임 보호 필요',
                        action: 'Python 기반 AI 전용 파이프라인 구축 및 Redis 세션 기반 복구 경로',
                        impact: '독립적인 AI 서비스 스케일링 및 장애 한계선 확보',
                        links: [{ label: 'SHOW_FASTAPI_DESIGN', href: '#backend-fastapi-detail' }]
                    }
                ]
            }
        },
        {
            id: 'backend-spring-core-summary',
            title: 'SPRING_BOOT_CORE_DESIGN_SUMMARY',
            navLabel: 'SPRING_CORE',
            theme: 'blue',
            recruiterBrief: {
                kicker: 'SPRING_CORE_DESIGN',
                title: 'Spring Boot 설계 핵심 요약 (Core Decisions)',
                cases: [
                    {
                        id: 'Architecture',
                        anchorId: 'backend-spring-core',
                        title: 'Spring Boot Core Architecture',
                        problem: '복잡한 비즈니스 로직과 다양한 인프라(DB, MQ, AI) 간의 높은 결합도로 인한 유지보수성 저하',
                        action: 'Hexagonal Architecture 기반의 계층 분리 및 API/Worker 물리적 역할 분리 설계',
                        impact: '도메인 로직 보호 및 부하 상황에서의 유연한 확장성(Scalability) 확보'
                    },
                    {
                        id: 'BE-C01',
                        anchorId: 'backend-spring-hex',
                        title: 'Hexagonal Architecture (도메인 보호)',
                        problem: '인프라 기술이 비즈니스 로직에 침투하여 결합도 상승',
                        action: 'Ports & Adapters 패턴을 통한 계층 분리',
                        impact: '순수 도메인 테스트 및 인프라 교체 비용 최소화'
                    },
                    {
                        id: 'BE-C06',
                        anchorId: 'backend-spring-api-write',
                        title: '비동기 쓰기 경로 최적화 (성능)',
                        problem: '동기 DB 저장으로 인한 API 응답 지연',
                        action: '202 Accepted 즉시 응답 + RabbitMQ Outbox 기반 비동기 처리',
                        impact: 'Write p95 지연 시간 15배 단축 (1.9s -> 126ms)'
                    },
                    {
                        id: 'BE-C05',
                        anchorId: 'backend-spring-state-management',
                        title: '상태 관리 규칙 정의 (정합성)',
                        problem: '비동기 환경에서의 엔티티 상태 전이 모호성',
                        action: '도메인 모델 내부에 명확한 상태 전이 및 불변 규칙 정의',
                        impact: '고동시성 상황에서도 비즈니스 데이터 무결성 유지'
                    },
                    {
                        id: 'BE-C02',
                        anchorId: 'backend-spring-auth',
                        title: '통합 인증 필터 및 보안 (보안)',
                        problem: '인증 정책 파편화 및 중복 유저 조회 발생',
                        action: 'JWT Claims 기반 인증 + Redis 연동 단일 보안 필터',
                        impact: '인증 쿼리 최소화(3→1) 및 일관된 보안 정책 강제'
                    },
                    {
                        id: 'BE-C16',
                        anchorId: 'backend-spring-oauth2',
                        title: 'OAuth2 소셜 로그인 통합 (DI/DIP 설계)',
                        problem: '채널 추가 시마다 인증 로직 분기 및 코드 복잡도 증가',
                        action: '인터페이스 기반 채널 추상화(DI/DIP) 및 벤더 검수(Google/Kakao/Naver) 완료',
                        impact: 'OCP 준수로 기존 코드 수정 없는 신규 채널 확장 및 일관된 인증 경험 확보'
                    }
                ],
                links: [
                    { label: 'SHOW_SPRING_DIAGRAM', href: '#backend-architecture-spring', variant: 'primary' }
                ]
            }
        },
        {
            id: 'backend-spring-infra-summary',
            title: 'SPRING_BOOT_INFRA_DESIGN_SUMMARY',
            navLabel: 'SPRING_INFRA',
            theme: 'blue',
            recruiterBrief: {
                kicker: 'SPRING_INFRA_DESIGN',
                title: 'Spring Boot 인프라 및 운영 요약 (Infra & Ops)',
                cases: [
                    {
                        id: 'BE-C07',
                        anchorId: 'backend-spring-worker-consume',
                        title: 'API/Worker 역할 분리 (확장성)',
                        problem: '단일 서버 내 발행/소비 로직 혼재로 부하 전파 위험',
                        action: '물리적 서버 역할 분리를 통한 부하 분산 및 전용 컨슈머 운영',
                        impact: '피크 부하 시에도 사용자 요청 경로 안정성 100% 보호'
                    },
                    {
                        id: 'BE-C03',
                        anchorId: 'backend-spring-packages',
                        title: '패키지/모듈 분리 (유지보수)',
                        problem: '기능 증가 시 변경 영향 범위 확산 및 결합도 상승',
                        action: '도메인/기능 중심 모듈화 및 계층간 참조 규칙 강제',
                        impact: '모듈 단위 변경 격리로 리팩토링 및 확장 안정성 확보'
                    },
                    {
                        id: 'BE-C08',
                        anchorId: 'backend-spring-troubleshooting',
                        title: '병목 재현 및 검증 (관측성)',
                        problem: '병목 원인 불명 상태에서 튜닝 회귀 반복 및 데이터 부재',
                        action: 'k6 재현-수정-검증 루프 고정 및 실측 지표 수집',
                        impact: '객관적인 성능 임계치 파악 및 최적화 효과 실측 데이터 확보'
                    },
                    {
                        id: 'BE-C16',
                        anchorId: 'backend-spring-oauth2',
                        title: 'OAuth2 소셜 로그인 통합 (확장성)',
                        problem: '채널 추가 시마다 인증 로직 분기 및 코드 복잡도 증가',
                        action: '인터페이스 기반 채널 추상화 및 DI 통합 구조 설계',
                        impact: '코드 수정 없는 신규 채널 확장성 및 일관된 인증 경험'
                    }
                ]
            }
        },
        {
            id: 'backend-spring-details',
            title: 'SPRING_BOOT_TECHNICAL_DECISIONS',
            navLabel: 'SPRING_DETAILS',
            theme: 'blue',
            cardVisualHeight: '290px',
            groups: [
                {
                    title: 'SPRING CORE DECISIONS',
                    desc: '핵심 설계 및 성능 튜닝',
                    cards: mapCards(["backend-spring-core", "backend-spring-hex", "backend-spring-api-write", "backend-spring-state-management", "backend-spring-auth"])
                },
                {
                    title: 'SPRING INFRA & OPS',
                    desc: '워커 분리 및 병목 검증',
                    cards: mapCards(["backend-spring-worker-consume", "backend-spring-packages", "backend-spring-troubleshooting", "backend-spring-oauth2"])
                }
            ]
        },
        {
            id: 'backend-fastapi-detail',
            title: 'FASTAPI_ARCHITECTURE_DEEP_DIVE',
            navLabel: 'FASTAPI_DETAIL',
            theme: 'blue',
            cardVisualHeight: '290px',
            recruiterBrief: {
                kicker: 'FASTAPI_AI_DESIGN',
                title: 'FastAPI AI 파이프라인 핵심 요약 (Architecture Strategy)',
                cases: [
                    {
                        id: 'AI_Auth',
                        anchorId: 'backend-fastapi-auth',
                        title: '서비스 간 통합 보안 인증',
                        problem: '분산 환경의 FastAPI AI 경로에서의 보안 공백 및 인증 정책 불일치 리스크',
                        action: 'Spring Auth Verify 연동을 통한 요청 단위 보안 필터 및 전용 httpx 클라이언트 구축',
                        impact: '분산 서버 환경에서도 Spring Core와 동일한 수준의 보안 가드레일 강제'
                    },
                    {
                        id: 'AI_Pipeline',
                        anchorId: 'backend-fastapi-analyze',
                        title: '지능형 세션 복구 및 분석',
                        problem: '무거운 AI 분석 중 네트워크 장애 시 작업 맥락 상실 및 중복 연산 발생',
                        action: 'Redis 기반 세션 스냅샷 저장 및 Qdrant 벡터 컨텍스트 선행 로딩 아키텍처',
                        impact: '장애 발생 시에도 중단 지점부터 즉시 복구 가능한 회복 탄력성(Resilience) 확보'
                    },
                    {
                        id: 'AI_Resilience',
                        anchorId: 'backend-fastapi-troubleshooting',
                        title: '외부 API 장애 격리 및 폴백',
                        problem: 'LLM 등 외부 API 장애가 전체 서비스 가용성 저하로 전파',
                        action: '비정형 응답 정규화(JSON) 및 단계적 기능 저하(Graceful Degradation) 전략 적용',
                        impact: '외부 의존 장애 상황에서도 핵심 분석 기능 및 사용자 경험 방어'
                    }
                ],
                links: [
                    { label: 'SHOW_FASTAPI_DIAGRAM', href: '#backend-architecture-fastapi', variant: 'primary' }
                ]
            },
            groups: [
                {
                    title: 'FASTAPI AI PIPELINE',
                    desc: 'AI 분석, 보안 및 장애 격리',
                    cards: mapCards(["backend-fastapi-auth", "backend-fastapi-analyze", "backend-fastapi-state-management", "backend-fastapi-domain-rules", "backend-fastapi-feedback", "backend-fastapi-troubleshooting", "backend-fastapi-packages"])
                }
            ]
        },
        {
            id: 'devops-services',
            title: 'DEVOPS_ARCHITECTURE_DEEP_DIVE',
            navLabel: 'DEVOPS',
            theme: 'orange',
            cardVisualHeight: '265px',
            recruiterBrief: {
                kicker: 'DEVOPS_PERFORMANCE_STRATEGY',
                title: '배포 안정성 및 관측성 핵심 요약',
                cases: [
                    {
                        id: 'Delivery',
                        anchorId: 'devops-cd-wireguard',
                        title: '보안 중심의 제로 터치 배포',
                        problem: '공인 IP 개방 없는 홈서버 환경으로의 안전한 배포 경로 확보 필요',
                        action: 'WireGuard VPN 터널을 통한 임시 보안 경로 구축 및 CD 자동화',
                        impact: '외부 공격 노출면 제거 및 안정적인 원격 배포 파이프라인 확보'
                    },
                    {
                        id: 'Validation',
                        anchorId: 'devops-k6-load-architecture',
                        title: '부하 테스트 기반 성능 검증',
                        problem: '아키텍처 개선 전후의 성과를 입증할 객관적 성능 지표 부재',
                        action: 'k6 부하 테스트 시나리오 자동화 및 관측성 지표 통합 분석',
                        impact: '500VU 고부하 환경 성능 증명 및 기술적 결정 근거 확보'
                    },
                    {
                        id: 'Observability',
                        anchorId: 'devops-observability-pipeline',
                        title: '통합 관측성 파이프라인',
                        problem: '분산 환경에서의 장애 인지 지연 및 원인 추적 경로 파편화',
                        action: 'Prometheus, Grafana, Loki를 활용한 메릭·로그·알림 통합',
                        impact: '장애 조기 감지 및 원인 분석 리드타임 획기적 단축'
                    }
                ]
            },
            groups: [
                {
                    title: "DELIVERY & INFRA",
                    desc: "CI/CD 및 런타임 환경",
                    cards: mapCards(["devops-ci-change-detection", "devops-cd-wireguard", "devops-compose-topology"])
                },
                {
                    title: "OPS & RELIABILITY",
                    desc: "모니터링 및 성능 실측",
                    cards: mapCards(["devops-observability-pipeline", "devops-k6-load-architecture"])
                }
            ]
        },
        {
            id: 'frontend-services',
            title: 'FRONTEND_ARCHITECTURE_DEEP_DIVE',
            navLabel: 'FRONTEND',
            theme: 'green',
            cardVisualHeight: '260px',
            recruiterBrief: {
                kicker: 'FRONTEND_ARCHITECTURE_STRATEGY',
                title: '모노레포 및 상태 관리 핵심 요약',
                cases: [
                    {
                        id: 'Monorepo',
                        anchorId: 'frontend-monorepo-architecture',
                        title: '확장 가능한 모노레포 구조',
                        problem: 'Web/App 간 코드 중복 및 플랫폼 독립적인 비즈니스 로직 관리의 어려움',
                        action: 'Turborepo 기반 패키지 분리 및 플랫폼 어댑터 패턴 적용',
                        impact: '로직 재사용성 극대화 및 플랫폼 추가 시 개발 비용 최소화'
                    },
                    {
                        id: 'State',
                        anchorId: 'frontend-rtk-single-source',
                        title: '서버 상태 동기화 최적화',
                        problem: '비동기 응답(202) 흐름에서의 UI-서버 간 데이터 불일치 및 사용자 경험 저하',
                        action: 'RTK Query SSOT 적용 및 낙관적 업데이트/롤백 로직 중앙화',
                        impact: '복잡한 비동기 환경에서도 높은 데이터 정합성과 응답성 유지'
                    }
                ]
            },
            groups: [
                {
                    title: 'FRONTEND CORE',
                    desc: '모노레포 및 상태 관리 설계',
                    cards: mapCards(["frontend-monorepo-architecture", "frontend-rtk-single-source", "frontend-api-bridge", "frontend-di-composition"])
                }
            ]
        }
    ],

    contact: {
        sectionId: 'contact',
        panelTitle: 'CONTACT',
        panelUid: 'ID: COMMS-01',
        description: '시스템 아키텍처 및 풀스택 설계 관련 협업 문의는 아래 채널로 부탁드립니다.',
        actions: [
            { label: 'GITHUB_REPO', href: 'https://github.com/ramyo564/L_N_Project' },
            { label: 'SEND_EMAIL', href: 'mailto:yohan032yohan@gmail.com' },
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
