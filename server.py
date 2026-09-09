#!/usr/bin/env python3
"""
CodingJr Semantrix Web Server
Serves the self-contained Arcade, Blocks, and Dictionary Experience.
"""

import http.server
import socketserver
import os
import sys
import threading
import time

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        super().end_headers()

    def log_message(self, format, *args):
        # Suppress noisy HTTP request logs
        pass


def is_port_in_use(port):
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0


def start_server_in_thread(port=PORT):
    if is_port_in_use(port):
        print(f"[CodingJr] Server already running at http://localhost:{port}")
        return

    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("", port), Handler)
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    print(f"[CodingJr] Local server started at http://localhost:{port}")
    time.sleep(1)


def run_server(port=PORT):
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), Handler) as httpd:
        url = f"http://localhost:{port}"
        print("==================================================")
        print(f"[CodingJr] Semantrix Server running at: {url}")
        print(f"[CodingJr] Arcade & Blocks game ready locally!")
        print(f"[CodingJr] Press Ctrl+C to stop the server.")
        print("==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer shutting down gracefully.")


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run_server(port)
