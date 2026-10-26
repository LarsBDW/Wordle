"""Build GooseWordle's 5-, 6-, and 7-letter dictionary from ENABLE data."""

import json
from pathlib import Path

SOURCE = Path("assets/data/enable1.txt")
OUTPUT = Path("assets/js/words.js")

words = SOURCE.read_text(encoding="utf-8").splitlines()
groups = {
    length: sorted({word.lower() for word in words if len(word) == length and word.isascii() and word.isalpha()})
    for length in (5, 6, 7)
}

# Every dictionary word is eligible, rather than repeating twelve fixed answers.
targets = groups
assert all(len(entries) >= 1000 for entries in targets.values())

OUTPUT.write_text(
    "/* Public-domain ENABLE English word list. */\n"
    f"window.GOOSE_WORDS={json.dumps(groups, separators=(',', ':'))};\n"
    "window.GOOSE_TARGETS=window.GOOSE_WORDS;\n",
    encoding="utf-8",
)

print({length: len(entries) for length, entries in groups.items()})
