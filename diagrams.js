export const diagrams = {
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

        'backend-spring-troubleshooting': `
            graph TB
            Issue1[MVC plus WebFlux mixed path overhead] --> Fix1[Converged to MVC centered runtime path]
            Issue2[Redis shared connection contention under load] --> Fix2[Split API and Worker Redis pool profiles]
            Issue3[Async write then immediate access race] --> Fix3[Pending cache check before ownership DB lookup]
            Issue4[RabbitMQ channel contention and timeout spikes] --> Fix4[Tuned concurrency max concurrency publishes and prefetch]
            Issue4 --> Fix5[Batch listeners plus semaphore resource guard]
            Issue5[Sync logging IO caused CPU and latency noise] --> Fix6[MDC trace propagation and AsyncAppender]
            Fix6 --> Result[p95 read and write stabilized at high load]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class Issue1,Issue2,Issue3,Issue4,Issue5 b
            class Fix1,Fix2,Fix3,Fix4,Fix5,Fix6 o
            class Result g
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

        'backend-fastapi-troubleshooting': `
            graph TB
            Issue1[verify access timeout or upstream auth error] --> Fix1[get_current_user handles timeout and schema errors]
            Issue2[session missing or expired in feedback] --> Fix2[invalid_session path with safe early return]
            Issue3[selected indices out of range or empty] --> Fix3[index_out_of_range and no_selection validation]
            Issue4[LLM response not strict JSON] --> Fix4[RecommendationCollection parse then text fallback]
            Issue5[Qdrant search or cache update exception] --> Fix5[log error and degrade with safe defaults]
            Issue6[created task mapping mismatch] --> Fix6[selectedIndex and recommendationId integrity checks]
            Fix6 --> Result[analysis and feedback pipeline stays recoverable]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class Issue1,Issue2,Issue3,Issue4,Issue5,Issue6 b
            class Fix1,Fix2,Fix3,Fix4,Fix5,Fix6 o
            class Result g
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
        'frontend-monorepo-architecture': `
            graph LR
            subgraph Apps [apps]
                Web[web Vite]
                Next[web-nextjs]
                Mobile[mobile RN]
                Desktop[desktop Electron]
            end

            subgraph Platform [platform adapters]
                PReact[react contracts]
                PNext[web-next adapter]
                PRN[mobile-rn adapter]
                PElec[desktop-electron adapter]
            end

            subgraph Core [core]
                Store[store RTK Query]
                API[api OpenAPI clients]
                Domain[domain and types and utils]
                Logic[hooks and services and usecases]
            end

            Web --> PReact
            Next --> PNext
            Mobile --> PRN
            Desktop --> PElec

            PReact --> Store
            PNext --> Store
            PRN --> Store
            PElec --> Store

            Store --> API
            Logic --> Store
            Logic --> Domain
            API --> Domain

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class Web,Next,Mobile,Desktop,Store,Logic b
            class PReact,PNext,PRN,PElec,API o
            class Domain g
        `,

        'frontend-package-map': `
            graph TB
            Root[packages] --> Apps[apps web web-nextjs mobile desktop]
            Root --> Platform[platform react web-next mobile-rn desktop-electron]
            Root --> Core[core]

            Core --> CType[types]
            Core --> CUtils[utils]
            Core --> CDomain[domain]
            Core --> CApi[api generated spring and fastapi]
            Core --> CStore[store slices mappers services]
            Core --> CHooks[hooks dispatch wrappers]
            Core --> CServices[services orchestration]
            Core --> CUsecases[usecases adapters]
            Core --> CInfra[infrastructure]
            Core --> CAssets[assets]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class Root,Apps,Platform,Core b
            class CApi,CStore,CHooks,CServices,CUsecases o
            class CType,CUtils,CDomain,CInfra,CAssets g
        `,

        'frontend-rtk-single-source': `
            graph TB
            UI[Pages and presenter hooks] --> Query[RTK Query hooks]
            Query --> APIs{API services}
            APIs --> AuthApi[authApi]
            APIs --> ProjectApi[projectApi]
            APIs --> TaskApi[taskApi]
            APIs --> AiApi[fastApiAiApi]

            AuthApi --> Cache[(RTK query cache)]
            ProjectApi --> Cache
            TaskApi --> Cache
            AiApi --> Cache

            Mutations[Mutations] --> Optimistic[onQueryStarted optimistic patch]
            Optimistic --> Cache
            Optimistic -. failure .-> Rollback[patchResult.undo rollback]

            Cache --> UI

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class UI,Query,APIs,Mutations b
            class AuthApi,ProjectApi,TaskApi,AiApi,Optimistic o
            class Cache,Rollback g
        `,

        'frontend-api-bridge': `
            graph TB
            subgraph SpringPath [Spring API path]
                ReqSpring[project and task requests] --> BQ[baseQueryWithReauth]
                BQ --> Cred[fetchBaseQuery with credentials include]
                Cred --> Reauth[401 then refresh and retry]
            end

            subgraph FastApiPath [FastAPI AI path]
                ReqAI[analyze and feedback requests] --> FQ[fastApiAiApi fakeBaseQuery queryFn]
                FQ --> Warmup[warmupFastApiAccessToken]
                Warmup --> TokenMgr[tokenManager exp check and refresh]
                TokenMgr --> OpenApi[OpenAPI TOKEN injector]
                OpenApi --> Axios[codegen axios request]
            end

            Reauth --> Spring[(Spring backend)]
            Axios --> Fast[(FastAPI backend)]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class ReqSpring,BQ,ReqAI,FQ b
            class Cred,Reauth,Warmup,TokenMgr,OpenApi o
            class Axios,Spring,Fast g
        `,

        'frontend-di-composition': `
            graph TB
            Main[app main.tsx] --> Session[configureFastApiSession]
            Main --> Store[createAppStore platform web]
            Main --> Provider[Redux Provider]
            Provider --> CoreProvider[CoreServicesProvider]

            CoreProvider --> HookFactory[createAuthService createTaskService createSignupService]
            HookFactory --> Services[createLoginFlowService createProjectsBoardService createTaskDetailService]
            Services --> Usecases[createLoginFlowUsecase createTaskActionsUsecase createTaskDetailUsecase]
            Usecases --> FeatureHooks[useProjectsControllerV2 and useAiRecommendationWorkflow]
            FeatureHooks --> Pages[Projects and Auth pages]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class Main,Provider,CoreProvider,FeatureHooks,Pages b
            class Session,Store,HookFactory,Services o
            class Usecases g
        `,

        'frontend-troubleshooting-patterns': `
            graph TB
            Issue1[project reorder not persisted] --> Cause1[missing transformResponse ordering]
            Cause1 --> Fix1[sort by position in getProjects]

            Issue2[delete not reflected in cache] --> Cause2[id type mismatch string vs number]
            Cause2 --> Fix2[String normalize before cache compare]

            Issue3[task status not updated on 202 empty body] --> Cause3[undefined transform response]
            Cause3 --> Fix3[nullable transform and keep optimistic state]

            Issue4[AI task memo missing] --> Cause4[approach field not mapped]
            Cause4 --> Fix4[map approach to reasoning and description]

            Issue5[maximum update depth] --> Cause5[unstable deps and repeated setState]
            Cause5 --> Fix5[memoized callbacks and guarded effect sync]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class Issue1,Issue2,Issue3,Issue4,Issue5 b
            class Cause1,Cause2,Cause3,Cause4,Cause5 o
            class Fix1,Fix2,Fix3,Fix4,Fix5 g
        `,

        // DevOps Services
        'devops-ci-change-detection': `
            graph TB
            PR[Pull request main and dev] --> Filter[dorny paths-filter]
            Filter --> Spring[spring build and push]
            Filter --> Fast[fastapi build and push]
            Filter --> Front[frontend lint test and image]
            Filter --> Nginx[nginx image build]
            Filter --> Mon[monitoring lint and smoke]
            Spring --> Int[integration gate]
            Fast --> Int
            Front --> Int
            Nginx --> Int
            Mon --> Int

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class PR,Filter,Int b
            class Spring,Fast,Front,Nginx o
            class Mon g
        `,

        'devops-ci-integration-gate': `
            graph TB
            Img[resolve image digests] --> Env[create env and rabbitmq definitions]
            Env --> Up[docker compose dev-CI up]
            Up --> Health{spring and nginx healthy}
            Health -->|yes| Probe[frontend root and api proxy checks]
            Probe --> Scan[trivy scans spring fastapi nginx]
            Scan --> Pass[integration passed]
            Health -->|no| Dump[dump compose logs and inspect]
            Dump --> Fail[integration failed]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class Img,Env,Up b
            class Health,Probe,Dump o
            class Scan,Pass,Fail g
        `,

        'devops-cd-wireguard': `
            graph TB
            Push[push to main or dev] --> Install[install wireguard]
            Install --> WGUp[wg-quick up]
            WGUp --> Copy[scp compose and monitoring files]
            Copy --> RemoteEnv[write env file by branch]
            RemoteEnv --> Deploy[docker compose up app data network monitoring]
            Deploy --> Verify[health check and secret rendering]
            Verify --> WGDown[wg-quick down always]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class Push,Install,WGUp b
            class Copy,RemoteEnv,Deploy o
            class Verify,WGDown g
        `,

        'devops-image-promotion': `
            graph LR
            Sha[sha tags from build jobs] --> Dig[buildx imagetools inspect digest]
            Dig --> Retag[imagetools create stable branch tags]
            Retag --> DevTag[backend and nginx dev tags]
            Retag --> ProdTag[backend and nginx prod tags]
            DevTag --> Deploy[deploy workflow pull stable tags]
            ProdTag --> Deploy

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class Sha,Dig,Retag b
            class DevTag,ProdTag o
            class Deploy g
        `,

        'devops-compose-topology': `
            graph TB
            subgraph Edge [edge and network utils]
                CF[Cloudflare]
                DD[ddclient]
                Cert[certbot dns challenge]
                Nginx[nginx reverse proxy]
            end

            subgraph App [application services]
                Spring[spring api replicas]
                Worker[spring-worker listener]
                Fast[fastapi ai]
            end

            subgraph Data [data services]
                Pg[(postgres)]
                Pool[(pgbouncer)]
                Redis[(redis)]
                MQ((rabbitmq))
                Q[(qdrant)]
            end

            subgraph Obs [observability]
                Prom[prometheus]
                Graf[grafana]
                Loki[loki and promtail]
                Alert[alertmanager]
            end

            DD --> CF
            Cert --> CF
            CF --> Nginx
            Nginx --> Spring
            Nginx --> Fast

            Spring --> Pool
            Worker --> Pool
            Pool --> Pg
            Spring --> Redis
            Spring --> MQ
            Worker --> MQ
            Fast --> Redis
            Fast --> Q

            Prom --> Spring
            Prom --> Worker
            Prom --> Fast
            Prom --> Graf
            Prom --> Alert
            Loki --> Graf

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class CF,Nginx,Spring,Worker,Fast b
            class DD,Cert,Pool,Pg,Redis,MQ,Q o
            class Prom,Graf,Loki,Alert g
        `,

        'devops-docker-build-map': `
            graph TB
            subgraph SpringImage [spring dockerfile]
                S1[gradle jdk21 build stage]
                S2[cache mount root gradle]
                S3[jre alpine runtime]
                S4[non-root user and healthcheck]
                S1 --> S2 --> S3 --> S4
            end

            subgraph FastApiImage [fastapi dockerfile]
                F1[python slim deps stage]
                F2[uv sync frozen no-install-project]
                F3[runtime copy source]
                F4[non-root appuser and cache volume]
                F1 --> F2 --> F3 --> F4
            end

            subgraph NginxImage [nginx dockerfile]
                N1[node22 pnpm web build]
                N2[nginx alpine runtime]
                N3[copy templates snippets scripts]
                N4[entrypoint render validate start]
                N1 --> N2 --> N3 --> N4
            end

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class S1,S2,S3,S4 b
            class F1,F2,F3,F4 o
            class N1,N2,N3,N4 g
        `,

        'devops-nginx-runtime-validation': `
            graph TB
            Start[docker-entrypoint] --> Step1[init environment]
            Step1 --> Step2[setup cors and proxy snippets]
            Step2 --> Step3[setup runtime and nginx config]
            Step3 --> Step4[start cert watcher and ensure cert]
            Step4 --> V1[validate template variables]
            V1 --> V2[nginx syntax test]
            V2 --> Debug[optional debug output]
            Debug --> Run[nginx daemon off]
            V1 -->|fail| Block[startup blocked]
            V2 -->|fail| Block

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class Start,Step1,Step2,Step3 b
            class Step4,V1,V2,Debug o
            class Run,Block g
        `,

        'devops-edge-security': `
            graph LR
            User[User HTTPS] --> CFE[Cloudflare edge and waf]
            CFE --> Tunnel[cloudflared outbound tunnel]
            Tunnel --> N80[nginx http internal]
            N80 --> Apps[Spring and FastAPI]

            DD[ddclient] --> DNS[Cloudflare DNS]
            Cert[certbot dns01 renew] --> DNS

            CI[GitHub Actions] --> WG[WireGuard VPN]
            WG --> SSH[SSH private access only]
            SSH --> Host[Home server deploy]

            WGUDP[WireGuard UDP 51820] --> Router[router selective open]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class User,CFE,Tunnel,N80,Apps b
            class DD,Cert,DNS o
            class CI,WG,SSH,Host,WGUDP,Router g
        `,

        'devops-observability-pipeline': `
            graph TB
            Spring[spring actuator] --> Prom[prometheus]
            Worker[spring-worker 9091] --> Prom
            Fast[fastapi metrics] --> Prom
            RedisEx[redis exporter] --> Prom
            PgEx[postgres and pgbouncer exporter] --> Prom
            Rabbit[rabbitmq 15692] --> Prom
            NginxEx[nginx exporter] --> Prom
            Node[node-exporter and cadvisor] --> Prom

            Prom --> Graf[grafana dashboards]
            Prom --> Alert[alertmanager]
            Alert --> Slack[slack webhook secret]

            Logs[promtail docker logs] --> Loki[loki]
            Loki --> Graf

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class Spring,Worker,Fast,Prom,Graf b
            class RedisEx,PgEx,Rabbit,NginxEx,Node o
            class Alert,Slack,Logs,Loki g
        `,

        'devops-k6-load-architecture': `
            graph TB
            Profiles[ramping profiles default fast_test stress spike] --> Scenarios[k6 scenarios read write auth ai]
            Scenarios --> Auth[auth manager login refresh backoff]
            Auth --> Target{target route}
            Target --> CDN[cloudflare route]
            Target --> Bypass[origin bypass with ORIGIN_IP]
            CDN --> Nginx[nginx]
            Bypass --> Nginx
            Nginx --> Spring[spring endpoints]
            Nginx --> Fast[fastapi ai endpoints]
            Scenarios --> Metrics[custom metrics and summary files]
            Metrics --> Dash[grafana k6 dashboards]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class Profiles,Scenarios,Auth,Target b
            class CDN,Bypass,Nginx,Spring,Fast o
            class Metrics,Dash g
        `,

        'devops-stress-mode-lifecycle': `
            graph LR
            On[stress-test-on] --> Prep[create env.stress and stop base stack]
            Prep --> Up[up database-test and app and monitoring]
            Up --> Ready[wait postgres and loki ready]
            Ready --> Run[k6 scenarios]

            Refresh[stress-test-refresh] --> Reset[down stress volumes and reset logs]
            Reset --> ReUp[restart stress services]

            Down[stress-test-down] --> Stop[down stress stack and volumes]
            Stop --> Restore[restore env.dev or env.prod base stack]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class On,Prep,Up,Ready,Run b
            class Refresh,Reset,ReUp o
            class Down,Stop,Restore g
        `,

        'devops-troubleshooting-patterns': `
            graph TB
            I1[400 bad request on tunnel] --> C1[tunnel service pointed to https 443]
            C1 --> F1[set tunnel service to http 80]

            I2[oauth redirect uri became http] --> C2[x-forwarded-proto came from http scheme]
            C2 --> F2[map oauth paths to proto https and port 443]

            I3[301 redirect loop] --> C3[nginx 80 redirect with flexible ssl]
            C3 --> F3[remove forced 301 and use full strict mode]

            I4[k6 summary showed zero fail] --> C4[rounding hid tiny failure ratio]
            C4 --> F4[write explicit failure summary files]

            I5[high vu host freeze] --> C5[unbounded k6 and haproxy resource use]
            C5 --> F5[set cpu memory limits and tune sysctl]

            classDef b fill:#161b22,stroke:#58a6ff,color:#c9d1d9
            classDef o fill:#161b22,stroke:#d29922,color:#c9d1d9
            classDef g fill:#161b22,stroke:#238636,color:#c9d1d9
            class I1,I2,I3,I4,I5 b
            class C1,C2,C3,C4,C5 o
            class F1,F2,F3,F4,F5 g
        `
};
