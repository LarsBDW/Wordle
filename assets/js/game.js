(() => {
  const $ = s => document.querySelector(s);
  const board = $('#board');
  const keyboard = $('#keyboard');
  const msg = $('#message');

  const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

  let game;
  let settings = JSON.parse(
    localStorage.getItem('gooseSettings') ||
    '{"animations":true,"sound":true}'
  );

  // Load saved game or start a new game
  const load = () => {
    const saved = JSON.parse(
      localStorage.getItem('gooseGame') || 'null'
    );

    game =
      saved &&
      saved.answer &&
      saved.guesses?.length < 6 &&
      !saved.finished
        ? saved
        : newGame(+localStorage.getItem('gooseLength') || 6);

    render();

    if (game.finished && game.won) {
      confetti();
    }
  };

  // IMPORTANT:
  // GOOSE_ANSWERS = only words that can be the answer.
  // GOOSE_WORDS   = all words that are allowed as guesses.
  const newGame = len => ({
    length: len,
    answer:
      GOOSE_ANSWERS[len][
        Math.floor(Math.random() * GOOSE_ANSWERS[len].length)
      ],
    guesses: [],
    current: '',
    finished: false,
    won: false,
    keys: {}
  });

  const save = () => {
    localStorage.setItem('gooseGame', JSON.stringify(game));
  };

  function render() {
    document.documentElement.classList.toggle(
      'no-motion',
      !settings.animations
    );

    $('#animations').checked = settings.animations;
    $('#sound').checked = settings.sound;

    document
      .querySelectorAll('[data-length]')
      .forEach(b =>
        b.classList.toggle(
          'selected',
          +b.dataset.length === game.length
        )
      );

    board.style.setProperty('--columns', game.length);
    board.innerHTML = '';

    // Render board
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < game.length; c++) {
        const rowWord =
          game.guesses[r]?.word ||
          (r === game.guesses.length ? game.current : '');

        const tile = document.createElement('div');
        const letter = rowWord[c] || '';

        tile.className = 'tile';
        tile.textContent = letter;
        tile.setAttribute('role', 'gridcell');

        if (game.guesses[r]) {
          tile.classList.add(
            game.guesses[r].states[c],
            'revealed'
          );
        }

        if (r === game.guesses.length && letter) {
          tile.classList.add('filled');
        }

        board.append(tile);
      }
    }

    // Render keyboard
    keyboard.innerHTML = '';
    keyboard.style.pointerEvents = 'auto';
    keyboard.style.position = 'relative';
    keyboard.style.zIndex = '10000';
    keyboard.style.touchAction = 'manipulation';

    rows.forEach((line, i) => {
      const row = document.createElement('div');

      row.className = 'key-row';

      if (i === 2) {
        row.append(key('ENTER', 'wide'));
      }

      [...line].forEach(l => {
        row.append(key(l, game.keys[l] || ''));
      });

      if (i === 2) {
        row.append(key('⌫', 'wide'));
      }

      keyboard.append(row);
    });
  }

  function key(label, state) {
    const b = document.createElement('button');

    b.type = 'button';
    b.className = 'key ' + state;
    b.dataset.key = label;

    if (/^[a-z]$/.test(label)) {
      b.textContent = label.toUpperCase();
    } else {
      b.textContent = label;
    }

    b.setAttribute(
      'aria-label',
      label === '⌫' ? 'Backspace' : label
    );

    b.tabIndex = 0;
    b.disabled = false;

    // Keep keyboard above decorative elements
    b.style.pointerEvents = 'auto';
    b.style.position = 'relative';
    b.style.zIndex = '10000';
    b.style.touchAction = 'manipulation';

    const activate = event => {
      event.preventDefault();
      event.stopPropagation();
      input(label.toUpperCase());
    };

    b.addEventListener('click', activate);

    return b;
  }

  function evaluate(word, answer) {
    const out = Array(word.length).fill('absent');
    const pool = [...answer];

    // Correct letters
    [...word].forEach((l, i) => {
      if (l === answer[i]) {
        out[i] = 'correct';
        pool[i] = null;
      }
    });

    // Present letters
    [...word].forEach((l, i) => {
      if (out[i] === 'correct') {
        return;
      }

      const p = pool.indexOf(l);

      if (p > -1) {
        out[i] = 'present';
        pool[p] = null;
      }
    });

    return out;
  }

  function jumpscare() {
    const scare = document.querySelector('#goose-jumpscare');
    if (!scare) return;

    scare.classList.add('show');
    scare.setAttribute('aria-hidden', 'false');

    setTimeout(() => {
      scare.classList.remove('show');
      scare.setAttribute('aria-hidden', 'true');
    }, 3000);
  }

  function submit() {
    // Special easter egg: "goose" always triggers the jumpscare,
    // regardless of the selected Wordle length or dictionary.
    if (game.current.toLowerCase() === 'goose') {
      game.current = '';
      render();
      jumpscare();
      return;
    }

    if (game.finished) {
      return;
    }

    if (game.current.length < game.length) {
      return notice('Not enough letters');
    }

    // GOOSE_WORDS contains ALL valid guesses.
    const dict = GOOSE_WORDS[game.length];

    // GOOSE_ANSWERS contains the smaller list of possible answers.
    // Therefore:
    // - Any word from GOOSE_WORDS can be guessed.
    // - Only words from GOOSE_ANSWERS can be selected as answers.
    if (
      !dict.includes(game.current) &&
      !GOOSE_ANSWERS[game.length].includes(game.current)
    ) {
      return shake('That goose does not know this word');
    }

    const states = evaluate(
      game.current,
      game.answer
    );

    const guess = {
      word: game.current,
      states
    };

    game.guesses.push(guess);

    states.forEach((s, i) => {
      const l = game.current[i];
      const old = game.keys[l];

      if (
        !old ||
        s === 'correct' ||
        (s === 'present' && old === 'absent')
      ) {
        game.keys[l] = s;
      }
    });

    easter(game.current);

    game.current = '';

    save();
    render();

    const tiles = [...board.children].slice(
      (game.guesses.length - 1) * game.length,
      game.guesses.length * game.length
    );

    tiles.forEach((t, i) => {
      setTimeout(
        () => t.classList.add('flip'),
        i * 130
      );
    });

    const good = states.filter(
      s => s === 'correct'
    ).length;

    if (good === game.length) {
      setTimeout(
        () => end(true),
        game.length * 130 + 300
      );
    } else if (game.guesses.length === 6) {
      setTimeout(
        () => end(false),
        game.length * 130 + 300
      );
    } else if (good >= 4) {
      react('Nice!', true);
    } else if (good >= 2) {
      react('Almost...');
    } else if (good) {
      react('Nice!');
    }
  }

  function input(k) {
    if (game.finished) {
      return;
    }

    k = String(k).toUpperCase();

    if (k === 'ENTER') {
      return submit();
    }

    if (k === '⌫' || k === 'BACKSPACE') {
      game.current = game.current.slice(0, -1);
      render();
      return;
    }

    if (
      /^[A-Z]$/.test(k) &&
      game.current.length < game.length
    ) {
      game.current += k.toLowerCase();
      render();
    }
  }

  function notice(t) {
    msg.textContent = t;
    msg.classList.add('show');

    setTimeout(
      () => msg.classList.remove('show'),
      1300
    );
  }

  function shake(t) {
    notice(t);

    board.classList.add('shake');

    setTimeout(
      () => board.classList.remove('shake'),
      500
    );
  }

  function react(t, all = false) {
    const bubbles = all
      ? [...document.querySelectorAll('.bubble')]
      : [document.querySelector('.friend .bubble')];

    bubbles.forEach(b => {
      b.textContent = t;
      b.classList.add('show');
    });

    setTimeout(
      () =>
        bubbles.forEach(b =>
          b.classList.remove('show')
        ),
      1700
    );
  }

  function honk(force = false) {
    if (settings.sound || force) {
      const audio = new Audio(
        'assets/audio/honk-sound.mp3'
      );

      audio.volume = 0.55;

      audio.play().catch(() => {});
    }

    react('Honk!', true);
  }

  function confetti() {
    const box = $('#confetti');

    box.innerHTML = Array.from(
      { length: 450 },
      (_, i) =>
        `<i style="--x:${Math.round(
          Math.random() * 100
        )}%;--d:${0.7 +
          Math.random() * 1.1}s;--r:${Math.round(
          Math.random() * 500
        )}deg"></i>`
    ).join('');

    box.classList.add('show');
  }

  function stopConfetti() {
    const box = $('#confetti');

    box.classList.remove('show');
    box.innerHTML = '';
  }

  function easter(w) {
    if (w === 'goose') {
      react('Honk honk!', true);

      document
        .querySelector('.flying-goose')
        .classList.add('fly-now');
    }

    if (w === 'honk') {
      honk();
    }

    if (w === 'egg') {
      $('#egg').classList.add('show');
    }

    if (w === 'fish') {
      $('#fish').classList.add('jump');

      setTimeout(
        () =>
          $('#fish').classList.remove('jump'),
        1000
      );
    }

    if (w === 'king') {
      document
        .querySelectorAll('.goose,.flying-goose')
        .forEach(g =>
          g.classList.add('crowned')
        );

      setTimeout(
        () =>
          document
            .querySelectorAll('.goose,.flying-goose')
            .forEach(g =>
              g.classList.remove('crowned')
            ),
        1800
      );
    }
  }

  function end(won) {
    game.finished = true;
    game.won = won;

    save();

    let st = JSON.parse(
      localStorage.getItem('gooseStats') ||
        '{"played":0,"wins":0,"streak":0,"best":0,"dist":[0,0,0,0,0,0]}'
    );

    st.played++;

    if (won) {
      st.wins++;
      st.streak++;
      st.best = Math.max(
        st.best,
        st.streak
      );

      st.dist[game.guesses.length - 1]++;

      react('Nice!', true);
      honk();
      confetti();

      document
        .querySelectorAll('.goose,.flying-goose')
        .forEach(g =>
          g.classList.add('crowned')
        );

      document
        .querySelector('.game')
        .classList.add('celebrate');
    } else {
      st.streak = 0;
      react('Honk?', true);
    }

    localStorage.setItem(
      'gooseStats',
      JSON.stringify(st)
    );

    $('#result-icon').textContent = won
      ? '🎉🪿'
      : '🪿';

    $('#result-title').textContent = won
      ? 'HONK! You got it!'
      : 'Honk? So close!';

    $('#result-copy').innerHTML =
      `The word was:<strong>${game.answer.toUpperCase()}</strong>`;

    setTimeout(
      () => $('#result-modal').showModal(),
      300
    );
  }

  function stats() {
    let s = JSON.parse(
      localStorage.getItem('gooseStats') ||
        '{"played":0,"wins":0,"streak":0,"best":0,"dist":[0,0,0,0,0,0]}'
    );

    const pct = s.played
      ? Math.round((s.wins / s.played) * 100)
      : 0;

    $('#statistics').innerHTML =
      `<div class="statline">
        <b>${s.played}</b>
        <span>Played</span>

        <b>${pct}%</b>
        <span>Wins</span>

        <b>${s.streak}</b>
        <span>Streak</span>

        <b>${s.best}</b>
        <span>Best</span>
      </div>

      <h3>Guess distribution</h3>

      ${s.dist
        .map(
          (n, i) =>
            `<div class="bar">
              <i style="width:${Math.max(
                18,
                n * 35
              )}px">
                ${i + 1} &nbsp; ${n}
              </i>
            </div>`
        )
        .join('')}`;
  }

  // Physical keyboard
  document.addEventListener('keydown', e => {
    if (document.querySelector('dialog[open]')) {
      return;
    }

    input(e.key.toUpperCase());
  });

  // On-screen keyboard
  keyboard.addEventListener('click', e => {
    if (e.target.dataset.key) {
      input(e.target.dataset.key);
    }
  });

  // Word length buttons
  document
    .querySelectorAll('[data-length]')
    .forEach(b => {
      b.onclick = () => {
        if (
          !game.finished &&
          !confirm(
            'Start a new game with a different word length?'
          )
        ) {
          return;
        }

        stopConfetti();

        game = newGame(+b.dataset.length);

        localStorage.setItem(
          'gooseLength',
          game.length
        );

        save();
        render();
      };
    });

  // Play again
  $('.play-again').onclick = () => {
    stopConfetti();

    game = newGame(game.length);

    save();

    $('#result-modal').close();

    $('.game').classList.remove(
      'celebrate'
    );

    document
      .querySelectorAll('.goose,.flying-goose')
      .forEach(g =>
        g.classList.remove('crowned')
      );

    render();
  };

  // Goose buttons
  document
    .querySelectorAll('.goose-sprite')
    .forEach(g => {
      g.onclick = () => honk(true);
    });

  // Close buttons
  document
    .querySelectorAll('.close')
    .forEach(b => {
      b.onclick = () =>
        b.closest('dialog').close();
    });

  // Settings
  $('.settings-toggle').onclick = () =>
    $('#settings-modal').showModal();

  // Statistics
  $('.stats-toggle').onclick = () => {
    stats();
    $('#stats-modal').showModal();
  };

  // Sound setting
  $('#sound').onchange = e => {
    settings.sound = e.target.checked;

    localStorage.setItem(
      'gooseSettings',
      JSON.stringify(settings)
    );
  };

  // Animation setting
  $('#animations').onchange = e => {
    settings.animations = e.target.checked;

    localStorage.setItem(
      'gooseSettings',
      JSON.stringify(settings)
    );

    render();
  };

  // Reset game data
  $('#reset-data').onclick = () => {
    if (
      confirm(
        'Reset all GooseWordle games and statistics?'
      )
    ) {
      localStorage.removeItem('gooseGame');
      localStorage.removeItem('gooseStats');

      location.reload();
    }
  };

  // Start
  load();
})();