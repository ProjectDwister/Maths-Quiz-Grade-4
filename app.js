'use strict';

const E=MathQuestionEngine;
const TOPICS=[
 {id:'numbers',name:'Numbers & Place Value',icon:'🔢',city:'Mumbai'},
 {id:'operations',name:'Addition & Subtraction',icon:'➕',city:'Jaipur'},
 {id:'multdiv',name:'Multiplication & Division',icon:'✖️',city:'Bengaluru'},
 {id:'factors',name:'Factors & Multiples',icon:'🧩',city:'Varanasi'},
 {id:'fractions',name:'Fractions',icon:'🍕',city:'Kolkata'},
 {id:'decimals',name:'Decimals',icon:'🔸',city:'Chennai'},
 {id:'measurement',name:'Measurement',icon:'📏',city:'Kochi'},
 {id:'time',name:'Time',icon:'🕒',city:'Delhi'},
 {id:'money',name:'Money',icon:'₹',city:'Hyderabad'},
 {id:'geometry',name:'Geometry',icon:'📐',city:'Ahmedabad'},
 {id:'patterns',name:'Patterns & Data',icon:'📊',city:'Pune'},
 {id:'word',name:'Word Problems',icon:'🧠',city:'Goa'}
];
const TOPIC_MAP=Object.fromEntries(TOPICS.map(x=>[x.id,x]));
const STORAGE_BASE='mathMastiGrade4v3';
const LEGACY='mathMastiGrade4v2';
const LEGACY_CLAIM='mathMastiLegacyClaimedBy';
let STORAGE=STORAGE_BASE;
let currentUser=null;
let currentProfile=null;
let cloudSyncReady=false;
let cloudSaveTimer=null;
const DIFF=['','Warm-up','Easy','Medium','Hard','Challenge'];
const AVATARS=[
 {id:'wizard',icon:'🧙',name:'Math Wizard',cost:0},
 {id:'astronaut',icon:'🧑‍🚀',name:'Number Astronaut',cost:80},
 {id:'detective',icon:'🕵️',name:'Puzzle Detective',cost:100},
 {id:'ninja',icon:'🥷',name:'Fraction Ninja',cost:120},
 {id:'scientist',icon:'🧑‍🔬',name:'Math Scientist',cost:150},
 {id:'hero',icon:'🦸',name:'Math Hero',cost:180}
];
const ACCESSORIES=[
 {id:'none',icon:'',name:'No accessory',cost:0},
 {id:'glasses',icon:'🤓',name:'Smart Glasses',cost:60},
 {id:'crown',icon:'👑',name:'Number Crown',cost:100},
 {id:'medal',icon:'🏅',name:'Mastery Medal',cost:140},
 {id:'rocket',icon:'🚀',name:'Rocket Pack',cost:180},
 {id:'trophy',icon:'🏆',name:'Champion Trophy',cost:240}
];
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const pct=(a,b)=>b?Math.round(a/b*100):0;
const now=()=>Date.now();
const dayMs=86400000;
const todayKey=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const level=()=>1+Math.floor(data.xp/200);
const weightedPick=items=>{
 const total=items.reduce((s,x)=>s+x.weight,0);
 let n=Math.random()*total;
 for(const x of items){n-=x.weight;if(n<=0)return x.value}
 return items[items.length-1].value;
};

