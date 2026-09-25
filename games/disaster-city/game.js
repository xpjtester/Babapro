const canvas=document.getElementById('city'),ctx=canvas.getContext('2d'),damageEl=document.getElementById('damage'),dropBtn=document.getElementById('dropBtn'),resetBtn=document.getElementById('resetBtn'),result=document.getElementById('result'),resultScore=document.getElementById('resultScore'),resultTitle=document.getElementById('resultTitle'),replayBtn=document.getElementById('replayBtn');
let W,H,objs=[],ball=null,damage=0,running=false,startX=.13,last=0,finishTimer=0;
const euro=n=>'€'+Math.round(n).toLocaleString('en-US')+' DAMAGE';
function resize(){const r=canvas.getBoundingClientRect();canvas.width=r.width*devicePixelRatio;canvas.height=r.height*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);W=r.width;H=r.height;reset()}addEventListener('resize',resize);
function add(type,x,y,w,h,value,color,extra={}){objs.push({type,x:x*W,y:y*H,w:w*W,h:h*H,value,color,alive:true,vx:0,vy:0,rot:0,...extra})}
function reset(){running=false;damage=0;damageEl.textContent=euro(0);result.classList.add('hidden');ball=null;finishTimer=0;objs=[];
add('house',.48,.56,.075,.18,180000,'#d95d4f');add('house',.57,.59,.07,.15,150000,'#e2b75b');add('tower',.79,.38,.09,.36,520000,'#9babb5');add('tower',.89,.47,.075,.27,390000,'#c7a47c');
add('car',.35,.72,.055,.035,65000,'#3477a9',{vx:.22*W});add('car',.62,.72,.055,.035,70000,'#d84a38',{vx:-.16*W});
add('barrel',.43,.69,.022,.055,120000,'#d33');add('barrel',.68,.69,.022,.055,120000,'#d33');
add('bridge',.67,.62,.16,.035,260000,'#555');add('train',.70,.565,.10,.045,340000,'#e8c94f',{vx:.07*W});}
function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function destroy(o,force=1){if(!o.alive)return;o.alive=false;damage+=o.value;damageEl.textContent=euro(damage);for(let i=0;i<10;i++)objs.push({type:'debris',x:o.x+o.w/2,y:o.y+o.h/2,w:4+Math.random()*7,h:4+Math.random()*7,vx:(Math.random()-.5)*260*force,vy:-Math.random()*220*force,value:0,color:o.color,alive:true,life:1+Math.random()});if(o.type==='barrel')explode(o.x+o.w/2,o.y+o.h/2)}
function explode(x,y){objs.forEach(o=>{if(!o.alive||o.type==='debris')return;let dx=o.x+o.w/2-x,dy=o.y+o.h/2-y;if(Math.hypot(dx,dy)<W*.17){o.vx+=Math.sign(dx||1)*180;o.vy-=150;setTimeout(()=>destroy(o,1.3),70+Math.random()*180)}})}
function drop(){if(running)return;reset();running=true;ball={x:startX*W,y:.17*H,r:18,vx:70,vy:0};dropBtn.textContent='DISASTER RUNNING...';last=performance.now()}
canvas.addEventListener('click',e=>{if(running)return;const r=canvas.getBoundingClientRect();startX=Math.max(.07,Math.min(.28,(e.clientX-r.left)/r.width));});
dropBtn.onclick=drop;resetBtn.onclick=()=>{reset();dropBtn.textContent='DROP BOWLING BALL'};replayBtn.onclick=()=>{reset();drop()};
function groundY(x){if(x<W*.32)return H*(.38+x/W*1.08);return H*.755}
function update(dt){if(!running)return;if(ball){ball.vy+=520*dt;ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;let gy=groundY(ball.x);if(ball.y+ball.r>gy){ball.y=gy-ball.r;ball.vy*=-.24;ball.vx+=95*dt}
let br={x:ball.x-ball.r,y:ball.y-ball.r,w:ball.r*2,h:ball.r*2};objs.forEach(o=>{if(o.alive&&o.type!=='debris'&&hit(br,o)){destroy(o,1);ball.vx*=.82;ball.vy-=60}});
if(ball.x>W+50)ball=null}
objs.forEach(o=>{if(!o.alive&&o.type!=='debris')return;if(o.type==='debris'){o.vy+=420*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.life-=dt;if(o.y>H*.77){o.y=H*.77;o.vy*=-.25;o.vx*=.75}if(o.life<0)o.alive=false;return}
if(o.vx||o.vy){o.vy+=260*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.vx*=.995;let gy=H*.72;if(o.y+o.h>gy){o.y=gy-o.h;o.vy*=-.15}objs.forEach(p=>{if(p!==o&&p.alive&&p.type!=='debris'&&hit(o,p)&&Math.abs(o.vx)>35){destroy(p,.8);o.vx*=.65}})}})
if(!ball&&!finishTimer){finishTimer=performance.now()+1800}if(finishTimer&&performance.now()>finishTimer){running=false;dropBtn.textContent='DROP BOWLING BALL';resultTitle.textContent=damage>=1000000?'CHALLENGE COMPLETE':'NOT ENOUGH DAMAGE';resultScore.textContent=euro(damage);result.classList.remove('hidden')}} 
function rect(o){ctx.save();ctx.translate(o.x+o.w/2,o.y+o.h/2);ctx.rotate(o.rot);ctx.fillStyle=o.color;ctx.fillRect(-o.w/2,-o.h/2,o.w,o.h);ctx.restore()}
function draw(){ctx.clearRect(0,0,W,H);let sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#a9d5e5');sky.addColorStop(1,'#e9e1c1');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
ctx.fillStyle='#7d9860';ctx.beginPath();ctx.moveTo(0,H*.38);ctx.lineTo(W*.32,H*.73);ctx.lineTo(W,H*.73);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();ctx.fillStyle='#555';ctx.fillRect(W*.30,H*.72,W*.7,H*.075);ctx.fillStyle='#eee';for(let x=W*.32;x<W;x+=55)ctx.fillRect(x,H*.755,28,3);
objs.forEach(o=>{if(!o.alive)return;if(o.type==='house'){ctx.fillStyle=o.color;ctx.fillRect(o.x,o.y,o.w,o.h);ctx.fillStyle='#713b32';ctx.beginPath();ctx.moveTo(o.x-5,o.y);ctx.lineTo(o.x+o.w/2,o.y-o.h*.28);ctx.lineTo(o.x+o.w+5,o.y);ctx.fill();ctx.fillStyle='#b9def1';ctx.fillRect(o.x+o.w*.18,o.y+o.h*.25,o.w*.22,o.h*.22)}
else if(o.type==='tower'){rect(o);ctx.fillStyle='#dcebf0';for(let yy=o.y+10;yy<o.y+o.h-8;yy+=18)for(let xx=o.x+8;xx<o.x+o.w-5;xx+=18)ctx.fillRect(xx,yy,8,8)}
else if(o.type==='car'){rect(o);ctx.fillStyle='#222';ctx.beginPath();ctx.arc(o.x+o.w*.2,o.y+o.h,5,0,7);ctx.arc(o.x+o.w*.8,o.y+o.h,5,0,7);ctx.fill()}
else if(o.type==='barrel'){rect(o);ctx.fillStyle='#ffd34e';ctx.fillRect(o.x,o.y+o.h*.42,o.w,o.h*.12)}
else if(o.type==='bridge'){rect(o)}
else if(o.type==='train'){rect(o);ctx.fillStyle='#333';ctx.fillRect(o.x+6,o.y+6,o.w*.55,o.h*.3)}
else rect(o)});
if(ball){ctx.fillStyle='#222';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#777';ctx.beginPath();ctx.arc(ball.x-6,ball.y-6,3,0,7);ctx.arc(ball.x+2,ball.y-9,3,0,7);ctx.fill()}
if(!running){ctx.fillStyle='#222b';ctx.font='bold 11px Verdana';ctx.fillText('CLICK HILL TO AIM',18,26);ctx.strokeStyle='#fff8';ctx.beginPath();ctx.arc(startX*W,groundY(startX*W)-22,24,0,7);ctx.stroke()}}
function frame(t){let dt=Math.min(.025,(t-(last||t))/1000);last=t;update(dt);draw();requestAnimationFrame(frame)}resize();requestAnimationFrame(frame);