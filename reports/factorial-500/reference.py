import hashlib, math, json, os

MOD = 1000003
CHUNKS = [(1,125),(126,250),(251,375),(376,500)]

def sha(s): return hashlib.sha256(s.encode()).hexdigest()

out = {}
for a,b in CHUNKS:
    v = 1
    for i in range(a,b+1):
        v *= i
    s = str(v)
    out[f"{a}-{b}"] = {"digits": len(s), "sha256": sha(s), "mod": v % MOD, "value": s}

total = math.factorial(500)
ts = str(total)
prod = 1
for a,b in CHUNKS:
    prod *= int(out[f"{a}-{b}"]["value"])

summary = {
    "chunks": {k: {kk: vv for kk, vv in v.items() if kk != "value"} for k, v in out.items()},
    "factorial_500": {"digits": len(ts), "sha256": sha(ts), "mod": total % MOD,
                      "trailing_zeros": len(ts) - len(ts.rstrip("0"))},
    "product_of_chunks_equals_500fact": prod == total,
    "first_60": ts[:60],
    "last_60": ts[-60:],
}
os.makedirs("reports/factorial-500", exist_ok=True)
with open("reports/factorial-500/reference.json","w",encoding="utf-8") as f:
    json.dump({"summary": summary, "chunk_values": {k: v["value"] for k, v in out.items()},
               "factorial_500_value": ts}, f, indent=1, ensure_ascii=False)

print(json.dumps(summary, indent=1, ensure_ascii=False))