function blankData(){
 return {
  version:4,localUpdatedAt:0,games:0,bestStreak:0,xp:0,coins:0,avatar:'wizard',accessory:'none',
  ownedAvatars:['wizard'],ownedAccessories:['none'],concepts:{},events:[],mistakes:{},
  settings:{length:20},daily:null
 };
}
function ensureConcepts(d){
 for(const t of TOPICS){
  for(const variant of E.VARIANTS_BY_TOPIC[t.id]){
   const key=t.id+'::'+variant;
   if(!d.concepts[key])d.concepts[key]={attempts:0,correct:0,hints:0,totalMs:0,mastery:0,recent:[]};
  }
 }
}
function normalizeData(d){
 d={...blankData(),...(d||{}),settings:{...blankData().settings,...((d&&d.settings)||{})}};
 d.ownedAvatars=[...new Set(['wizard',...(d.ownedAvatars||[])])];
 d.ownedAccessories=[...new Set(['none',...(d.ownedAccessories||[])])];
 d.events=Array.isArray(d.events)?d.events:[];
 d.mistakes=d.mistakes||{};
 ensureConcepts(d);
 return d;
}
function loadData(key=STORAGE){
 let d;
 try{d=JSON.parse(localStorage.getItem(key)||'null')}catch(e){}
 return normalizeData(d||blankData());
}
function legacyDeviceProgress(uid){
 const claimed=localStorage.getItem(LEGACY_CLAIM);
 if(claimed&&claimed!==uid)return null;
 try{
  const current=JSON.parse(localStorage.getItem(STORAGE_BASE)||'null');
  if(current){
   localStorage.setItem(LEGACY_CLAIM,uid);
   return normalizeData(current);
  }
 }catch(e){}
 try{
  const old=JSON.parse(localStorage.getItem(LEGACY)||'null');
  if(old){
   const d=blankData();
   d.games=old.games||0;d.bestStreak=old.bestStreak||0;
   d.xp=(old.stars||0)*8;d.coins=Math.floor((old.stars||0)/2);
   localStorage.setItem(LEGACY_CLAIM,uid);
   return normalizeData(d);
  }
 }catch(e){}
 return null;
}
let data=blankData();
function setSyncStatus(text,state=''){
 const el=$('#syncChip');if(!el)return;
 el.textContent=text;
 el.dataset.state=state;
}
function scheduleCloudSave(){
 if(!cloudSyncReady||!currentUser||!window.MathAuth||!MathAuth.configured)return;
 clearTimeout(cloudSaveTimer);
 setSyncStatus('☁️ Syncing…','syncing');
 const snapshot=JSON.parse(JSON.stringify(data));
 cloudSaveTimer=setTimeout(()=>{
  MathAuth.saveProgress(snapshot)
   .then(()=>setSyncStatus('☁️ Synced','synced'))
   .catch(err=>{console.error('Cloud sync failed',err);setSyncStatus('⚠️ Sync error','error')});
 },650);
}
function save(){
 data.events=data.events.slice(-1500);
 data.localUpdatedAt=now();
 localStorage.setItem(STORAGE,JSON.stringify(data));
 updateHud();
 scheduleCloudSave();
}
function conceptKey(topic,variant){return topic+'::'+variant}
function conceptData(topic,variant){return data.concepts[conceptKey(topic,variant)]}
function recentScore(ev){
 if(!ev.correct)return Math.max(5,25-ev.difficulty*3);
 let score=65+ev.difficulty*5+(ev.hintUsed?-10:5);
 if(ev.responseMs<=30000)score+=5; else if(ev.responseMs>90000)score-=4;
 return clamp(score,0,100);
}
function recalcMastery(c){
 const recent=c.recent.slice(-12);
 let sum=80,weights=2; // cautious prior: 40 mastery
 recent.forEach((ev,i)=>{
  const age=recent.length-1-i,w=Math.pow(.82,age);
  sum+=recentScore(ev)*w;weights+=w;
 });
 c.mastery=clamp(Math.round(sum/weights),0,100);
}
function topicConcepts(topic){return E.VARIANTS_BY_TOPIC[topic].map(v=>({variant:v,key:conceptKey(topic,v),data:conceptData(topic,v)}))}
function topicStats(topic){
 const cs=topicConcepts(topic),attempts=cs.reduce((s,x)=>s+x.data.attempts,0),correct=cs.reduce((s,x)=>s+x.data.correct,0);
 const attempted=cs.filter(x=>x.data.attempts>0);
 const avg=attempted.length?attempted.reduce((s,x)=>s+x.data.mastery,0)/attempted.length:0;
 const coverage=attempted.length/cs.length;
 const mastery=Math.round(avg*(.55+.45*coverage));
 const totalMs=cs.reduce((s,x)=>s+x.data.totalMs,0);
 const hints=cs.reduce((s,x)=>s+x.data.hints,0);
 return {attempts,correct,accuracy:pct(correct,attempts),mastery,coverage:Math.round(coverage*100),avgMs:attempts?Math.round(totalMs/attempts):0,hintRate:pct(hints,attempts)};
}
function starsFor(topic){const m=topicStats(topic).mastery;return m>=82?3:m>=65?2:m>=50?1:0}
function chapterUnlocked(index){
 if(index===0)return true;
 const prev=topicStats(TOPICS[index-1].id);
 return prev.attempts>=10&&prev.mastery>=50;
}
function allChapterUnlocked(topic){
 const idx=TOPICS.findIndex(x=>x.id===topic);
 return chapterUnlocked(idx);
}
function mistakeEntries(){
 return Object.entries(data.mistakes).filter(([,m])=>m&&m.count>0);
}
function mistakeTotal(){return mistakeEntries().reduce((s,[,m])=>s+m.count,0)}
function avatarInfo(){return AVATARS.find(x=>x.id===data.avatar)||AVATARS[0]}
function accessoryInfo(){return ACCESSORIES.find(x=>x.id===data.accessory)||ACCESSORIES[0]}
function avatarDisplay(){return avatarInfo().icon+(accessoryInfo().icon?' '+accessoryInfo().icon:'')}
function updateHud(){
 $('#hudAvatar').textContent=avatarDisplay();
 $('#hudLevel').textContent='Lv '+level();
 $('#hudXp').textContent='✨ '+data.xp+' XP';
 $('#hudCoins').textContent='🪙 '+data.coins;
}
function ensureDaily(){
 const date=todayKey();
 if(data.daily&&data.daily.date===date)return;
 const seed=new Date().getDate()%3;
 data.daily=seed===0?{date,kind:'answers',title:'Answer 12 questions',target:12,progress:0,rewarded:false}
  :seed===1?{date,kind:'clean',title:'Get 7 correct without a hint',target:7,progress:0,rewarded:false}
  :{date,kind:'xp',title:'Earn 100 XP today',target:100,progress:0,rewarded:false};
 save();
}
function updateDaily({correct,hintUsed,xpEarned}){
 ensureDaily();
 const d=data.daily;
 if(d.kind==='answers')d.progress++;
 if(d.kind==='clean'&&correct&&!hintUsed)d.progress++;
 if(d.kind==='xp')d.progress+=xpEarned;
 let reward=false;
 if(d.progress>=d.target&&!d.rewarded){
  d.progress=d.target;d.rewarded=true;data.coins+=50;data.xp+=100;reward=true;
 }
 return reward;
}
function renderDaily(){
 ensureDaily();const d=data.daily;
 $('#dailyTitle').textContent=d.title;
 $('#dailyProgress').textContent=Math.min(d.progress,d.target)+' / '+d.target;
 $('#dailyBar').style.width=Math.min(100,d.progress/d.target*100)+'%';
 $('#dailyStatus').textContent=d.rewarded?'✅ Complete — reward claimed':'Reward: 100 XP + 50 coins';
}
function badges(){
 const out=[];
 if(data.games>=1)out.push('🎒 First Quest');
 if(data.bestStreak>=5)out.push('🔥 5 Streak');
 if(data.bestStreak>=10)out.push('⚡ 10 Streak');
 if(TOPICS.some(t=>starsFor(t.id)>=2))out.push('⭐ Chapter Star');
 if(TOPICS.filter(t=>starsFor(t.id)>=1).length>=4)out.push('🗺️ Explorer');
 if(mistakeTotal()===0&&data.events.length>=20)out.push('🧹 Clean Slate');
 if(level()>=5)out.push('🏆 Level 5');
 return out;
}
function renderHome(){
 showView('home');
 renderDaily();renderJourney();renderPractice();
 $('#mistakeCount').textContent=mistakeTotal();
 $('#mistakeBtn').disabled=mistakeTotal()===0;
 $('#gamesCount').textContent=data.games;
 $('#masteredCount').textContent=Object.values(data.concepts).filter(c=>c.mastery>=75&&c.attempts>=3).length;
 $('#badgeRow').innerHTML=badges().length?badges().map(b=>'<span class="badge">'+b+'</span>').join(''):'<span class="muted">Play to unlock achievements.</span>';
 $$('.length-btn').forEach(b=>b.classList.toggle('active',Number(b.dataset.length)===data.settings.length));
 updateHud();
}
function renderJourney(){
 $('#journeyGrid').innerHTML=TOPICS.map((t,i)=>{
  const s=topicStats(t.id),unlocked=chapterUnlocked(i),stars=starsFor(t.id);
  return '<div class="chapter '+(unlocked?'':'locked')+'">'+
   (!unlocked?'<span class="lock">🔒</span>':'')+
   '<div class="chapter-icon">'+t.icon+'</div><div class="chapter-city">'+esc(t.city)+' stop '+(i+1)+'</div>'+
   '<div class="chapter-title">'+esc(t.name)+'</div><div class="stars">'+('⭐'.repeat(stars)+'☆'.repeat(3-stars))+'</div>'+
   '<div class="chapter-mastery">'+s.mastery+'% mastery • '+s.coverage+'% concepts seen</div>'+
   '<div class="progress"><div style="width:'+s.mastery+'%"></div></div>'+
   '<button class="btn '+(unlocked?'primary':'secondary')+'" data-journey="'+t.id+'" '+(unlocked?'':'disabled')+'>'+(unlocked?'Play chapter':'Master previous stop')+'</button></div>';
 }).join('');
 $$('[data-journey]').forEach(b=>b.onclick=()=>startSession('journey',b.dataset.journey));
}
function renderPractice(){
 $('#practiceGrid').innerHTML=TOPICS.map(t=>{
  const s=topicStats(t.id);
  return '<button class="practice-card" data-practice="'+t.id+'"><span>'+t.icon+'</span><b>'+esc(t.name)+'</b><small>'+s.mastery+'% mastery • '+s.accuracy+'% accuracy</small></button>';
 }).join('');
 $$('[data-practice]').forEach(b=>b.onclick=()=>startSession('practice',b.dataset.practice));
}
function showView(name){
 $('.view').forEach(v=>v.classList.toggle('active',v.id===name+'View'));
 window.scrollTo({top:0,behavior:'smooth'});
}
function setAuthMessage(message,type=''){
 const el=$('#authMessage');if(!el)return;
 el.textContent=message||'';el.className='auth-message '+type;
}
function friendlyAuthError(err){
 const code=err&&err.code?err.code:'';
 const map={
  'auth/invalid-credential':'Email or password is incorrect.',
  'auth/wrong-password':'Email or password is incorrect.',
  'auth/user-not-found':'No account was found for that email.',
  'auth/email-already-in-use':'An account already exists for this email.',
  'auth/invalid-email':'Enter a valid email address.',
  'auth/weak-password':'Choose a stronger password.',
  'auth/too-many-requests':'Too many attempts. Try again a little later.',
  'auth/network-request-failed':'Network problem. Check your internet connection.',
  'auth/popup-closed-by-user':'Google sign-in was closed before it finished.',
  'auth/unauthorized-domain':'This website domain has not yet been authorized in Firebase.'
 };
 return map[code]||(err&&err.message?err.message:'Authentication failed. Please try again.');
}
function setAuthMode(mode){
 const signIn=mode!=='signup';
 $('#signInPanel').hidden=!signIn;
 $('#signUpPanel').hidden=signIn;
 $('.auth-tab').forEach(b=>b.classList.toggle('active',b.dataset.authMode===mode));
 setAuthMessage('');
}
function renderAccountControls(){
 const loggedIn=!!currentUser;
 $('#appAccount').hidden=!loggedIn;
 $('#guestAccount').hidden=loggedIn;
 if(!loggedIn)return;
 const name=(currentUser.displayName||currentUser.email||'Account').trim();
 const role=currentProfile&&currentProfile.role?currentProfile.role:'child';
 $('#userChip').textContent=(role==='parent'?'👨‍👩‍👧 ':'🧒 ')+name;
 $('#userChip').title=(currentUser.email||'')+' • '+role;
}
function showSignedOut(){
 clearInterval(S&&S.timer);
 currentUser=null;currentProfile=null;cloudSyncReady=false;clearTimeout(cloudSaveTimer);
 STORAGE=STORAGE_BASE;data=blankData();
 renderAccountControls();
 setSyncStatus('☁️ Not signed in','');
 if(window.MathAuth&&MathAuth.configured){
  $('#authSetupRequired').hidden=true;$('#authForms').hidden=false;
 }else{
  $('#authSetupRequired').hidden=false;$('#authForms').hidden=true;
  $('#authSetupText').textContent=(window.MathAuth&&MathAuth.error)||'Firebase setup is required before sign-in can be used.';
 }
 setAuthMode('signin');
 showView('auth');
}
async function activateUser(user){
 if(!user)return showSignedOut();
 if(currentUser&&currentUser.uid===user.uid&&cloudSyncReady)return;
 showView('loading');
 currentUser=user;currentProfile=null;cloudSyncReady=false;
 STORAGE=STORAGE_BASE+':'+user.uid;
 renderAccountControls();
 setSyncStatus('☁️ Loading…','syncing');
 try{
  const [remote,profile]=await Promise.all([MathAuth.loadProgress(),MathAuth.getProfile()]);
  currentProfile=profile||{role:'child',displayName:user.displayName||'',email:user.email||''};
  let scopedRaw=null;
  try{scopedRaw=JSON.parse(localStorage.getItem(STORAGE)||'null')}catch(e){}
  const scoped=scopedRaw?normalizeData(scopedRaw):null;
  let chosen;
  if(remote&&scoped){
   chosen=(Number(scoped.localUpdatedAt)||0)>(Number(remote.localUpdatedAt)||0)?scoped:normalizeData(remote);
  }else if(remote)chosen=normalizeData(remote);
  else chosen=scoped||(legacyDeviceProgress(user.uid)||blankData());
  data=normalizeData(chosen);
  localStorage.setItem(STORAGE,JSON.stringify(data));
  if(!remote)await MathAuth.saveProgress(data);
  cloudSyncReady=true;
  renderAccountControls();
  setSyncStatus('☁️ Synced','synced');
  ensureDaily();updateHud();updateLengthButtons();renderHome();
 }catch(err){
  console.error('Could not load user progress',err);
  data=loadData(STORAGE);cloudSyncReady=true;
  renderAccountControls();setSyncStatus('⚠️ Offline cache','error');
  ensureDaily();updateHud();updateLengthButtons();renderHome();
 }
}
async function handleEmailSignIn(){
 const email=$('#signInEmail').value.trim(),password=$('#signInPassword').value;
 if(!email||!password)return setAuthMessage('Enter both email and password.','error');
 setAuthMessage('Signing in…','info');$('#signInBtn').disabled=true;
 try{await MathAuth.signIn(email,password)}
 catch(err){setAuthMessage(friendlyAuthError(err),'error')}
 finally{$('#signInBtn').disabled=false}
}
async function handleSignUp(){
 const name=$('#signUpName').value.trim(),email=$('#signUpEmail').value.trim(),password=$('#signUpPassword').value,role=$('#signUpRole').value;
 if(!name||!email||!password)return setAuthMessage('Enter name, email and password.','error');
 if(password.length<8)return setAuthMessage('Use at least 8 characters for the password.','error');
 setAuthMessage('Creating account…','info');$('#signUpBtn').disabled=true;
 try{
  await MathAuth.signUp({name,email,password,role});
  setAuthMessage('Account created. We also sent a verification email.','success');
 }catch(err){setAuthMessage(friendlyAuthError(err),'error')}
 finally{$('#signUpBtn').disabled=false}
}
async function handleGoogleSignIn(){
 const role=$('#googleRole').value;
 setAuthMessage('Opening Google sign-in…','info');$('#googleSignInBtn').disabled=true;
 try{await MathAuth.signInWithGoogle(role)}
 catch(err){setAuthMessage(friendlyAuthError(err),'error')}
 finally{$('#googleSignInBtn').disabled=false}
}
async function handleResetPassword(){
 const email=$('#signInEmail').value.trim();
 if(!email)return setAuthMessage('Enter your email address first, then choose Forgot password.','error');
 try{
  await MathAuth.resetPassword(email);
  setAuthMessage('Password reset email sent. Check your inbox.','success');
 }catch(err){setAuthMessage(friendlyAuthError(err),'error')}
}
function startAuthBridge(){
 if(!window.MathAuth)return;
 if(!MathAuth.configured)return showSignedOut();
 MathAuth.observe(user=>user?activateUser(user):showSignedOut());
}
function bindAuthUi(){
 $('.auth-tab').forEach(b=>b.onclick=()=>setAuthMode(b.dataset.authMode));
 $('#signInBtn').onclick=handleEmailSignIn;
 $('#signInPassword').onkeydown=e=>{if(e.key==='Enter')handleEmailSignIn()};
 $('#signUpBtn').onclick=handleSignUp;
 $('#signUpPassword').onkeydown=e=>{if(e.key==='Enter')handleSignUp()};
 $('#googleSignInBtn').onclick=handleGoogleSignIn;
 $('#forgotPasswordBtn').onclick=handleResetPassword;
 $('#signOutBtn').onclick=async()=>{setSyncStatus('☁️ Signing out…','syncing');try{await MathAuth.signOut()}catch(err){alert(friendlyAuthError(err))}};
}

