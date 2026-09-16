// generate-words.js  —  run with:  node generate-words.js
const fs = require('fs');
const https = require('https');

const DICT_URL = 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';
const LENGTHS = [5, 6, 7];
const MAX = 4000;

const get = (url) => new Promise((res, rej) => {
  https.get(url, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => res(d)); }).on('error', rej);
});

(async () => {
  console.log('Downloading dictionary...');
  const raw = await get(DICT_URL);

  const all = raw.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(w => /^[a-z]+$/.test(w));
  console.log(`Total words: ${all.length}`);

  const out = {};
  for (const len of LENGTHS) {
    let list = [...new Set(all.filter(w => w.length === len))];
    if (list.length > MAX) list = list.slice(0, MAX);
    out[len] = list;
    console.log(`Length ${len}: ${list.length} words`);
  }

  const fmt = (arr) => arr.map(w => `    "${w}"`).join(',\n');

  const js = `/* words.js — auto-generated ${new Date().toISOString()} */
/* Source: dwyl/english-words (words_alpha.txt) */

window.GOOSE_WORDS = {
  5: [
${fmt(out[5])}
  ],
  6: [
${fmt(out[6])}
  ],
  7: [
${fmt(out[7])}
  ]
};

window.GOOSE_TARGETS = {
  5: ${JSON.stringify(out[5].slice(0, 500))},
  6: ${JSON.stringify(out[6].slice(0, 500))},
  7: ${JSON.stringify(out[7].slice(0, 500))}
};
`;

  fs.writeFileSync('words.js', js, 'utf8');
  console.log('\n✅ words.js written.');
})();