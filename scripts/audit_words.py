"""Compare GooseWordle's dictionary with the independent ENABLE word list."""

import json
from pathlib import Path

game_source = Path("assets/js/words.js").read_text(encoding="utf-8")
word_data = json.loads(game_source.split("window.GOOSE_WORDS=", 1)[1].split(";\nwindow.GOOSE_TARGETS=", 1)[0])
targets = json.loads(game_source.split("window.GOOSE_TARGETS=", 1)[1].rstrip(";\n"))
enable = {
    word.strip().lower()
    for word in Path("assets/data/enable1.txt").read_text(encoding="utf-8").splitlines()
    if word.strip().isalpha()
}

report = {}
for length, words in word_data.items():
    recognized = [word for word in words if word in enable]
    report[length] = {
        "total": len(words),
        "recognized_by_enable": len(recognized),
        "not_recognized_by_enable": len(words) - len(recognized),
        "coverage_percent": round(len(recognized) / len(words) * 100, 2),
        "duplicates": len(words) - len(set(words)),
        "invalid_format": sum(not (len(word) == int(length) and word.isascii() and word.isalpha()) for word in words),
    }

all_targets = [word for group in targets.values() for word in group]
print(json.dumps(report, indent=2))
print("common_targets_not_in_enable:", [word for word in all_targets if word not in enable])
print("common_targets_not_in_game_dictionary:", [word for word in all_targets if word not in word_data[str(len(word))]])
