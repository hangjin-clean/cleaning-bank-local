const $=id=>document.getElementById(id);
function log(s){$("log").textContent+="\n["+new Date().toLocaleTimeString()+"] "+s}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function hash(s){let x=2166136261;for(const c of String(s)){x^=c.charCodeAt(0);x=Math.imul(x,16777619)}return x|0}
function actualPath(x){const id=Math.abs(hash(x.title)).toString(36);return "/local/v4/"+id+"/"}
async function load(start=1,limit=20){
 log("계산 요청: "+start+"번부터 "+limit+"개");$("progressText").textContent="전국 지역/키워드 계산 중...";$("bar").style.width="35%";
 const r=await fetch("/.netlify/functions/generate-bulk?start="+start+"&limit="+limit,{cache:"no-store"}),d=await r.json();if(!d.ok)throw new Error(d.error||"생성기 오류");
 $("total").textContent=d.total.toLocaleString();$("areas").textContent=d.areaRecords.toLocaleString();$("services").textContent=d.services.toLocaleString();$("range").textContent=d.start.toLocaleString()+"~"+d.end.toLocaleString();
 $("headline").textContent="현재 규칙 실제 키워드 "+d.total.toLocaleString()+"개 · 8,000개씩 "+Math.ceil(d.total/8000).toLocaleString()+"회";$("bar").style.width="100%";$("progressText").textContent="후보 "+d.start.toLocaleString()+"~"+d.end.toLocaleString()+" 계산 완료";
 $("samples").innerHTML=d.items.slice(0,40).map(x=>'<li style="margin:8px 0"><a href="'+actualPath(x)+'" target="_blank" rel="noopener" style="color:#10243a;text-decoration:underline;text-decoration-color:#22b573;text-underline-offset:4px;font-weight:700">'+esc(x.title)+' ↗</a></li>').join("");log("완료: 총 "+d.total.toLocaleString()+"개 / 현재 "+d.returned.toLocaleString()+"개");return d}
$("calc").onclick=()=>load(1,20).catch(e=>alert(e.message));
$("preview").onclick=()=>load(+$("start").value||1,Math.min(8000,+$("limit").value||8000)).catch(e=>alert(e.message));
$("test").onclick=()=>load(+$("testStart").value||1,20).catch(e=>alert(e.message));
$("testCurrent").onclick=()=>{const n=+$("start").value||1;$("testStart").value=n;load(n,20).catch(e=>alert(e.message))};
$("next").onclick=()=>{const n=(+$("start").value||1)+8000;$("start").value=n;load(n,Math.min(8000,+$("limit").value||8000)).catch(e=>alert(e.message))};
$("prepare").onclick=async()=>{const d=await load(+$("start").value||1,Math.min(8000,+$("limit").value||8000));log("선택 구간 준비 완료: "+d.start+"~"+d.end)};
$("reset").onclick=()=>{$("samples").innerHTML="";$("log").textContent="화면 초기화 완료.";$("bar").style.width="0";$("progressText").textContent="대기 중"};
let publishState=null;
async function loadPublishStatus(){const r=await fetch("/.netlify/functions/publish-status",{cache:"no-store"}),d=await r.json();if(!d.ok)throw new Error(d.error||"상태 확인 실패");publishState=d;$("lastDone").textContent=d.last?`${d.last.start.toLocaleString()}~${d.last.end.toLocaleString()}`:"없음";$("nextStart").textContent=d.nextStart.toLocaleString();return d}
function setPublishUI(text,pct){$("progressText").textContent=text;$("bar").style.width=pct+"%"}
async function waitForChunk(start,end){
 const begun=Date.now();let checks=0;
 while(Date.now()-begun<4*60*1000){
  await new Promise(r=>setTimeout(r,5000));checks++;
  try{
   const d=await loadPublishStatus();
   if(d.last && d.last.start===start && d.last.end===end)return d.last;
  }catch(e){log("상태 확인 재시도: "+e.message)}
 }
 throw new Error(start+"~"+end+" 구간 커밋을 4분 내 확인하지 못했습니다. 재발행 전 GitHub 기록을 확인하세요.");
}
let publishing=false;
$("publish").onclick=async()=>{
 if(publishing)return;
 const start=+$("start").value||1,limit=Math.min(8000,+$("limit").value||8000),end=start+limit-1;
 if(!confirm(start+"~"+end+" 구간을 최대 500개씩 순차 발행할까요?"))return;
 publishing=true;$("publish").disabled=true;$("publish").textContent="발행 처리 중...";
 try{
  // Resume only at the confirmed next commit. Never overwrite a completed range.
  let d=await loadPublishStatus();
  let cursor=start;
  if(d.nextStart>cursor && d.nextStart<=end+1){
   if(!confirm("GitHub에 "+(d.nextStart-1)+"번까지 발행 기록이 있습니다. "+d.nextStart+"번부터 이어서 진행할까요?"))return;
   cursor=d.nextStart;
  }else if(d.nextStart<cursor){
   throw new Error("GitHub 다음 시작번호("+d.nextStart+")와 요청번호("+cursor+")가 다릅니다. 중복/누락 위험으로 중단합니다.");
  }else if(d.nextStart>end+1){
   throw new Error("이미 완료된 구간입니다. GitHub 최근 발행 기록을 확인하세요.");
  }
  while(cursor<=end){
   const count=Math.min(500,end-cursor+1),chunkEnd=cursor+count-1;
   const progress=Math.round((cursor-start)/limit*100);
   setPublishUI("⏳ "+cursor+"~"+chunkEnd+" 발행 요청 중",progress);
   log("분할 발행 요청: "+cursor+"~"+chunkEnd);
   const r=await fetch("/.netlify/functions/publish-bulk-background",{
    method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({start:cursor,limit:count})
   });
   if(!r.ok)throw new Error("발행 요청 HTTP "+r.status+" / "+cursor+"~"+chunkEnd);
   const commit=await waitForChunk(cursor,chunkEnd);
   log("✅ GitHub 커밋 확인 "+cursor+"~"+chunkEnd+" / "+String(commit.sha).slice(0,7));
   cursor=chunkEnd+1;
   if(cursor<=end)await new Promise(r=>setTimeout(r,8000));
   setPublishUI("GitHub 커밋 완료 "+(cursor-1)+" / "+end,Math.round((cursor-start)/limit*100));
  }
  setPublishUI("✅ GitHub 발행 커밋 완료 "+start+"~"+end,100);
  alert("GitHub 발행 커밋 완료: "+start+"~"+end+" (Netlify 배포 및 IndexNow 결과는 별도 확인)");
 }catch(e){
  log("❌ "+e.message);
  $("progressText").textContent="⚠️ "+e.message;
  alert("발행 중단: "+e.message);
 }finally{
  publishing=false;$("publish").disabled=false;$("publish").textContent="선택 구간 실제 발행";
 }
};
$("loadStatus").onclick=()=>loadPublishStatus().then(d=>{if(d.last)log(`최근 완료 ${d.last.start}~${d.last.end} / 다음 시작 ${d.nextStart}`)}).catch(e=>alert(e.message));
$("applyNext").onclick=async()=>{const d=publishState||await loadPublishStatus();$("start").value=d.nextStart;log("다음 시작번호 적용: "+d.nextStart)};
loadPublishStatus().then(d=>{if(d.last){$("start").value=d.nextStart}}).catch(e=>log("최근 상태 자동확인 실패: "+e.message));