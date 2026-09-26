(function(root){
'use strict';

const TOPICS=['numbers','operations','multdiv','factors','fractions','decimals','measurement','time','money','geometry','patterns','word'];
const r=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const p=a=>a[r(0,a.length-1)];
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=b;b=a%b;a=t}return a||1};
const lcm=(a,b)=>Math.abs(a*b)/gcd(a,b);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const fmt=n=>Number(n).toLocaleString('en-IN');

function reduceFraction(n,d){
  const g=gcd(n,d);
  return [n/g,d/g];
}
function fractionText(n,d){
  const [rn,rd]=reduceFraction(n,d);
  return rd===1?String(rn):rn+'/'+rd;
}
function normalizeText(x){
  return String(x).trim().toLowerCase().replace(/[₹,\s]/g,'');
}
function parseFraction(x){
  const m=String(x).trim().match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  if(!m||Number(m[2])===0)return null;
  return [Number(m[1]),Number(m[2])];
}
function parseTime(x){
  const m=String(x).trim().match(/^(\d{1,2}):(\d{2})$/);
  if(!m)return null;
  let h=Number(m[1]),min=Number(m[2]);
  if(h<1||h>12||min<0||min>59)return null;
  return [h,min];
}
function isCorrect(value,answer){
  const vf=parseFraction(value),af=parseFraction(answer);
  if(vf&&af)return vf[0]*af[1]===af[0]*vf[1];

  const vt=parseTime(value),at=parseTime(answer);
  if(vt&&at)return vt[0]===at[0]&&vt[1]===at[1];

  const nv=normalizeText(value),na=normalizeText(answer);
  if(nv===na)return true;

  const numberPattern=/^[-+]?\d*\.?\d+$/;
  if(numberPattern.test(nv)&&numberPattern.test(na)){
    return Math.abs(Number(nv)-Number(na))<1e-9;
  }
  return false;
}
function input(q,a,h,t,solution){
  return {kind:'input',q:String(q),a:String(a),h:String(h),t,solution:String(solution)};
}
function mcq(q,a,distractors,h,t,solution){
  const answer=String(a);
  const wrong=[];
  for(const item of distractors.map(String)){
    if(isCorrect(item,answer))continue;
    if(!wrong.some(x=>normalizeText(x)===normalizeText(item)))wrong.push(item);
  }
  if(wrong.length<3)throw new Error('MCQ needs at least three distinct wrong options: '+q);
  const options=shuffle([answer,...shuffle(wrong).slice(0,3)]);
  return {kind:'mcq',q:String(q),a:answer,o:options,h:String(h),t,solution:String(solution)};
}
function validateQuestion(q){
  if(!q||!q.q||q.a===undefined||q.a===null||!String(q.a).trim())return {ok:false,reason:'missing question or answer'};
  if(!TOPICS.includes(q.t))return {ok:false,reason:'unknown topic'};
  if(!q.solution||!String(q.solution).trim())return {ok:false,reason:'missing solution'};
  if(q.kind==='mcq'){
    if(!Array.isArray(q.o)||q.o.length!==4)return {ok:false,reason:'MCQ must have four options'};
    const raw=new Set(q.o.map(normalizeText));
    if(raw.size!==4)return {ok:false,reason:'MCQ options must be unique'};
    const matches=q.o.filter(x=>isCorrect(x,q.a)).length;
    if(matches!==1)return {ok:false,reason:'MCQ must contain exactly one correct answer; found '+matches};
  }else if(q.kind!=='input'){
    return {ok:false,reason:'unknown question kind'};
  }
  return {ok:true};
}
function finish(q){
  const check=validateQuestion(q);
  if(!check.ok)throw new Error(check.reason+' | '+JSON.stringify(q));
  return q;
}

function generate(topic,difficulty){
  let t=topic==='mixed'?p(TOPICS):topic;
  if(!TOPICS.includes(t))throw new Error('Unknown topic: '+topic);
  const d=clamp(Number(difficulty)||2,1,5);
  return finish(generateCore(t,d));
}

