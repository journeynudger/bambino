#!/usr/bin/env python3
"""Re-serializes post HTML into well-formed markup so React hydration matches."""
import json, glob, os
from html.parser import HTMLParser
from html import escape

VOID = {"img", "br", "hr"}
KEEP_ATTRS = {"class", "src", "href", "alt", "width", "height", "target", "rel"}
DROP_TAGS = {"form", "input", "button", "svg", "source", "picture", "script", "style", "iframe"}
BLOCK = {"div", "figure", "blockquote", "ul", "ol", "h1", "h2", "h3", "pre", "p", "hr"}

class Rebuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.stack = []

    def _close(self, tag):
        self.out.append(f"</{tag}>")

    def handle_starttag(self, tag, attrs):
        if tag in DROP_TAGS: return
        if tag in VOID:
            a = "".join(
                f' {k}="{escape(v or "", quote=True)}"' for k, v in attrs if k in KEEP_ATTRS
            )
            self.out.append(f"<{tag}{a}/>")
            return
        # block element cannot live inside <p>
        if tag in BLOCK and "p" in self.stack:
            while self.stack and self.stack[-1] != "p":
                self._close(self.stack.pop())
            self._close(self.stack.pop())  # close the p
        a = "".join(
            f' {k}="{escape(v or "", quote=True)}"' for k, v in attrs if k in KEEP_ATTRS
        )
        self.out.append(f"<{tag}{a}>")
        self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in DROP_TAGS or tag in VOID: return
        if tag not in self.stack: return  # stray closer — drop
        while self.stack and self.stack[-1] != tag:
            self._close(self.stack.pop())
        self._close(self.stack.pop())

    def handle_data(self, data):
        self.out.append(escape(data))

    def result(self):
        while self.stack:
            self._close(self.stack.pop())
        return "".join(self.out)

for path in sorted(glob.glob(os.path.join("content", "posts", "*.json"))):
    if path.endswith("index.json"): continue
    d = json.load(open(path))
    r = Rebuilder()
    r.feed(d["bodyHtml"])
    d["bodyHtml"] = r.result()
    json.dump(d, open(path, "w"), ensure_ascii=False, indent=2)
    print("rebalanced", os.path.basename(path))
