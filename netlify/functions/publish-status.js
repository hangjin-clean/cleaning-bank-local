exports.handler=async function(){
 try{
  const token=process.env.GITHUB_TOKEN,owner=process.env.GITHUB_OWNER,repo=process.env.GITHUB_REPO,branch=process.env.GITHUB_BRANCH||"main";
  if(!token||!owner||!repo)throw Error("GitHub 환경변수 누락");
  const r=await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=30`,{headers:{Authorization:`Bearer ${token}`,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","User-Agent":"cleaning-bank-4"}});
  const d=await r.json();if(!r.ok)throw Error(d.message||"GitHub status error");
  let last=null;
  for(const c of d){const m=c.commit?.message||"";const x=m.match(/4호 대량발행\s+(\d+)-(\d+)/);if(x){last={start:+x[1],end:+x[2],sha:c.sha,date:c.commit?.author?.date||"",message:m};break}}
  return{statusCode:200,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"},body:JSON.stringify({ok:true,last,nextStart:last?last.end+1:1})}
 }catch(e){return{statusCode:500,headers:{"Content-Type":"application/json; charset=utf-8"},body:JSON.stringify({ok:false,error:e.message})}}
};