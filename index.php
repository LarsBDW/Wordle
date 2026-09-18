<?php
// GooseWordle is intentionally client-side: localStorage keeps games private and persistent.
?><!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#bfe3ff"><title>GooseWordle</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
<main class="sky">
  <div class="cloud cloud-a"></div><div class="cloud cloud-b"></div><div class="cloud cloud-c"></div>
  <i class="feather f1">❧</i><i class="feather f2">❧</i><i class="feather f3">❧</i><i class="feather f4">❧</i>
  <button class="goose-sprite flying-goose" aria-label="Flying goose — honk"></button>
  <button class="corner settings-toggle" aria-label="Open settings">⚙</button>
  <button class="corner stats-toggle" aria-label="Open statistics">▥</button>

  <section class="game" aria-label="GooseWordle game">
    <header><div class="brand"><span class="brand-goose">🪿</span><h1>Goose<span>Wordle</span></h1></div><p>Guess the word in 6 tries</p></header>
    <nav class="lengths" aria-label="Choose word length">
      <button data-length="5">5 Letters</button><button data-length="6" class="selected">6 Letters</button><button data-length="7">7 Letters</button>
    </nav>
    <div id="message" class="message" aria-live="polite"></div>
    <div id="board" class="board" role="grid" aria-label="Word grid"></div>
    <div id="keyboard" class="keyboard" aria-label="On-screen keyboard"></div>
    <p class="motto">❧ &nbsp; Small words. Big honks. &nbsp; ❧</p>
  </section>

  <aside class="goose friend"><span class="bubble">Ready?</span><button class="goose-sprite standing-goose" aria-label="Goose — click to honk"></button></aside>
  <aside class="goose pond-goose"><span class="bubble">Zzz...</span><button class="goose-sprite sleepy-goose" aria-label="Sleepy goose in the water — click to honk"></button><span id="fish" class="fish">🐟</span></aside>
  <div class="grass left-grass">🌷　🌱　🌼</div><div class="grass right-grass">🌼　🌱　🌷</div>
  <div id="egg" class="egg" aria-hidden="true">🥚</div><div id="confetti" class="confetti" aria-hidden="true"></div>

  <div id="goose-jumpscare" class="goose-jumpscare" aria-hidden="true" role="dialog" aria-label="Goose jumpscare">
    <img id="goose-jumpscare-image" src="image/goose-scare" alt="Surprise goose">
  </div>

  <dialog id="result-modal" class="modal"><button class="close" aria-label="Close">×</button><div id="result-icon">🪿</div><h2 id="result-title">HONK!</h2><p id="result-copy"></p><button class="play-again">Play Again</button></dialog>
  <dialog id="settings-modal" class="modal small"><button class="close" aria-label="Close">×</button><h2>Settings</h2><label><input type="checkbox" id="sound"> Gentle sounds</label><label><input type="checkbox" id="animations" checked> Decorative animations</label><button id="reset-data" class="quiet">Reset game data</button></dialog>
  <dialog id="stats-modal" class="modal small"><button class="close" aria-label="Close">×</button><h2>Flock statistics</h2><div id="statistics"></div></dialog>
</main>
<script src="assets/js/words.js"></script><script src="assets/js/game.js"></script>
</body></html>
