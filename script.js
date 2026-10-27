(()=>{
'use strict';
const C=window.SITE_CONFIG,$=id=>document.getElementById(id),sleep=ms=>new Promise(r=>setTimeout(r,ms));
let token=0,page=0,changing=false,letterRunning=false,textVersion=0,letterVersion=0;const scenes=['intro','music','invite','gallery','ending'];
const audio=$('backgroundMusic');audio.volume=.48;
function show(id){token++;letterVersion++;letterRunning=false;scenes.forEach(s=>$(s).classList.toggle('active',s===id));}
function buildMatrix(){const el=$('matrix');for(let i=0;i<40;i++){const s=document.createElement('span');s.className='stream';s.textContent=Array.from({length:20+Math.floor(Math.random()*52)},()=>Math.random()>.48?'1':'0').join('');s.style.setProperty('--duration',(3+Math.random()*7)+'s');s.style.setProperty('--delay',(-Math.random()*8)+'s');el.appendChild(s)}}
async function intro(){
  show('intro');const t=token,count=$('count'),holder=$('introWords');
  count.style.display='block';holder.replaceChildren();
  for(let i=3;i>=1;i--){
    if(t!==token)return;
    count.classList.remove('count-show');void count.offsetWidth;
    count.textContent=i;count.classList.add('count-show');
    await sleep(920);
  }
  if(t!==token)return;
  count.style.display='none';
  for(let i=0;i<C.introWords.length;i++){
    if(t!==token)return;
    const el=document.createElement('div');el.className='intro-word';el.textContent=C.introWords[i];holder.appendChild(el);
    await sleep(i===C.introWords.length-1?1620:1420);
    if(t!==token)return;
    el.classList.add('leaving');await sleep(650);
    if(t!==token)return;
    el.remove();
  }
  if(t===token)show('music');
}
// Words appear with gentle stagger, instead of flashing or revealing all at once.
async function typeWords(el,value,duration,t,v){el.replaceChildren();const words=String(value).trim().split(/\s+/).filter(Boolean);if(!words.length)return;const step=Math.max(160,duration/words.length);for(let i=0;i<words.length;i++){if(t!==token||v!==textVersion)return;const span=document.createElement('span');span.className='typed-word';span.textContent=words[i];el.appendChild(span);if(i<words.length-1)el.appendChild(document.createTextNode(' '));await sleep(step)}}
function setPhoto(which,path,num){const img=$('photo'+which),ph=$('placeholder'+which);img.onload=()=>{img.hidden=false;ph.hidden=true};img.onerror=()=>{img.hidden=true;ph.hidden=false};img.hidden=true;ph.hidden=false;ph.querySelector('small').textContent='Ваше фото '+num;img.removeAttribute('src');if(path)img.src=path}
function populate(idx){const p=C.pages[idx];page=idx;$('pageNumber').textContent=String(idx+1).padStart(2,'0')+' / '+String(C.pages.length).padStart(2,'0');setPhoto('A',p.photos[0],idx*2+1);setPhoto('B',p.photos[1],idx*2+2);$('prevPage').disabled=idx===0;$('nextPage').textContent=idx===C.pages.length-1?'♥':'›';$('dots').replaceChildren();C.pages.forEach((_,i)=>{const b=document.createElement('button');b.className='dot'+(i===idx?' selected':'');b.setAttribute('aria-label','Страница '+(i+1));b.addEventListener('click',()=>renderPage(i));$('dots').appendChild(b)})}
async function turn(card,from,to,t){const forward=to>from,sign=forward?-1:1;card.classList.add('is-turning');card.style.transformOrigin=forward?'left center':'right center';const first=card.animate([{transform:'perspective(1300px) rotateY(0deg)',opacity:1,filter:'brightness(1)'},{transform:`perspective(1300px) rotateY(${sign*88}deg)`,opacity:.55,filter:'brightness(.7)'}],{duration:700,easing:'cubic-bezier(.45,.05,.62,.9)',fill:'forwards'});try{await first.finished}catch{}first.cancel();if(t!==token){card.classList.remove('is-turning');return false}populate(to);$('pageText').replaceChildren();card.style.transformOrigin=forward?'right center':'left center';const second=card.animate([{transform:`perspective(1300px) rotateY(${-sign*88}deg)`,opacity:.55,filter:'brightness(.7)'},{transform:'perspective(1300px) rotateY(0deg)',opacity:1,filter:'brightness(1)'}],{duration:820,easing:'cubic-bezier(.16,.72,.18,1)',fill:'forwards'});try{await second.finished}catch{}second.cancel();card.classList.remove('is-turning');return t===token}
async function renderPage(idx){if(changing||idx<0||idx>=C.pages.length||idx===page)return;changing=true;const v=++textVersion;const t=token,old=page;const ok=await turn($('galleryCard'),old,idx,t);changing=false;if(ok)await typeWords($('pageText'),C.pages[idx].text,5000,t,v)}
async function next(){if(changing)return;if(page<C.pages.length-1)await renderPage(page+1);else show('ending')}
async function gallery(){show('gallery');changing=false;page=0;populate(0);const v=++textVersion;await typeWords($('pageText'),C.pages[0].text,5000,token,v)}
async function typeLetter(){
  if(letterRunning)return;
  letterRunning=true;
  const run=++letterVersion,t=token,dest=$('letterText');
  dest.replaceChildren();$('signature').hidden=true;$('replay').hidden=true;
  $('letter').scrollTop=0;
  $('letter').querySelector('h2').textContent=C.letterTitle;
  for(const paragraph of C.letter){
    if(t!==token||run!==letterVersion)return;
    const p=document.createElement('p');p.className='letter-paragraph';dest.appendChild(p);
    const parts=paragraph.match(/\S+\s*/g)||[];
    for(const part of parts){
      if(t!==token||run!==letterVersion)return;
      const span=document.createElement('span');span.className='letter-word';span.textContent=part;p.appendChild(span);
      await sleep(Math.max(190,C.letterWordDelay??215));
    }
    await sleep(700);
  }
  if(t===token&&run===letterVersion){
    $('signature').textContent=C.signature;
    $('signature').hidden=false;$('replay').hidden=false;
    letterRunning=false;
  }
}
async function startMusic(){const b=$('startMusic');b.disabled=true;try{await audio.play();$('musicToggle').textContent='♫';$('musicToggle').setAttribute('aria-label','Выключить музыку')}catch(err){$('musicToggle').textContent='♪';}b.disabled=false;show('invite')}
$('startMusic').addEventListener('click',startMusic);$('introSkip').onclick=()=>show('music');$('openCard').onclick=async()=>{const btn=$('openCard');if(btn.disabled)return;btn.disabled=true;btn.classList.add('opening');await sleep(980);gallery();btn.classList.remove('opening');btn.disabled=false;};$('prevPage').onclick=()=>renderPage(page-1);$('nextPage').onclick=next;
$('musicToggle').onclick=async()=>{if(audio.paused){try{await audio.play();$('musicToggle').textContent='♫'}catch{}}else{audio.pause();$('musicToggle').textContent='♪'}};
$('letterButton').onclick=async()=>{const btn=$('letterButton');if(btn.disabled)return;btn.disabled=true;btn.classList.add('opening');await sleep(660);btn.hidden=true;btn.classList.remove('opening');btn.disabled=false;$('letter').hidden=false;typeLetter()};$('replay').onclick=()=>{letterVersion++;letterRunning=false;$('letterButton').hidden=false;$('letter').hidden=true;intro()};
let touchStart=null;const galleryScene=$('gallery');galleryScene.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});galleryScene.addEventListener('touchend',e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.25){if(dx<0)next();else renderPage(page-1)}},{passive:true});
window.addEventListener('keydown',e=>{if(!$('gallery').classList.contains('active'))return;if(e.key==='ArrowRight')next();if(e.key==='ArrowLeft')renderPage(page-1)});
buildMatrix();intro();
})();
