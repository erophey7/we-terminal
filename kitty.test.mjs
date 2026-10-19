import { ApcSplitter } from './kitty.js';
import assert from 'node:assert/strict';

const E = '\x1b';
const ST = E + '\\';
const stream = 'hello' + E + '[31mred' + E + '_Ga=T,i=1;QUJD' + ST + 'world' + E + '_Gm=1;xx' + ST + 'tail';

const flat = (segs) => segs.map((s) => (s.text !== undefined ? 'T:' + s.text : 'A:' + s.apc));
const norm = (arr) => {
  const o = [];
  for (const s of arr) {
    const l = o[o.length - 1];
    if (s.text !== undefined && l && l.text !== undefined) l.text += s.text;
    else o.push({ ...s });
  }
  return o;
};

let sp = new ApcSplitter();
const expected = norm(sp.push(stream));
console.log(flat(expected));
assert.deepEqual(flat(expected), ['T:hello\x1b[31mred', 'A:a=T,i=1;QUJD', 'T:world', 'A:m=1;xx', 'T:tail']);

// любое разбиение на два чанка
for (let n = 1; n < stream.length; n++) {
  sp = new ApcSplitter();
  const got = [...sp.push(stream.slice(0, n)), ...sp.push(stream.slice(n))];
  const c = sp.takeCarry();
  if (c) got.push({ text: c });
  assert.deepEqual(norm(got), expected, 'split at ' + n);
}
// по одному символу
sp = new ApcSplitter();
const g = [];
for (const ch of stream) g.push(...sp.push(ch));
const c = sp.takeCarry();
if (c) g.push({ text: c });
assert.deepEqual(norm(g), expected, '1-char');

// одинокий ESC в конце отдаётся через takeCarry
sp = new ApcSplitter();
assert.deepEqual(sp.push('ab' + E), [{ text: 'ab' }]);
assert.equal(sp.takeCarry(), E);

// чужой APC уходит в xterm нетронутым
sp = new ApcSplitter();
const X = E + '_Xfoo' + ST;
assert.deepEqual(sp.push(X), [{ text: X }]);

// переполнение: пакет отбрасывается, поток продолжается
sp = new ApcSplitter(10);
const r = sp.push(E + '_G' + 'a'.repeat(50));
r.push(...sp.push('bbb' + ST + 'z'));
assert.deepEqual(r, [{ apc: null }, { text: 'z' }]);

console.log('splitter OK');
