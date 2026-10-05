// 청소뱅크 4호 전국 키워드 생성기
// 지역: 전국 시·군·구 + 동·읍
// 제외: 면·리, 숫자 분동(1동/2동...), 숫자 가(1가/2가...)
// 실제 총 개수는 고정하지 않고 생성 후 계산
// 한 번에 최대 8,000개 범위 조회

const SOURCES = [
  "서울특별시","경기도","인천광역시","부산광역시","대구광역시","대전광역시",
  "울산광역시","세종특별자치시","강원특별자치도","충청북도","충청남도",
  "전북특별자치도","전라남도","경상북도","경상남도","제주특별자치도","광주광역시"
];

const SERVICES = [
  "사무실청소","사무실정기청소","오피스청소",
  "병원청소","병원정기청소","개인의원청소","병원오픈청소","병원마감청소",
  "학원청소","학원정기청소","스터디카페청소","교습소청소","어린이집청소","학교청소",
  "계단청소","빌라계단청소","상가계단청소","건물계단청소","원룸계단청소","오피스텔계단청소","아파트계단청소",
  "식당청소","음식점청소","주방청소","후드청소","식당마감청소",
  "카페청소","베이커리청소","무인매장청소","카페마감청소",
  "준공청소","상가준공청소","사무실준공청소","인테리어준공청소",
  "입주청소","이사청소","거주청소",
  "유리창청소","외벽청소","간판청소",
  "헬스장청소","샤워실청소","탈의실청소",
  "공장청소","창고청소","건물청소","상가청소","매장청소",
  "주차장청소","화장실청소","바닥왁스청소","카페트청소","에어컨청소",
  "소독방역","방역청소"
];

const TAILS = [
  "업체 추천","업체 후기","업체 리뷰","업체 상담","업체 평판",
  "업체 가격비교","업체 비용","업체 견적","업체 무료견적","업체 비교",
  "가까운 업체","전문 업체","업체 알아보기","업체 선택","업체 예약"
];

function hash(s) {
  let x = 2166136261;
  for (const c of String(s)) {
    x ^= c.charCodeAt(0);
    x = Math.imul(x, 16777619);
  }
  return x >>> 0;
}

function validArea(s) {
  s = String(s || "").trim();
  if (!s || s.includes("하위 법정동 없음")) return false;
  if (/면$/.test(s) || /리$/.test(s)) return false;
  if (/\d+가$/.test(s) || /\d+동$/.test(s)) return false;
  if (/\s/.test(s)) return false; // "읍 OO리" 같은 하위 리 제거
  return /동$|읍$/.test(s);
}

function shortName(s) {
  return String(s || "").replace(/(특별자치시|특별시|광역시|특별자치도|도|시|군|구)$/, "");
}

function parseRegionMarkdown(md, sido) {
  const out = [];
  let district = "";
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      district = line.slice(3).trim();
      continue;
    }
    if (!district || !line || line.startsWith("#") || line.startsWith("---")) continue;
    if (!line.includes("·") && !/(동|읍)/.test(line)) continue;

    for (const token of line.split("·")) {
      const area = token.trim();
      if (!validArea(area)) continue;
      out.push({ sido, district, area });
    }
  }
  return out;
}

// 사용자 확정 규칙:
// 서울: 강남구 / 강남 / 논현동 / 강남구 논현동
// 경기 등: 안양시 / 안양 / 관양동 / 안양 관양동
// 읍: 화성시 / 화성 / 봉담읍 / 화성 봉담읍
function regionForms(x) {
  const district = x.district;
  const area = x.area;
  const parts = district.split(/\s+/);
  const city = parts.find(p => /시$/.test(p));

  let fullBase = district;
  let shortBase = shortName(district);

  if (city) {
    fullBase = city;
    shortBase = shortName(city);
  }

  const forms = [
    fullBase,
    shortBase,
    area,
    `${shortBase} ${area}`
  ];

  // 서울 외 광역시는 "부산 해운대구", "부산 해운대구 우동" 같은 표현도 추가
  if (/광역시$|특별시$/.test(x.sido) && x.sido !== "서울특별시") {
    const metro = shortName(x.sido);
    forms.push(`${metro} ${district}`, `${metro} ${district} ${area}`);
  }

  return [...new Set(forms.map(v => v.trim()).filter(Boolean))];
}

async function loadAreas() {
  const all = [];
  for (const sido of SOURCES) {
    const url =
      "https://raw.githubusercontent.com/wellsa-ai/admincode-kr/main/kr/" +
      encodeURIComponent(sido) + ".md";

    const r = await fetch(url);
    if (!r.ok) throw new Error(`전국 지역자료 불러오기 실패: ${sido} (${r.status})`);
    all.push(...parseRegionMarkdown(await r.text(), sido));
  }
  return all;
}

function buildKeywords(areas) {
  const items = [];
  const seen = new Set();

  for (const place of areas) {
    for (const region of regionForms(place)) {
      for (const service of SERVICES) {
        // 같은 지역/업종에서도 꼬리문구가 기계적으로 고정되지 않도록 결정적 순환
        const tail = TAILS[hash(`${region}|${service}`) % TAILS.length];
        const title = `${region} ${service} ${tail}`;

        if (seen.has(title)) continue;
        seen.add(title);

        items.push({
          title,
          region,
          service,
          tail,
          sido: place.sido,
          district: place.district,
          area: place.area
        });
      }
    }
  }
  return items;
}

exports.handler = async function(event) {
  try {
    const areas = await loadAreas();
    const keywords = buildKeywords(areas);

    const q = event.queryStringParameters || {};
    let body = {};
    try { body = JSON.parse(event.body || "{}"); } catch (_) {}

    const start = Math.max(1, Number(body.start || q.start || 1));
    const limit = Math.min(8000, Math.max(1, Number(body.limit || q.limit || 20)));
    const slice = keywords.slice(start - 1, start - 1 + limit);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({
        ok: true,
        system: "cleaning-bank-4",
        version: "4.0",
        total: keywords.length,
        areaRecords: areas.length,
        services: SERVICES.length,
        tails: TAILS.length,
        start,
        limit,
        returned: slice.length,
        end: slice.length ? start + slice.length - 1 : start,
        items: slice,
        sample: keywords.slice(0, 12)
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: false, error: error.message || String(error) })
    };
  }
};
