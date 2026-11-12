#!/usr/bin/env python3
"""Fetch ynet breaking-news RSS and write data/news.json (only if headlines changed)."""
import html
import json
import os
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

FEEDS = [
    "https://www.ynet.co.il/Integration/StoryRss1854.xml",
    "https://www.ynet.co.il/Integration/StoryRss2.xml",
]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "news.json")
MAX_ITEMS = 15


def clean(text):
    text = html.unescape(text or "")
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (lobby-screen news fetcher)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    root = ET.fromstring(data)
    items = []
    for item in root.iter("item"):
        title = clean(item.findtext("title"))
        if title and title not in items:
            items.append(title)
        if len(items) >= MAX_ITEMS:
            break
    if not items:
        raise ValueError("no items in feed")
    return items


def main():
    items = None
    for url in FEEDS:
        try:
            items = fetch(url)
            print(f"fetched {len(items)} items from {url}")
            break
        except Exception as e:  # noqa: BLE001
            print(f"failed {url}: {e}", file=sys.stderr)
    if not items:
        print("all feeds failed; keeping the existing news.json", file=sys.stderr)
        return 0
    try:
        with open(OUT, encoding="utf-8") as f:
            old = json.load(f).get("items")
    except Exception:  # noqa: BLE001
        old = None
    if old == items:
        print("headlines unchanged")
        return 0
    payload = {"updated": datetime.now(timezone.utc).isoformat(timespec="seconds"), "items": items}
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("news.json updated")
    return 0


if __name__ == "__main__":
    sys.exit(main())
