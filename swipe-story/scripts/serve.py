# serve.py: serve this folder for review. Extra mounts let absolute paths
# the page uses in production resolve locally:
#   python3 serve.py 4700 /floor/=../../public/floor /decks/=../../public/decks
import http.server, os, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4700
MOUNTS = [a.split('=', 1) for a in sys.argv[2:] if '=' in a]
class H(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        p = path.split('?')[0].split('#')[0]
        for pre, src in MOUNTS:
            if p.startswith(pre):
                return os.path.join(os.path.abspath(os.path.join(ROOT, src)), p[len(pre):])
        return os.path.join(ROOT, p.lstrip('/'))
    def log_message(self, *a): pass
print(f'Serving {ROOT} at http://127.0.0.1:{PORT}/')
http.server.ThreadingHTTPServer(('127.0.0.1', PORT), H).serve_forever()
