// Run with node scripts/check-game.cjs. Exercise the real game script with a small DOM stub.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const words = fs.readFileSync(path.join(root, 'assets/js/words.js'), 'utf8');
const game = fs.readFileSync(path.join(root, 'assets/js/game.js'), 'utf8');

function boot(store = {}, random = Math.random) {
  const nodes = {};
  function element() {
    return {
      children: [], style: { setProperty() {} }, dataset: {},
      classList: { toggle() {}, add() {}, remove() {} },
      append(child) { this.children.push(child); },
      set innerHTML(value) { this.children = []; },
      setAttribute() {}, addEventListener() {},
    };
  }
  const context = {
    document: {
      querySelector: selector => nodes[selector] ||= element(),
      querySelectorAll: () => [], createElement: element,
      documentElement: element(), addEventListener() {},
    },
    localStorage: {
      getItem: key => store[key] ?? null,
      setItem: (key, value) => { store[key] = String(value); },
    },
    Math: Object.assign(Object.create(Math), { random }),
    setTimeout() {},
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(words, context);
  vm.runInContext(game.replace('  load();',
    '  load(); window.test = { newGame, input, getGame: () => game };'), context);
  return { context, store, nodes, test: context.test };
}

const first = boot({ gooseLength: '5' });
const targets = first.context.GOOSE_TARGETS[5];
assert.equal(targets.length, 1000);
assert.equal(new Set(targets).size, 1000);
assert.equal(first.context.GOOSE_WORDS[5].length, 8636);
assert(targets.every(word => first.context.GOOSE_WORDS[5].includes(word)));
assert.equal(first.nodes['#board'].children.length, 30);
assert.equal(first.nodes['#keyboard'].children.length, 3);

// Every target is reachable, including entries past the original twelve.
for (let i = 0; i < targets.length; i++) {
  delete first.store.gooseLastAnswer5;
  delete first.store.gooseGame;
  first.context.Math.random = () => (i + 0.5) / targets.length;
  assert.equal(first.test.newGame(5).answer, targets[i]);
}

// Deterministic randomness still cannot repeat the last answer.
first.context.Math.random = () => 0;
for (const length of [5, 6, 7]) {
  let previous = first.test.newGame(length).answer;
  for (let i = 0; i < 100; i++) {
    const next = first.test.newGame(length).answer;
    assert.notEqual(next, previous);
    previous = next;
  }
}

const saved = answer => JSON.stringify({
  length: 5, answer, guesses: [], current: '', keys: {}, finished: false, won: false,
});
const resumed = boot({ gooseLength: '5', gooseGame: saved('beach') });
assert.equal(resumed.test.getGame().answer, 'beach');
assert.notEqual(resumed.test.newGame(5).answer, 'beach');
const refreshed = boot(resumed.store);
assert.equal(refreshed.test.getGame().answer, 'beach');
assert.notEqual(refreshed.test.newGame(5).answer, 'beach');
const completed = JSON.parse(saved('beach'));
completed.finished = true;
assert.notEqual(boot({ gooseLength: '5', gooseGame: JSON.stringify(completed) }).test.getGame().answer, 'beach');

const outsidePool = first.context.GOOSE_WORDS[5].find(word => !targets.includes(word));
assert.notEqual(boot({ gooseLength: '5', gooseGame: saved(outsidePool) }).test.getGame().answer, outsidePool);
// A dictionary word outside the answer pool must still be accepted as a guess.
for (const letter of outsidePool) refreshed.test.input(letter);
refreshed.test.input('ENTER');
assert.equal(refreshed.test.getGame().guesses[0].word, outsidePool);
console.log('Passed: 1,000 unique reachable answers, 8,636 guesses, rendering, saved games, and repeat prevention.');
