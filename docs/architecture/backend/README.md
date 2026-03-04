# Backend System Architect (PCRT Full Inventory)

갱신일: 2026-03-04

## Backend 섹션 요약

- Problem: 고동시성 환경에서 읽기/쓰기 정합성과 인증 안정성이 흔들렸습니다.
- Choice: Hexagonal Spring + API/Worker 분리 + FastAPI 경계 분리를 적용했습니다.
- Result: WRITE p95 `1.9s -> 126ms` (@500VU), READ p95 `975ms -> 141ms`.
- Trade-off: DLQ/재처리/서비스 간 verify 운영 경계가 증가했습니다.

## Featured 3 (기본 노출)

- `BE-C06` Spring API Write Path
- `BE-C05` Spring State Management
- `BE-C10` FastAPI Auth Flow

## Spring Stack (`BE-C01 ~ BE-C08`)

### Spring Hexagonal (`BE-C01`)

- Problem: 도메인 로직이 프레임워크/인프라 변경에 오염될 위험
- Choice: Hexagonal 포트/어댑터 경계 고정
- Result: 도메인-인프라 분리로 교체/리팩토링 비용 감소
- Trade-off: 초기 설계 복잡도와 보일러플레이트 증가

<details>
<summary>Evidence / Mapping</summary>

- Config key: `backend-spring-hex`
- Diagram key: `backend-spring-hex`
- Register ID: `BE-C01`
- 상태: `근거 있음`
- Evidence: `L_N_Project/docs/config.js:5`, `L_N_Project/Backend/README.md:299-343`
- 코멘트: `-`

</details>

### Spring Auth Flow (`BE-C02`)

- Problem: Spring/FastAPI 인증 정책 드리프트와 키 관리 중복 위험
- Choice: Spring verify 단일 정책 경계 채택
- Result: 정책 단일화로 인증 기준 일관성 확보
- Trade-off: FastAPI 인증 독립성 저하, verify 경로 의존

<details>
<summary>Evidence / Mapping</summary>

- Config key: `backend-spring-auth`
- Diagram key: `backend-spring-auth`
- Register ID: `BE-C02`
- 상태: `근거 있음`
- Evidence: `L_N_Project/docs/config.js:6`, `L_N_Project/Backend/README.md:606-616`
- 코멘트: 중복그룹 `AUTH-VERIFY-SINGLE` 대표

</details>

### Spring Package Map (`BE-C03`)

- Problem: 기능 증가 시 변경 영향 범위 확산
- Choice: 도메인/기능 중심 패키지 분리 유지
- Result: 모듈 단위 변경 격리로 유지보수 안정성 강화
- Trade-off: 초기 개발 속도 저하, 구조 학습 비용 증가

<details>
<summary>Evidence / Mapping</summary>

- Config key: `backend-spring-packages`
- Diagram key: `backend-spring-packages`
- Register ID: `BE-C03`
- 상태: `근거 있음`
- Evidence: `L_N_Project/docs/config.js:7`, `L_N_Project/Backend/README.md:453-482`
- 코멘트: `-`

</details>

### Spring Domain Rules (`BE-C04`)

- Problem: API별 인라인 검증에서 규칙 누락/편차 누적
- Choice: 권한/상태/멱등 규칙 도메인 경계 중앙화
- Result: 규칙 일관성과 테스트 가능성 확보
- Trade-off: 클래스/설계 비용 증가로 초기 속도 저하

<details>
<summary>Evidence / Mapping</summary>

- Config key: `backend-spring-domain-rules`
- Diagram key: `backend-spring-domain-rules`
- Register ID: `BE-C04`
- 상태: `근거 있음`
- Evidence: `L_N_Project/docs/config.js:8`, `L_N_Project/Backend/README.md:346-351`, `L_N_Project/Backend/BusinessRules.md:85-173`
- 코멘트: `-`

</details>

### Spring State Management (`BE-C05`)

- Problem: 비동기 경로에서 상태 불일치 가능
- Choice: 상태 전이를 엔티티 내부 규칙으로 고정
- Result: 상태 불변조건과 전이 규칙 일관성 확보
- Trade-off: 엔티티 모델 복잡도/구현 난이도 증가

<details>
<summary>Evidence / Mapping</summary>

