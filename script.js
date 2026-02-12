// System Dashboard Logic
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Inter',
    flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'linear'
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    // Uptime Counter Simulation
    const startTime = new Date();
    const uptimeElement = document.getElementById('uptime');

    function updateUptime() {
        const now = new Date();
        const diff = Math.floor((now - startTime) / 1000);

        const h = Math.floor(diff / 3600).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');

        uptimeElement.textContent = `${h}:${m}:${s}`;
    }

    setInterval(updateUptime, 1000);
    updateUptime();

    // Node Hover Effects removed as we use Mermaid now


    // Mermaid Diagram Definitions
    const diagrams = {
        'architecture': `
            graph LR
            subgraph Client [Client]
                Browser[Web Browser]
            end

            subgraph Edge [Edge Layer]
                CDN[Cloudflare]
                LB[Nginx LB]
            end

            subgraph Spring [Spring Backend]
                API[Task API]
                AUTH[Auth Verify]
                WORKER[Task Worker Listener]
                EVICT[Cache Eviction Listener]
            end

            subgraph AI [FastAPI AI Service]
                FAPI[Analyze and Feedback API]
                ANALYSIS[AnalysisService]
                RECO[RecommendationEngine]
            end

            subgraph Data [Data Layer]
                PG[(PostgreSQL)]
                REDIS[(Redis)]
                MQ((RabbitMQ todo.exchange))
                QDRANT[(Qdrant)]
                LLM[External LLM API]
            end

            Browser -->|HTTPS| CDN
            CDN --> LB
            LB -->|/api| API
            LB -->|/api/v1/ai| FAPI

            API --> AUTH
            API --> REDIS
            API --> MQ
            API --> PG
            MQ -->|task events| WORKER
            WORKER --> PG
            WORKER --> EVICT
            EVICT --> REDIS

            FAPI -->|verify access token| AUTH
            FAPI --> ANALYSIS
            ANALYSIS --> REDIS
            ANALYSIS --> RECO
            RECO --> QDRANT
            RECO --> LLM
            FAPI -->|create selected tasks| API

            classDef default fill:#161b22,stroke:#30363d,color:#c9d1d9
            classDef accent fill:#161b22,stroke:#58a6ff,color:#58a6ff
            class Browser,API,FAPI,WORKER accent
        `,
        // Backend Services
        'backend-spring-hex': `
            graph TB
            In[adapter/in web and messaging] --> App[application command query service]
            App --> Domain[domain model event service]
            Domain --> Port[port interfaces]
            Port --> Out[adapter/outbound persistence messaging security]
            Out --> Infra[PostgreSQL Redis RabbitMQ]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class In,App,Domain b
            class Port o
            class Out,Infra g
        `,

        'backend-spring-auth': `
            graph TB
            Client[Client] --> Login[POST /api/v1/auth/login]
            Login --> LCH[LoginCommandHandler]
            LCH --> JWT[JwtProvider issue access and refresh]
            LCH --> Cookie[TokenCookieManager set cookies]
            LCH --> RTS[(RefreshTokenService Redis session store)]

            APIReq[Protected API request] --> Filter[JwtAuthenticationFilter]
            Filter --> BL[RefreshTokenPort isBlacklisted]
            Filter --> Cache[AuthTokenCache Redis hit or miss]
            Filter --> Validate[JwtProvider validate and parse access token]
            Validate --> Security[SecurityContext authentication]

            Refresh[POST /api/v1/auth/refresh] --> RCH[ReissueTokenCommandHandler]
            RCH --> Rotate[RefreshTokenService replaceToken and rotate]
            Rotate --> CookieRefresh[Set rotated refresh session cookie]

            Logout[POST /api/v1/auth/logout] --> LOH[LogoutCommandHandler]
            LOH --> Revoke[Delete refresh session and blacklist access]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class Client,Login,LCH,Filter,Refresh,Logout,RCH,LOH b
            class JWT,Validate,Security,Cookie,CookieRefresh o
            class RTS,Cache,BL,Rotate,Revoke g
        `,

        'backend-spring-domain-rules': `
            graph TB
            Req[Task and Project commands] --> Access[ProjectAccessVerifier]
            Access --> Pending[ProjectPendingCachePort isPending]
            Pending -- hit --> Allow[Allow request]
            Pending -- miss --> OwnCache[Ownership cache project_ownership_v2]
            OwnCache -- miss --> OwnDb[ProjectRepository isOwnerAndActive]
            OwnDb --> Allow
            Access -->|not owner| Deny[ForbiddenProjectAccessException]

            Allow --> Guard[Domain Guard Rules]
            Guard --> Deleted[Deleted entity blocks status and position update]
            Guard --> Dup[Reorder duplicate ID check and reject]
            Guard --> Idem[Delete handlers idempotent skip if already deleted]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class Req,Access,Allow,Guard b
            class Pending,OwnCache,OwnDb,Deny o
            class Deleted,Dup,Idem g
        `,

        'backend-spring-state-management': `
            graph TB
            subgraph Task [Task Status]
                TP[PENDING] --> TI[IN_PROGRESS]
                TI --> TD[DONE]
                TI --> TF[FAIL and CANCELED and OVERDUE and DEFERRED and SKIPPED]
                TD --> TP
                TD --> TDone[DONE sets completedAt now]
                TF --> TClear[Non DONE clears completedAt]
            end

            subgraph Project [Project Status]
                PI[IN_PROGRESS] --> PD[DONE]
                PD --> PI
                PD --> PDone[done is idempotent]
                PI --> PUndo[uncompleted clears completedAt]
            end

            subgraph SubTask [SubTask Status]
                SP[PENDING] <--> SD[DONE]
                ST[toggleStatus] --> SP
                ST --> SD
            end

            Del[DELETED] -. transition blocked .-> TP
            Del -. transition blocked .-> PI
            Del -. transition blocked .-> SP

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class TP,TI,TD,TF,PI,PD,SP,SD b
            class Del,ST o
            class TDone,TClear,PDone,PUndo g
        `,

        'backend-spring-api-write': `
            graph TB
            FE[Frontend] --> CTRL[TaskController]
            CTRL --> ACK[HTTP 202 Accepted]
            CTRL --> SVC[TaskCommandService]
            SVC --> RC[(Redis optimistic task cache)]
            SVC --> PROD[RabbitMQTaskMessageProducerAdapter]
            PROD --> EX((todo.exchange))
            EX --> Q[todo.task.queue]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class FE,CTRL,SVC,PROD b
            class ACK,Q,EX o
            class RC g
        `,

        'backend-spring-worker-consume': `
            graph TB
            Q[todo.task.queue] --> LISTENER[TaskEventListener batch]
            LISTENER --> CRUD[TaskCrudEventHandler]
            LISTENER --> STATUS[TaskStatusChangeEventHandler]
            CRUD --> CH[Create or Update command handlers]
            STATUS --> CH
            CH --> REPO[SpringDataTaskRepositoryPortAdapter]
            REPO --> DB[(PostgreSQL)]
            CH --> EVT[Task domain events]
            EVT --> EVICT[CacheEvictionListener AFTER_COMMIT]
            EVICT --> RC[(Redis task caches)]
            Q -. failure .-> DLQ[(todo.task.dlq)]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class LISTENER,CRUD,STATUS,CH,REPO,EVICT b
            class Q,DLQ o
            class DB,RC,EVT g
        `,

        'backend-fastapi-analyze': `
            graph TB
            REQ[POST /api/v1/ai/analyze/failure] --> AUTH[get_current_user]
            AUTH --> VERIFY[Spring /api/auth/verify]
            REQ --> AS[AnalysisService]
            AS --> FA[FailureAnalyzer]
            FA --> PROMPT[prompts and json_parser]
            FA --> AI1[AIClient classify]
            AS --> RE[RecommendationEngine]
            RE --> REDIS[(Redis ai_session)]
            RE --> QDRANT[(Qdrant similar failures)]
            RE --> AI2[AIClient recommendations]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class REQ,AUTH,AS,FA,RE b
            class VERIFY,PROMPT,AI1,AI2 o
            class REDIS,QDRANT g
        `,

        'backend-fastapi-auth': `
            graph TB
            Client[Client] --> Header[Authorization Bearer token]
            Header --> Dep[get_current_user dependency]
            Dep --> Bearer[HTTPBearer extract credentials]
            Dep --> Shared[get_http_client shared AsyncClient]
            Dep --> Verify[GET Spring /api/v1/auth/verify-access]
            Verify --> Parse[VerifyResponsePayload schema validation]
            Parse --> User[Verified user context]
            User --> Endpoints[Protected AI endpoints]

            Missing[Missing or invalid token] --> Err401[401 Unauthorized]
            Verify -. timeout or network error .-> Err503[503 or 504]
            Verify -. non 200 response .-> Err401

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class Client,Header,Dep,Bearer,Endpoints b
            class Verify,Parse,User,Shared o
            class Err401,Err503,Missing g
        `,

        'backend-fastapi-domain-rules': `
            graph TB
            AI[AI response payload] --> Normalize[RecommendationCollection from_ai_response]
            Normalize --> HasList{recommendations list valid}
            HasList -- yes --> MapDict[RecommendationResult from_mapping]
            HasList -- no --> ParseText[extract_recommendations from text]
            ParseText --> Parsed{parsed list exists}
            Parsed -- yes --> MapDict
            Parsed -- no --> Fallback[RecommendationResult from_text fallback]
            MapDict --> Recs[Normalized recommendation list]
            Fallback --> Recs

            Selection[FeedbackSelection selected_indices] --> Session{Session exists in cache}
            Session -- no --> Invalid[failed invalid_session]
            Session -- yes --> IndexCheck{indices in range}
            IndexCheck -- no --> OutRange[failed index_out_of_range or no_selection]
            IndexCheck -- yes --> Mapping[Attach selectedIndex and recommendationId]
            Mapping --> Guard{Created task mapping exists}
            Guard -- no --> MappingErr[ValueError missing mapping metadata]
            Guard -- yes --> Success[created and failed response merge]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class AI,Normalize,Recs,Selection,Mapping,Success b
            class HasList,ParseText,Parsed,Session,IndexCheck,Guard o
            class MapDict,Fallback,Invalid,OutRange,MappingErr g
        `,

        'backend-fastapi-state-management': `
            graph TB
            AnalyzeReq[POST analyze failure] --> Create[create_analysis_session]
            Create --> CacheSet[(Redis ai_session status analyzing ttl 3600)]
            AnalyzeReq --> Pattern[analyze_failure_pattern]
            AnalyzeReq --> Recommend[generate_recommendations and vector search]
            Pattern --> Snapshot[AnalysisService update_session_snapshot]
            Recommend --> Snapshot
            Snapshot --> SessionReady[(session category and recommendations_full)]

            FeedbackReq[POST analyze feedback] --> Load[(cache get_session)]
            Load --> Exists{session valid}
            Exists -- no --> Invalid[failed invalid_session]
            Exists -- yes --> Resolve[resolve selected indices]
            Resolve --> SpringCreate[SpringClient create_tasks]
            SpringCreate --> Update[(cache update status completed selected_count notes)]
            Update --> Result[result created and failed]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class AnalyzeReq,Pattern,Recommend,FeedbackReq,Resolve,SpringCreate,Result b
            class Create,Snapshot,Load,Exists o
            class CacheSet,SessionReady,Update,Invalid g
        `,

        'backend-fastapi-feedback': `
            graph TB
            REQ[POST /api/v1/ai/analyze/feedback] --> AUTH[get_current_user]
            AUTH --> VERIFY[Spring /api/auth/verify]
            REQ --> FB[FeedbackService]
            FB --> SESSION[(Load ai_session from Redis)]
            FB --> MAP[Resolve selected indices]
            FB --> CLIENT[SpringClient.create_tasks]
            CLIENT --> SPRING[POST /api/projects/:projectId/tasks]
            SPRING --> WORKER[Spring async worker pipeline]
            FB --> UPDATE[(Update ai_session status and notes)]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class REQ,AUTH,FB,MAP,CLIENT b
            class VERIFY,SPRING,WORKER o
            class SESSION,UPDATE g
        `,

        'backend-spring-packages': `
            graph TB
            Root[com.example.project] --> Common[common config security cache messaging monitoring]
            Root --> Auth[auth]
            Root --> Project[project]
            Root --> Task[task_mvc]
            Root --> SubTask[subtask_mvc]
            Root --> User[user]

            Pattern[layer pattern]
            Pattern --> L1[adapter in and outbound]
            Pattern --> L2[application command query service port]
            Pattern --> L3[domain model event service port]
            Pattern --> L4[infrastructure persistence security]

            Auth --> Pattern
            Project --> Pattern
            Task --> Pattern
            SubTask --> Pattern
            User --> Pattern

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class Root,Auth,Project,Task,SubTask,User b
            class Pattern,L1,L2,L3,L4 o
            class Common g
        `,

        'backend-fastapi-packages': `
            graph TB
            App[src/app] --> API[api v1 endpoints]
            App --> Core[core config auth dependencies startup]
            App --> Services[services analysis failure recommend feedback]
            App --> Domain[domain interfaces and models]
            App --> Infra[infrastructure ai cache vector spring clients]
            App --> Schemas[schemas requests responses]
            App --> Prompts[prompts templates]

            API --> Services
            Core --> Infra
            Services --> Domain
            Services --> Infra
            Infra --> Ext[Redis Qdrant Spring API LLM]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class App,API,Core,Services,Domain b
            class Infra,Schemas,Prompts o
            class Ext g
        `,

        // Frontend Services
        'frontend-arch': `
            graph LR
            Pg[Page] --> Cmp[Component]
            Cmp --> Hk[Hook]
            Hk --> St[Store]
            style Pg fill:#161b22,stroke:#58a6ff
            style Cmp fill:#161b22,stroke:#58a6ff
            style Hk fill:#161b22,stroke:#d29922
            style St fill:#161b22,stroke:#238636
        `,

        // DevOps Services
        'devops-ci': `
            graph LR
            Git --> Act[Action]
            Act --> Dck[Docker]
            Dck --> Reg[Registry]
            style Git fill:#161b22,stroke:#58a6ff
            style Act fill:#161b22,stroke:#d29922
            style Dck fill:#161b22,stroke:#238636
            style Reg fill:#161b22,stroke:#238636
        `,
        'devops-deploy': `
            graph LR
            Reg --> Tun[Tunnel]
            Tun --> Prox[Nginx]
            Prox --> App[Container]
            style Reg fill:#161b22,stroke:#58a6ff
            style Tun fill:#161b22,stroke:#d29922
            style Prox fill:#161b22,stroke:#238636
            style App fill:#161b22,stroke:#238636
        `
    };

    // Initialize Mermaid Diagrams based on data-mermaid-id
    const mermaidContainer = document.querySelectorAll('.mermaid');
    mermaidContainer.forEach(container => {
        const id = container.getAttribute('data-mermaid-id');
        if (id && diagrams[id]) {
            container.innerHTML = diagrams[id];
        }
    });

    function setupMermaidModal() {
        const modal = document.getElementById('mermaid-modal');
        const modalContent = document.getElementById('mermaid-modal-content');
        const modalTitle = document.getElementById('mermaid-modal-title');

        if (!modal || !modalContent || !modalTitle) {
            return;
        }

        const targets = document.querySelectorAll('.graph-container, .card-visual');

        const closeModal = () => {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            modalContent.replaceChildren();
            document.body.classList.remove('modal-open');
        };

        const openModal = (target) => {
            const sourceSvg = target.querySelector('.mermaid svg');
            if (!sourceSvg) {
                return;
            }

            const clonedSvg = sourceSvg.cloneNode(true);
            const viewBox = sourceSvg.getAttribute('viewBox');
            if (viewBox) {
                const parts = viewBox.trim().split(/\s+/).map(Number);
                if (parts.length === 4 && parts.every(Number.isFinite)) {
                    const zoomFactor = 1.35;
                    clonedSvg.setAttribute('width', String(Math.round(parts[2] * zoomFactor)));
                    clonedSvg.setAttribute('height', String(Math.round(parts[3] * zoomFactor)));
                }
            } else {
                const rect = sourceSvg.getBoundingClientRect();
                clonedSvg.setAttribute('width', String(Math.round(rect.width * 1.35)));
                clonedSvg.setAttribute('height', String(Math.round(rect.height * 1.35)));
            }

            modalContent.replaceChildren(clonedSvg);

            const titleText =
                target.closest('.service-card')?.querySelector('.card-title')?.textContent?.trim() ||
                target.closest('.hero-panel')?.querySelector('.panel-title')?.textContent?.trim() ||
                'Mermaid Diagram';
            modalTitle.textContent = titleText;

            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');
        };

        targets.forEach((target) => {
            target.classList.add('mermaid-zoom-target');
            target.setAttribute('tabindex', '0');
            target.setAttribute('role', 'button');
            target.setAttribute('aria-label', 'Open expanded Mermaid diagram');

            target.addEventListener('click', () => openModal(target));
            target.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openModal(target);
                }
            });
        });

        modal.querySelectorAll('[data-mermaid-close]').forEach((closeButton) => {
            closeButton.addEventListener('click', closeModal);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.classList.contains('is-open')) {
                closeModal();
            }
        });
    }

    // Run Mermaid manually after content injection
    await mermaid.run({
        nodes: mermaidContainer
    });

    setupMermaidModal();
});
