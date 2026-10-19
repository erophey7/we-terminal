// Все языки интерфейса должны иметь тот же набор ключей, что и английский.
import assert from 'node:assert/strict';
import { DEFAULT_LANGUAGE, LANGUAGES, MESSAGES, translator } from './i18n.js';

assert.equal(DEFAULT_LANGUAGE, 'en');
const base = Object.keys(MESSAGES.en).sort();
for (const lang of Object.keys(LANGUAGES)) {
  assert.ok(MESSAGES[lang], 'messages for ' + lang);
  assert.deepEqual(Object.keys(MESSAGES[lang]).sort(), base, 'keys of ' + lang + ' match en');
  for (const v of Object.values(MESSAGES[lang])) assert.ok(typeof v === 'string' && v.length, 'non-empty string in ' + lang);
}
assert.equal(translator('xx')('copy'), 'Copy');        // неизвестный язык -> английский
assert.equal(translator('ru')('copy'), 'Копировать');
assert.equal(translator('en')('nope'), 'nope');         // неизвестный ключ -> сам ключ
console.log('i18n OK:', Object.keys(LANGUAGES).join(' '));
