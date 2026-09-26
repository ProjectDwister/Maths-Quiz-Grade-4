const assert = require('assert');
const E = require('../questions.js');

const cleanNum = s => Number(String(s).replace(/,/g, ''));
let count = 0;
let mcqCount = 0;
const variants = Object.fromEntries(E.TOPICS.map(t => [t, new Set()]));

function semanticCheck(q) {
  let m;

  if (q.t === 'operations' && (m = q.q.match(/^([\d,]+) ([+−]) ([\d,]+) = \?$/))) {
    const a = cleanNum(m[1]), b = cleanNum(m[3]);
    const expected = m[2] === '+' ? a + b : a - b;
    assert.strictEqual(Number(q.a), expected, q.q);
  }

  if (q.t === 'multdiv' && (m = q.q.match(/^([\d,]+) ([×÷]) ([\d,]+) = \?$/))) {
    const a = cleanNum(m[1]), b = cleanNum(m[3]);
    const expected = m[2] === '×' ? a * b : a / b;
    assert.strictEqual(Number(q.a), expected, q.q);
  }

  if (q.t === 'factors') {
    if ((m = q.q.match(/^Which is a factor of (\d+)\?$/))) {
      const n = Number(m[1]), answer = Number(q.a);
      assert.strictEqual(n % answer, 0, q.q);
      for (const option of q.o) {
        if (Number(option) !== answer) assert.notStrictEqual(n % Number(option), 0, q.q + ' | ' + option);
      }
    }
    if ((m = q.q.match(/^What is the (\d+)th multiple of (\d+)\?$/))) {
      assert.strictEqual(Number(q.a), Number(m[1]) * Number(m[2]), q.q);
    }
    if ((m = q.q.match(/^Find the (HCF|LCM) of (\d+) and (\d+)\.$/))) {
      const a = Number(m[2]), b = Number(m[3]);
      const expected = m[1] === 'HCF' ? E.gcd(a, b) : E.lcm(a, b);
      assert.strictEqual(Number(q.a), expected, q.q);
    }
  }

  if (q.t === 'decimals' && q.q.endsWith(' = ?')) {
    const tokens = q.q.slice(0, -4).trim().replace(/−/g, '-').split(/\s+/);
    let expected = Number(tokens[0]);
    for (let i = 1; i < tokens.length; i += 2) {
      expected = tokens[i] === '+' ? expected + Number(tokens[i + 1]) : expected - Number(tokens[i + 1]);
    }
    assert.ok(Math.abs(Number(q.a) - expected) < 1e-9, q.q);
  }

  if (q.t === 'measurement') {
    if ((m = q.q.match(/^(\d+) metres = \? centimetres$/))) assert.strictEqual(Number(q.a), Number(m[1]) * 100, q.q);
    if ((m = q.q.match(/^(\d+) centimetres = \? metres$/))) assert.strictEqual(Number(q.a), Number(m[1]) / 100, q.q);
    if ((m = q.q.match(/^A rectangle is (\d+) cm long and (\d+) cm wide\. What is its perimeter in cm\?$/))) {
      assert.strictEqual(Number(q.a), 2 * (Number(m[1]) + Number(m[2])), q.q);
    }
    if ((m = q.q.match(/^What is the area of a (\d+) cm × (\d+) cm rectangle in cm²\?$/))) {
      assert.strictEqual(Number(q.a), Number(m[1]) * Number(m[2]), q.q);
    }
  }

  if (q.t === 'money' || q.t === 'word') {
    const numericAnswer = Number(String(q.a).replace(/[₹,]/g, ''));
    if (!Number.isNaN(numericAnswer)) assert.ok(numericAnswer >= 0, q.q);
  }
}

assert.ok(E.isCorrect('1/2', '2/4'), 'Equivalent fractions must be accepted');
assert.ok(E.isCorrect('4', '4.00'), 'Equivalent decimals must be accepted');
assert.ok(E.isCorrect('01:15', '1:15'), 'Equivalent time formatting must be accepted');

for (const topic of E.TOPICS) {
  for (let difficulty = 1; difficulty <= 5; difficulty++) {
    for (let i = 0; i < 500; i++) {
      const q = E.generate(topic, difficulty);
      count++;
      variants[topic].add(q.variant);
      const result = E.validateQuestion(q);
      assert.ok(result.ok, topic + ' L' + difficulty + ': ' + result.reason);

      assert.ok(q.solution && q.solution.trim(), 'Every question must include a worked solution');

      if (q.kind === 'mcq') {
        mcqCount++;
        assert.strictEqual(q.o.length, 4, q.q);
        assert.strictEqual(new Set(q.o).size, 4, q.q);
        assert.strictEqual(q.o.filter(x => E.isCorrect(x, q.a)).length, 1, q.q);
      }

      semanticCheck(q);
    }
  }
}

for (const topic of E.TOPICS) {
  assert.strictEqual(
    variants[topic].size,
    E.VARIANT_COUNTS[topic],
    topic + ' should exercise all ' + E.VARIANT_COUNTS[topic] + ' question variants but saw: ' + [...variants[topic]].join(', ')
  );
}

console.log('Question engine tests passed:', count, 'questions;', mcqCount, 'MCQs; all topic variants covered.');
