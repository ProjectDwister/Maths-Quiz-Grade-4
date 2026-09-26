(function(root){
'use strict';

const TOPICS=['numbers','operations','multdiv','factors','fractions','decimals','measurement','time','money','geometry','patterns','word'];
const VARIANT_COUNTS={numbers:7,operations:5,multdiv:6,factors:6,fractions:7,decimals:7,measurement:8,time:6,money:7,geometry:10,patterns:7,word:8};
const VARIANTS_BY_TOPIC={
  numbers:['place-digit','place-value','roman','compare','successor-predecessor','rounding','expanded-form'],
  operations:['direct','missing-addend','missing-subtrahend','three-addends','estimation'],
  multdiv:['multiply','exact-division','missing-factor','missing-dividend','remainder','grouping'],
  factors:['factor-choice','multiple','prime-composite','divisibility','hcf','lcm'],
  fractions:['add-like','subtract-like','equivalent','compare-like','fraction-of-quantity','add-unlike','mixed-to-improper'],
  decimals:['decimal-place','compare-decimals','decimal-add','decimal-subtract','fraction-to-decimal','decimal-to-fraction','rupees-paise-decimal'],
  measurement:['m-cm','cm-m','kg-g','l-ml','perimeter','area','compound-length','fencing'],
  time:['end-time','start-time','duration','hours-minutes','compound-time','clock-language'],
  money:['remaining','total','change','quantity-price','rupees-paise','compare-money','multi-step-money'],
  geometry:['triangle-sides','rectangle-vertices','circle','right-angles','parallel','symmetry','acute','obtuse','trapezium','ray'],
  patterns:['add-pattern','subtract-pattern','multiply-pattern','alternating-pattern','data-maximum','data-total','data-difference'],
  word:['addition-story','subtraction-story','multiplication-story','division-story','multiply-add','multiply-subtract','capacity-story','array-plus-extra']
};
const CONCEPT_META={
  'place-digit':['Place-value digits','Check the named place carefully; counting from the wrong side is a common slip.'],
  'place-value':['Place value','A digit and its place value are different: 6 in the hundreds place means 600.'],
  'roman':['Roman numerals','Build Roman numerals in groups; remember IV=4, IX=9 and XL=40.'],
  'compare':['Comparing numbers','Compare from the highest place first, not from the last digit.'],
  'successor-predecessor':['Successor & predecessor','Successor means +1; predecessor means −1.'],
  'rounding':['Rounding','Look one place to the right: 5 or more rounds up, 4 or less stays down.'],
  'expanded-form':['Expanded form','Expanded form shows each non-zero digit multiplied by its place value.'],

  'direct':['Addition & subtraction','Line up matching place values and watch the operation sign.'],
  'missing-addend':['Missing addend','Use the inverse operation: total − known addend = missing addend.'],
  'missing-subtrahend':['Missing subtrahend','If start − ? = result, then start − result gives the missing amount.'],
  'three-addends':['Three-number addition','Add in manageable pairs and keep place values aligned.'],
  'estimation':['Estimation','Round first, then calculate; do not calculate exactly before rounding.'],

  'multiply':['Multiplication','Break a larger factor into tens and ones if the table fact is not immediate.'],
  'exact-division':['Exact division','Use the related multiplication fact to check the quotient.'],
  'missing-factor':['Missing factor','Use division: product ÷ known factor = missing factor.'],
  'missing-dividend':['Missing dividend','Dividend = divisor × quotient.'],
  'remainder':['Division with remainder','The remainder must be smaller than the divisor.'],
  'grouping':['Equal grouping','Equal groups use division, not multiplication.'],

  'factor-choice':['Factors','A factor divides exactly; a multiple is produced by multiplication.'],
  'multiple':['Multiples','The nth multiple is the number multiplied by n.'],
  'prime-composite':['Prime & composite','Prime numbers have exactly two factors: 1 and the number itself.'],
  'divisibility':['Divisibility','Use a divisibility rule or confirm that division leaves no remainder.'],
  'hcf':['HCF','HCF is the greatest factor shared by both numbers.'],
  'lcm':['LCM','LCM is the smallest positive multiple shared by both numbers.'],

  'add-like':['Adding like fractions','With the same denominator, add numerators only; keep the denominator.'],
  'subtract-like':['Subtracting like fractions','With the same denominator, subtract numerators only.'],
  'equivalent':['Equivalent fractions','Multiply or divide numerator and denominator by the same number.'],
  'compare-like':['Comparing fractions','When denominators match, the larger numerator gives the larger fraction.'],
  'fraction-of-quantity':['Fraction of a quantity','Divide by the denominator first, then multiply by the numerator.'],
  'add-unlike':['Adding unlike fractions','Convert to a common denominator before adding.'],
  'mixed-to-improper':['Mixed to improper fraction','Whole × denominator + numerator gives the new numerator.'],

  'decimal-place':['Decimal place value','Tenths are first after the decimal; hundredths are second.'],
  'compare-decimals':['Comparing decimals','Compare whole parts, then tenths, then hundredths.'],
  'decimal-add':['Adding decimals','Align decimal points before adding.'],
  'decimal-subtract':['Subtracting decimals','Align decimal points and regroup if needed.'],
  'fraction-to-decimal':['Fraction to decimal','Tenths have one decimal place; hundredths have two.'],
  'decimal-to-fraction':['Decimal to fraction','Write the decimal over 10 or 100, then simplify.'],
  'rupees-paise-decimal':['Rupees & paise','100 paise = ₹1, so paise occupy hundredths of a rupee.'],

  'm-cm':['Metres to centimetres','Multiply metres by 100.'],
  'cm-m':['Centimetres to metres','Divide centimetres by 100.'],
  'kg-g':['Kilograms to grams','Multiply kilograms by 1000.'],
  'l-ml':['Litres to millilitres','Multiply litres by 1000.'],
  'perimeter':['Perimeter','Perimeter measures the boundary: add all side lengths.'],
  'area':['Area','Area measures surface covered: rectangle area = length × width.'],
  'compound-length':['Compound length','Convert everything to the same unit before adding.'],
  'fencing':['Perimeter in context','Fencing goes around the boundary, so use perimeter, not area.'],

  'end-time':['Finding end time','Add the elapsed time to the start time.'],
  'start-time':['Finding start time','Work backwards from the end time by the duration.'],
  'duration':['Elapsed time','Count the time between the start and end, not the clock readings themselves.'],
  'hours-minutes':['Hours to minutes','Multiply hours by 60.'],
  'compound-time':['Hours & minutes','Convert hours to minutes before adding the extra minutes.'],
  'clock-language':['Reading clock language','Quarter past = :15, half past = :30, quarter to = :45 of the previous hour.'],

  'remaining':['Money remaining','Remaining money = starting amount − amount spent.'],
  'total':['Adding money','Add all prices to find the total.'],
  'change':['Finding change','Change = amount paid − total bill.'],
  'quantity-price':['Quantity × price','Total cost = number of items × price per item.'],
  'rupees-paise':['Rupees to paise','₹1 equals 100 paise.'],
  'compare-money':['Comparing money','Compare the full amounts, not just one digit.'],
  'multi-step-money':['Multi-step money','Find item totals first, add them, then calculate change.'],

  'triangle-sides':['Triangle properties','A triangle always has 3 sides.'],
  'rectangle-vertices':['Vertices','Vertices are corners; a rectangle has 4.'],
  'circle':['Curved shapes','A circle has a curved boundary and no straight sides.'],
  'right-angles':['Right angles','A rectangle has four 90° angles.'],
  'parallel':['Parallel sides','Parallel lines stay the same distance apart and never meet.'],
  'symmetry':['Line symmetry','A symmetry line splits a shape into matching mirror halves.'],
  'acute':['Acute angles','Acute angles are less than 90°.'],
  'obtuse':['Obtuse angles','Obtuse angles are greater than 90° and less than 180°.'],
  'trapezium':['Quadrilaterals','A trapezium has exactly one pair of parallel sides in this Grade 4 convention.'],
  'ray':['Lines & rays','A ray has one endpoint and continues forever in one direction.'],

  'add-pattern':['Growing patterns','Find the constant amount added each time.'],
  'subtract-pattern':['Decreasing patterns','Find the constant amount subtracted each time.'],
  'multiply-pattern':['Multiplicative patterns','Look for multiplication, not just addition.'],
  'alternating-pattern':['Alternating patterns','Two different rules repeat in turn.'],
  'data-maximum':['Reading data','Compare all values before choosing the greatest.'],
  'data-total':['Adding data','Add every category exactly once.'],
  'data-difference':['Data difference','Difference means greatest value − smallest value.'],

  'addition-story':['Addition word problems','Words such as altogether or now often indicate addition.'],
  'subtraction-story':['Subtraction word problems','Words such as left or remain often indicate subtraction.'],
  'multiplication-story':['Multiplication word problems','Equal groups with the same amount use multiplication.'],
  'division-story':['Division word problems','Equal sharing or equal grouping uses division.'],
  'multiply-add':['Two-step: multiply then add','Solve the equal groups first, then add the extra amount.'],
  'multiply-subtract':['Two-step: multiply then subtract','Find the grouped total first, then subtract what was removed.'],
  'capacity-story':['Capacity word problem','Find total capacity first, then adjust for empty places.'],
  'array-plus-extra':['Arrays plus extras','Find the array total with multiplication, then add extras.']
};

const TOPIC_LABELS={
  numbers:'Numbers & Place Value',operations:'Addition & Subtraction',multdiv:'Multiplication & Division',
  factors:'Factors & Multiples',fractions:'Fractions',decimals:'Decimals',measurement:'Measurement',
  time:'Time',money:'Money',geometry:'Geometry',patterns:'Patterns & Data',word:'Word Problems'
};
const r=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const p=a=>a[r(0,a.length-1)];
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const fmt=n=>Number(n).toLocaleString('en-IN');
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=b;b=a%b;a=t}return a||1};
const lcm=(a,b)=>Math.abs(a*b)/gcd(a,b);
const ordinal=n=>n+(n%100>=11&&n%100<=13?'th':n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th');
const pad=n=>String(n).padStart(2,'0');

function reduceFraction(n,d){const g=gcd(n,d);return [n/g,d/g]}
function fractionText(n,d){const [a,b]=reduceFraction(n,d);return b===1?String(a):a+'/'+b}
function normalizeText(x){return String(x).trim().toLowerCase().replace(/[₹,\s]/g,'')}
function parseFraction(x){
  const m=String(x).trim().match(/^(-?\d+)\s*\/\s*(-?\d+)$/);
  return !m||Number(m[2])===0?null:[Number(m[1]),Number(m[2])];
}
function parseTime(x){
  const m=String(x).trim().match(/^(\d{1,2}):(\d{2})$/);
  if(!m)return null;
  const h=Number(m[1]),min=Number(m[2]);
  return h<1||h>12||min<0||min>59?null:[h,min];
}
function isCorrect(value,answer){
  const vf=parseFraction(value),af=parseFraction(answer);
  if(vf&&af)return vf[0]*af[1]===af[0]*vf[1];
  const vt=parseTime(value),at=parseTime(answer);
  if(vt&&at)return vt[0]===at[0]&&vt[1]===at[1];
  const nv=normalizeText(value),na=normalizeText(answer);
  if(nv===na)return true;
  const num=/^[-+]?\d*\.?\d+$/;
  return num.test(nv)&&num.test(na)&&Math.abs(Number(nv)-Number(na))<1e-9;
}
function input(q,a,h,t,solution,variant){
  return {kind:'input',q:String(q),a:String(a),h:String(h),t,solution:String(solution),variant};
}
function mcq(q,a,distractors,h,t,solution,variant){
  const answer=String(a),wrong=[];
  for(const item of distractors.map(String)){
    if(isCorrect(item,answer))continue;
    if(!wrong.some(x=>normalizeText(x)===normalizeText(item)))wrong.push(item);
  }
  if(wrong.length<3)throw new Error('MCQ needs at least three distinct wrong options: '+q);
  return {kind:'mcq',q:String(q),a:answer,o:shuffle([answer,...shuffle(wrong).slice(0,3)]),h:String(h),t,solution:String(solution),variant};
}
function validateQuestion(q){
  if(!q||!q.q||q.a===undefined||q.a===null||!String(q.a).trim())return {ok:false,reason:'missing question or answer'};
  if(!TOPICS.includes(q.t))return {ok:false,reason:'unknown topic'};
  if(!q.solution||!String(q.solution).trim())return {ok:false,reason:'missing solution'};
  if(!q.variant)return {ok:false,reason:'missing variant'};
  if(q.kind==='mcq'){
    if(!Array.isArray(q.o)||q.o.length!==4)return {ok:false,reason:'MCQ must have four options'};
    if(new Set(q.o.map(normalizeText)).size!==4)return {ok:false,reason:'MCQ options must be unique'};
    const matches=q.o.filter(x=>isCorrect(x,q.a)).length;
    if(matches!==1)return {ok:false,reason:'MCQ must contain exactly one correct answer; found '+matches};
  }else if(q.kind!=='input')return {ok:false,reason:'unknown question kind'};
  return {ok:true};
}
function buildVisual(q){
  const fractions=(q.q.match(/\d+\/\d+/g)||[]).slice(0,2);
  if(q.t==='fractions'&&fractions.length){
    return {type:'fraction',fractions};
  }
  if(q.t==='time'){
    const tm=(q.q.match(/\b\d{1,2}:\d{2}\b/)||[])[0] || (q.variant==='clock-language'?q.a:null);
    if(tm)return {type:'clock',time:tm};
  }
  if(q.t==='measurement'&&['perimeter','area','fencing'].includes(q.variant)){
    const nums=(q.q.match(/\d+/g)||[]).map(Number);
    if(nums.length>=2)return {type:'rectangle',length:nums[0],width:nums[1],mode:q.variant};
  }
  if(q.t==='patterns'&&q.variant.startsWith('data-')){
    const pairs=[...q.q.matchAll(/(Red|Blue|Green|Yellow):\s*(\d+)/g)].map(m=>({label:m[1],value:Number(m[2])}));
    if(pairs.length)return {type:'bars',items:pairs};
  }
  if(q.t==='geometry')return {type:'geometry',shape:q.variant};
  if(q.t==='money'){
    const amounts=[...q.q.matchAll(/₹\s*(\d+(?:\.\d+)?)/g)].map(m=>Number(m[1])).slice(0,4);
    if(amounts.length)return {type:'money',amounts};
  }
  if(q.t==='numbers'&&['place-digit','place-value','expanded-form'].includes(q.variant)){
    const n=(q.q.match(/[\d,]{3,}/)||[])[0];
    if(n)return {type:'place-value',number:n};
  }
  if(q.t==='multdiv'&&['grouping','multiply'].includes(q.variant)){
    const nums=(q.q.match(/\d+/g)||[]).map(Number);
    if(nums.length>=2&&nums[0]<=120)return {type:'groups',values:nums.slice(0,2)};
  }
  return null;
}
function decorate(q){
  const meta=CONCEPT_META[q.variant]||[q.variant.replace(/-/g,' '),'Re-read the question and check the operation or rule used.'];
  q.concept=q.t+'::'+q.variant;
  q.conceptLabel=meta[0];
  q.topicLabel=TOPIC_LABELS[q.t]||q.t;
  q.misconception=meta[1];
  q.visual=buildVisual(q);
  return q;
}
function finish(q){
  q=decorate(q);
  const c=validateQuestion(q);
  if(!c.ok)throw new Error(c.reason+' | '+JSON.stringify(q));
  return q;
}
function roman(n){
  const vals=[[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let out=''; for(const [v,s] of vals)while(n>=v){out+=s;n-=v} return out;
}
function timeFromMinutes(total){
  total=((total%(12*60))+(12*60))%(12*60);
  let h=Math.floor(total/60); if(h===0)h=12;
  return h+':'+pad(total%60);
}
function numericDistractors(ans,step=1){
  const vals=[ans-step,ans+step,ans+2*step,ans-2*step,ans+3*step].filter(x=>x>=0&&x!==ans);
  return [...new Set(vals)].slice(0,4);
}

function generate(topic,difficulty,preferredVariant){
  const t=topic==='mixed'?p(TOPICS):topic;
  if(!TOPICS.includes(t))throw new Error('Unknown topic: '+topic);
  const d=clamp(Number(difficulty)||2,1,5);
  if(preferredVariant)return generateForVariant(t,d,preferredVariant);
  return finish(generateCore(t,d));
}
function generateForVariant(topic,difficulty,variant){
  if(!TOPICS.includes(topic))throw new Error('Unknown topic: '+topic);
  const wanted=String(variant),base=clamp(Number(difficulty)||2,1,5);
  const levels=[base,3,4,5,2,1].filter((x,i,a)=>a.indexOf(x)===i);
  for(const level of levels){
    for(let i=0;i<260;i++){
      const q=finish(generateCore(topic,level));
      if(q.variant===wanted)return q;
    }
  }
  throw new Error('Could not generate variant '+wanted+' for '+topic);
}

function generateCore(t,d){
  if(t==='numbers'){
    const ranges=[null,[100,999],[1000,9999],[10000,99999],[100000,999999],[100000,999999]];
    const [min,max]=ranges[d],mode=r(1,7);
    if(mode===1){
      const n=r(min,max),places=d===1?[[100,'hundreds'],[10,'tens'],[1,'ones']]:d===2?[[1000,'thousands'],[100,'hundreds'],[10,'tens'],[1,'ones']]:d===3?[[10000,'ten-thousands'],[1000,'thousands'],[100,'hundreds'],[10,'tens'],[1,'ones']]:[[100000,'lakh'],[10000,'ten-thousands'],[1000,'thousands'],[100,'hundreds'],[10,'tens'],[1,'ones']];
      const [pv,name]=p(places),digit=Math.floor(n/pv)%10;
      return input('What is the digit in the '+name+' place of '+fmt(n)+'?',digit,'Locate the named place from right to left.','numbers','The digit in the '+name+' place is '+digit+'.','place-digit');
    }
    if(mode===2){
      const n=r(min,max),places=d===1?[10,100]:d===2?[10,100,1000]:d===3?[10,100,1000,10000]:[10,100,1000,10000,100000],pv=p(places),digit=Math.floor(n/pv)%10,value=digit*pv;
      return input('What is the place value of the digit '+digit+' in '+fmt(n)+'?',value,'Place value = digit × value of its position.','numbers',digit+' × '+fmt(pv)+' = '+fmt(value)+'.','place-value');
    }
    if(mode===3){
      const upper=[0,20,30,40,50,50][d],n=r(1,upper),a=roman(n);
      const candidates=[n-1,n+1,n-2,n+2,n-5,n+5,n-10,n+10].filter(x=>x>=1&&x<=50&&x!==n).map(roman);
      return mcq('Which Roman numeral represents '+n+'?',a,candidates,'Build the numeral using I, V, X and L.','numbers',a+' represents '+n+'.','roman');
    }
    if(mode===4){
      let a=r(min,max),b=r(min,max);while(a===b)b=r(min,max);const ans=Math.max(a,b);
      return mcq('Which number is greater?',fmt(ans),[fmt(Math.min(a,b)),'They are equal','Cannot be determined'],'Compare digits from the highest place.','numbers',fmt(ans)+' is greater than '+fmt(Math.min(a,b))+'.','compare');
    }
    if(mode===5){
      const n=r(min+2,max-2),wantNext=Math.random()>.5,ans=wantNext?n+1:n-1;
      return input('What is the '+(wantNext?'successor':'predecessor')+' of '+fmt(n)+'?',ans,wantNext?'Successor means the next number.':'Predecessor means the number just before.','numbers',fmt(n)+(wantNext?' + 1 = ':' − 1 = ')+fmt(ans)+'.','successor-predecessor');
    }
    if(mode===6){
      const n=r(min,max),base=d<=2?10:d===3?100:1000,ans=Math.round(n/base)*base;
      return input('Round '+fmt(n)+' to the nearest '+fmt(base)+'.',ans,'Look at the digit immediately to the right of the rounding place.','numbers',fmt(n)+' rounds to '+fmt(ans)+' to the nearest '+fmt(base)+'.','rounding');
    }
    const n=r(min,max);
    const parts=[];let rem=n,pow=1;while(pow*10<=n)pow*=10;
    while(pow>=1){const digit=Math.floor(rem/pow);if(digit)parts.push(digit*pow);rem%=pow;pow=Math.floor(pow/10)}
    const answer=parts.map(fmt).join(' + ');
    const wrong=[parts.slice().reverse().map(fmt).join(' + '),fmt(n-1)+' + 1',fmt(n+10)+' − 10',parts.map((x,i)=>fmt(i===0?x+10:x)).join(' + ')];
    return mcq('Which is the expanded form of '+fmt(n)+'?',answer,wrong,'Write the value contributed by each non-zero digit.','numbers',fmt(n)+' = '+answer+'.','expanded-form');
  }

  if(t==='operations'){
    const ranges=[null,[100,999,10,300],[1000,4999,100,1500],[1000,9999,500,4000],[10000,50000,1000,9000],[10000,99999,5000,30000]],z=ranges[d],mode=r(1,5);
    if(mode===1){
      const add=Math.random()>.5;let a=r(z[0],z[1]),b=r(z[2],z[3]);if(!add&&b>a)[a,b]=[b,a];const ans=add?a+b:a-b,op=add?'+':'−';
      return input(fmt(a)+' '+op+' '+fmt(b)+' = ?',ans,add?'Add matching place values.':'Regroup if needed while subtracting.','operations',fmt(a)+' '+op+' '+fmt(b)+' = '+fmt(ans)+'.','direct');
    }
    if(mode===2){
      const b=r(z[2],z[3]),missing=r(z[2],z[3]),total=b+missing;
      return input('? + '+fmt(b)+' = '+fmt(total),missing,'Use subtraction to find the missing addend.','operations',fmt(total)+' − '+fmt(b)+' = '+fmt(missing)+'.','missing-addend');
    }
    if(mode===3){
      const sub=r(z[2],z[3]),ans=r(z[2],z[3]),start=sub+ans;
      return input(fmt(start)+' − ? = '+fmt(ans),sub,'Subtract the result from the starting number.','operations',fmt(start)+' − '+fmt(ans)+' = '+fmt(sub)+'.','missing-subtrahend');
    }
    if(mode===4){
      const a=r(z[0],z[1]),b=r(z[2],z[3]),c=r(10,Math.max(20,Math.floor(z[3]/2))),ans=a+b+c;
      return input(fmt(a)+' + '+fmt(b)+' + '+fmt(c)+' = ?',ans,'Add two numbers first, then add the third.','operations',fmt(a)+' + '+fmt(b)+' + '+fmt(c)+' = '+fmt(ans)+'.','three-addends');
    }
    const base=d<=2?10:100,a=r(z[0],z[1]),b=r(z[2],z[3]),ra=Math.round(a/base)*base,rb=Math.round(b/base)*base,ans=ra+rb;
    return input('Estimate '+fmt(a)+' + '+fmt(b)+' by rounding each number to the nearest '+fmt(base)+'.',ans,'Round each number first, then add.','operations',fmt(a)+' ≈ '+fmt(ra)+' and '+fmt(b)+' ≈ '+fmt(rb)+', so the estimate is '+fmt(ans)+'.','estimation');
  }

  if(t==='multdiv'){
    const mode=r(1,6);
    if(mode===1){
      const ar=[null,[2,12],[12,50],[20,99],[100,299],[100,499]][d],br=[null,[2,9],[2,9],[2,12],[2,9],[10,19]][d],a=r(ar[0],ar[1]),b=r(br[0],br[1]),ans=a*b;
      return input(fmt(a)+' × '+b+' = ?',ans,'Break the multiplication into easier parts.','multdiv',fmt(a)+' × '+b+' = '+fmt(ans)+'.','multiply');
    }
    if(mode===2){
      const dm=[0,5,9,12,15,20][d],qm=[0,12,20,40,60,80][d],divisor=r(2,dm),quotient=r(3,qm),dividend=divisor*quotient;
      return input(fmt(dividend)+' ÷ '+divisor+' = ?',quotient,'Think: divisor × what number = dividend?','multdiv',divisor+' × '+quotient+' = '+fmt(dividend)+'.','exact-division');
    }
    if(mode===3){
      const a=r(2,d<=2?12:20),b=r(3,d<=2?12:30),product=a*b;
      return input(a+' × ? = '+product,b,'Use the related division fact.','multdiv',product+' ÷ '+a+' = '+b+'.','missing-factor');
    }
    if(mode===4){
      const divisor=r(2,d<=2?9:15),quotient=r(3,d<=2?15:40),dividend=divisor*quotient;
      return input('? ÷ '+divisor+' = '+quotient,dividend,'Dividend = divisor × quotient.','multdiv',divisor+' × '+quotient+' = '+dividend+'.','missing-dividend');
    }
    if(mode===5&&d>=3){
      const divisor=r(3,9),quotient=r(4,20),rem=r(1,divisor-1),dividend=divisor*quotient+rem;
      return input('What is the remainder when '+dividend+' is divided by '+divisor+'?',rem,'Find the greatest multiple of the divisor below the dividend.','multdiv',divisor+' × '+quotient+' = '+(divisor*quotient)+', leaving remainder '+rem+'.','remainder');
    }
    const groups=r(3,d<=2?8:12),each=r(4,d<=2?12:25),total=groups*each;
    return input(total+' objects are arranged equally in '+groups+' groups. How many are in each group?',each,'Equal grouping uses division.','multdiv',total+' ÷ '+groups+' = '+each+'.','grouping');
  }

  if(t==='factors'){
    const mode=r(1,6);
    if(mode===1){
      const n=p([12,18,20,24,30,36,42,48]),pool=[2,3,4,5,6,7,8,9,10,12],factors=pool.filter(x=>n%x===0),answer=p(factors),wrong=pool.filter(x=>n%x!==0);
      return mcq('Which is a factor of '+n+'?',answer,wrong,'A factor divides exactly.','factors',n+' ÷ '+answer+' = '+(n/answer)+' exactly.','factor-choice');
    }
    if(mode===2){
      const a=p([4,6,7,8,9,10,12]),k=r(3,12),ans=a*k;
      return input('What is the '+ordinal(k)+' multiple of '+a+'?',ans,'Multiply the number by the position.','factors',a+' × '+k+' = '+ans+'.','multiple');
    }
    if(mode===3){
      const primes=[2,3,5,7,11,13,17,19,23,29,31],composites=[4,6,8,9,10,12,14,15,16,18,20,21,22,24,25],prime=Math.random()>.5,n=prime?p(primes):p(composites),ans=prime?'Prime':'Composite';
      return mcq('Is '+n+' prime or composite?',ans,prime?['Composite','Neither','Both']:['Prime','Neither','Both'],'Prime numbers have exactly two factors.','factors',n+' is '+ans.toLowerCase()+'.','prime-composite');
    }
    if(mode===4){
      const divisor=p([2,3,5,10]),n=r(20,200),yes=n%divisor===0,ans=yes?'Yes':'No';
      return mcq('Is '+n+' divisible by '+divisor+'?',ans,[yes?'No':'Yes','Only sometimes','Cannot tell'],'Use the divisibility rule or divide exactly.','factors',n+(yes?' is ':' is not ')+'divisible by '+divisor+'.','divisibility');
    }
    if(mode===5){
      const a=p([12,18,24,30,36,42]),b=p([8,16,20,28,32,40]),ans=gcd(a,b);
      return input('Find the HCF of '+a+' and '+b+'.',ans,'Find common factors and choose the greatest.','factors','HCF('+a+', '+b+') = '+ans+'.','hcf');
    }
    const a=p([4,6,8,9,10,12]),b=p([6,8,12,15,18]),ans=lcm(a,b);
    return input('Find the LCM of '+a+' and '+b+'.',ans,'Find the first common multiple.','factors','LCM('+a+', '+b+') = '+ans+'.','lcm');
  }

  if(t==='fractions'){
    const mode=r(1,7);
    if(mode===1){
      const den=p([4,5,6,8,10,12]),a=r(1,Math.max(1,Math.floor(den/3))),b=r(1,Math.max(1,Math.floor(den/3))),num=a+b,ans=fractionText(num,den);
      return input(a+'/'+den+' + '+b+'/'+den+' = ? (simplest form)',ans,'Add the numerators, keep the denominator, then simplify.','fractions',a+'/'+den+' + '+b+'/'+den+' = '+num+'/'+den+' = '+ans+'.','add-like');
    }
    if(mode===2){
      const den=p([5,6,8,10,12]),a=r(2,den-1),b=r(1,a-1),num=a-b,ans=fractionText(num,den);
      return input(a+'/'+den+' − '+b+'/'+den+' = ? (simplest form)',ans,'Subtract the numerators, then simplify.','fractions',a+'/'+den+' − '+b+'/'+den+' = '+num+'/'+den+' = '+ans+'.','subtract-like');
    }
    if(mode===3){
      const base=p([2,3,4,5,6]),num=r(1,base-1),k=p([2,3,4]),newDen=base*k,ans=num*k;
      return input(num+'/'+base+' = ?/'+newDen+'. Find the missing numerator.',ans,'Multiply numerator and denominator by the same number.','fractions',base+' × '+k+' = '+newDen+', so '+num+' × '+k+' = '+ans+'.','equivalent');
    }
    if(mode===4){
      const den=p([5,6,8,10,12]),a=r(1,den-1);let b=r(1,den-1);if(a===b)b=b===den-1?b-1:b+1;const ans=a>b?a+'/'+den:b+'/'+den;
      return mcq('Which fraction is greater?',ans,[a>b?b+'/'+den:a+'/'+den,'They are equal','Cannot tell'],'With equal denominators, compare numerators.','fractions',ans+' has the larger numerator.','compare-like');
    }
    if(mode===5){
      const den=p([2,3,4,5,6,8]),num=r(1,den-1),unit=r(2,12),qty=den*unit,ans=num*unit;
      return input('What is '+num+'/'+den+' of '+qty+'?',ans,'Divide by the denominator, then multiply by the numerator.','fractions',qty+' ÷ '+den+' = '+unit+', then '+unit+' × '+num+' = '+ans+'.','fraction-of-quantity');
    }
    if(mode===6&&d>=3){
      const small=p([2,3,4,5]),factor=p([2,3]),big=small*factor,a=r(1,small-1),b=r(1,big-1),num=a*factor+b,ans=fractionText(num,big);
      return input(a+'/'+small+' + '+b+'/'+big+' = ? (simplest form)',ans,'Use a common denominator.','fractions',a+'/'+small+' = '+(a*factor)+'/'+big+', so the sum is '+num+'/'+big+' = '+ans+'.','add-unlike');
    }
    const whole=r(1,4),den=p([3,4,5,6,8]),num=r(1,den-1),improper=whole*den+num;
    return input('Convert '+whole+' '+num+'/'+den+' to an improper fraction. What is the numerator over denominator '+den+'?',improper,'Multiply the whole number by the denominator, then add the numerator.','fractions',whole+' × '+den+' + '+num+' = '+improper+', so the fraction is '+improper+'/'+den+'.','mixed-to-improper');
  }

  if(t==='decimals'){
    const mode=r(1,7);
    if(mode===1){
      const hundredths=d>=3,n=hundredths?r(101,999):r(11,99),value=hundredths?(n/100).toFixed(2):(n/10).toFixed(1),place=hundredths&&Math.random()>.5?'hundredths':'tenths',digit=place==='hundredths'?n%10:hundredths?Math.floor(n/10)%10:n%10;
      return input('What digit is in the '+place+' place in '+value+'?',digit,'Look at digits to the right of the decimal point.','decimals','The digit in the '+place+' place is '+digit+'.','decimal-place');
    }
    if(mode===2){
      const scale=d>=3?100:10,a=r(1,9*scale)/scale,b=r(1,9*scale)/scale;if(a===b)return generateCore('decimals',d);const ans=Math.max(a,b).toFixed(scale===100?2:1);
      return mcq('Which decimal is greater?',ans,[Math.min(a,b).toFixed(scale===100?2:1),'They are equal','Cannot tell'],'Compare whole numbers, then tenths, then hundredths.','decimals',ans+' is greater.','compare-decimals');
    }
    if(mode===3){
      const scale=d>=3?100:10,ai=r(scale,9*scale),bi=r(1,2*scale),ans=ai+bi;
      return input((ai/scale).toFixed(scale===100?2:1)+' + '+(bi/scale).toFixed(scale===100?2:1)+' = ?',(ans/scale).toFixed(scale===100?2:1),'Align decimal points.','decimals','The sum is '+(ans/scale).toFixed(scale===100?2:1)+'.','decimal-add');
    }
    if(mode===4){
      const scale=d>=3?100:10,ai=r(2*scale,9*scale),bi=r(1,ai-1),ans=ai-bi;
      return input((ai/scale).toFixed(scale===100?2:1)+' − '+(bi/scale).toFixed(scale===100?2:1)+' = ?',(ans/scale).toFixed(scale===100?2:1),'Align decimal points before subtracting.','decimals','The difference is '+(ans/scale).toFixed(scale===100?2:1)+'.','decimal-subtract');
    }
    if(mode===5){
      const den=d>=3?100:10,num=r(1,den-1),ans=(num/den).toFixed(den===100?2:1);
      return input('Write '+num+'/'+den+' as a decimal.',ans,'Tenths have one decimal place; hundredths have two.','decimals',num+'/'+den+' = '+ans+'.','fraction-to-decimal');
    }
    if(mode===6){
      const den=d>=3?100:10,num=r(1,den-1),decimal=(num/den).toFixed(den===100?2:1),ans=fractionText(num,den);
      return input('Write '+decimal+' as a fraction in simplest form.',ans,'Write it over 10 or 100, then simplify.','decimals',decimal+' = '+num+'/'+den+' = '+ans+'.','decimal-to-fraction');
    }
    const rupees=r(20,200),paise=p([25,50,75]),val=(rupees+paise/100).toFixed(2);
    return input('₹'+rupees+' and '+paise+' paise = ₹?',val,'100 paise = ₹1.','decimals','₹'+rupees+' + ₹'+(paise/100).toFixed(2)+' = ₹'+val+'.','rupees-paise-decimal');
  }

  if(t==='measurement'){
    const mode=r(1,8);
    if(mode===1){const x=r(2,15),ans=x*100;return input(x+' metres = ? centimetres',ans,'1 m = 100 cm.','measurement',x+' × 100 = '+ans+' cm.','m-cm')}
    if(mode===2){const x=r(2,15),cm=x*100;return input(cm+' centimetres = ? metres',x,'100 cm = 1 m.','measurement',cm+' ÷ 100 = '+x+' m.','cm-m')}
    if(mode===3){const kg=r(1,9),ans=kg*1000;return input(kg+' kilograms = ? grams',ans,'1 kg = 1000 g.','measurement',kg+' × 1000 = '+ans+' g.','kg-g')}
    if(mode===4){const l=r(1,9),ans=l*1000;return input(l+' litres = ? millilitres',ans,'1 L = 1000 mL.','measurement',l+' × 1000 = '+ans+' mL.','l-ml')}
    if(mode===5){const l=r(4,18),w=r(2,12),ans=2*(l+w);return input('A rectangle is '+l+' cm by '+w+' cm. Find its perimeter in cm.',ans,'Perimeter = 2 × (length + width).','measurement','2 × ('+l+' + '+w+') = '+ans+' cm.','perimeter')}
    if(mode===6){const l=r(4,18),w=r(3,12),ans=l*w;return input('A rectangle is '+l+' cm by '+w+' cm. Find its area in cm².',ans,'Area = length × width.','measurement',l+' × '+w+' = '+ans+' cm².','area')}
    if(mode===7){const m=r(1,8),cm=r(1,99),ans=m*100+cm;return input(m+' m '+cm+' cm = ? cm',ans,'Convert metres to centimetres, then add the extra centimetres.','measurement',m+' m = '+(m*100)+' cm; '+(m*100)+' + '+cm+' = '+ans+' cm.','compound-length')}
    const l=r(8,20),w=r(4,12),laps=d>=4?2:1,one=2*(l+w),ans=one*laps;
    return input('A '+l+' m by '+w+' m garden needs fencing '+(laps===1?'once':'twice')+' around it. How many metres of fencing are needed?',ans,'Find the perimeter, then account for the number of rounds.','measurement','One perimeter = '+one+' m'+(laps===2?'; twice around = '+ans+' m.':'.'),'fencing');
  }

  if(t==='time'){
    const mode=r(1,6),startH=r(1,10),startM=p([0,15,30,45]),start=startH*60+startM;
    if(mode===1){
      const dur=p(d<=2?[15,30,45,60]:[45,60,75,90,105,120]),end=start+dur,ans=timeFromMinutes(end);
      return input('A programme starts at '+timeFromMinutes(start)+' and lasts '+dur+' minutes. When does it end?',ans,'Add the duration to the start time.','time',timeFromMinutes(start)+' + '+dur+' minutes = '+ans+'.','end-time');
    }
    if(mode===2){
      const dur=p(d<=2?[15,30,45]:[45,60,75,90]),end=start+dur;
      return input('A class ends at '+timeFromMinutes(end)+' and lasts '+dur+' minutes. When did it start?',timeFromMinutes(start),'Count backward by the duration.','time',timeFromMinutes(end)+' − '+dur+' minutes = '+timeFromMinutes(start)+'.','start-time');
    }
    if(mode===3){
      const dur=p([30,45,60,75,90,105,120]),end=start+dur;
      return input('How many minutes pass from '+timeFromMinutes(start)+' to '+timeFromMinutes(end)+'?',dur,'Count the minutes between the two times.','time','The elapsed time is '+dur+' minutes.','duration');
    }
    if(mode===4){
      const h=r(1,6),ans=h*60;
      return input(h+' hours = ? minutes',ans,'1 hour = 60 minutes.','time',h+' × 60 = '+ans+' minutes.','hours-minutes');
    }
    if(mode===5){
      const h=r(1,4),min=p([15,30,45]),ans=h*60+min;
      return input(h+' hours '+min+' minutes = ? minutes',ans,'Convert the hours to minutes, then add.','time',h+' × 60 + '+min+' = '+ans+' minutes.','compound-time');
    }
    const time=p([{label:'quarter past 4',a:'4:15'},{label:'half past 7',a:'7:30'},{label:'quarter to 9',a:'8:45'},{label:'quarter past 11',a:'11:15'}]);
    return mcq('Which digital time means "'+time.label+'"?',time.a,['4:45','7:15','9:15','8:15','11:45','7:45'],'Translate quarter past, half past and quarter to carefully.','time',time.label+' is '+time.a+'.','clock-language');
  }

  if(t==='money'){
    const mode=r(1,7);
    if(mode===1){const a=r(50,d<=2?500:1000),b=r(10,a),ans=a-b;return input('You have ₹'+a+' and spend ₹'+b+'. How much remains?',ans,'Subtract spending from the amount you had.','money','₹'+a+' − ₹'+b+' = ₹'+ans+'.','remaining')}
    if(mode===2){const a=r(25,300),b=r(20,250),ans=a+b;return input('An item costs ₹'+a+' and another costs ₹'+b+'. What is the total cost?',ans,'Add the two prices.','money','₹'+a+' + ₹'+b+' = ₹'+ans+'.','total')}
    if(mode===3){const cost=r(120,450),paid=p([500,1000]),ans=paid-cost;return input('A bill is ₹'+cost+'. You pay ₹'+paid+'. How much change should you receive?',ans,'Change = amount paid − bill.','money','₹'+paid+' − ₹'+cost+' = ₹'+ans+'.','change')}
    if(mode===4){const qty=r(2,8),price=r(15,90),ans=qty*price;return input(qty+' notebooks cost ₹'+price+' each. What is the total cost?',ans,'Multiply quantity by price per item.','money',qty+' × ₹'+price+' = ₹'+ans+'.','quantity-price')}
    if(mode===5){const rupees=r(5,50),ans=rupees*100;return input('₹'+rupees+' = ? paise',ans,'₹1 = 100 paise.','money',rupees+' × 100 = '+ans+' paise.','rupees-paise')}
    if(mode===6){
      const a=r(20,200),b=r(20,200);if(a===b)return generateCore('money',d);const ans='₹'+Math.max(a,b);
      return mcq('Which amount is greater?',ans,['₹'+Math.min(a,b),'They are equal','Cannot tell'],'Compare the rupee amounts.','money',ans+' is greater.','compare-money');
    }
    const qty=r(3,6),price=r(35,85),extra=r(20,100),paid=1000,cost=qty*price+extra,ans=paid-cost;
    return input('You buy '+qty+' books at ₹'+price+' each and a pen for ₹'+extra+'. You pay ₹'+paid+'. How much change do you get?',ans,'Multiply, add the pen, then subtract from the amount paid.','money','Books = ₹'+(qty*price)+'. Total = ₹'+cost+'. Change = ₹'+ans+'.','multi-step-money');
  }

  if(t==='geometry'){
    const pools=[
      mcq('How many sides does a triangle have?','3',['2','4','5'],'Tri means three.','geometry','A triangle has 3 sides.','triangle-sides'),
      mcq('How many vertices does a rectangle have?','4',['2','3','5'],'Vertices are corners.','geometry','A rectangle has 4 vertices.','rectangle-vertices'),
      mcq('Which shape has no straight sides?','Circle',['Triangle','Square','Rectangle'],'Think about the boundary.','geometry','A circle has a curved boundary.','circle'),
      mcq('How many right angles does a rectangle have?','4',['1','2','3'],'Each corner is a right angle.','geometry','A rectangle has 4 right angles.','right-angles'),
      mcq('How many pairs of parallel sides does a rectangle have?','2',['0','1','4'],'Opposite sides are parallel.','geometry','A rectangle has 2 pairs of parallel sides.','parallel'),
      mcq('How many lines of symmetry does a square have?','4',['1','2','3'],'Think of vertical, horizontal and diagonal folds.','geometry','A square has 4 lines of symmetry.','symmetry'),
      mcq('An angle smaller than 90° is called…','Acute',['Right','Obtuse','Straight'],'Compare it with a right angle.','geometry','An angle below 90° is acute.','acute'),
      mcq('An angle greater than 90° but less than 180° is called…','Obtuse',['Acute','Right','Straight'],'It is wider than a right angle.','geometry','Such an angle is obtuse.','obtuse'),
      mcq('Which quadrilateral has exactly one pair of parallel sides?','Trapezium',['Square','Rectangle','Rhombus'],'Count parallel side pairs.','geometry','A trapezium has exactly one pair of parallel sides.','trapezium'),
      mcq('A line that starts at one point and continues forever in one direction is a…','Ray',['Line segment','Line','Curve'],'A ray has one endpoint.','geometry','A ray starts at one point and extends forever in one direction.','ray')
    ];
    const max=d===1?3:d===2?5:d===3?7:10;
    return p(pools.slice(0,max));
  }

  if(t==='patterns'){
    const mode=r(1,7);
    if(mode===1){const a=r(3,30),step=r(2,d<=2?8:15),ans=a+4*step;return input('Complete: '+a+', '+(a+step)+', '+(a+2*step)+', '+(a+3*step)+', ?',ans,'Find what is added each time.','patterns','The rule is +'+step+', so the next number is '+ans+'.','add-pattern')}
    if(mode===2){const step=r(2,9),a=r(50,100),ans=a-4*step;return input('Complete: '+a+', '+(a-step)+', '+(a-2*step)+', '+(a-3*step)+', ?',ans,'Find what is subtracted each time.','patterns','The rule is −'+step+', so the next number is '+ans+'.','subtract-pattern')}
    if(mode===3){const mult=p([2,3]),a=r(1,5),ans=a*Math.pow(mult,4);return input('Complete: '+a+', '+(a*mult)+', '+(a*mult*mult)+', '+(a*Math.pow(mult,3))+', ?',ans,'Each term is multiplied by the same number.','patterns','The rule is ×'+mult+', giving '+ans+'.','multiply-pattern')}
    if(mode===4){const a=r(10,25),up=r(4,9),down=r(2,4),s1=a+up,s2=s1-down,s3=s2+up,s4=s3-down,ans=s4+up;return input('Complete: '+a+', '+s1+', '+s2+', '+s3+', '+s4+', ?',ans,'The rule alternates between two steps.','patterns','The rule is +'+up+', −'+down+', so the next number is '+ans+'.','alternating-pattern')}
    const cats=['Red','Blue','Green','Yellow'],vals=cats.map(()=>r(2,12)),max=Math.max(...vals),min=Math.min(...vals),table=cats.map((x,i)=>x+': '+vals[i]).join(' | ');
    if(mode===5){const idx=vals.indexOf(max);return input('Sticker counts — '+table+'. How many stickers are in the largest group?',max,'Find the greatest number in the data.','patterns','The largest count is '+max+' ('+cats[idx]+').','data-maximum')}
    if(mode===6){const total=vals.reduce((a,b)=>a+b,0);return input('Sticker counts — '+table+'. How many stickers are there altogether?',total,'Add all four values.','patterns',vals.join(' + ')+' = '+total+'.','data-total')}
    const diff=max-min;return input('Sticker counts — '+table+'. What is the difference between the largest and smallest groups?',diff,'Subtract the smallest value from the largest.','patterns',max+' − '+min+' = '+diff+'.','data-difference');
  }

  if(t==='word'){
    const mode=r(1,8);
    if(mode===1){const a=r(200,900),b=r(50,300),ans=a+b;return input('A library has '+a+' storybooks and buys '+b+' more. How many storybooks are there now?',ans,'Use addition.','word',a+' + '+b+' = '+ans+'.','addition-story')}
    if(mode===2){const a=r(300,900),b=r(50,Math.min(300,a)),ans=a-b;return input('A shop had '+a+' balloons and sold '+b+'. How many are left?',ans,'Use subtraction.','word',a+' − '+b+' = '+ans+'.','subtraction-story')}
    if(mode===3){const boxes=r(3,9),each=r(6,20),ans=boxes*each;return input(boxes+' boxes hold '+each+' crayons each. How many crayons are there?',ans,'Use multiplication for equal groups.','word',boxes+' × '+each+' = '+ans+'.','multiplication-story')}
    if(mode===4){const groups=r(3,9),each=r(6,18),total=groups*each;return input(total+' sweets are shared equally among '+groups+' children. How many sweets does each child get?',each,'Use division for equal sharing.','word',total+' ÷ '+groups+' = '+each+'.','division-story')}
    if(mode===5){const kids=r(3,8),each=r(15,30),extra=r(5,25),ans=kids*each+extra;return input(kids+' children collect '+each+' stickers each and the teacher adds '+extra+' more. How many stickers are there?',ans,'Multiply first, then add.','word',kids+' × '+each+' = '+(kids*each)+'; + '+extra+' = '+ans+'.','multiply-add')}
    if(mode===6){const packs=r(4,9),each=r(12,25),given=r(15,40),total=packs*each,ans=total-given;return input('A class buys '+packs+' packs of '+each+' crayons and gives away '+given+'. How many crayons remain?',ans,'Multiply first, then subtract.','word',packs+' × '+each+' = '+total+'; '+total+' − '+given+' = '+ans+'.','multiply-subtract')}
    if(mode===7){const buses=r(2,5),per=r(30,45),absent=r(5,20),ans=buses*per-absent;return input(buses+' buses can carry '+per+' students each. If '+absent+' seats are empty, how many students are travelling?',ans,'Find total seats, then subtract empty seats.','word',buses+' × '+per+' = '+(buses*per)+'; − '+absent+' = '+ans+'.','capacity-story')}
    const rows=r(4,8),seats=r(6,12),extra=r(10,30),ans=rows*seats+extra;
    return input('There are '+rows+' rows of '+seats+' chairs and '+extra+' extra chairs. How many chairs are there in all?',ans,'Multiply rows by chairs per row, then add extras.','word',rows+' × '+seats+' = '+(rows*seats)+'; + '+extra+' = '+ans+'.','array-plus-extra');
  }

  throw new Error('Unhandled topic: '+t);
}

const api={TOPICS,TOPIC_LABELS,VARIANT_COUNTS,VARIANTS_BY_TOPIC,CONCEPT_META,generate,generateForVariant,isCorrect,validateQuestion,reduceFraction,gcd,lcm};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.MathQuestionEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
