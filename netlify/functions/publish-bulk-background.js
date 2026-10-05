const INDEXNOW_KEY="c4b4a4e8d1f74c5da0e5400e64f40b4a";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function hash(s){let x=2166136261;for(const c of String(s)){x^=c.charCodeAt(0);x=Math.imul(x,16777619)}return x|0}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function pageHtml(p,site){
 const t=esc(p.title),r=esc(p.region),s=esc(p.service),c=site+p.urlPath;
 return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t} | 청소뱅크</title><meta name="description" content="${r} ${s} 청소업체 상담. 무료 방문견적, 카드결제, 세금계산서, 영업배상책임보험 1억원.">
<meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${c}"><link rel="stylesheet" href="/assets/style.css">
<style>.x{max-width:980px;margin:46px auto;padding:0 24px;color:#17212b;line-height:1.8}.hero{width:100%;max-height:520px;object-fit:cover;border-radius:18px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{border:1px solid #d9e0df;border-radius:14px;padding:20px}.info,.cta{padding:26px;border-radius:18px;margin:30px 0;background:#edf9f5}.btn{display:inline-block;padding:14px 22px;border-radius:28px;text-decoration:none;font-weight:800;margin:4px}.call{background:#168e70;color:#fff}.home{background:#fff;color:#168e70;border:2px solid #168e70}@media(max-width:720px){.grid{grid-template-columns:1fr}}</style></head><body>
<div class="top">무료견적서비스 010-6856-0158 · 상담 08:00~20:00</div><main class="x"><img class="hero" src="/assets/images/office-hero.jpg" alt="${r} ${s} 청소 현장"><p>청소뱅크 › 지역별 서비스 › ${r} ${s}</p><h1>${t}</h1>
<p>${r}에서 ${s} 업체를 찾을 때는 작업범위와 방문주기, 운영시간을 함께 확인하는 것이 좋습니다. 청소뱅크는 현장 규모와 이용환경을 확인한 뒤 필요한 범위를 상담하고 무료 방문견적을 안내합니다.</p>
<h2>${r} ${s} 관리범위</h2><div class="grid"><div class="card"><b>바닥·공용공간</b><br>현장 상태에 맞는 기본 관리</div><div class="card"><b>화장실·출입구</b><br>이용량이 많은 공간 관리</div><div class="card"><b>정기관리</b><br>주 1회~주 7회 상담</div></div>
<div class="info"><b>청소뱅크 안내</b><br>무료 방문견적 · 카드결제 · 세금계산서 · 영업배상책임보험 1억원 · 하청 없이 직접 관리 상담</div>
<h2>${r} ${s} 업체 상담</h2><p>정확한 비용은 면적, 오염도, 작업시간, 관리주기와 세부 범위를 확인한 뒤 안내합니다.</p>
<div class="cta"><h2>청소 상담이 필요하신가요?</h2><a class="btn call" href="tel:01068560158">☎ 010-6856-0158</a><a class="btn home" href="https://cleaning-bank.imweb.me/" target="_blank" rel="noopener">청소뱅크 홈페이지</a></div></main></body></html>`;
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

  const tree=new Array(pages.length+1);
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

  const kb=await gh(`${api}/repos/${owner}/${repo}/git/blobs`,{method:"POST",body:JSON.stringify({content:INDEXNOW_KEY,encoding:"utf-8"})},headers);
  tree[pages.length]={path:`${INDEXNOW_KEY}.txt`,mode:"100644",type:"blob",sha:kb.sha};

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