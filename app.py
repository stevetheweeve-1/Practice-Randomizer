#!/usr/bin/env python3
"""A tiny local app that serves a random PDF from ./pdfs."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
import json
import random


ROOT = Path(__file__).parent.resolve()
PDF_DIRECTORY = ROOT / "pdfs"


class AppHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if urlparse(self.path).path == "/api/random-pdf":
            self.send_random_pdf()
            return
        if urlparse(self.path).path == "/api/pdfs":
            self.send_pdf_list()
            return
        super().do_GET()

    def available_pdfs(self):
        # rglob makes PDFs in subfolders available too.
        return [
            file for file in PDF_DIRECTORY.rglob("*")
            if file.is_file() and file.suffix.lower() == ".pdf"
        ] if PDF_DIRECTORY.exists() else []

    def send_pdf_list(self):
        pdfs = self.available_pdfs()
        response = {
            "pdfs": [
                {"pdf": file.relative_to(ROOT).as_posix(), "name": file.name}
                for file in pdfs
            ]
        }
        self.send_json(response)

    def send_random_pdf(self):
        pdfs = self.available_pdfs()

        if not pdfs:
            response = {"pdf": None, "count": 0}
        else:
            chosen = random.choice(pdfs)
            response = {
                "pdf": chosen.relative_to(ROOT).as_posix(),
                "name": chosen.name,
                "count": len(pdfs),
            }
        self.send_json(response)

    def send_json(self, response):

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(json.dumps(response).encode("utf-8"))


if __name__ == "__main__":
    PDF_DIRECTORY.mkdir(exist_ok=True)
    address = ("127.0.0.1", 8000)
    print(f"Open http://{address[0]}:{address[1]}")
    print(f"Add PDFs to: {PDF_DIRECTORY}")
    ThreadingHTTPServer(address, AppHandler).serve_forever()
