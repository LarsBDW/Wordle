"""Build GooseWordle's 5-, 6-, and 7-letter dictionary from ENABLE data."""

import json
from pathlib import Path

SOURCE = Path("assets/data/enable1.txt")
OUTPUT = Path("assets/js/words.js")

targets = {
    5: ["goose", "water", "happy", "cloud", "honey", "grape", "queen", "beach", "tiger", "magic", "lemon", "plant"],
    6: ["animal", "garden", "friend", "bright", "cheese", "castle", "rocket", "summer", "yellow", "candle", "puzzle", "forest"],
    7: ["journey", "chicken", "rainbow", "freedom", "helpful", "weather", "picture", "blanket", "kingdom", "success", "village", "morning"],
}

words = SOURCE.read_text(encoding="utf-8").splitlines()
groups = {
    length: sorted({word.lower() for word in words if len(word) == length and word.isascii() and word.isalpha()})
    for length in (5, 6, 7)
}

OUTPUT.write_text(
    "/* Public-domain ENABLE English word list. */\n"
    f"window.GOOSE_WORDS={json.dumps(groups, separators=(',', ':'))};\n"
    f"window.GOOSE_TARGETS={json.dumps(targets, separators=(',', ':'))};\n",
    encoding="utf-8",
)

print({length: len(entries) for length, entries in groups.items()})
