from __future__ import annotations

import re
import sys
import zlib
from pathlib import Path


STREAM_RE = re.compile(rb"stream\r?\n(.*?)\r?\nendstream", re.S)
TEXT_OBJ_RE = re.compile(rb"BT(.*?)ET", re.S)
STRING_RE = re.compile(rb"\((?:\\.|[^\\()])*\)\s*Tj")
ARRAY_RE = re.compile(rb"\[(.*?)\]\s*TJ", re.S)
PLAIN_STR_RE = re.compile(rb"\((?:\\.|[^\\()])*\)")


def pdf_unescape(value: bytes) -> str:
    inner = value[1:-1]
    out = bytearray()
    i = 0
    while i < len(inner):
        ch = inner[i]
        if ch != 0x5C:
            out.append(ch)
            i += 1
            continue
        i += 1
        if i >= len(inner):
            break
        esc = inner[i]
        if esc in b"nrtbf":
            out.extend({
                ord("n"): b"\n",
                ord("r"): b"\r",
                ord("t"): b"\t",
                ord("b"): b"\b",
                ord("f"): b"\f",
            }[esc])
            i += 1
        elif esc in b"()\\":
            out.append(esc)
            i += 1
        elif 48 <= esc <= 55:
            oct_digits = bytes([esc])
            i += 1
            for _ in range(2):
                if i < len(inner) and 48 <= inner[i] <= 55:
                    oct_digits += bytes([inner[i]])
                    i += 1
                else:
                    break
            out.append(int(oct_digits, 8))
        else:
            out.append(esc)
            i += 1
    return out.decode("utf-8", "ignore")


def extract_text_from_stream(decoded: bytes) -> list[str]:
    lines: list[str] = []
    for text_obj in TEXT_OBJ_RE.findall(decoded):
        for token in STRING_RE.findall(text_obj):
            text = pdf_unescape(token[:-2].strip())
            if text.strip():
                lines.append(text)
        for arr in ARRAY_RE.findall(text_obj):
            parts = []
            for token in PLAIN_STR_RE.findall(arr):
                text = pdf_unescape(token)
                if text:
                    parts.append(text)
            if parts:
                joined = "".join(parts).strip()
                if joined:
                    lines.append(joined)
    return lines


def main() -> int:
    if len(sys.argv) < 2:
      print("Usage: python scripts/extract_pdf_text_heuristic.py <pdf-path> [output-txt]")
      return 1

    pdf_path = Path(sys.argv[1]).resolve()
    out_path = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else pdf_path.with_suffix(".heuristic.txt")
    data = pdf_path.read_bytes()

    extracted: list[str] = []
    seen = set()

    for raw_stream in STREAM_RE.findall(data):
        stream = raw_stream
        if stream.startswith(b"\r\n"):
            stream = stream[2:]
        elif stream.startswith(b"\n"):
            stream = stream[1:]
        try:
            decoded = zlib.decompress(stream)
        except Exception:
            continue
        for line in extract_text_from_stream(decoded):
            normalized = re.sub(r"\s+", " ", line).strip()
            if len(normalized) < 2:
                continue
            if normalized not in seen:
                seen.add(normalized)
                extracted.append(normalized)

    out_path.write_text("\n".join(extracted), encoding="utf-8")
    print(f"Wrote {len(extracted)} lines to {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
