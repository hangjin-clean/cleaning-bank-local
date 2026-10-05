const $=id=>document.getElementById(id);
function log(s){$("log").textContent+="\n["+new Date().toLocaleTimeString()+"] "+s}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function hash(s){let x=2166136261;for(const c of String(s)){x^=c.charCodeAt(0);x=Math.imul(x,16777619)}return x|0}
function actualPath(x){const id=Math.abs(hash(x.title)).toString(36);return "/local/v4/"+id+"/"}

async function load(start=1,limit=20){
 log("계산 요청: "+start+"번부터 "+limit+"개");
 $("progressText").textContent="전국 지역/키워드 계산 중...";
 $("bar").style.width="35%";
 const r=await fetch("/.netlify/functions/generate-bulk?start="+start+"&limit="+limit,{cache:"no-store"}),d=await r.json();
 if(!d.ok)throw new Error(d.error||"생성기 오류");
 $("total").textContent=d.total.toLocaleString();$("areas").textContent=d.areaRecords.toLocaleString();$("services").textContent=d.services.toLocaleString();
 $("range").textContent=d.start.toLocaleString()+"~"+d.end.toLocaleString();
 $("headline").textContent="현재 규칙 실제 키워드 "+d.total.toLocaleString()+"개 · 8,000개씩 "+Math.ceil(d.total/8000).toLocaleString()+"회";
 $("bar").style.width="100%";$("progressText").textContent="후보 "+d.start.toLocaleString()+"~"+d.end.toLocaleString()+" 계산 완료";
 $("samples").innerHTML=d.items.slice(0,40).map(x=>'<li style="margin:8px 0"><a href="'+actualPath(x)+'" target="_blank" rel="noopener" style="color:#10243a;text-decoration:underline;text-decoration-color:#22b573;text-underline-offset:4px;font-weight:700">'+esc(x.title)+' ↗</a></li>').join("");
 log("완료: 총 "+d.total.toLocaleString()+"개 / 현재 "+d.returned.toLocaleString()+"개");
 return d
}
$("calc").onclick=()=>load(1,20).catch(e=>alert(e.message));
$("preview").onclick=()=>load(+$("start").value||1,Math.min(8000,+$("limit").value||8000)).catch(e=>alert(e.message));
$("test").onclick=()=>load(1,20).catch(e=>alert(e.message));
$("next").onclick=()=>{const n=(+$("start").value||1)+8000;$("start").value=n;load(n,Math.min(8000,+$("limit").value||8000)).catch(e=>alert(e.message))};
$("prepare").onclick=async()=>{const d=await load(+$("start").value||1,Math.min(8000,+$("limit").value||8000));log("선택 구간 준비 완료: "+d.start+"~"+d.end)};
$("reset").onclick=()=>{$("samples").innerHTML="";$("log").textContent="화면 초기화 완료.";$("bar").style.width="0";$("progressText").textContent="대기 중"};

let publishState=null;
async function loadPublishStatus(){const r=await fetch("/.netlify/functions/publish-status",{cache:"no-store"}),d=await r.json();if(!d.ok)throw new Error(d.error||"상태 확인 실패");publishState=d;$("lastDone").textContent=d.last?`${d.last.start.toLocaleString()}~${d.last.end.toLocaleString()}`:"없음";$("nextStart").textContent=d.nextStart.toLocaleString();return d}
function setPublishUI(text,pct){$("progressText").textContent=text;$("bar").style.width=pct+"%"}
async function waitForPublish(start,end){
 const begun=Date.now();
 let checks=0;
 while(Date.now()-begun < 15*60*1000){
   await new Promise(r=>setTimeout(r,5000));
   checks++;
   try{
     const d=await loadPublishStatus();
     if(d.last && d.last.start===start && d.last.end===end){
       setPublishUI("✅ 발행 완료 "+start+"~"+end,100);
       log("✅ 발행 완료 확인: "+start+"~"+end+" / GitHub 커밋 "+String(d.last.sha||"").slice(0,7));
       $("publish").disabled=false;$("publish").textContent="선택 구간 실제 발행";
       alert("발행 완료: "+start+"~"+end);
       return;
     }
     const pct=Math.min(90,15+checks*2);
     setPublishUI("⏳ 처리 중 · GitHub/Netlify 완료 확인 중 ("+checks+"회 확인)",pct);
   }catch(e){log("상태 확인 재시도: "+e.message)}
 }
 setPublishUI("⚠️ 15분 내 완료 확인 안 됨 · Function 로그 확인 필요",95);
 log("⚠️ 완료 커밋을 15분 내 확인하지 못했습니다. 중복 발행하지 말고 Function 로그를 확인하세요.");
 $("publish").disabled=false;$("publish").textContent="선택 구간 실제 발행";
 alert("완료 여부를 확인하지 못했습니다. Function 로그를 확인하세요.");
}
$("publish").onclick=async()=>{
 if(!confirm("선택한 구간을 실제 GitHub에 발행하고 IndexNow까지 등록할까요?"))return;
 const start=+$("start").value||1,limit=Math.min(8000,+$("limit").value||8000),end=start+limit-1;
 $("publish").disabled=true;$("publish").textContent="발행 처리 중...";
 setPublishUI("🚀 발행 요청 전송 중 "+start+"~"+end,8);
 log("실제 발행 시작 요청: "+start+" / "+limit+"개");
 try{
   const r=await fetch("/.netlify/functions/publish-bulk-background",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({start,limit})});
   if(!r.ok)throw new Error("HTTP "+r.status);
   setPublishUI("⏳ 발행 요청 접수 · 완료 자동 확인 중",15);
   log("발행 요청 접수 완료. 이제 완료 커밋을 자동 확인합니다.");
   waitForPublish(start,end);
 }catch(e){
   setPublishUI("❌ 발행 요청 실패: "+e.message,0);
   log("❌ 발행 요청 실패: "+e.message);
   $("publish").disabled=false;$("publish").textContent="선택 구간 실제 발행";
   alert("발행 요청 실패: "+e.message);
 }
};
$("loadStatus").onclick=()=>loadPublishStatus().then(d=>{if(d.last)log(`최근 완료 ${d.last.start}~${d.last.end} / 다음 시작 ${d.nextStart}`)}).catch(e=>alert(e.message));
$("applyNext").onclick=async()=>{const d=publishState||await loadPublishStatus();$("start").value=d.nextStart;log("다음 시작번호 적용: "+d.nextStart)};
loadPublishStatus().then(d=>{if(d.last){$("start").value=d.nextStart}}).catch(e=>log("최근 상태 자동확인 실패: "+e.message));