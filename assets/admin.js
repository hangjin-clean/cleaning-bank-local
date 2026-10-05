const $ = id => document.getElementById(id);

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;"
  }[c]));
}

async function call(start = 1, limit = 20) {
  $("out").innerHTML = "<p>전국 지역과 키워드를 계산 중입니다...</p>";

  const r = await fetch(
    `/.netlify/functions/generate-bulk?start=${start}&limit=${limit}`,
    { cache: "no-store" }
  );
  const d = await r.json();
  if (!d.ok) throw new Error(d.error || "오류");

  $("summary").innerHTML =
    `<b>총 키워드: ${d.total.toLocaleString()}개</b>` +
    ` · 지역기록 ${d.areaRecords.toLocaleString()}개` +
    ` · 서비스 검색어 ${d.services}종`;

  $("out").innerHTML =
    `<div class="card">` +
    `<b>${d.start.toLocaleString()} ~ ${d.end.toLocaleString()}</b>` +
    `<ol>${d.items.slice(0,100).map(x => `<li>${esc(x.title)}</li>`).join("")}</ol>` +
    (d.items.length > 100
      ? `<p>※ 화면은 앞 100개만 표시합니다. 선택 구간은 ${d.returned.toLocaleString()}개입니다.</p>`
      : "") +
    `</div>`;

  return d;
}

$("countBtn").onclick = () =>
  call(1, 20).catch(e => alert(e.message));

$("rangeBtn").onclick = () =>
  call(
    Number($("start").value || 1),
    Number($("limit").value || 8000)
  ).catch(e => alert(e.message));
