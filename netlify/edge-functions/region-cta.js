// 4호 기존 정적 발행 URL은 그대로 유지하고 응답 HTML에 상담 메뉴만 추가합니다.
// Netlify Edge middleware; /local/* 대량발행 페이지에만 적용.
const HOME = "https://cleaning-bank.imweb.me/";
const QUOTE = "https://docs.google.com/forms/d/e/1FAIpQLSdHW-3aXFkPAz7eE46jdBGemgc6CHKebGbTGl3fKtj3iu6GfA/viewform?usp=send_form";
const REVIEWS = "https://cleaning-bank.imweb.me/work-images";

const css = `<style id="cb4-global-style">
.cb4-global-cta{position:fixed;bottom:0;left:0;right:0;z-index:2147483000;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:rgba(255,255,255,.97);border-top:1px solid #dce7e2;box-shadow:0 -4px 18px #0002;font-family:Arial,"Noto Sans KR",sans-serif}
.cb4-global-links{max-width:880px;margin:0 auto;display:flex;gap:10px}
.cb4-global-links>a{flex:1;display:flex;align-items:center;justify-content:center;min-height:48px;padding:8px;border-radius:999px;color:white!important;text-decoration:none!important;font-size:15px;font-weight:800;text-align:center}
.cb4-global-links>a:nth-child(1){background:#137950}.cb4-global-links>a:nth-child(2){background:#2676d9}.cb4-global-links>a:nth-child(3){background:#e66a2b}
.cb4-global-info{box-sizing:border-box;max-width:980px;margin:42px auto 28px;padding:24px;border:1px solid #e0e9e5;border-radius:14px;background:#f6faf8;color:#263b33;font:16px/1.75 Arial,"Noto Sans KR",sans-serif}
.cb4-global-info h2{font-size:23px;margin:0 0 12px}.cb4-global-info p{margin:0 0 14px}.cb4-global-info a{color:#137950;text-decoration:underline}
.cb4-global-info ul{margin:4px 0 14px;padding-left:22px}
html body{padding-bottom:88px!important}
@media(max-width:620px){.cb4-global-cta{padding:8px 6px calc(8px + env(safe-area-inset-bottom))}.cb4-global-links{gap:5px}.cb4-global-links>a{font-size:12px;padding:5px 2px;min-height:43px}.cb4-global-info{margin:28px 12px;padding:18px}.cb4-global-info h2{font-size:20px}html body{padding-bottom:80px!important}}
</style>`;
const cta = `<nav class="cb4-global-cta" aria-label="청소뱅크 빠른 상담"><div class="cb4-global-links"><a href="${HOME}" target="_blank" rel="noopener noreferrer">⌂ 홈페이지방문</a><a href="${QUOTE}" target="_blank" rel="noopener noreferrer">✉ 무료견적문의</a><a href="tel:01068560158">☎ 전화문의</a></div></nav>`;
const info = `<section class="cb4-global-info" aria-label="청소 서비스 상담 안내"><h2>청소 상담 전 확인할 사항</h2><p>원하시는 청소 서비스에 대해 사업장 위치, 면적, 방문 주기, 희망 작업 시간과 청소 범위를 알려주시면 현장에 맞는 견적 상담에 도움이 됩니다. 실제 제공 범위와 비용은 방문견적 및 협의를 통해 확정됩니다.</p><ul><li>주 1회~주 7회 정기청소 및 별도 대청소 상담</li><li>카드결제·세금계산서·무료 방문견적 안내</li><li>유리창·바닥왁스코팅 등 추가 작업은 별도 범위 확인</li></ul><p><a href="${REVIEWS}" target="_blank" rel="noopener noreferrer">실제 작업사진 확인</a> · <a href="${HOME}" target="_blank" rel="noopener noreferrer">전체 서비스 안내</a></p></section>`;
export default async function (_request, context) {
  const response = await context.next();
  if (response.status !== 200 || !/text\/html/i.test(response.headers.get("content-type") || "")) return response;
  const html = await response.text();
  if (!/<\/body\s*>/i.test(html) || html.includes("cb4-global-cta")) return new Response(html, response);
  let changed = html;
  if (!html.includes("cb4-global-info")) {
    if (/<\/main\s*>/i.test(changed)) changed = changed.replace(/<\/main\s*>/i, info + "</main>");
    else changed = changed.replace(/<\/body\s*>/i, info + "</body>");
  }
  changed = changed.replace(/<\/head\s*>/i, css + "</head>").replace(/<\/body\s*>/i, cta + "</body>");
  const headers = new Headers(response.headers);
  headers.delete("content-length"); headers.delete("etag"); headers.delete("content-encoding");
  return new Response(changed, {status: response.status, statusText: response.statusText, headers});
}
export const config = { path: "/local/*", method: "GET", onError: "bypass" };
