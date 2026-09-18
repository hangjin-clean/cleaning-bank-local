const services=[{"slug": "office-cleaning", "name": "사무실청소"}, {"slug": "hospital-cleaning", "name": "병원청소"}, {"slug": "academy-cleaning", "name": "학원청소"}, {"slug": "stair-cleaning", "name": "계단청소"}, {"slug": "office-regular-cleaning", "name": "사무실정기청소"}, {"slug": "hospital-regular-cleaning", "name": "병원정기청소"}, {"slug": "academy-regular-cleaning", "name": "학원정기청소"}, {"slug": "office-movein-cleaning", "name": "사무실입주청소"}, {"slug": "hospital-movein-cleaning", "name": "병원입주청소"}, {"slug": "academy-movein-cleaning", "name": "학원입주청소"}, {"slug": "villa-stair-cleaning", "name": "빌라계단청소"}];
const sel=document.getElementById('service'); services.forEach(s=>{let o=document.createElement('option');o.value=s.slug;o.textContent=s.name;sel.appendChild(o)});
function preview(){
 const r=document.getElementById('region').value.trim(), s=services.find(x=>x.slug===sel.value);
 if(!r) return alert('지역명을 입력하세요.');
 const slug=encodeURIComponent(r.replace(/\s+/g,'-'));
 document.getElementById('out').innerHTML=`<div class="card"><h2>${r} ${s.name}</h2><p>예상 URL: /local/${slug}/${s.slug}/</p><p>발행 전 페이지별 제목·본문·사진·메타설명을 독립적으로 구성합니다.</p></div>`;
}