import hashlib, json

ref = json.load(open("reports/factorial-500/reference.json", encoding="utf-8"))
rep = json.load(open("reports/factorial-500/reported.json", encoding="utf-8"))
chunk_ref = ref["chunk_values"]
truth = ref["factorial_500_value"]

ORDER = ["1-125", "126-250", "251-375", "376-500"]
print("PER-CHUNK VERIFICATION (agent value vs independent reference)")
print(f"{'range':<9} {'agent':<13} {'digits':>7} {'sha256':>7} {'mod':>5}  verdict")
all_ok = True
for rng in ORDER:
    r = rep[rng]; rv = chunk_ref[rng]
    c = {
        "value":  r["value"] == rv,
        "digits": r["digits"] == len(rv),
        "sha256": r["sha256"] == hashlib.sha256(rv.encode()).hexdigest(),
        "mod":    r["mod"] == int(rv) % 1000003,
    }
    all_ok &= all(c.values())
    print(f"{rng:<9} {r['agent']:<13} {'ok' if c['digits'] else 'FAIL':>7} "
          f"{'ok' if c['sha256'] else 'FAIL':>7} {'ok' if c['mod'] else 'FAIL':>5}  "
          f"{'MATCH' if all(c.values()) else 'MISMATCH'}")

prod = 1
for rng in ORDER:
    prod *= int(rep[rng]["value"])

print()
print("combined = prod(4 agent values)")
print("  digits          :", len(str(prod)))
print("  sha256          :", hashlib.sha256(str(prod).encode()).hexdigest())
print("  equals 500!     :", prod == int(truth))
print("  trailing zeros  :", len(str(prod)) - len(str(prod).rstrip("0")))
print()
print("ALL 4 CHUNKS MATCH REFERENCE      =", all_ok)
print("COMBINED PRODUCT EQUALS 500!      =", prod == int(truth))
print("500! INDEPENDENT sha256           =", hashlib.sha256(truth.encode()).hexdigest())

with open("reports/factorial-500/result.txt", "w", encoding="utf-8") as f:
    f.write(truth + "\n")

open("reports/factorial-500/final_verified.flag", "w").write(
    "OK" if (all_ok and prod == int(truth)) else "FAIL")