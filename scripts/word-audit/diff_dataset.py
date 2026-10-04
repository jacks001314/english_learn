#!/usr/bin/env python3
"""比对两份词库 JSON，输出 (id, field, old, new) 差异清单。

用途：验证 enrichment 补丁管线在副本上跑完后，数据集只发生了预期变化。

用法：
  python scripts/word-audit/diff_dataset.py --a backend/middle_school.json --b .tmp/verify/backend/middle_school.json
"""
import argparse
import json
import sys


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--a", required=True, help="基线文件")
    ap.add_argument("--b", required=True, help="对比文件")
    ap.add_argument("--json", action="store_true", help="以 JSON 输出差异")
    ap.add_argument("--limit", type=int, default=40)
    args = ap.parse_args()

    a = json.load(open(args.a, encoding="utf-8"))
    b = json.load(open(args.b, encoding="utf-8"))

    if len(a) != len(b):
        print(f"FAIL: 条目数不同 {len(a)} vs {len(b)}")
        return 1

    diffs = []
    for i, (x, y) in enumerate(zip(a, b), 1):
        if str(x.get("id")) != str(y.get("id")):
            diffs.append({"index": i, "id": x.get("id"), "field": "<id>",
                          "old": x.get("id"), "new": y.get("id"), "note": "顺序或 id 变化"})
            continue
        for key in sorted(set(x) | set(y)):
            if x.get(key) != y.get(key):
                diffs.append({"index": i, "id": x.get("id"), "field": key,
                              "old": x.get(key), "new": y.get(key)})

    if args.json:
        print(json.dumps(diffs, ensure_ascii=False, indent=2))
    else:
        print(f"A={args.a}  B={args.b}")
        print(f"条目数 {len(a)} / 差异 {len(diffs)} 条")
        for item in diffs[: args.limit]:
            print(f"  [{item['index']:>5}] {item['id']:<24} {item['field']:<16} {item['old']!r} -> {item['new']!r}")
        if len(diffs) > args.limit:
            print(f"  ... 其余 {len(diffs)-args.limit} 条省略")
    return 0


if __name__ == "__main__":
    sys.exit(main())
