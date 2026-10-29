const friends = [
  {name:'Jinx the cat',image:'assets/0.png'}, {name:'Roo the rabbit',image:'assets/1.png'},
  {name:'Sunny the dog',image:'assets/2.png'}, {name:'Moss the bear',image:'assets/3.png'},
  {name:'Bop the rabbit',image:'assets/4.png'}, {name:'Pixel the raccoon',image:'assets/5.png'},
  {name:'Mimi the cat',image:'assets/6.png'}, {name:'Scout the puppy',image:'assets/7.png'},
  {name:'Bean the bear',image:'assets/8.png'}, {name:'Star the fox',image:'assets/9.png'},
  {name:'Doodle the dog',image:'assets/10.png'}, {name:'Disco the bear',image:'assets/11.png'}
];
// Equalize each sprite's longest visible dimension, accounting for transparent padding.
const spriteScale = [0.971,1.026,0.976,1.040,0.985,1.023,0.950,0.948,1.015,0.956,1.078,1.037];
// Ground contact positions measured from the visible lower edge of each sprite.
const footAnchors = [[.561,.950],[.511,.950],[.476,.952],[.486,.950],[.485,.943],[.445,.952],[.556,.941],[.489,.903],[.513,.954],[.446,.944],[.466,.896],[.506,.952]];
const questions = [
  'What harmless opinion will you defend forever?', 'What’s your most questionable food combination?',
  'What tiny thing makes you irrationally competitive?', 'What popular trend do you just not understand?',
  'If your working style were a snack, what would it be?', 'What’s the most ridiculous hill you’ll die on?',
  'What’s your most controversial emoji opinion?', 'What workplace habit secretly puzzles you?',
  'What advice do you politely ignore?', 'What’s something you used to judge but now enjoy?',
  'Which meeting could be replaced by a single emoji?', 'What skill would you love without doing the practice?',
  'What’s an assumption people make about you that isn’t quite right?', 'What unwritten rule at work would you change?',
  'What does our team do that outsiders might find funny?', 'What tiny team tradition should we start?',
  'If our team were a café, what would be its signature dish?', 'What’s an unpopular productivity tip that works for you?',
  'What’s a work task you enjoy that most people dislike?', 'What’s one thing that could make our team’s week better?',
  'What’s a surprisingly useful lesson from a mistake?', 'What’s a talent you have that is almost completely useless?',
  'What’s the most unexpected thing you’ve learned from a colleague?', 'What’s something you wish people asked you about more often?'
];
const field=document.querySelector('#field');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const shuffled=a=>{const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out};
let pool=shuffled(questions), active=null, previous=0;
function nextQuestion(){if(!pool.length)pool=shuffled(questions);return pool.pop()}
const items=friends.map((friend,i)=>{
  const button=document.createElement('button');button.type='button';button.className='friend';button.setAttribute('aria-pressed','false');button.setAttribute('aria-label',`Turn over ${friend.name}`);button.style.setProperty('--hop-duration',`${3.3+i*.37}s`);button.style.setProperty('--hop-delay',`${-i*.6}s`);
  const shadow=document.createElement('span'),jumper=document.createElement('span'),flipper=document.createElement('span'),front=document.createElement('span'),back=document.createElement('span'),img=document.createElement('img');
  shadow.className='shadow';jumper.className='jumper';flipper.className='flipper';front.className='face';back.className='back';img.src=friend.image;img.style.setProperty('--sprite-scale',spriteScale[i]);img.alt='';img.draggable=false;front.append(img);flipper.append(front,back);jumper.append(flipper);button.append(shadow,jumper);field.append(button);
  const item={button,back,jumper,shadow,foot:footAnchors[i],x:0,y:0,vx:0,vy:0,z:0,vz:0,tilt:(Math.random()-.5)*14,nextTurn:0,held:false,question:''};
  button.addEventListener('pointerdown',()=>{item.held=true});for(const event of ['pointerup','pointercancel','pointerleave'])button.addEventListener(event,()=>{item.held=false});
  button.addEventListener('click',()=>{
    if(active===item){close(item);return}
    if(active)close(active);
    item.z=0;item.vz=0;
    const b=bounds(item), extra=Math.max(0, ((field.clientWidth<=600?140:150)-button.offsetWidth)/2); item.x=Math.max(extra,Math.min(b.w-extra,item.x));item.y=Math.max(extra,Math.min(b.h-extra,item.y));button.style.transform=`translate(${item.x}px,${item.y}px)`;item.question=nextQuestion();back.textContent=item.question;button.setAttribute('aria-pressed','true');button.setAttribute('aria-label',`${friend.name} asks: ${item.question}. Select to turn back.`);active=item;
  });
  return item;
});
function close(item){item.button.setAttribute('aria-pressed','false');const i=items.indexOf(item);item.button.setAttribute('aria-label',`Turn over ${friends[i].name}`);active=null}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){const button=active.button;close(active);button.focus()}});
function bounds(item){return {w:Math.max(0,field.clientWidth-item.button.offsetWidth),h:Math.max(0,field.clientHeight-item.button.offsetHeight)}}
const random=(min,max)=>min+Math.random()*(max-min);
const limit=(value,min,max)=>Math.max(min,Math.min(max,value));
function draw(item){
  const size=item.button.offsetWidth;
  item.button.style.transform=`translate3d(${item.x}px,${item.y}px,0)`;
  item.button.style.zIndex=item===active?'9500':item.held?'9000':String(Math.round(item.y+size));
  const angle=item===active?0:item.tilt+item.z*item.vx*.006;
  item.jumper.style.transform=`translateY(${-item.z}px) rotate(${angle}deg)`;
  const hoverScale=item.button.matches(':hover')?1.08:1;
  const dx=(item.foot[0]-.5)*size*hoverScale,dy=(item.foot[1]-.5)*size*hoverScale;
  const radians=angle*Math.PI/180;
  item.shadow.style.left=`${size/2+dx*Math.cos(radians)-dy*Math.sin(radians)}px`;
  item.shadow.style.top=`${size/2+dx*Math.sin(radians)+dy*Math.cos(radians)}px`;
  item.shadow.style.transform=`translate(-50%,-50%) scale(${Math.max(.35,1-item.z/size*.8)})`;
}
function setup(){
  const cols=field.clientWidth<600?3:Math.max(3,Math.min(5,Math.round(Math.sqrt(items.length*field.clientWidth/field.clientHeight)))),rows=Math.ceil(items.length/cols);
  const cells=shuffled(Array.from({length:cols*rows},(_,i)=>i));
  items.forEach((item,i)=>{const b=bounds(item),cell=cells[i];item.x=limit((cell%cols+random(.2,.8))*field.clientWidth/cols-item.button.offsetWidth/2,0,b.w);item.y=limit((Math.floor(cell/cols)+random(.2,.8))*field.clientHeight/rows-item.button.offsetHeight/2,0,b.h);const angle=random(0,Math.PI*2),speed=item.button.offsetWidth*random(.23,.55);item.vx=Math.cos(angle)*speed;item.vy=Math.sin(angle)*speed;item.z=0;item.vz=0;item.nextTurn=random(100,3500);draw(item)});
}
function collide(a,b){
  if(a===active||b===active||a.held||b.held)return;
  const sa=a.button.offsetWidth,sb=b.button.offsetWidth,dx=(b.x+sb/2)-(a.x+sa/2),dy=(b.y+sb/2)-(a.y+sa/2),distance=Math.hypot(dx,dy)||.01,minDistance=(sa+sb)*.29;
  if(distance>=minDistance||Math.abs(a.z-b.z)>Math.min(sa,sb)*.06)return;
  const nx=dx/distance,ny=dy/distance,overlap=(minDistance-distance)/2;
  a.x-=nx*overlap;a.y-=ny*overlap;b.x+=nx*overlap;b.y+=ny*overlap;
  const closing=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;
  if(closing>0){a.vx-=closing*nx;a.vy-=closing*ny;b.vx+=closing*nx;b.vy+=closing*ny;if(closing>20&&b.z===0)b.vz=sb*1.25}
}
function step(t){
  const dt=previous?Math.min((t-previous)/1000,.04):0;previous=t;
  if(!reduced.matches){
    for(const item of items){
      if(item.held||item===active)continue;
      const size=item.button.offsetWidth,b=bounds(item);
      item.x+=item.vx*dt;item.y+=item.vy*dt;item.nextTurn-=dt*1000;
      if(item.nextTurn<=0&&item.z===0){const angle=random(0,Math.PI*2),speed=size*random(.23,.55);item.vx=Math.cos(angle)*speed;item.vy=Math.sin(angle)*speed;item.vz=size*random(1.2,2.05);item.nextTurn=random(1200,4500)}
      item.vz-=size*6.8*dt;item.z=Math.max(0,item.z+item.vz*dt);if(item.z===0)item.vz=0;
      if(item.x<0||item.x>b.w)item.vx=(item.x<0?1:-1)*Math.abs(item.vx);
      const top=Math.min(b.h,size*.32);
      if(item.y<top||item.y>b.h)item.vy=(item.y<top?1:-1)*Math.abs(item.vy);
      item.x=limit(item.x,0,b.w);item.y=limit(item.y,top,b.h);
    }
    for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++)collide(items[i],items[j]);
  } else for(const item of items){item.z=0;item.vz=0}
  items.forEach(draw);requestAnimationFrame(step);
}
setup();window.addEventListener('resize',setup);requestAnimationFrame(step);
