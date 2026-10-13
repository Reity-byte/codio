"""
Aktualizuje seznam souborů pro offline režim v sw.js (PRECACHE) a jeho VERSION.

Použití (ve složce projektu):
    python tools/build-sw.py

Spusť po přidání/přejmenování souborů. VERSION je otisk obsahu všech souborů,
takže se po každé změně vytvoří nová cache a stará se smaže.
Na GitHub Pages to dělá automaticky workflow .github/workflows/pages.yml.
"""
import hashlib
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INCLUDE_DIRS = ["css", "js", "content", "assets"]
INCLUDE_FILES = ["index.html", "manifest.webmanifest"]
EXTENSIONS = {".html", ".css", ".js", ".json", ".svg", ".png", ".webmanifest"}


def collect():
    files = list(INCLUDE_FILES)
    for d in INCLUDE_DIRS:
        for base, _, names in os.walk(os.path.join(ROOT, d)):
            for name in names:
                if os.path.splitext(name)[1] in EXTENSIONS:
                    rel = os.path.relpath(os.path.join(base, name), ROOT).replace(os.sep, "/")
                    files.append(rel)
    return sorted(set(files))


def main():
    files = collect()
    digest = hashlib.sha256()
    for f in files:
        with open(os.path.join(ROOT, f), "rb") as fh:
            digest.update(f.encode())
            digest.update(fh.read())
    version = digest.hexdigest()[:10]

    sw_path = os.path.join(ROOT, "sw.js")
    with open(sw_path, encoding="utf-8") as fh:
        sw = fh.read()

    entries = ",\n".join(f'  "./{f}"' for f in files)
    block = f'// @precache-start\nconst PRECACHE = [\n  "./",\n{entries},\n];\n// @precache-end'
    sw = re.sub(r"// @precache-start.*?// @precache-end", lambda _: block, sw, flags=re.S)
    sw = re.sub(r'const VERSION = "[^"]*"; // @version', f'const VERSION = "{version}"; // @version', sw)

    with open(sw_path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(sw)
    print(f"sw.js: {len(files)} souborů, verze {version}")


if __name__ == "__main__":
    main()
