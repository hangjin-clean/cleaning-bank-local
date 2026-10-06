4호 v20 - 지역 생성 + Sitemap 정리만 수정

수정 파일 2개:
1) netlify/functions/generate-bulk.js
2) netlify/functions/publish-bulk-background.js

지역 규칙:
- 서울: 구 유지 (도봉구 도봉동)
- 1동/2동만 제외, 3동 이상은 허용
- 읍/면 허용, 리 제외
- 경기도 시+구 지역은 시/구/동 조합 유지
- 광역시 중구/동구/서구/북구는 광역시명과 함께 생성
- 애매한 '중', '서', '북' 같은 구 축약 조합 제거

Sitemap:
- 과거 커밋 이력에서 잘못된 v18 Sitemap을 자동으로 되살리는 방식 제거
- 현재 저장소의 정상 8,000개 구간 Sitemap만 index에 누적
- 8452 단일 검증 Sitemap은 index 누적에서 제외

절대 변경하지 않음:
- v18 8,000개 Git Tree 대량배포 엔진
- 랜딩 디자인/이미지
- 전화 링크/하단 CTA
- 서비스 목록/제목 꼬리말
- IndexNow 전송 방식