let S={mode:'mixed',topic:null,fixedVariant:null,total:20,n:0,score:0,correct:0,streak:0,bestRun:0,current:null,difficulty:2,start:0,qStart:0,hintUsed:false,timer:null,sessionXp:0,sessionCoins:0,startStars:0,answered:false,history:[],reviewFilter:'all',finished:false};
function chooseTopic(){
 if(S.mode!=='mixed')return S.topic;
 const choices=TOPICS.map(t=>{
  const st=topicStats(t.id);
  return {value:t.id,weight:1+(100-st.mastery)/22+(st.attempts===0?2:0)};
 });
 return weightedPick(choices);
}
function chooseVariant(topic){
 if(S.fixedVariant)return S.fixedVariant;
 if(S.mode==='revision'){
  const candidates=mistakeEntries().filter(([,m])=>m.topic===topic);
  if(candidates.length)return weightedPick(candidates.map(([k,m])=>({value:m.variant,weight:Math.max(1,m.count*2)})));
 }
 const choices=topicConcepts(topic).map(x=>{
  const m=data.mistakes[x.key]?.count||0;
  return {value:x.variant,weight:1+(100-x.data.mastery)/25+(x.data.attempts===0?2.5:0)+m*1.5};
 });
 return weightedPick(choices);
}
function chooseRevisionConcept(){
 const entries=mistakeEntries();
 if(!entries.length)return null;
 const key=weightedPick(entries.map(([k,m])=>({value:k,weight:m.count*2+1})));
 return {key,...data.mistakes[key]};
}
function adaptiveLevel(topic,variant){
 const c=conceptData(topic,variant),m=c.mastery,recent=c.recent.slice(-5);
 if(recent.length<3)return 2;
 let target=m<25?1:m<45?2:m<65?3:m<82?4:5;
 const accuracy=recent.filter(x=>x.correct).length/recent.length;
 const hintRate=recent.filter(x=>x.hintUsed).length/recent.length;
 const avg=recent.reduce((s,x)=>s+x.responseMs,0)/recent.length;
 const last=recent[recent.length-1].difficulty||2;
 if(accuracy>=.8&&hintRate<=.33&&avg<=60000)target=Math.max(target,last+1);
 if(accuracy<=.4||hintRate>=.67)target=Math.min(target,last-1);
 if(target<last&&accuracy>.5&&hintRate<.67)target=last;
 if(target>last&&accuracy<.75)target=last;
 return clamp(target,1,5);
}
function startSession(mode,topic=null,variant=null){
 clearInterval(S.timer);
 S={mode,topic,fixedVariant:variant,total:data.settings.length,n:0,score:0,correct:0,streak:0,bestRun:0,current:null,difficulty:2,start:now(),qStart:0,hintUsed:false,timer:null,sessionXp:0,sessionCoins:0,startStars:topic?starsFor(topic):0,answered:false,history:[],reviewFilter:'all',finished:false};
 if(mode==='revision')S.total=Math.min(data.settings.length,Math.max(10,mistakeEntries().length*2));
 showView('game');
 $('#gameMode').textContent=mode==='revision'?'Practice My Mistakes':mode==='journey'?'Journey Chapter':mode==='mixed'?'Mixed Mastery':variant?'Recommended Practice':'Free Practice';
 S.timer=setInterval(()=>$('#timerChip').textContent='⏱ '+Math.floor((now()-S.start)/1000)+'s',1000);
 nextQuestion();
}
function nextQuestion(){
 if(S.n>=S.total)return finishSession();
 S.answered=false;S.hintUsed=false;
 let topic,variant;
 if(S.mode==='revision'){
  const rev=chooseRevisionConcept();
  if(!rev)return finishSession();
  topic=rev.topic;variant=rev.variant;
 }else{
  topic=chooseTopic();variant=chooseVariant(topic);
 }
 S.difficulty=adaptiveLevel(topic,variant);
 try{S.current=E.generateForVariant(topic,S.difficulty,variant)}
 catch(e){S.current=E.generate(topic,S.difficulty)}
 S.n++;S.qStart=now();
 const q=S.current,t=TOPIC_MAP[q.t],cd=conceptData(q.t,q.variant);
 $('#topicLabel').textContent=t.icon+' '+t.name+' • '+q.conceptLabel;
 $('#questionCount').textContent=S.n+' / '+S.total;
 $('#questionText').textContent=q.q;
 $('#masteryChip').textContent='Mastery '+cd.mastery+'%';
 $('#difficultyChip').textContent='⚡ '+DIFF[S.difficulty];
 $('#gameProgress').style.width=((S.n-1)/S.total*100)+'%';
 $('#hintBox').textContent=q.h;$('#hintBox').classList.remove('show');
 $('#feedback').innerHTML='';$('#nextBtn').style.display='none';$('#hintBtn').style.display='inline-block';
 $('#visual').innerHTML=renderVisual(q);
 renderAnswerArea(q);
}
function renderAnswerArea(q){
 const box=$('#answerArea');box.innerHTML='';
 if(q.kind==='mcq'){
  const wrap=document.createElement('div');wrap.className='answers';
  q.o.forEach(opt=>{
   const b=document.createElement('button');b.className='answer';b.textContent=opt;b.onclick=()=>submitAnswer(opt,b);wrap.appendChild(b);
  });box.appendChild(wrap);
 }else{
  const w=document.createElement('div');w.className='center';
  const i=document.createElement('input');i.className='answer-input';i.placeholder='Type your answer';i.autocomplete='off';
  const b=document.createElement('button');b.className='btn primary';b.textContent='Check Answer';b.style.marginTop='10px';
  i.onkeydown=e=>{if(e.key==='Enter')submitAnswer(i.value,i)};b.onclick=()=>submitAnswer(i.value,i);
  w.append(i,b);box.appendChild(w);setTimeout(()=>i.focus(),40);
 }
}
function submitAnswer(value,el){
 if(S.answered||!String(value).trim())return;
 S.answered=true;
 const q=S.current,correct=E.isCorrect(value,q.a),responseMs=now()-S.qStart,key=q.concept,c=conceptData(q.t,q.variant);
 S.history.push({
  number:S.n,
  question:JSON.parse(JSON.stringify(q)),
  userAnswer:String(value),
  correctAnswer:String(q.a),
  correct,
  hintUsed:S.hintUsed,
  responseMs,
  difficulty:S.difficulty
 });
 c.attempts++;if(correct)c.correct++;if(S.hintUsed)c.hints++;c.totalMs+=responseMs;
 const event={ts:now(),topic:q.t,variant:q.variant,correct,hintUsed:S.hintUsed,responseMs,difficulty:S.difficulty};
 c.recent.push(event);c.recent=c.recent.slice(-12);recalcMastery(c);data.events.push({...event,concept:key});
 let xpEarned=correct?10+S.difficulty*3+(S.hintUsed?0:2):2;
 let coinsEarned=correct?2:0;
 if(correct){
  S.correct++;S.streak++;S.bestRun=Math.max(S.bestRun,S.streak);data.bestStreak=Math.max(data.bestStreak,S.streak);
  if(S.streak>0&&S.streak%5===0)coinsEarned+=5;
  const scoreGain=100+Math.min(60,S.streak*10)+S.difficulty*5;S.score+=scoreGain;
  el.classList?.add('correct');
  const m=data.mistakes[key];
  if(S.mode==='revision'&&m&&!S.hintUsed){m.count=Math.max(0,m.count-1);if(m.count===0)delete data.mistakes[key]}
 }else{
  S.streak=0;el.classList?.add('wrong');
  data.mistakes[key]=data.mistakes[key]||{topic:q.t,variant:q.variant,count:0,lastWrong:0};
  data.mistakes[key].count=Math.min(8,data.mistakes[key].count+1);data.mistakes[key].lastWrong=now();
  $$('.answer').forEach(b=>{if(E.isCorrect(b.textContent,q.a))b.classList.add('correct')});
 }
 data.xp+=xpEarned;data.coins+=coinsEarned;S.sessionXp+=xpEarned;S.sessionCoins+=coinsEarned;
 const dailyReward=updateDaily({correct,hintUsed:S.hintUsed,xpEarned});
 if(dailyReward){S.sessionXp+=100;S.sessionCoins+=50}
 save();
 $$('.answer,.answer-input').forEach(x=>x.disabled=true);
 $('#hintBtn').style.display='none';$('#nextBtn').style.display='inline-block';$('#gameProgress').style.width=(S.n/S.total*100)+'%';
 const nextLevel=adaptiveLevel(q.t,q.variant);
 let html='<div>'+(correct?'✅ Correct!':'❌ Not quite. Correct answer: <b>'+esc(q.a)+'</b>')+'</div>';
 if(!correct)html+='<div class="explain mistake-note"><b>What may have happened:</b> '+esc(q.misconception)+'</div>';
 html+='<div class="explain solution"><b>Worked solution:</b> '+esc(q.solution)+'</div>';
 html+='<div class="adapt-note">Concept mastery: '+c.mastery+'% • Next '+esc(q.conceptLabel)+' question is estimated at '+DIFF[nextLevel]+'. '+(dailyReward?'🎁 Daily quest complete! +100 XP and +50 coins.':'')+'</div>';
 $('#feedback').innerHTML=html;
 updateGameHud();
}
function updateGameHud(){
 $('#scoreChip').textContent='⭐ '+S.score;
 $('#streakChip').textContent='🔥 '+S.streak;
 $('#difficultyChip').textContent='⚡ '+DIFF[S.difficulty];
}
function finishSession(){
 clearInterval(S.timer);
 if(!S.finished){
  S.finished=true;
  data.games++;
  const accuracy=pct(S.correct,S.n||1),bonusCoins=Math.floor(accuracy/20);
  data.coins+=bonusCoins;S.sessionCoins+=bonusCoins;
  let chapterBonus='';
  if(S.mode==='journey'&&S.topic){
   const gained=starsFor(S.topic)-S.startStars;
   if(gained>0){const reward=gained*25;data.coins+=reward;S.sessionCoins+=reward;chapterBonus=' • Chapter star bonus +'+reward+' coins';}
  }
  S.chapterBonus=chapterBonus;
  data.lastSession={
   completedAt:now(),
   mode:S.mode,
   topic:S.topic,
   total:S.n,
   correct:S.correct,
   history:S.history.slice(-30)
  };
  save();
 }
 renderSessionResults();
}
function renderSessionResults(filter=S.reviewFilter||'all'){
 S.reviewFilter=filter;
 const accuracy=pct(S.correct,S.n||1),wrong=S.n-S.correct;
 $('#topicLabel').textContent='Quest complete';
 $('#questionCount').textContent=S.n+' / '+S.total;
 $('#gameProgress').style.width='100%';
 $('#visual').innerHTML='';
 $('#questionText').innerHTML='<div class="end-summary"><h2>'+(accuracy>=90?'🌟 Masterful!':accuracy>=75?'🎉 Great work!':accuracy>=60?'👍 Good practice!':'💪 Keep building!')+'</h2><div>'+S.correct+'/'+S.n+' correct • '+accuracy+'% accuracy • Best streak '+S.bestRun+'</div><div class="reward-burst">+'+S.sessionXp+' XP • +'+S.sessionCoins+' coins'+(S.chapterBonus||'')+'</div></div>';
 const filtered=S.history.filter(item=>filter==='all'||(filter==='correct'?item.correct:!item.correct));
 const rows=filtered.map(item=>{
  const q=item.question,t=TOPIC_MAP[q.t]||{icon:'🧠',name:q.t};
  return '<div class="review-row '+(item.correct?'review-correct':'review-wrong')+'">'+
   '<div class="review-status">'+(item.correct?'✅':'❌')+'</div>'+
   '<div class="review-main"><div class="review-meta">Q'+item.number+' • '+t.icon+' '+esc(q.conceptLabel||t.name)+' • '+DIFF[item.difficulty]+'</div>'+
   '<div class="review-question">'+esc(q.q)+'</div>'+
   '<div class="review-answers"><span><b>Your answer:</b> '+esc(item.userAnswer)+'</span><span><b>Correct:</b> '+esc(item.correctAnswer)+'</span></div></div>'+
   '<button class="btn secondary review-open" data-review-index="'+S.history.indexOf(item)+'">Review question</button></div>';
 }).join('');
 $('#answerArea').innerHTML=
  '<div class="review-summary">'+
   '<div class="review-stat"><b>'+S.correct+'</b><span>Correct</span></div>'+
   '<div class="review-stat"><b>'+wrong+'</b><span>Incorrect</span></div>'+
   '<div class="review-stat"><b>'+accuracy+'%</b><span>Accuracy</span></div>'+
  '</div>'+
  '<div class="review-toolbar"><b>Review all '+S.n+' questions</b><div class="review-filters">'+
   '<button class="review-filter '+(filter==='all'?'active':'')+'" data-review-filter="all">All ('+S.n+')</button>'+
   '<button class="review-filter '+(filter==='wrong'?'active':'')+'" data-review-filter="wrong">Incorrect ('+wrong+')</button>'+
   '<button class="review-filter '+(filter==='correct'?'active':'')+'" data-review-filter="correct">Correct ('+S.correct+')</button>'+
  '</div></div>'+
  '<div class="review-list">'+(rows||'<div class="review-empty">No questions in this filter.</div>')+'</div>'+
  '<div class="center review-bottom"><button class="btn primary" id="playAgain">Play Again</button> <button class="btn secondary" id="homeAfter">Home</button></div>';
 $('#feedback').innerHTML='';
 $('#hintBtn').style.display='none';
 $('#nextBtn').style.display='none';
 $$('.review-filter').forEach(b=>b.onclick=()=>renderSessionResults(b.dataset.reviewFilter));
 $$('.review-open').forEach(b=>b.onclick=()=>openReviewQuestion(Number(b.dataset.reviewIndex)));
 $('#playAgain').onclick=()=>startSession(S.mode,S.topic,S.fixedVariant);
 $('#homeAfter').onclick=renderHome;
}
function openReviewQuestion(index){
 const item=S.history[index];if(!item)return renderSessionResults();
 const q=item.question,t=TOPIC_MAP[q.t]||{icon:'🧠',name:q.t};
 $('#topicLabel').textContent='Review • '+t.icon+' '+t.name+' • '+(q.conceptLabel||'');
 $('#questionCount').textContent='Question '+item.number+' of '+S.n;
 $('#masteryChip').textContent=item.correct?'Answered correctly':'Needs review';
 $('#difficultyChip').textContent='⚡ '+DIFF[item.difficulty];
 $('#visual').innerHTML=renderVisual(q);
 $('#questionText').textContent=q.q;
 $('#hintBox').classList.remove('show');
 renderReviewedAnswer(item);
 let html='<div class="review-verdict '+(item.correct?'good':'bad')+'">'+(item.correct?'✅ Answered correctly':'❌ Answered incorrectly')+'</div>';
 if(!item.correct)html+='<div class="explain mistake-note"><b>What may have happened:</b> '+esc(q.misconception)+'</div>';
 html+='<div class="explain solution"><b>Worked solution:</b> '+esc(q.solution)+'</div>';
 if(item.hintUsed)html+='<div class="adapt-note">💡 A hint was used on this question.</div>';
 html+='<div class="review-nav">'+
  '<button class="btn secondary" id="reviewPrev" '+(index===0?'disabled':'')+'>← Previous</button>'+
  '<button class="btn primary" id="reviewBack">Back to Results</button>'+
  '<button class="btn secondary" id="reviewNext" '+(index===S.history.length-1?'disabled':'')+'>Next →</button></div>';
 $('#feedback').innerHTML=html;
 $('#hintBtn').style.display='none';$('#nextBtn').style.display='none';
 const prev=$('#reviewPrev'),next=$('#reviewNext');
 if(prev)prev.onclick=()=>openReviewQuestion(index-1);
 if(next)next.onclick=()=>openReviewQuestion(index+1);
 $('#reviewBack').onclick=()=>renderSessionResults(S.reviewFilter);
}
function renderReviewedAnswer(item){
 const q=item.question,box=$('#answerArea');box.innerHTML='';
 if(q.kind==='mcq'){
  const wrap=document.createElement('div');wrap.className='answers review-answers-grid';
  q.o.forEach(opt=>{
   const b=document.createElement('button');b.className='answer';b.disabled=true;b.textContent=opt;
   if(E.isCorrect(opt,q.a))b.classList.add('correct');
   if(E.isCorrect(opt,item.userAnswer)&&!item.correct)b.classList.add('wrong');
   wrap.appendChild(b);
  });
  box.appendChild(wrap);
 }else{
  box.innerHTML='<div class="review-inputs"><div class="review-answer-card '+(item.correct?'good':'bad')+'"><small>Your answer</small><b>'+esc(item.userAnswer)+'</b></div>'+
   '<div class="review-answer-card good"><small>Correct answer</small><b>'+esc(item.correctAnswer)+'</b></div></div>';
 }
}
function renderVisual(q){
 const v=q.visual;if(!v)return '';
 if(v.type==='fraction'){
  return '<div class="fraction-wrap">'+v.fractions.map(fr=>{
   const [n,d]=fr.split('/').map(Number);
   return '<div><div class="fraction-bar">'+Array.from({length:d},(_,i)=>'<span class="fraction-seg '+(i<n?'fill':'')+'"></span>').join('')+'</div><div class="center muted">'+esc(fr)+'</div></div>';
  }).join('')+'</div>';
 }
 if(v.type==='clock'){
  const [h,m]=v.time.split(':').map(Number),cx=110,cy=110;
  const ma=m*6-90,ha=((h%12)+m/60)*30-90;
  const end=(len,ang)=>[cx+len*Math.cos(ang*Math.PI/180),cy+len*Math.sin(ang*Math.PI/180)];
  const me=end(77,ma),he=end(54,ha);
  const nums=Array.from({length:12},(_,i)=>{const n=i+1,a=(n*30-90)*Math.PI/180,x=cx+88*Math.cos(a),y=cy+88*Math.sin(a)+5;return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="12">'+n+'</text>'}).join('');
  return '<svg viewBox="0 0 220 220" width="220" height="220" aria-label="analogue clock"><circle cx="110" cy="110" r="102" fill="#fff" stroke="#39445c" stroke-width="4"/>'+nums+'<line x1="110" y1="110" x2="'+he[0]+'" y2="'+he[1]+'" stroke="#26324a" stroke-width="7" stroke-linecap="round"/><line x1="110" y1="110" x2="'+me[0]+'" y2="'+me[1]+'" stroke="#6757e8" stroke-width="4" stroke-linecap="round"/><circle cx="110" cy="110" r="6" fill="#26324a"/></svg>';
 }
 if(v.type==='rectangle'){
  return '<svg viewBox="0 0 360 190" width="360" height="190"><rect x="55" y="32" width="250" height="120" rx="4" fill="#eeeaff" stroke="#5549ce" stroke-width="4"/><text x="180" y="178" text-anchor="middle" font-size="15">'+v.length+' '+(v.mode==='fencing'?'m':'cm')+'</text><text x="25" y="98" text-anchor="middle" font-size="15" transform="rotate(-90 25 98)">'+v.width+' '+(v.mode==='fencing'?'m':'cm')+'</text></svg>';
 }
 if(v.type==='bars'){
  const max=Math.max(...v.items.map(x=>x.value));
  return '<div class="chart">'+v.items.map(x=>'<div class="bar-col"><b>'+x.value+'</b><div class="bar-rect" style="height:'+Math.max(12,x.value/max*105)+'px"></div><span class="bar-label">'+esc(x.label)+'</span></div>').join('')+'</div>';
 }
 if(v.type==='geometry')return geometryVisual(v.shape);
 if(v.type==='money')return '<div class="money-row">'+v.amounts.map(x=>'<div class="note-card">₹'+x+'</div>').join('')+'</div>';
 if(v.type==='place-value'){
  const digits=String(v.number).replace(/,/g,'').split(''),names=['Ones','Tens','Hundreds','Thousands','Ten-thousands','Lakhs'];
  return '<div class="place-grid">'+digits.map((d,i)=>'<div class="place-cell"><b>'+d+'</b><small>'+names[digits.length-1-i]+'</small></div>').join('')+'</div>';
 }
 if(v.type==='groups'){
  return '<div class="dot-groups">'+Array.from({length:v.groups},()=>'<div class="dot-group">'+Array.from({length:v.per},()=>'<i class="dot"></i>').join('')+'</div>').join('')+'</div>';
 }
 return '';
}
function geometryVisual(shape){
 const start='<svg viewBox="0 0 260 170" width="260" height="170">',end='</svg>';
 if(shape==='triangle-sides')return start+'<polygon points="130,20 35,145 225,145" fill="#eeeaff" stroke="#5d50d9" stroke-width="5"/>'+end;
 if(['rectangle-vertices','right-angles','parallel','symmetry'].includes(shape))return start+'<rect x="38" y="35" width="184" height="100" fill="#eef7ff" stroke="#426f9d" stroke-width="5"/>'+(shape==='symmetry'?'<line x1="130" y1="22" x2="130" y2="148" stroke="#d94f6a" stroke-width="3" stroke-dasharray="7 5"/>':'')+end;
 if(shape==='circle')return start+'<circle cx="130" cy="85" r="62" fill="#fff3db" stroke="#da8a22" stroke-width="5"/>'+end;
 if(shape==='acute')return start+'<line x1="65" y1="130" x2="205" y2="130" stroke="#333" stroke-width="5"/><line x1="65" y1="130" x2="160" y2="55" stroke="#6757e8" stroke-width="5"/><path d="M105 130 A40 40 0 0 0 96 105" fill="none" stroke="#d94f6a" stroke-width="3"/>'+end;
 if(shape==='obtuse')return start+'<line x1="130" y1="130" x2="225" y2="130" stroke="#333" stroke-width="5"/><line x1="130" y1="130" x2="50" y2="58" stroke="#6757e8" stroke-width="5"/><path d="M175 130 A45 45 0 0 0 97 99" fill="none" stroke="#d94f6a" stroke-width="3"/>'+end;
 if(shape==='trapezium')return start+'<polygon points="75,40 185,40 225,140 35,140" fill="#eef9ee" stroke="#31815d" stroke-width="5"/>'+end;
 if(shape==='ray')return start+'<circle cx="45" cy="90" r="7" fill="#333"/><line x1="45" y1="90" x2="210" y2="90" stroke="#6757e8" stroke-width="5"/><polygon points="222,90 202,78 202,102" fill="#6757e8"/>'+end;
 return '';
}
function updateLengthButtons(){
 $$('.length-btn').forEach(b=>b.onclick=()=>{data.settings.length=Number(b.dataset.length);save();renderHome()});
}
function recentEvents(days,offsetDays=0){
 const end=now()-offsetDays*dayMs,start=end-days*dayMs;
 return data.events.filter(e=>e.ts>=start&&e.ts<end);
}
function eventStats(events){
 const n=events.length,c=events.filter(e=>e.correct).length,h=events.filter(e=>e.hintUsed).length;
 return {n,accuracy:pct(c,n),avgMs:n?Math.round(events.reduce((s,e)=>s+e.responseMs,0)/n):0,hintRate:pct(h,n)};
}
function weakestConcept(){
 const rows=[];
 for(const t of TOPICS)for(const v of E.VARIANTS_BY_TOPIC[t.id]){
  const c=conceptData(t.id,v),m=data.mistakes[conceptKey(t.id,v)]?.count||0;
  const priority=(100-c.mastery)+(c.attempts===0?15:0)+m*12;
  rows.push({topic:t.id,variant:v,c,priority,label:E.CONCEPT_META[v][0]});
 }
 return rows.sort((a,b)=>b.priority-a.priority)[0];
}
function renderDashboard(){
 showView('dashboard');
 const s7=eventStats(recentEvents(7)),s30=eventStats(recentEvents(30)),prev7=eventStats(recentEvents(7,7));
 const trend=s7.n>=3&&prev7.n>=3?s7.accuracy-prev7.accuracy:null;
 $('#dashMetrics').innerHTML=[
  ['7-day accuracy',s7.n?s7.accuracy+'%':'—'],
  ['30-day accuracy',s30.n?s30.accuracy+'%':'—'],
  ['Avg response',s30.n?Math.round(s30.avgMs/1000)+'s':'—'],
  ['Hint rate',s30.n?s30.hintRate+'%':'—']
 ].map(x=>'<div class="metric"><b>'+x[1]+'</b><small>'+x[0]+'</small></div>').join('');
 $('#trendText').innerHTML=trend===null?'Not enough history yet for a 7-day trend.':trend>=0?'<span class="trend-up">▲ '+trend+' percentage points vs previous 7 days</span>':'<span class="trend-down">▼ '+Math.abs(trend)+' percentage points vs previous 7 days</span>';
 const rec=weakestConcept();
 $('#recommendText').innerHTML='<b>Recommended next practice:</b> '+TOPIC_MAP[rec.topic].icon+' '+esc(rec.label)+' <span class="muted">('+rec.c.mastery+'% mastery, '+rec.c.attempts+' attempts)</span>';
 $('#recommendBtn').onclick=()=>startSession('concept',rec.topic,rec.variant);
 $('#topicReport').innerHTML=TOPICS.map(t=>{
  const st=topicStats(t.id);return '<div class="report-card"><b>'+t.icon+' '+esc(t.name)+'</b><div>'+st.mastery+'% mastery • '+st.accuracy+'% accuracy</div><div class="progress"><div style="width:'+st.mastery+'%"></div></div><small class="muted">'+st.attempts+' questions • '+(st.avgMs?Math.round(st.avgMs/1000)+'s avg':'no timing yet')+' • '+st.hintRate+'% hints</small></div>';
 }).join('');
 const rows=[];
 for(const t of TOPICS)for(const v of E.VARIANTS_BY_TOPIC[t.id]){
  const c=conceptData(t.id,v),m=data.mistakes[conceptKey(t.id,v)]?.count||0;
  rows.push({topic:t,variant:v,c,m,label:E.CONCEPT_META[v][0]});
 }
 rows.sort((a,b)=>a.c.mastery-b.c.mastery||b.m-a.m);
 $('#conceptRows').innerHTML=rows.map(x=>'<tr><td>'+x.topic.icon+' '+esc(x.topic.name)+'</td><td>'+esc(x.label)+'</td><td>'+x.c.mastery+'%</td><td>'+x.c.correct+'/'+x.c.attempts+'</td><td>'+(x.c.attempts?Math.round(x.c.totalMs/x.c.attempts/1000)+'s':'—')+'</td><td>'+x.c.hints+'</td><td>'+x.m+'</td><td><button class="btn secondary concept-practice" data-topic="'+x.topic.id+'" data-variant="'+x.variant+'">Practise</button></td></tr>').join('');
 $$('.concept-practice').forEach(b=>b.onclick=()=>startSession('concept',b.dataset.topic,b.dataset.variant));
}
function renderShop(){
 showView('shop');
 $('#avatarPreview').textContent=avatarDisplay();
 $('#shopBalance').textContent='🪙 '+data.coins+' • Level '+level();
 $('#avatarShop').innerHTML=AVATARS.map(item=>{
  const owned=data.ownedAvatars.includes(item.id),equipped=data.avatar===item.id;
  return '<div class="shop-item '+(equipped?'equipped':'')+'"><div class="shop-icon">'+item.icon+'</div><b>'+esc(item.name)+'</b><div class="muted">'+(owned?'Owned':item.cost+' coins')+'</div><button class="btn '+(equipped?'secondary':'primary')+'" data-avatar="'+item.id+'">'+(equipped?'Equipped':owned?'Use':'Buy')+'</button></div>';
 }).join('');
 $('#accessoryShop').innerHTML=ACCESSORIES.map(item=>{
  const owned=data.ownedAccessories.includes(item.id),equipped=data.accessory===item.id;
  return '<div class="shop-item '+(equipped?'equipped':'')+'"><div class="shop-icon">'+(item.icon||'✨')+'</div><b>'+esc(item.name)+'</b><div class="muted">'+(owned?'Owned':item.cost+' coins')+'</div><button class="btn '+(equipped?'secondary':'orange')+'" data-accessory="'+item.id+'">'+(equipped?'Equipped':owned?'Use':'Buy')+'</button></div>';
 }).join('');
 $$('[data-avatar]').forEach(b=>b.onclick=()=>buyOrEquip('avatar',b.dataset.avatar));
 $$('[data-accessory]').forEach(b=>b.onclick=()=>buyOrEquip('accessory',b.dataset.accessory));
}
function buyOrEquip(type,id){
 const list=type==='avatar'?AVATARS:ACCESSORIES,item=list.find(x=>x.id===id),ownedKey=type==='avatar'?'ownedAvatars':'ownedAccessories';
 if(!item)return;
 if(!data[ownedKey].includes(id)){
  if(data.coins<item.cost){alert('You need '+(item.cost-data.coins)+' more coins.');return}
  data.coins-=item.cost;data[ownedKey].push(id);
 }
 data[type]=id;save();renderShop();
}
function resetProgress(){
 if(!confirm('Reset all Math Masti progress, mastery, coins and rewards on this device?'))return;
 localStorage.removeItem(STORAGE);data=loadData();ensureDaily();renderHome();
}

document.addEventListener('DOMContentLoaded',()=>{
 bindAuthUi();
 $('#homeNav').onclick=()=>currentUser&&renderHome();
 $('#dashboardNav').onclick=()=>currentUser&&renderDashboard();
 $('#shopNav').onclick=()=>currentUser&&renderShop();
 $('#mixedBtn').onclick=()=>startSession('mixed');
 $('#mistakeBtn').onclick=()=>startSession('revision');
 $('#dashboardBtn').onclick=renderDashboard;
 $('#shopBtn').onclick=renderShop;
 $('#backFromGame').onclick=()=>{clearInterval(S.timer);renderHome()};
 $('#backFromDashboard').onclick=renderHome;
 $('#backFromShop').onclick=renderHome;
 $('#hintBtn').onclick=()=>{S.hintUsed=true;$('#hintBox').classList.add('show')};
 $('#nextBtn').onclick=nextQuestion;
 $('#resetBtn').onclick=resetProgress;
 renderAccountControls();
 showView('loading');
 if(window.MathAuth)startAuthBridge();
 else window.addEventListener('mathauthready',startAuthBridge,{once:true});
});
