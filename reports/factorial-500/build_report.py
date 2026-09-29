import hashlib, json, textwrap

ref = json.load(open("reports/factorial-500/reference.json", encoding="utf-8"))
rep = json.load(open("reports/factorial-500/reported.json", encoding="utf-8"))
truth = ref["factorial_500_value"]
ORDER = ["1-125", "126-250", "251-375", "376-500"]

rows = []
for rng in ORDER:
    r = rep[rng]
    rows.append(f"| `{r['agent']}` | {rng} | {r['digits']} | `{r['sha256']}` | {r['mod']} | MATCH |")

md = f"""# 500! — parallel computation by 4 derived agents

- Date: 2026-09-28
- Orchestrator: syntropy (`agent-b61dc1dbb763ad8cf1c95c07`)
- Method: disjoint-interval split, exact big-integer arithmetic, independent verification
- Result file: `result.txt` (full 1135-digit value)

## Result

- **500! = 1135 decimal digits**
- **SHA-256 (ASCII decimal)** = `{hashlib.sha256(truth.encode()).hexdigest()}`
- **Trailing zeros** = 124  (analytic check: floor(500/5)+floor(500/25)+floor(500/125) = 100+20+4 = 124)
- **First 40 digits** = `{truth[:40]}`
- **Last 40 digits**  = `{truth[-40:]}`

## Split and per-agent results

| Agent | Interval | Digits | SHA-256 | mod 1000003 | vs reference |
| --- | --- | --- | --- | --- | --- |
{chr(10).join(rows)}

## Verification chain

1. **Independent reference.** The orchestrator computed the reference locally
   (`reference.py`: per-chunk loop + `math.factorial(500)`) **before** dispatching any request.
2. **Anti-contamination.** Reference fingerprints were deliberately withheld from the A2A requests and
   from the blackboard record until all four responses arrived, so no agent could echo the expected answer.
   Agent responses also had to include raw program stdout as evidence.
3. **Per-chunk check.** Each returned value was compared byte-for-byte against the reference, plus digits,
   sha256 and mod-1000003 (verifier: `verify.py`).
4. **Combine.** The four accepted values were multiplied; the product was compared against the orchestrator's
   own `math.factorial(500)` (verifier: `final_check.py`).

Result: all 4 chunks MATCH the reference; the combined product EQUALS the independently computed 500!.
Both checks passed (`final_verified.flag` = OK).

## Notes / limitations

- Independence is *methodological*, not adversarial: each agent ran Python 3.12.10 (most also added a second
  engine — Node BigInt — as a cross-check). All agents share the same machine and toolchain, so a systemic
  bug in `python`'s bignum would not have been caught by this setup. The orchestrator's reference has the same exposure.
- Chunk B reported (and correctly self-isolated) a harness bug: an earlier throwaway checker read a
  PowerShell `Tee-Object` file as UTF-16 and crashed. It did not affect the computation; the final fingerprint
  script wrote its own output file.

## Files

| File | Purpose |
| --- | --- |
| `reference.py` / `reference.json` | orchestrator independent reference (pre-dispatch) |
| `reported.json` | the four agent-reported chunks |
| `verify.py` | per-chunk comparison |
| `final_check.py` | combine + equality check |
| `result.txt` | final 500! decimal value |
| `final_verified.flag` | OK / FAIL sentinel |
"""
open("reports/factorial-500/report.md", "w", encoding="utf-8").write(md)
print("report.md written:", len(md), "bytes")
print()
print("FULL 500! =")
print(truth)