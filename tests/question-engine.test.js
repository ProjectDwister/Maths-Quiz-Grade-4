const assert=require('assert');
const E=require('../questions.js');

let count=0,mcqCount=0,visualCount=0,targetedCount=0;

assert.ok(E.isCorrect('1/2','2/4'),'Equivalent fractions must be accepted');
assert.ok(E.isCorrect('4','4.00'),'Equivalent decimals must be accepted');
assert.ok(E.isCorrect('01:15','1:15'),'Equivalent clock formatting must be accepted');
assert.strictEqual(Object.keys(E.VARIANTS_BY_TOPIC).length,12,'All 12 topics need concept maps');

for(const topic of E.TOPICS){
  assert.strictEqual(E.VARIANTS_BY_TOPIC[topic].length,E.VARIANT_COUNTS[topic],topic+' concept count');
  for(const variant of E.VARIANTS_BY_TOPIC[topic]){
    assert.ok(E.CONCEPT_META[variant],topic+'::'+variant+' needs concept metadata');
    const targeted=E.generateForVariant(topic,3,variant);
    targetedCount++;
    assert.strictEqual(targeted.variant,variant,'Targeted regeneration must preserve concept');
    assert.strictEqual(targeted.concept,topic+'::'+variant,'Concept key mismatch');
    assert.ok(targeted.conceptLabel,'Concept label missing');
    assert.ok(targeted.misconception,'Misconception guidance missing');
  }

  for(let difficulty=1;difficulty<=5;difficulty++){
    for(let i=0;i<300;i++){
      const q=E.generate(topic,difficulty);
      count++;
      const result=E.validateQuestion(q);
      assert.ok(result.ok,topic+' L'+difficulty+': '+result.reason);
      assert.ok(q.solution&&q.solution.trim(),'Every question needs a worked solution');
      assert.ok(q.concept&&q.conceptLabel&&q.misconception,'Every question needs learner metadata');
      assert.ok(E.VARIANTS_BY_TOPIC[topic].includes(q.variant),'Variant belongs to wrong topic');

      if(q.visual){
        visualCount++;
        assert.ok(q.visual.type,'Visual descriptor needs a type');
        if(q.visual.type==='groups'){
          assert.ok(q.visual.groups>0&&q.visual.per>0,'Group visual must have positive dimensions');
          if(q.variant==='grouping'){
            const nums=(q.q.match(/\d+/g)||[]).map(Number);
            assert.strictEqual(q.visual.groups,nums[1],'Grouping visual group count mismatch');
            assert.strictEqual(q.visual.per,Number(q.a),'Grouping visual items-per-group mismatch');
          }
        }
      }

      if(q.kind==='mcq'){
        mcqCount++;
        assert.strictEqual(q.o.length,4,q.q);
        assert.strictEqual(new Set(q.o).size,4,q.q);
        assert.strictEqual(q.o.filter(x=>E.isCorrect(x,q.a)).length,1,q.q);
      }
    }
  }
}

assert.ok(visualCount>3000,'Visual maths should appear frequently enough');
console.log('Question engine tests passed:',count,'random questions;',targetedCount,'targeted concepts;',mcqCount,'MCQs;',visualCount,'visual questions.');
