const INDEXNOW_KEY="c4b4a4e8d1f74c5da0e5400e64f40b4a";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function hash(s){let x=2166136261;for(const c of String(s)){x^=c.charCodeAt(0);x=Math.imul(x,16777619)}return x|0}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function serviceTemplate(service){
 const s=String(service||"");
 if(/병원|의원/.test(s)) return {img:"/assets/images/cleaning-bank-main-new.png",scope:["진료실·대기실","접수대·공용공간","화장실·바닥"],intro:"병원과 개인의원은 환자와 의료진의 이동이 많아 진료 전후의 청결 관리와 마감 관리가 중요합니다.",detail:"오픈 전 청소, 마감청소, 정기관리 횟수와 진료시간을 확인해 동선을 방해하지 않는 시간대로 상담합니다."};
 if(/학원|스터디|교습소|어린이집|학교/.test(s)) return {img:"/assets/images/cleaning-bank-main-new.png",scope:["교실·책상","칠판·공용공간","복도·화장실"],intro:"학원과 교육시설은 책상, 교실, 복도처럼 반복 사용되는 공간의 먼지와 생활오염을 일정하게 관리하는 것이 중요합니다.",detail:"수업 전후 시간과 학생 이용량을 고려해 교실, 책상정리, 칠판, 공용공간과 화장실 범위를 상담합니다."};
 if(/계단/.test(s)) return {img:"/assets/images/cleaning-bank-main-new.png",scope:["공용계단","난간·출입구","복도·화장실"],intro:"빌라, 상가, 원룸, 오피스텔의 공용계단은 외부 먼지와 발자국 오염이 반복되어 정기적인 관리가 효과적입니다.",detail:"건물 층수와 엘리베이터 유무, 공용화장실 포함 여부, 월 관리 횟수를 확인해 범위를 정합니다."};
 if(/식당|음식점|주방|후드/.test(s)) return {img:"/assets/images/cleaning-bank-main-new.png",scope:["홀·바닥","주방 주변","후드·기름때"],intro:"식당과 음식점은 홀 바닥뿐 아니라 주방 주변과 후드의 기름 오염, 영업 마감 후 관리가 중요합니다.",detail:"영업시간과 마감시간, 주방·홀·후드 등 필요한 범위를 나눠 정기관리 또는 별도 작업으로 상담합니다."};
 if(/카페|베이커리|무인매장/.test(s)) return {img:"/assets/images/cleaning-bank-main-new.png",scope:["매장·바닥","테이블·공용공간","화장실·마감"],intro:"카페와 베이커리, 무인매장은 고객 이용이 잦아 바닥과 테이블 주변, 출입구의 반복 관리가 중요합니다.",detail:"오픈 전 또는 마감 후 작업시간과 매장 규모를 확인해 필요한 관리주기를 상담합니다."};
 if(/준공|입주|이사|거주/.test(s)) return {img:"/assets/images/cleaning-bank-main-new.png",scope:["바닥·분진","창틀·유리","주방·화장실"],intro:"준공·입주·이사 청소는 공사 분진과 생활오염 등 현장 상태에 따라 작업범위가 크게 달라집니다.",detail:"평수와 공사·입주 상태, 창틀·유리·주방·욕실 등 세부 범위를 확인한 뒤 방문견적을 안내합니다."};
 if(/유리|외벽|간판/.test(s)) return {img:"/assets/images/cleaning-bank-main-new.png",scope:["유리·창틀","외벽 표면","간판·외부오염"],intro:"유리창, 외벽, 간판은 높이와 오염상태, 장비 사용 여부에 따라 작업방법이 달라지는 외부 청소 영역입니다.",detail:"건물 높이와 작업면적, 접근환경을 확인해 안전한 작업방식과 필요한 장비를 상담합니다."};
 if(/헬스장|샤워실|탈의실/.test(s)) return {img:"/assets/images/cleaning-bank-main-new.png",scope:["운동공간·기구주변","샤워실","탈의실·화장실"],intro:"헬스장은 운동공간뿐 아니라 샤워실과 탈의실처럼 이용량과 습도가 높은 공간을 함께 관리해야 합니다.",detail:"운영시간과 회원 이용량을 고려해 기구 주변 먼지, 바닥, 샤워실, 탈의실과 화장실 범위를 상담합니다."};
 if(/공장|창고/.test(s)) return {img:"/assets/images/cleaning-bank-main-new.png",scope:["작업장 바닥","통로·출입구","창고·분진"],intro:"공장과 창고는 면적, 적재상태, 분진과 바닥오염 정도에 따라 일반 사업장과 다른 작업계획이 필요합니다.",detail:"작업장 동선과 가동시간, 바닥상태와 장비 사용 가능 여부를 확인해 작업범위를 정합니다."};
 if(/주차장/.test(s)) return {img:"/assets/images/cleaning-bank-main-new.png",scope:["주차면","차량 통로","출입구·분진"],intro:"주차장은 차량 이동으로 먼지와 타이어 오염이 반복되므로 면적과 바닥상태에 맞는 관리가 필요합니다.",detail:"주차면수, 작업 가능시간, 배수와 장비 사용환경을 확인해 세척 또는 정기관리 범위를 상담합니다."};
 if(/화장실|방역|소독/.test(s)) return {img:"/assets/images/cleaning-bank-main-new.png",scope:["바닥·벽면","변기·세면대","유리·접촉부"],intro:"화장실과 위생관리 영역은 이용량에 따라 오염이 빠르게 반복되어 정기적인 점검과 관리가 중요합니다.",detail:"바닥, 벽면, 유리, 변기와 세면대 등 필요한 범위를 확인하고 현장 운영시간에 맞춰 상담합니다."};
 return {img:"/assets/images/cleaning-bank-main-new.png",scope:["사무공간·바닥","출입구·공용공간","탕비실·화장실"],intro:"사무실과 일반 사업장은 직원과 방문객 이용으로 바닥과 공용공간에 먼지와 생활오염이 반복적으로 쌓입니다.",detail:"사무실 규모와 운영시간을 확인해 청소기·물걸레, 공용공간, 탕비실과 화장실 등 필요한 범위를 상담합니다."};
}
function pageHtml(p,site){
 const t=esc(p.title),r=esc(p.region),s=esc(p.service),c=site+p.urlPath,x=serviceTemplate(p.service);
 return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t} | 청소뱅크</title><meta name="description" content="${r} ${s} 청소업체 상담. 무료 방문견적, 카드결제, 세금계산서, 영업배상책임보험 1억원.">
<meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${c}"><link rel="stylesheet" href="/assets/style.css">
<style>.x{max-width:980px;margin:46px auto 70px;padding:0 24px;color:#17212b;line-height:1.8}.hero{display:block!important;width:100%!important;height:auto!important;max-width:100%!important;max-height:none!important;min-height:0!important;object-fit:contain!important;object-position:center top!important;border-radius:0!important;overflow:visible!important}.crumb{margin:32px 0 10px;color:#667085}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:20px 0}.card{border:1px solid #d9e0df;border-radius:14px;padding:20px;background:#fff}.info{padding:24px;border-radius:16px;margin:28px 0;background:#f0f8f5}.cta{padding:34px 24px;border-radius:18px;margin:36px 0;background:#edf9f5;text-align:center}.btn{display:inline-block;padding:14px 22px;border-radius:28px;text-decoration:none;font-weight:800;margin:4px}.call{background:#168e70;color:#fff}.home{background:#fff;color:#168e70;border:2px solid #168e70}.cert{width:100%;max-width:760px;margin:25px auto;display:block;border-radius:12px}@media(max-width:720px){.grid{grid-template-columns:1fr}.x h1{font-size:30px}}</style></head><body>
<div class="top">무료견적서비스 010-6856-0158 · 상담 08:00~20:00</div><main class="x">
<img class="hero" src="${x.img}" alt="${r} ${s} 청소 현장"><div class="crumb">청소뱅크 › 지역별 서비스 › ${r} ${s}</div><h1>${t}</h1>
<p>${x.intro} 청소뱅크는 ${r} 현장의 규모와 운영환경을 확인한 뒤 ${s}에 필요한 범위와 관리주기를 상담합니다.</p>
<h2>${r} ${s} 관리범위</h2><div class="grid">${x.scope.map(v=>`<div class="card"><b>${v}</b><br>현장 상태와 이용량에 맞춰 필요한 작업범위를 확인합니다.</div>`).join("")}</div>
<p>${x.detail}</p><div class="info"><b>청소뱅크 정기관리 안내</b><br>무료 방문견적 · 주 1회~주 7회 상담 · 카드결제 · 세금계산서 발행 · 영업배상책임보험 1억원 · 하청 없이 직접 관리 상담</div>
<h2>${r} ${s} 업체를 비교할 때 확인할 점</h2><p>가격만 비교하기보다 실제 작업범위, 방문 횟수, 작업시간, 결제방법과 사후관리 조건을 함께 확인하는 것이 좋습니다. 정확한 비용은 현장 조건을 확인한 뒤 안내합니다.</p>
<img class="cert" src="/assets/images/cleaning-certificates-3.png" alt="청소뱅크 청소 관련 자격 및 인증 안내">
<div class="cta"><h2>청소 상담이 필요하신가요?</h2><p>${r} ${s} 무료 방문견적과 관리주기를 상담하세요.</p><a class="btn call" href="tel:01068560158">☎ 010-6856-0158</a><a class="btn home" href="https://cleaning-bank.imweb.me/" target="_blank" rel="noopener">청소뱅크 홈페이지</a></div></main></body></html>`;
}
async function gh(url,opt,headers,attempt=0){
 const r=await fetch(url,{...opt,headers:opt.headers||headers});
 const tx=await r.text(); let d={}; try{d=JSON.parse(tx)}catch{d={message:tx}}
 if(r.ok)return d;
 const msg=String(d.message||tx||"");
 const retryable=r.status===403||r.status===429||r.status>=500;
 if(retryable && attempt<8){
   const ra=Number(r.headers.get("retry-after")||0);
   const wait=ra?ra*1000:Math.min(120000,5000*Math.pow(2,attempt));
   console.log("GH_RETRY",r.status,"attempt",attempt+1,"wait",wait,msg.slice(0,160));
   await sleep(wait);
   return gh(url,opt,headers,attempt+1);
 }
 throw Error(`GitHub ${r.status}: ${msg}`);
}


function xmlEsc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}
async function makeBlob(api,headers,content){
 return gh(`${api}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/git/blobs`,{method:"POST",body:JSON.stringify({content,encoding:"utf-8"})},headers);
}
function sitemapPart(site,items){
 return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`+
 items.map(p=>`  <url><loc>${xmlEsc(site+p.urlPath)}</loc></url>`).join("\n")+
 `\n</urlset>\n`;
}
function sitemapIndex(site,parts){
 return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`+
 parts.map(n=>`  <sitemap><loc>${xmlEsc(site+"/sitemaps/"+n)}</loc></sitemap>`).join("\n")+
 `\n</sitemapindex>\n`;
}

exports.handler=async function(event){
 try{
  let b={};try{b=JSON.parse(event.body||"{}")}catch{}
  const start=Math.max(1,+b.start||1),limit=Math.min(8000,Math.max(1,+b.limit||8000));
  const site=(process.env.SITE_URL||"").replace(/\/$/,""),token=process.env.GITHUB_TOKEN,owner=process.env.GITHUB_OWNER,repo=process.env.GITHUB_REPO,branch=process.env.GITHUB_BRANCH||"main";
  if(!site||!token||!owner||!repo)throw Error("환경변수 누락");

  const gr=await fetch(`${site}/.netlify/functions/generate-bulk?start=${start}&limit=${limit}`,{cache:"no-store"}),gd=await gr.json();
  if(!gd.ok||!gd.items?.length)throw Error(gd.error||"키워드 생성 실패");

  const pages=gd.items.map(p=>{
    const id=p.id||Math.abs(hash(p.title)).toString(36);
    return {...p,id,urlPath:p.urlPath||`/local/v4/${id}/`};
  });

  const api="https://api.github.com";
  const headers={Authorization:`Bearer ${token}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json","User-Agent":"cleaning-bank-4"};

  const ref=await gh(`${api}/repos/${owner}/${repo}/git/ref/heads/${branch}`,{},headers);
  const parent=ref.object.sha;
  const cm=await gh(`${api}/repos/${owner}/${repo}/git/commits/${parent}`,{},headers);
  const base=cm.tree.sha;

  const tree=new Array(pages.length);
  let cursor=0,done=0;
  const concurrency=Math.max(1,Math.min(3,Number(process.env.GITHUB_BLOB_CONCURRENCY||2)));

  async function worker(){
    while(true){
      const i=cursor++;
      if(i>=pages.length)return;
      const p=pages[i];
      const bl=await gh(`${api}/repos/${owner}/${repo}/git/blobs`,{method:"POST",body:JSON.stringify({content:pageHtml(p,site),encoding:"utf-8"})},headers);
      tree[i]={path:`local/v4/${p.id}/index.html`,mode:"100644",type:"blob",sha:bl.sha};
      done++;
      if(done%100===0)console.log("4HO_PROGRESS",done,"/",pages.length);
      await sleep(180);
    }
  }

  await Promise.all(Array.from({length:concurrency},worker));

  
  // 자동 사이트맵: 발행 구간별 sitemap part + sitemap.xml index
  const currentEnd=start+pages.length-1;
  const currentName=`v4-${start}-${currentEnd}.xml`;
  const smBlob=await makeBlob(api,headers,sitemapPart(site,pages));
  tree.push({path:`sitemaps/${currentName}`,mode:"100644",type:"blob",sha:smBlob.sha});

  // 기존 4호 발행 커밋들을 읽어 sitemap index에 누적
  let parts=[currentName];
  try{
    const cr=await fetch(`${api}/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=100`,{headers});
    const commits=await cr.json();
    if(cr.ok&&Array.isArray(commits)){
      for(const c of commits){
        const m=String(c.commit?.message||"").match(/4호 대량발행\s+(\d+)-(\d+)/);
        if(m) parts.push(`v4-${m[1]}-${m[2]}.xml`);
      }
    }
  }catch(e){console.log("SITEMAP_HISTORY_WARN",e.message)}
  parts=[...new Set(parts)];
  const indexBlob=await makeBlob(api,headers,sitemapIndex(site,parts));
  tree.push({path:"sitemap.xml",mode:"100644",type:"blob",sha:indexBlob.sha});

const kb=await gh(`${api}/repos/${owner}/${repo}/git/blobs`,{method:"POST",body:JSON.stringify({content:INDEXNOW_KEY,encoding:"utf-8"})},headers);
  tree.push({path:`${INDEXNOW_KEY}.txt`,mode:"100644",type:"blob",sha:kb.sha});

  const nt=await gh(`${api}/repos/${owner}/${repo}/git/trees`,{method:"POST",body:JSON.stringify({base_tree:base,tree})},headers);
  const nc=await gh(`${api}/repos/${owner}/${repo}/git/commits`,{method:"POST",body:JSON.stringify({message:`4호 대량발행 ${start}-${start+pages.length-1}`,tree:nt.sha,parents:[parent]})},headers);
  await gh(`${api}/repos/${owner}/${repo}/git/refs/heads/${branch}`,{method:"PATCH",body:JSON.stringify({sha:nc.sha,force:false})},headers);

  let deployed=false;
  for(let i=0;i<60;i++){
    await sleep(5000);
    try{const r=await fetch(site+pages[0].urlPath,{cache:"no-store"});if(r.ok){deployed=true;break}}catch{}
  }

  let ix=0;
  if(deployed){
    // IndexNow has practical batch limits; send 1,000 URLs per request.
    const urls=pages.map(p=>site+p.urlPath);
    for(let i=0;i<urls.length;i+=1000){
      const batch=urls.slice(i,i+1000);
      const r=await fetch("https://api.indexnow.org/indexnow",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({host:new URL(site).host,key:INDEXNOW_KEY,keyLocation:`${site}/${INDEXNOW_KEY}.txt`,urlList:batch})});
      ix=r.status;
      if(!r.ok)console.log("INDEXNOW_BATCH",i,r.status);
      await sleep(1000);
    }
  }

  console.log("4HO_PUBLISH_DONE",JSON.stringify({start,count:pages.length,end:start+pages.length-1,commit:nc.sha,deployed,indexNowStatus:ix}));
 }catch(e){console.error("4HO_PUBLISH_ERROR",e)}
};