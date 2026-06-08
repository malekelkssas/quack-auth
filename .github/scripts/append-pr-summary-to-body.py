#!/usr/bin/env python3
"""Merge AI summary markdown into PR body with a stable HTML comment marker."""

from __future__ import annotations

import os
import re
from pathlib import Path

MARKER = "<!-- pr-change-summary:cursor -->"


def main() -> None:
    summary = Path("summary.md").read_text(encoding="utf-8").strip()
    existing = os.environ.get("PR_BODY", "") or ""
    block = f"{MARKER}\n## Change summary (AI)\n\n{summary}\n"

    if MARKER in existing:
        new_body = re.sub(
            rf"{re.escape(MARKER)}[\s\S]*",
            block.rstrip() + "\n",
            existing,
            count=1,
        )
    else:
        prefix = existing.rstrip() + "\n\n" if existing.strip() else ""
        new_body = prefix + block

    Path("pr-body.md").write_text(new_body, encoding="utf-8")


if __name__ == "__main__":
    main()
