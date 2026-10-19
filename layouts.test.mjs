// Проверка таблиц раскладок виртуальной клавиатуры: длины строк, ширина рядов,
// физические клавиши QWERTY для Ctrl-комбинаций в любой раскладке.
import assert from 'node:assert/strict';
import { LAYOUTS, POS, layoutRows } from './kblayouts.js';

const lens = ['r0', 'r1', 'r2', 'r3'].map((r) => Array.from(POS[r]).length);
assert.deepEqual(lens, [13, 13, 11, 10]);

for (const [name, L] of Object.entries(LAYOUTS)) {
  for (let r = 0; r < 4; r++) {
    assert.equal(Array.from(L.base[r]).length, lens[r], `${name} base r${r}`);
    assert.equal(Array.from(L.shift[r]).length, lens[r], `${name} shift r${r}`);
  }
  // все ряды = 15 единиц ширины → выровнены как настоящая QWERTY
  const rows = layoutRows(name);
  assert.equal(rows.length, 4);
  for (const row of rows) assert.equal(row.reduce((s, k) => s + (k.w ?? 1), 0), 15, `${name} row width`);
  // en у символьных клавиш — физическая клавиша QWERTY
  const q = rows[1].find((k) => k.en === 'q');
  assert.ok(q, `${name}: physical Q exists`);
}

// Ctrl+С в русской раскладке = физическая C
const ruC = layoutRows('ru')[3].find((k) => k.en === 'c');
assert.equal(ruC.base, 'с');
// ключевые отличия
assert.equal(layoutRows('de')[1].find((k) => k.en === 'y').base, 'z'); // QWERTZ
assert.equal(layoutRows('fr')[1].find((k) => k.en === 'q').base, 'a'); // AZERTY
assert.equal(layoutRows('tr')[2].find((k) => k.en === "'").shift, 'İ'); // турецкая İ

console.log('layouts OK:', Object.keys(LAYOUTS).join(' '));
