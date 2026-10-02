#!/usr/bin/env python3
"""A tiny local server for the Practice Randomizer web app."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).parent.resolve()


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)


if __name__ == "__main__":
    address = ("127.0.0.1", 8000)
    print(f"Open http://{address[0]}:{address[1]}")
    ThreadingHTTPServer(address, AppHandler).serve_forever()