- Config key: `backend-spring-state-management`
- Diagram key: `backend-spring-state-management`
- Register ID: `BE-C05`
- 상태: `근거 있음`
- Evidence: `L_N_Project/docs/config.js:9`, `L_N_Project/Backend/README.md:359-364`, `L_N_Project/Backend/BusinessRules.md:8-82`
- 코멘트: 상태 전이 카드로 스코프 고정

</details>

### Spring API Write Path (`BE-C06`)

- Problem: 동기 DB 저장으로 쓰기 지연/타임아웃 증가
- Choice: `202 + Pending + RabbitMQ` 비동기 쓰기 경로
- Result: WRITE p95 `1.9s -> 126ms` (@500VU)
- Trade-off: 정합성 경계 및 DLQ/재처리 운영 복잡도 증가

<details>
<summary>Evidence / Mapping</summary>

- Config key: `backend-spring-api-write`
- Diagram key: `backend-spring-api-write`
- Register ID: `BE-C06`
- 상태: `근거 있음`
- Evidence: `L_N_Project/docs/config.js:10`, `L_N_Project/Backend/README.md:160-163`, `L_N_Project/Backend/ConcurrencyControl.md:23-49`
- 코멘트: 핵심 Featured 후보

</details>

### Spring Worker Consume Path (`BE-C07`)

- Problem: API와 소비 로직 결합 시 고부하에서 응답성 저하
- Choice: API(발행)/Worker(소비) 역할 분리
- Result: 피크 부하에서 API 응답성 보호 및 확장성 확보
- Trade-off: 배포/운영 포인트(DLQ/모니터링/장애지점) 증가

<details>
<summary>Evidence / Mapping</summary>

- Config key: `backend-spring-worker-consume`
- Diagram key: `backend-spring-worker-consume`
- Register ID: `BE-C07`
- 상태: `근거 있음`
- Evidence: `L_N_Project/docs/config.js:11`, `L_N_Project/Backend/ConcurrencyControl.md:255-315`, `L_N_Project/Backend/README.md:366-377`
- 코멘트: `-`

</details>

### Spring Troubleshooting (`BE-C08`)

- Problem: 병목 원인 불명 상태에서 튜닝 회귀 반복
- Choice: k6 재현-수정-검증 루프 고정
- Result: READ p95 `975ms -> 141ms`, WRITE p95 `1.9s -> 126ms`
- Trade-off: 테스트 구축/분석 시간 증가, 저트래픽 구간 과투자 위험

<details>
<summary>Evidence / Mapping</summary>

- Config key: `backend-spring-troubleshooting`
- Diagram key: `backend-spring-troubleshooting`
- Register ID: `BE-C08`
- 상태: `근거 있음`
- Evidence: `L_N_Project/docs/config.js:12`, `L_N_Project/Backend/README.md:8-10`, `L_N_Project/Backend/README.md:1436-1744`
- 코멘트: `-`

</details>

## FastAPI Stack (`BE-C09 ~ BE-C15`)

### FastAPI Analyze Path (`BE-C09`)

- Problem: 단순 추론 호출 시 분석 품질/복구 일관성 저하
- Choice: Spring verify + Redis 세션 + Qdrant 컨텍스트 선행
- Result: 분석 맥락 보존 및 복구 가능한 경로 확보
- Trade-off: 외부 의존성/네트워크 hop 증가

<details>
<summary>Evidence / Mapping</summary>

- Config key: `backend-fastapi-analyze`
- Diagram key: `backend-fastapi-analyze`
- Register ID: `BE-C09`
- 상태: `근거 있음`
- Evidence: `L_N_Project/docs/config.js:13`, `L_N_Project/Backend/README.md:190-223`, `L_N_Project/Backend/README.md:260-269`
- 코멘트: BE-002(분리 결정)와 구현 경계 분리

</details>

### FastAPI Auth Flow (`BE-C10`)

- Problem: AI 경로에서 인증 실행 누락/정책 불일치 위험
- Choice: 요청 단위 Spring verify 호출로 실행 강제
- Result: FastAPI 보호 엔드포인트 인증 일관성 확보
- Trade-off: 네트워크 hop 증가, Spring verify 가용성 의존

<details>
<summary>Evidence / Mapping</summary>

