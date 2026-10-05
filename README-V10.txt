v10 테스트 링크 수정
원인: generate-bulk 응답에는 id/urlPath가 없어 v9가 /undefined/ 링크를 생성.
수정: 실제 publish-bulk-background와 동일한 FNV 해시 규칙으로 title -> id 계산 후 /local/v4/{id}/ 링크 생성.
발행 엔진/템플릿/sitemap/IndexNow는 수정하지 않음.
