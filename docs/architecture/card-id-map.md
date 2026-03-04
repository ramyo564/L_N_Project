# Card ID Mapping Baseline

갱신일: 2026-03-04

## Backend Canonical Mapping (`BE-C01 ~ BE-C15`)

| Card ID | config key | diagrams key | Register ID | 상태 |
|---|---|---|---|---|
| BE-C01 | `backend-spring-hex` | `backend-spring-hex` | BE-C01 | 근거 있음 |
| BE-C02 | `backend-spring-auth` | `backend-spring-auth` | BE-C02 | 근거 있음 |
| BE-C03 | `backend-spring-packages` | `backend-spring-packages` | BE-C03 | 근거 있음 |
| BE-C04 | `backend-spring-domain-rules` | `backend-spring-domain-rules` | BE-C04 | 근거 있음 |
| BE-C05 | `backend-spring-state-management` | `backend-spring-state-management` | BE-C05 | 근거 있음 |
| BE-C06 | `backend-spring-api-write` | `backend-spring-api-write` | BE-C06 | 근거 있음 |
| BE-C07 | `backend-spring-worker-consume` | `backend-spring-worker-consume` | BE-C07 | 근거 있음 |
| BE-C08 | `backend-spring-troubleshooting` | `backend-spring-troubleshooting` | BE-C08 | 근거 있음 |
| BE-C09 | `backend-fastapi-analyze` | `backend-fastapi-analyze` | BE-C09 | 근거 있음 |
| BE-C10 | `backend-fastapi-auth` | `backend-fastapi-auth` | BE-C10 | 근거 있음 |
| BE-C11 | `backend-fastapi-packages` | `backend-fastapi-packages` | BE-C11 | 근거 있음 |
| BE-C12 | `backend-fastapi-domain-rules` | `backend-fastapi-domain-rules` | BE-C12 | 근거 있음 |
| BE-C13 | `backend-fastapi-state-management` | `backend-fastapi-state-management` | BE-C13 | 근거 있음 |
| BE-C14 | `backend-fastapi-feedback` | `backend-fastapi-feedback` | BE-C14 | 근거 있음 |
| BE-C15 | `backend-fastapi-troubleshooting` | `backend-fastapi-troubleshooting` | BE-C15 | 근거 있음 |

## Frontend Range Baseline

| Card ID Range | Source |
|---|---|
| `FE-C01 ~ FE-C06` | `L_N_Project/docs/config.js`, `TRADEOFF-REGISTER.md` |

## DevOps Range Baseline

| Card ID Range | Source |
|---|---|
| `DEV-C01 ~ DEV-C12` | `L_N_Project/docs/config.js`, `TRADEOFF-REGISTER.md` |

## 검증 규칙

1. 카드 ID가 다르면 병합하지 않는다.
2. 중복 처리는 Register 코멘트(`중복그룹/대표ID/역할`)에서만 수행한다.
3. 본 문서는 ID 매핑 베이스라인이며, 판정(근거 상태)은 Register A 섹션을 따른다.
