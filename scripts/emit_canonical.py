import hashlib, json, os
gt = open(r"reports/fact500/500fact_full.txt").read().strip()
assert len(gt) == 1135
canon = gt
open(r"reports/fact500/500fact_value_only.txt", "w", encoding="utf-8", newline="\n").write(canon + "\n")
meta = {
    "value_len": len(canon),
    "trailing_zeros": len(canon) - len(canon.rstrip("0")),
    "sha256_of_decimal_string": hashlib.sha256(canon.encode()).hexdigest(),
    "sha256_of_file_bytes_with_newline": hashlib.sha256((canon + "\n").encode()).hexdigest(),
    "head20": canon[:20],
    "tail20": canon[-20:],
    "note": "canonical single-line value; copy from this file, never retype",
}
open(r"reports/fact500/500fact_canonical.json", "w", encoding="utf-8").write(json.dumps(meta, indent=2))
print(json.dumps(meta, indent=2))
