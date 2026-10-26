# Five-letter answer selection

`common-answers-5.json` contains exactly 1,000 unique five-letter answers.
Candidates were ranked using the Google 10,000 English frequency list:
https://github.com/first20hours/google-10000-english

The selection intersects that list with the game's existing ENABLE dictionary,
filters names, explicit terms and some technical abbreviations, and takes the
first 1,000 remaining words. Frequency is a guide to familiarity, not a guarantee
that every player will know every answer. Plurals and inflected words are allowed.

All 8,636 five-letter dictionary entries remain valid guesses. Six- and
seven-letter answer pools are unchanged. Run `scripts/build_words.py` to rebuild
the browser dictionary using this saved selection.
