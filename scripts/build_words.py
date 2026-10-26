"""Build GooseWordle's 5-, 6-, and 7-letter dictionary from ENABLE data."""

import json
from pathlib import Path

SOURCE = Path("assets/data/enable1.txt")
OUTPUT = Path("assets/js/words.js")

if SOURCE.exists():
    words = SOURCE.read_text(encoding="utf-8").splitlines()
else:
    # The deployed dictionary also lets a checkout rebuild without ENABLE's source.
    existing = OUTPUT.read_text(encoding="utf-8")
    dictionary = json.loads(existing.split("window.GOOSE_WORDS=", 1)[1].split(";", 1)[0])
    words = [word for entries in dictionary.values() for word in entries]
groups = {
    length: sorted({word.lower() for word in words if len(word) == length and word.isascii() and word.isalpha()})
    for length in (5, 6, 7)
}

# Five-letter answers are selected for familiarity; all words remain valid guesses.
targets = dict(groups)
targets[5] = json.loads(Path("assets/data/common-answers-5.json").read_text(encoding="utf-8"))
assert len(targets[5]) == len(set(targets[5])) == 1000
assert set(targets[5]).issubset(groups[5])
assert all(len(entries) >= 1000 for entries in targets.values())

OUTPUT.write_text(
    "/* Public-domain ENABLE English word list. */\n"
    f"window.GOOSE_WORDS={json.dumps(groups, separators=(',', ':'))};\n"
    f"window.GOOSE_TARGETS={json.dumps(targets, separators=(',', ':'))};\n",
    encoding="utf-8",
)

print({length: len(entries) for length, entries in groups.items()})
