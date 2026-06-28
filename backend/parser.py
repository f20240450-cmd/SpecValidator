"""
parser.py — Ingest markdown, plain text, PDF, or DOCX and split into
header-delimited sections for parallel processing.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class Section:
    title: str
    level: int          # heading depth (1–6); 0 = no heading (preamble)
    body: str
    index: int          # position in document


def _split_markdown(text: str) -> list[Section]:
    """Split markdown by ATX headings (# / ## / ### …)."""
    lines = text.splitlines(keepends=True)
    sections: list[Section] = []
    current_title = "__preamble__"
    current_level = 0
    current_lines: list[str] = []
    idx = 0

    heading_re = re.compile(r"^(#{1,6})\s+(.*?)\s*$")

    def flush():
        nonlocal idx
        body = "".join(current_lines).strip()
        if body or current_title != "__preamble__":
            sections.append(Section(current_title, current_level, body, idx))
            idx += 1

    for line in lines:
        m = heading_re.match(line.rstrip("\n"))
        if m:
            flush()
            current_level = len(m.group(1))
            current_title = m.group(2)
            current_lines = []
        else:
            current_lines.append(line)

    flush()
    return [s for s in sections if s.body.strip()]


def _extract_text_from_pdf(path: Path) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(str(path))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception as e:
        raise RuntimeError(f"PDF extraction failed: {e}") from e


def _extract_text_from_docx(path: Path) -> str:
    try:
        import docx
        doc = docx.Document(str(path))
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception as e:
        raise RuntimeError(f"DOCX extraction failed: {e}") from e


def parse_file(path: Path) -> list[Section]:
    """
    Accept .md / .txt / .pdf / .docx and return a list of Sections.
    Gracefully degrades to treating the whole file as one section if
    no headings are found.
    """
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        text = _extract_text_from_pdf(path)
    elif suffix in (".docx", ".doc"):
        text = _extract_text_from_docx(path)
    else:
        text = path.read_text(encoding="utf-8", errors="replace")

    sections = _split_markdown(text)

    if not sections:
        # No headings found — treat whole document as one section
        sections = [Section(title=path.stem, level=1, body=text.strip(), index=0)]

    return sections
