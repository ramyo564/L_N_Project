# DevOps System Architect (Section Skeleton)

갱신일: 2026-03-04

## 섹션 요약

- Problem: 모노레포 배포 지연과 홈서버 배포 경로의 보안 리스크가 있었습니다.
- Choice: Selective CI + WireGuard CD + runtime validation + observability pipeline을 적용했습니다.
- Result: 피드백 속도와 배포 안전성을 함께 개선했습니다.
- Trade-off: 파이프라인 분기와 운영 통제 포인트가 증가했습니다.

## 카드 범위 (이번 라운드: 골격만 유지)

- Delivery Pipeline: `DEV-C01`, `DEV-C02`, `DEV-C03`, `DEV-C04`
- Runtime Infra: `DEV-C05`, `DEV-C06`, `DEV-C07`, `DEV-C08`, `DEV-C09`
- Performance/Incident: `DEV-C10`, `DEV-C11`, `DEV-C12`

## 다음 라운드 확장 항목

- 카드별 `Problem / Choice / Result / Trade-off` 상세 매핑
- 카드별 `config key / diagram key / register id / evidence` 고정
- DEV-004 관련 실측 로그 1회 확보 후 목표값 갱신 반영