- Config key: `backend-fastapi-auth`
- Diagram key: `backend-fastapi-auth`
- Register ID: `BE-C10`
- 상태: `근거 있음`
- Evidence: `L_N_Project/docs/config.js:14`, `L_N_Project/Backend/README.md:747-763`, `L_N_Project/Backend/README.md:260-269`
- 코멘트: `AUTH-VERIFY-SINGLE` 역할=요청 단위 실행

</details>

### FastAPI Package Map (`BE-C11`)

- Problem: Flat 구조에서 의존성 얽힘/교체 난이도 증가
- Choice: API/Service/Domain/Infra 계층 분리
- Result: 테스트 더블 주입과 외부의존 교체 용이성 확보
- Trade-off: 초기 DI/설계 비용 및 디버깅 경로 증가

<details>
<summary>Evidence / Mapping</summary>

- Config key: `backend-fastapi-packages`
- Diagram key: `backend-fastapi-packages`
- Register ID: `BE-C11`
- 상태: `근거 있음`
- Evidence: `L_N_Project/docs/config.js:15`, `L_N_Project/Backend/README.md:713-725`, `upgrade_todo/backend/bk-fastApi-dev/src/app/core/dependencies.py:12-24`
- 코멘트: `-`

</details>

### FastAPI Domain Rules (`BE-C12`)

- Problem: LLM 포맷 오염이 생성 경로로 전파될 위험
- Choice: JSON 정규화 + fallback + 매핑 무결성 검증
- Result: 파싱 실패/오입력의 후속 전파 차단
- Trade-off: 규칙 분기 코드 증가, 추천 다양성 일부 저하 가능

<details>
<summary>Evidence / Mapping</summary>

- Config key: `backend-fastapi-domain-rules`
- Diagram key: `backend-fastapi-domain-rules`
- Register ID: `BE-C12`
- 상태: `근거 있음`
- Evidence: `L_N_Project/docs/config.js:16`, `L_N_Project/Backend/README.md:230-235`, `L_N_Project/Backend/README.md:260-263`
- 코멘트: `-`

</details>

### FastAPI State Management (`BE-C13`)

- Problem: analyze->feedback->create 다단계 상태 불일치 위험
- Choice: Redis 세션 수명주기/스냅샷 갱신 고정
- Result: 세션 기반 단계 일관성 및 재시도 복구성 확보
- Trade-off: 세션 만료/정리 운영 부담 증가

<details>
<summary>Evidence / Mapping</summary>

- Config key: `backend-fastapi-state-management`
- Diagram key: `backend-fastapi-state-management`
- Register ID: `BE-C13`
- 상태: `근거 있음`
- Evidence: `L_N_Project/docs/config.js:17`, `L_N_Project/Backend/README.md:237-243`
- 코멘트: `-`

</details>

### FastAPI Feedback Path (`BE-C14`)

- Problem: 잘못된 선택 인덱스로 오생성 task 발생 가능
- Choice: 세션 스냅샷 매핑 후 Spring 생성 API 위임
- Result: 유효 인덱스/매핑 검증으로 오생성 차단
- Trade-off: 경로 복잡도 증가, 추가 hop 발생

<details>
<summary>Evidence / Mapping</summary>

- Config key: `backend-fastapi-feedback`
- Diagram key: `backend-fastapi-feedback`
- Register ID: `BE-C14`
- 상태: `근거 있음`
- Evidence: `L_N_Project/docs/config.js:18`, `L_N_Project/Backend/README.md:245-253`
- 코멘트: `-`

</details>

### FastAPI Troubleshooting (`BE-C15`)

- Problem: 외부 의존 장애가 전체 기능으로 전파될 위험
- Choice: verify/fallback/유효성 분기 기반 안전 저하 전략
- Result: 전체 fail-fast 대신 부분 기능 축소로 복구 가능성 확보
- Trade-off: 오류 분기 코드 증가, 디버깅 난이도 상승

<details>
<summary>Evidence / Mapping</summary>

- Config key: `backend-fastapi-troubleshooting`
- Diagram key: `backend-fastapi-troubleshooting`
- Register ID: `BE-C15`
- 상태: `근거 있음`
- Evidence: `L_N_Project/docs/config.js:19`, `L_N_Project/Backend/README.md:257-270`
- 코멘트: `-`

</details>
