# L_N_Project Docs Hub

갱신일: 2026-03-04

## Backend-first Quick View

- Problem: 고부하 요청에서 지연과 정합성 리스크가 누적되었습니다.
- Choice: Spring Hexagonal + API/Worker 분리 + FastAPI AI 경계 분리를 적용했습니다.
- Result: READ p95 `975ms -> 141ms`, WRITE p95 `1.9s -> 126ms` (@500VU).
- Trade-off: 운영 경계(DLQ/재처리/서비스 간 verify) 복잡도가 증가했습니다.

## 문서 진입점

- [Architecture Hub](./architecture/README.md)
- [Backend Full Inventory (`BE-C01 ~ BE-C15`)](./architecture/backend/README.md)
- [DevOps Skeleton](./architecture/devops/README.md)
- [Frontend Skeleton](./architecture/frontend/README.md)
- [Card ID Map](./architecture/card-id-map.md)
