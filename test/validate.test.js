const test = require('node:test');
const assert = require('node:assert');
const { cleanText, validateSubmission } = require('../server/validate');
const { rankCounts, csvCell } = require('../server/results');

const cfg = {
  memberSet: new Set(['Asha', 'Bilal', 'Chen']),
  awardIds: new Set(['cp-farmer']),
};

test('cleanText strips html but keeps text like <3', () => {
  assert.strictEqual(cleanText('Man of <b>Steal</b> <script>alert(1)</script>'), 'Man of Steal');
  assert.strictEqual(cleanText('I <3 Excel & decks'), 'I <3 Excel & decks');
  assert.strictEqual(cleanText('<img src=x onerror=alert(1)>hi'), 'hi');
  assert.strictEqual(cleanText('&lt;b&gt;bold&lt;/b&gt;'), 'bold');
});

test('validateSubmission rules', () => {
  assert.equal(validateSubmission({ voter: 'Zed' }, cfg).ok, false);
  assert.equal(validateSubmission({ voter: 'Asha', awards: { 'cp-farmer': 'Asha' } }, cfg).ok, false);
  assert.equal(validateSubmission({ voter: 'Asha', taglines: [{ target: 'Bilal', text: 'x'.repeat(61) }] }, cfg).ok, false);
  const ok = validateSubmission({ voter: 'Asha', awards: { 'cp-farmer': 'Bilal', nope: 'Chen' },
    taglines: [{ target: 'Bilal', text: 'Hi' }, { target: 'Bilal', text: 'hi' }, { target: '', text: '' }] }, cfg);
  assert.equal(ok.ok, true);
  assert.deepStrictEqual(ok.value.awards, { 'cp-farmer': 'Bilal' });
  assert.equal(ok.value.taglines.length, 1);
});

test('rankCounts uses competition ranking', () => {
  assert.deepStrictEqual(rankCounts({ a: 3, b: 3, c: 1 }).map((r) => r.rank), [1, 1, 3]);
});

test('csvCell quotes and defuses formulas', () => {
  assert.strictEqual(csvCell('a,b'), '"a,b"');
  assert.strictEqual(csvCell('=1+1'), "'=1+1");
});
