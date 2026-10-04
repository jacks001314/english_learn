#!/usr/bin/env python3
"""校验审核补丁清单与源文件是否一致。

用法：
  python scripts/word-audit/checkpatch.py --source backend/middle_school.json --patch reports/word-audit/middle-a-c.json
  python scripts/word-audit/checkpatch.py --source chuzhong/vocab/七年级下册.json --patch reports/word-audit/course-7.json --course

校验项：id/定位键存在、index 对齐、field 合法、old 与源文件逐字一致、new 与 old 不同、无重复。
退出码 0 表示全部通过。
"""
import argparse
import json
import sys

ALLOWED_FIELDS = {"word", "meaning", "pos", "phonetic"}
COURSE_FIELDS = {"word", "meaning", "pos", "phonetic"}


def load(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", required=True)
    ap.add_argument("--patch", required=True)
    ap.add_argument("--course", action="store_true")
    args = ap.parse_args()

    data = load(args.source)
    fixes = load(args.patch)
    errors = []

    if not isinstance(fixes, list):
        print("FAIL: 补丁文件必须是 JSON 数组")
        return 1

    if args.course:
        idx = {}
        for si, section in enumerate(data.get("sections", []), 1):
            for wi, w in enumerate(section.get("words", []), 1):
                idx[(si, wi)] = (section.get("section", ""), w)
        seen = set()
        for n, fix in enumerate(fixes, 1):
            tag = f"#{n} {fix.get('book','')}/{fix.get('section','')}#{fix.get('index_in_section','')} {fix.get('word','')}"
            si, wi = fix.get("section_index"), fix.get("index_in_section")
            if not isinstance(si, int) or not isinstance(wi, int) or (si, wi) not in idx:
                errors.append(f"{tag}: section_index/index_in_section 无法定位")
                continue
            section, entry = idx[(si, wi)]
            field = fix.get("field")
            if field not in COURSE_FIELDS:
                errors.append(f"{tag}: 非法 field {field!r}")
                continue
            if entry.get(field) != fix.get("old"):
                errors.append(f"{tag}: old 与源文件不一致\n    source={entry.get(field)!r}\n    patch ={fix.get('old')!r}")
            if fix.get("new") == fix.get("old"):
                errors.append(f"{tag}: new 与 old 相同")
            key = (si, wi, field)
            if key in seen:
                errors.append(f"{tag}: 同一字段重复修正")
            seen.add(key)
    else:
        idx = {}
        for i, e in enumerate(data, 1):
            idx.setdefault(str(e.get("id", "")), (i, e))
        seen = set()
        for n, fix in enumerate(fixes, 1):
            tag = f"#{n} {fix.get('id','')}"
            entry = idx.get(str(fix.get("id", "")))
            if entry is None:
                errors.append(f"{tag}: 源文件中不存在该 id")
                continue
            index, e = entry
            if fix.get("index") != index:
                errors.append(f"{tag}: index 不匹配（源文件为 {index}，补丁写 {fix.get('index')}）")
            field = fix.get("field")
            if field not in ALLOWED_FIELDS:
                errors.append(f"{tag}: 非法 field {field!r}")
                continue
            if e.get(field) != fix.get("old"):
                errors.append(f"{tag}: old 与源文件不一致\n    source={e.get(field)!r}\n    patch ={fix.get('old')!r}")
            if fix.get("new") == fix.get("old"):
                errors.append(f"{tag}: new 与 old 相同")
            key = (str(fix.get("id", "")), field)
            if key in seen:
                errors.append(f"{tag}: 同一字段重复修正")
            seen.add(key)

    if errors:
        print(f"FAIL: {len(errors)} 个问题")
        for item in errors[:60]:
            print("  -", item)
        if len(errors) > 60:
            print(f"  ... 其余 {len(errors)-60} 条省略")
        return 1
    print(f"OK: {len(fixes)} 条修正全部通过校验（source={args.source}）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
