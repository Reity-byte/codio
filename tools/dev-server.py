"""
Jednoduchý vývojový server pro Codio.

Stejný jako `python -m http.server`, ale posílá hlavičku Cache-Control: no-cache,
takže prohlížeč po úpravě souborů vždy načte jejich novou verzi
(ES moduly se jinak rády drží v cache).

Použití (ve složce projektu):
    python tools/dev-server.py          # http://localhost:8000
    python tools/dev-server.py 5173     # vlastní port
"""
import http.server
import sys
import os


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    # .js musí mít správný MIME typ, jinak prohlížeč ES modul odmítne
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".svg": "image/svg+xml",
        ".json": "application/json",
        ".webmanifest": "application/manifest+json",
    }

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    # server vždy servíruje kořen projektu (o složku výš než tools/)
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    # vícevláknový server – prohlížeč otevírá víc souběžných spojení
    http.server.ThreadingHTTPServer.allow_reuse_address = True
    with http.server.ThreadingHTTPServer(("", port), NoCacheHandler) as httpd:
        print(f"Codio běží na http://localhost:{port}  (Ctrl+C ukončí)")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
