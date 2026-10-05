청소뱅크 4호 v5 - GitHub secondary rate limit 대응
- GitHub blob 동시처리 기본 2개
- 요청 사이 180ms 지연
- 403/429/5xx 자동 exponential backoff 재시도
- 100페이지마다 Netlify 로그 진행률 출력
- IndexNow 1,000 URL 단위 분할 전송
- 기존 1~10 완료 유지, 실패한 11~8010은 다시 11부터 실행
권장: 업로드 후 먼저 11부터 100개 테스트 → 성공 확인 후 8,000개.
