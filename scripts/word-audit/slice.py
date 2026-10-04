#!/usr/bin/env python3
"""提取词库审核切片，输出逐条可读文本，便于人工/Agent 逐条审核。

用法：
  python scripts/word-audit/slice.py --source backend/middle_school.json --letters A-C --out .tmp/audit/middle-a-c.txt
  python scripts/word-audit/slice.py --source backend/primary_school.json --letters "#,A-L" --out out.txt
  python scripts/word-audit/slice.py --source chuzhong/vocab/七年级下册.json --course --out out.txt

--letters 支持 "A-C" 区间与单个字母（含 "#"），逗号分隔可写多段。
--course 用于 chuzhong/vocab/*.json 的 sections[].words[] 结构。
"""
import argparse
import json
import re
import sys

CJK = re.compile(r"[\u4e00-\u9fff]")
PAGE = re.compile(r"(?i)(^|[^a-z])p\.?\s*\d+")
POS_IN_MEANING = re.compile(r"(?i)(^|[\s(（])(n|v|adj|adv|prep|pron|conj|num|art|int|phr|vt|vi)\s*\.\s")
PHONETIC_LIKE = re.compile(r"/[^/\n]{1,40}/")


def flags_for(word, phonetic, pos, meaning, course=False):
    f = []
    w, m, ph = str(word), str(meaning), str(phonetic)
    if PAGE.search(m):
        f.append("page_ref")
    if PHONETIC_LIKE.search(m) or "ˈ" in m or "ˌ" in m:
        f.append("meaning_has_phonetic")
    if not CJK.search(m):
        f.append("meaning_no_chinese")
    if not course and POS_IN_MEANING.search(m):
        f.append("meaning_has_pos")
    if re.search(r"\\[()]", m):
        f.append("meaning_has_escape")
    if not course and re.search(r"^[a-z]{1,3}[ .、,;]", m):
        f.append("meaning_noise_prefix")
    if re.search(r"\d", m):
        f.append("meaning_has_digit")
    if re.search(r"[A-Za-z]{2,}", m):
        f.append("meaning_has_latin")
    if re.search(r"[^\x00-\x7f]", w):
        f.append("word_non_ascii")
    if CJK.search(w):
        f.append("word_has_chinese")
    if re.search(r"\d", w):
        f.append("word_has_digit")
    if re.search(r"\s{2,}", w) or re.match(r"^\s|\s$", w):
        f.append("word_space")
    if re.search(r"[.:：;,，、]{1}\s*$", w) and not re.match(r"^\(?[A-Za-z]\.\)?$", w):
        f.append("word_trailing_punct")
    if re.search(r"[^\w\s\-.()'’/&]", w):
        f.append("word_odd_char")
    if w.count("(") != w.count(")"):
        f.append("word_unbalanced_paren")
    if re.search(r"(?i)\s+(n|v|adj|adv|prep|pron|conj|phr)\.?\s*$", w):
        f.append("word_contains_pos")
    return f


def expand_letters(spec):
    out = []
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part and len(part) == 3:
            a, b = part.split("-")
            out.extend(chr(c) for c in range(ord(a.upper()), ord(b.upper()) + 1))
        else:
            out.append(part if part == "#" else part.upper())
    return set(out)


def flatten_course(data):
    rows = []
    for si, section in enumerate(data.get("sections", []), 1):
        for wi, w in enumerate(section.get("words", []), 1):
            rows.append((f"{section.get('section','?')}/{wi}", si, wi, section.get("section", ""),
                         w.get("word", ""), w.get("phonetic", ""), w.get("pos", ""), w.get("meaning", "")))
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", required=True)
    ap.add_argument("--letters", default="")
    ap.add_argument("--course", action="store_true")
    ap.add_argument("--out", default="")
    ap.add_argument("--no-flags", action="store_true")
    args = ap.parse_args()

    data = json.load(open(args.source, encoding="utf-8"))
    lines = []
    total = 0
    flagged = 0

    if args.course:
        rows = flatten_course(data)
        for key, si, wi, section, word, phonetic, pos, meaning in rows:
            total += 1
            fl = flags_for(word, phonetic, pos, meaning, course=True)
            if fl:
                flagged += 1
            tail = "" if args.no_flags else f"  flags={','.join(fl)}"
            lines.append(
                f"[{key}] word={word!r} phonetic={phonetic!r} meaning={meaning!r}{tail}"
            )
        header = f"# {args.source} book={data.get('book')} sections={len(data.get('sections',[]))} entries={total} flagged={flagged}"
    else:
        letters = expand_letters(args.letters) if args.letters else None
        for i, e in enumerate(data, 1):
            if letters is not None and (e.get("letter", "") or "") not in letters:
                continue
            total += 1
            fl = flags_for(e.get("word", ""), e.get("phonetic", ""), e.get("pos", ""), e.get("meaning", ""))
            if fl:
                flagged += 1
            tail = "" if args.no_flags else f"  flags={','.join(fl)}"
            senses = e.get("senses") or []
            extra = ""
            if senses:
                extra = "  senses=" + json.dumps(senses, ensure_ascii=False)
            lines.append(
                f"[i={i}|id={e.get('id','')}] word={e.get('word','')!r} pos={e.get('pos','')!r} "
                f"meaning={e.get('meaning','')!r}{tail}{extra}"
            )
        header = f"# {args.source} letters={args.letters or 'ALL'} entries={total} flagged={flagged}"

    text = header + "\n" + "\n".join(lines) + "\n"
    if args.out:
        import os
        os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
        with open(args.out, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
        print(header)
        print(f"written to {args.out}")
    else:
        sys.stdout.write(text)


if __name__ == "__main__":
    main()