function generateCore(t,d){
  if(t==='numbers'){
    const ranges=[null,[100,999],[1000,9999],[10000,99999],[100000,999999],[100000,999999]];
    const [min,max]=ranges[d],mode=r(1,4);
    if(mode===1){
      const n=r(min,max);
      const places=d===1?[[100,'hundreds'],[10,'tens'],[1,'ones']]
        :d===2?[[1000,'thousands'],[100,'hundreds'],[10,'tens'],[1,'ones']]
        :d===3?[[10000,'ten-thousands'],[1000,'thousands'],[100,'hundreds'],[10,'tens'],[1,'ones']]
        :[[100000,'lakh'],[10000,'ten-thousands'],[1000,'thousands'],[100,'hundreds'],[10,'tens'],[1,'ones']];
      const [pv,name]=p(places),digit=Math.floor(n/pv)%10;
      return input('What is the digit in the '+name+' place of '+fmt(n)+'?',digit,'Locate the named place from right to left.','numbers','In '+fmt(n)+', the digit in the '+name+' place is '+digit+'.');
    }
    if(mode===2){
      const n=r(min,max);
      const places=d===1?[10,100]:d===2?[10,100,1000]:d===3?[10,100,1000,10000]:[10,100,1000,10000,100000];
      const pv=p(places),digit=Math.floor(n/pv)%10,value=digit*pv;
      return input('What is the place value of the digit '+digit+' in '+fmt(n)+'?',value,'Place value = digit × value of its position.','numbers',digit+' × '+fmt(pv)+' = '+fmt(value)+'.');
    }
    if(mode===3){
      const roman=[
        null,
        {n:9,a:'IX',w:['VIII','XI','VI']},
        {n:14,a:'XIV',w:['XII','XVI','XIX']},
        {n:29,a:'XXIX',w:['XXIV','XXVIII','XXXI']},
        {n:40,a:'XL',w:['XXXIX','XLI','LX']},
        {n:49,a:'XLIX',w:['XLVIII','L','LI']}
      ][d];
      return mcq('Which Roman numeral represents '+roman.n+'?',roman.a,roman.w,'Use standard Roman numeral rules.','numbers',roman.a+' represents '+roman.n+'.');
    }
    let a=r(min,max),b=r(min,max);
    while(b===a)b=r(min,max);
    const ans=Math.max(a,b);
    return mcq('Which number is greater: '+fmt(a)+' or '+fmt(b)+'?',fmt(ans),[fmt(Math.min(a,b)),'They are equal','Cannot be determined'],'Compare digits from the highest place value.','numbers',fmt(ans)+' is greater than '+fmt(Math.min(a,b))+'.');
  }

  if(t==='operations'){
    const ranges=[null,[100,999,10,300],[1000,4999,100,1500],[1000,9999,500,4000],[10000,50000,1000,9000],[10000,99999,5000,30000]];
    const z=ranges[d],add=Math.random()>.5;
    let a=r(z[0],z[1]),b=r(z[2],z[3]);
    if(!add&&b>a)[a,b]=[b,a];
    const ans=add?a+b:a-b,op=add?'+':'−';
    return input(fmt(a)+' '+op+' '+fmt(b)+' = ?',ans,add?'Add matching place values carefully.':'Subtract from right to left and regroup when needed.','operations',fmt(a)+' '+op+' '+fmt(b)+' = '+fmt(ans)+'.');
  }

  if(t==='multdiv'){
    if(Math.random()>.5){
      const ar=[null,[2,12],[12,50],[20,99],[100,299],[100,499]][d];
      const br=[null,[2,9],[2,9],[2,12],[2,9],[10,19]][d];
      const a=r(ar[0],ar[1]),b=r(br[0],br[1]),ans=a*b;
      return input(fmt(a)+' × '+fmt(b)+' = ?',ans,'Break the larger number into easier parts, then add partial products.','multdiv',fmt(a)+' × '+fmt(b)+' = '+fmt(ans)+'.');
    }
    const dm=[0,5,9,12,15,20][d],qm=[0,12,20,40,60,80][d];
    const divisor=r(2,dm),quotient=r(3,qm),dividend=divisor*quotient;
    return input(fmt(dividend)+' ÷ '+divisor+' = ?',quotient,'Think: divisor × what number = dividend?','multdiv',divisor+' × '+quotient+' = '+fmt(dividend)+', so '+fmt(dividend)+' ÷ '+divisor+' = '+quotient+'.');
  }

  if(t==='factors'){
    if(d===1){
      const n=p([12,18,20,24,30,36]);
      const pool=[2,3,4,5,6,7,8,9,10,12];
      const factors=pool.filter(x=>n%x===0),answer=p(factors);
      const wrong=pool.filter(x=>n%x!==0);
      return mcq('Which is a factor of '+n+'?',answer,wrong,'A factor divides the number exactly, with no remainder.','factors',n+' ÷ '+answer+' = '+(n/answer)+' exactly, so '+answer+' is a factor of '+n+'.');
    }
    if(d===2){
      const a=p([4,6,8,9,10,12]),k=r(4,10),ans=a*k;
      return input('What is the '+k+'th multiple of '+a+'?',ans,'The nth multiple is number × n.','factors',a+' × '+k+' = '+ans+'.');
    }
    if(d===3){
      const a=p([12,18,24,30,36]),b=p([8,16,20,28,32]),ans=gcd(a,b);
      return input('Find the HCF of '+a+' and '+b+'.',ans,'Find all common factors and choose the greatest.','factors','HCF('+a+', '+b+') = '+ans+'.');
    }
    if(d===4){
      const a=p([4,6,8,9,10,12]),b=p([6,8,12,15,18]),ans=lcm(a,b);
      return input('Find the LCM of '+a+' and '+b+'.',ans,'List multiples until you find the first common multiple.','factors','LCM('+a+', '+b+') = '+ans+'.');
    }
    const a=p([18,24,30,36,42,48]),b=p([20,28,32,40,45,54]),useHcf=Math.random()>.5;
    const ans=useHcf?gcd(a,b):lcm(a,b),name=useHcf?'HCF':'LCM';
    return input('Find the '+name+' of '+a+' and '+b+'.',ans,useHcf?'Find the greatest common factor.':'Find the smallest common multiple.','factors',name+'('+a+', '+b+') = '+ans+'.');
  }

  if(t==='fractions'){
    const den=p(d<=2?[4,5,6,8]:[6,8,10,12]);
    if(d<=2){
      const maxNum=Math.max(1,Math.floor(den/3)),a=r(1,maxNum),b=r(1,maxNum),num=a+b,ans=fractionText(num,den);
      return input(a+'/'+den+' + '+b+'/'+den+' = ? (give the answer in simplest form)',ans,'With equal denominators, add the numerators and then simplify.','fractions',a+'/'+den+' + '+b+'/'+den+' = '+num+'/'+den+' = '+ans+'.');
    }
    if(d===3){
      const a=r(2,den-1),b=r(1,a-1),num=a-b,ans=fractionText(num,den);
      return input(a+'/'+den+' − '+b+'/'+den+' = ? (give the answer in simplest form)',ans,'With equal denominators, subtract the numerators and then simplify.','fractions',a+'/'+den+' − '+b+'/'+den+' = '+num+'/'+den+' = '+ans+'.');
    }
    if(d===4){
      const base=p([2,3,4,5]),num=r(1,base-1),k=p([2,3,4]),newDen=base*k,ans=num*k;
      return input(num+'/'+base+' = ?/'+newDen+'. What is the missing numerator?',ans,'Multiply numerator and denominator by the same number.','fractions','The denominator is multiplied by '+k+', so '+num+' × '+k+' = '+ans+'.');
    }
    const small=p([2,3,4,5]),factor=p([2,3]),big=small*factor,a=r(1,small-1),b=r(1,big-1);
    const num=a*factor+b,ans=fractionText(num,big);
    return input(a+'/'+small+' + '+b+'/'+big+' = ? (give the answer in simplest form)',ans,'Convert both fractions to the same denominator, add, then simplify.','fractions',a+'/'+small+' = '+(a*factor)+'/'+big+', so '+(a*factor)+'/'+big+' + '+b+'/'+big+' = '+num+'/'+big+' = '+ans+'.');
  }

  if(t==='decimals'){
    if(d===1){
      const ai=r(10,50),bi=r(1,9),ans=ai+bi;
      return input((ai/10).toFixed(1)+' + '+(bi/10).toFixed(1)+' = ?',(ans/10).toFixed(1),'Line up the decimal points.','decimals',ai/10+' + '+bi/10+' = '+(ans/10).toFixed(1)+'.');
    }
    if(d===2){
      const ai=r(20,90),bi=r(1,ai-1),ans=ai-bi;
      return input((ai/10).toFixed(1)+' − '+(bi/10).toFixed(1)+' = ?',(ans/10).toFixed(1),'Line up the decimal points before subtracting.','decimals',(ai/10).toFixed(1)+' − '+(bi/10).toFixed(1)+' = '+(ans/10).toFixed(1)+'.');
    }
    if(d===3){
      const ai=r(100,900),bi=r(10,90),ans=ai+bi;
      return input((ai/100).toFixed(2)+' + '+(bi/100).toFixed(2)+' = ?',(ans/100).toFixed(2),'Hundredths stay under hundredths.','decimals',(ai/100).toFixed(2)+' + '+(bi/100).toFixed(2)+' = '+(ans/100).toFixed(2)+'.');
    }
    if(d===4){
      const ai=r(300,990),bi=r(10,Math.min(250,ai-1)),ans=ai-bi;
      return input((ai/100).toFixed(2)+' − '+(bi/100).toFixed(2)+' = ?',(ans/100).toFixed(2),'Regroup across the decimal point if needed.','decimals',(ai/100).toFixed(2)+' − '+(bi/100).toFixed(2)+' = '+(ans/100).toFixed(2)+'.');
    }
    const ai=r(100,700),bi=r(10,200),ci=r(10,150),ans=ai+bi+ci;
    return input((ai/100).toFixed(2)+' + '+(bi/100).toFixed(2)+' + '+(ci/100).toFixed(2)+' = ?',(ans/100).toFixed(2),'Keep all decimal points aligned.','decimals',(ai/100).toFixed(2)+' + '+(bi/100).toFixed(2)+' + '+(ci/100).toFixed(2)+' = '+(ans/100).toFixed(2)+'.');
  }

  if(t==='measurement'){
    if(d===1){
      const x=r(2,9),ans=x*100;
      return input(x+' metres = ? centimetres',ans,'1 metre = 100 centimetres.','measurement',x+' × 100 = '+ans+' cm.');
    }
    if(d===2){
      const x=r(2,12),cm=x*100;
      return input(cm+' centimetres = ? metres',x,'100 centimetres = 1 metre.','measurement',cm+' ÷ 100 = '+x+' m.');
    }
    if(d===3){
      const l=r(4,15),w=r(2,10),ans=2*(l+w);
      return input('A rectangle is '+l+' cm long and '+w+' cm wide. What is its perimeter in cm?',ans,'Perimeter = 2 × (length + width).','measurement','2 × ('+l+' + '+w+') = '+ans+' cm.');
    }
    if(d===4){
      const l=r(4,16),w=r(3,12),ans=l*w;
      return input('What is the area of a '+l+' cm × '+w+' cm rectangle in cm²?',ans,'Area = length × width.','measurement',l+' × '+w+' = '+ans+' cm².');
    }
    const l=r(8,20),w=r(4,12),one=2*(l+w),ans=2*one;
    return input('A rectangular garden is '+l+' m by '+w+' m. A rope goes around it twice. How many metres of rope are needed?',ans,'Find one perimeter, then multiply it by 2.','measurement','One perimeter = 2 × ('+l+' + '+w+') = '+one+' m. Twice around = '+one+' × 2 = '+ans+' m.');
  }

  if(t==='time'){
    const adds=[null,[15,30],[30,45,60],[45,60,90],[75,90,105],[105,120,135,150]][d];
    const h=r(1,10),m=p([0,15,30,45]),add=p(adds);
    const total=h*60+m+add;
    let hh=Math.floor(total/60),mm=total%60;
    while(hh>12)hh-=12;
    const answer=hh+':'+String(mm).padStart(2,'0');
    return input('A programme starts at '+h+':'+String(m).padStart(2,'0')+' and lasts '+add+' minutes. What time does it end?',answer,'Add the minutes. Every 60 minutes makes 1 hour.','time',h+':'+String(m).padStart(2,'0')+' + '+add+' minutes = '+answer+'.');
  }

  if(t==='money'){
    if(d<=2){
      const cap=d===1?200:500,a=r(50,cap),b=r(10,a),ans=a-b;
      return input('You have ₹'+a+' and spend ₹'+b+'. How much money remains?',ans,'Subtract the amount spent from the amount you had.','money','₹'+a+' − ₹'+b+' = ₹'+ans+'.');
    }
    if(d===3){
      const a=r(35,240),b=r(25,180),ans=a+b;
      return input('A book costs ₹'+a+' and a pen set costs ₹'+b+'. What is the total cost?',ans,'Add the two prices.','money','₹'+a+' + ₹'+b+' = ₹'+ans+'.');
    }
    if(d===4){
      const a=r(80,240),b=r(50,180),paid=500,cost=a+b,ans=paid-cost;
      return input('You buy items costing ₹'+a+' and ₹'+b+' and pay ₹'+paid+'. How much change should you get?',ans,'Add the costs first, then subtract from the amount paid.','money','Total cost = ₹'+a+' + ₹'+b+' = ₹'+cost+'. Change = ₹'+paid+' − ₹'+cost+' = ₹'+ans+'.');
    }
    const qty=r(3,6),price=r(35,85),paid=1000,cost=qty*price,ans=paid-cost;
    return input('You buy '+qty+' notebooks at ₹'+price+' each and pay ₹'+paid+'. How much change should you get?',ans,'Multiply to find the total cost, then subtract from the amount paid.','money','Cost = '+qty+' × ₹'+price+' = ₹'+cost+'. Change = ₹'+paid+' − ₹'+cost+' = ₹'+ans+'.');
  }

  if(t==='geometry'){
    if(d===1){
      return p([
        mcq('How many sides does a triangle have?','3',['2','4','5'],'Tri means three.','geometry','A triangle has 3 sides.'),
        mcq('Which shape has no straight sides?','Circle',['Triangle','Square','Rectangle'],'Think about the boundary of each shape.','geometry','A circle has a curved boundary and no straight sides.')
      ]);
    }
    if(d===2)return mcq('How many right angles does a rectangle have?','4',['1','2','3'],'Every corner of a rectangle is a right angle.','geometry','A rectangle has 4 right angles.');
    if(d===3){
      return p([
        mcq('How many pairs of parallel sides does a rectangle have?','2',['0','1','4'],'Opposite sides of a rectangle are parallel.','geometry','A rectangle has 2 pairs of parallel opposite sides.'),
        mcq('How many lines of symmetry does a square have?','4',['1','2','3'],'Think of vertical, horizontal and both diagonal folds.','geometry','A square has 4 lines of symmetry.')
      ]);
    }
    if(d===4)return mcq('An angle greater than 90° but less than 180° is called…','Obtuse',['Acute','Right','Straight'],'Acute is below 90°, right is exactly 90°.','geometry','An angle between 90° and 180° is an obtuse angle.');
    return mcq('Which quadrilateral has exactly one pair of parallel sides?','Trapezium',['Square','Rectangle','Rhombus'],'Count the pairs of parallel opposite sides.','geometry','In the usual Grade 4 definition, a trapezium has exactly one pair of parallel sides.');
  }

  if(t==='patterns'){
    if(d<=2){
      const a=r(3,30),step=r(d===1?2:5,d===1?5:12),ans=a+4*step;
      return input('Complete the pattern: '+a+', '+(a+step)+', '+(a+2*step)+', '+(a+3*step)+', ?',ans,'Find the number added each time.','patterns','The rule is +'+step+', so the next number is '+(a+3*step)+' + '+step+' = '+ans+'.');
    }
    if(d===3){
      const step=r(3,9),a=r(45,90),ans=a-4*step;
      return input('Complete the pattern: '+a+', '+(a-step)+', '+(a-2*step)+', '+(a-3*step)+', ?',ans,'Find the number subtracted each time.','patterns','The rule is −'+step+', so the next number is '+(a-3*step)+' − '+step+' = '+ans+'.');
    }
    if(d===4){
      const mult=p([2,3]),a=r(2,6),ans=a*Math.pow(mult,4);
      return input('Complete the pattern: '+a+', '+(a*mult)+', '+(a*mult*mult)+', '+(a*mult*mult*mult)+', ?',ans,'Each term is multiplied by the same number.','patterns','The rule is ×'+mult+', so the next number is '+(a*mult*mult*mult)+' × '+mult+' = '+ans+'.');
    }
    const a=r(10,25),up=r(5,10),down=r(2,4);
    const s1=a+up,s2=s1-down,s3=s2+up,s4=s3-down,ans=s4+up;
    return input('Complete the pattern: '+a+', '+s1+', '+s2+', '+s3+', '+s4+', ?',ans,'The rule alternates between adding and subtracting.','patterns','The rule is +'+up+', −'+down+'. After '+s4+', add '+up+' to get '+ans+'.');
  }

  if(t==='word'){
    if(d===1){
      const a=r(200,600),b=r(50,180),add=Math.random()>.5,ans=add?a+b:a-b;
      const q=add?'A shop sold '+a+' pencils in the morning and '+b+' in the afternoon. How many pencils were sold altogether?':'A shop had '+a+' pencils and sold '+b+'. How many pencils remain?';
      return input(q,ans,add?'Altogether means add.':'Remain means subtract.','word',add?a+' + '+b+' = '+ans+'.':a+' − '+b+' = '+ans+'.');
    }
    if(d===2){
      const boxes=r(3,8),each=r(6,15),ans=boxes*each;
      return input(boxes+' boxes have '+each+' pencils each. How many pencils are there altogether?',ans,'Equal groups mean multiplication.','word',boxes+' × '+each+' = '+ans+'.');
    }
    if(d===3){
      const groups=r(3,9),each=r(6,15),total=groups*each;
      return input(total+' sweets are shared equally among '+groups+' children. How many sweets does each child get?',each,'Equal sharing means division.','word',total+' ÷ '+groups+' = '+each+'.');
    }
    if(d===4){
      const kids=r(3,8),each=r(15,30),extra=r(5,25),ans=kids*each+extra;
      return input(kids+' children collect '+each+' stickers each, and a teacher adds '+extra+' more. How many stickers are there altogether?',ans,'Multiply first, then add the extra stickers.','word',kids+' × '+each+' = '+(kids*each)+', then '+(kids*each)+' + '+extra+' = '+ans+'.');
    }
    const packs=r(4,9),each=r(12,25),given=r(15,40),total=packs*each,ans=total-given;
    return input('A class buys '+packs+' packs of '+each+' crayons and gives away '+given+' crayons. How many crayons remain?',ans,'Multiply to find the total, then subtract those given away.','word',packs+' × '+each+' = '+total+', then '+total+' − '+given+' = '+ans+'.');
  }

  throw new Error('Unhandled topic: '+t);
}

const api={TOPICS,generate,isCorrect,validateQuestion,reduceFraction,gcd,lcm};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.MathQuestionEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
