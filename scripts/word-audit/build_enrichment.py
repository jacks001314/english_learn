#!/usr/bin/env python3
"""把审核补丁清单转换成 backend/enrichment 兼容的最小补丁文件。

用法：
  python scripts/word-audit/build_enrichment.py --source backend/middle_school.json \
      --patch reports/word-audit/middle-a-c.json --out .tmp/audit/middle_a_c_audit_fix.json

规则：
- 输入是审核补丁清单（含 old/new/reason/confidence 元数据），按 id 聚合；
- 输出只保留 id 与被修正的字段（word/meaning/pos/phonetic），供 internal/enrichment.Apply 使用；
- 同一 id 同一字段出现多个互相冲突的 new 值时直接报错退出。
"""
import argparse
import json
import sys


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", required=True)
    ap.add_argument("--patch", action="append", required=True)
    ap.add_argument("--out", default="")
    args = ap.parse_args()

    data = json.load(open(args.source, encoding="utf-8"))
    order = {}
    current = {}
    for i, e in enumerate(data, 1):
        key = str(e.get("id", ""))
        order[key] = i
        current[key] = e

    merged = {}
    for path in args.patch:
        fixes = json.load(open(path, encoding="utf-8"))
        for fix in fixes:
            wid = str(fix.get("id", ""))
            field = fix.get("field")
            if wid not in current:
                print(f"FAIL: {path}: id {wid!r} 不在 {args.source} 中", file=sys.stderr)
                return 1
            if field not in {"word", "meaning", "pos", "phonetic"}:
                print(f"FAIL: {path}: id {wid!r} 非法 field {field!r}", file=sys.stderr)
                return 1
            if current[wid].get(field) != fix.get("old"):
                print(f"FAIL: {path}: id {wid!r} field {field!r} 的 old 与源文件不一致", file=sys.stderr)
                return 1
            slot = merged.setdefault(wid, {})
            if field in slot and slot[field] != fix.get("new"):
                print(f"FAIL: id {wid!r} field {field!r} 出现冲突修正", file=sys.stderr)
                return 1
            slot[field] = fix.get("new")

    out = []
    for wid in sorted(merged, key=lambda k: order.get(k, 10**9)):
        item = {"id": wid}
        item.update(merged[wid])
        out.append(item)

    text = json.dumps(out, ensure_ascii=False, indent=2) + "\n"
    if args.out:
        with open(args.out, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
        fields = {}
        for item in out:
            for k in item:
                if k != "id":
                    fields[k] = fields.get(k, 0) + 1
        print(f"wrote {args.out}: {len(out)} 个词条, 字段分布 {fields}")
    else:
        sys.stdout.write(text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
