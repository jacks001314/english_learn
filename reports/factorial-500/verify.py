import hashlib, json, sys

ref = json.load(open("reports/factorial-500/reference.json", encoding="utf-8"))["chunk_values"]
rep = json.load(open("reports/factorial-500/reported.json", encoding="utf-8"))

ok = True
for rng, r in rep.items():
    rv = ref[rng]
    checks = {
        "value_exact":   r["value"] == rv,
        "digits":        r["digits"] == len(rv),
        "sha256":        r["sha256"] == hashlib.sha256(rv.encode()).hexdigest(),
        "mod":           r["mod"] == int(rv) % 1000003,
    }
    verdict = "MATCH" if all(checks.values()) else "MISMATCH"
    if not all(checks.values()):
        ok = False
    print(f"[{verdict}] {rng}  agent={r.get('agent','?')}  " +
          "  ".join(f"{k}={'ok' if v else 'FAIL'}" for k, v in checks.items()))

print()
print(f"chunks checked: {len(rep)} / 4")
print("ALL_REPORTED_CHUNKS_VERIFIED =", ok)