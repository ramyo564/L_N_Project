# Backend-First Architecture Docs

갱신일: 2026-03-04

## 한눈 요약 (PCRT)

- Problem: 고부하 요청에서 지연과 정합성 리스크가 누적되었습니다.
- Choice: Spring Hexagonal + API/Worker 분리 + FastAPI AI 경계 분리를 적용했습니다.
- Result: READ p95 `975ms -> 141ms`, WRITE p95 `1.9s -> 126ms` (@500VU).
- Trade-off: 운영 경계(DLQ/재처리/서비스 간 verify) 복잡도가 증가했습니다.

## 섹션 확장 구조

| Section | Scope | Status | 문서 |
|---|---|---|---|
| Backend | `BE-C01 ~ BE-C15` | 이번 라운드 완료 | [Backend 상세](./backend/README.md) |
| DevOps | `DEV-C01 ~ DEV-C12` | 최소 골격 | [DevOps 골격](./devops/README.md) |
| Frontend | `FE-C01 ~ FE-C06` | 최소 골격 | [Frontend 골격](./frontend/README.md) |

## 운영 원칙 (고정)

1. 카드 원본(Source of Truth)은 `L_N_Project/docs/config.js`를 사용한다.
2. 의사결정 ledger는 `TRADEOFF-REGISTER.md`를 사용한다.
3. 카드/노드 ID가 다르면 병합하지 않는다.
4. 중복은 Register에서만 처리한다(중복그룹/대표ID/역할 코멘트).
5. 카드 매핑 정합성은 [Card ID Map](./card-id-map.md)으로 고정 검증한다.

## 이번 라운드 완료 범위

- Backend 카드 `BE-C01 ~ BE-C15`를 `Problem / Choice / Result / Trade-off`로 누락 없이 매핑했다.
- 각 카드 상세에 `config key`, `diagram key`, `register id`, `evidence`, `코멘트`를 고정했다.
- DevOps/Frontend는 섹션 진입 골격만 두고, 상세 PCRT는 다음 라운드로 분리했다.
