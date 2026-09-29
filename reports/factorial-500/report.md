# 500! — parallel computation by 4 derived agents

- Date: 2026-09-28
- Orchestrator: syntropy (`agent-b61dc1dbb763ad8cf1c95c07`)
- Method: disjoint-interval split, exact big-integer arithmetic, independent verification
- Result file: `result.txt` (full 1135-digit value)

## Result

- **500! = 1135 decimal digits**
- **SHA-256 (ASCII decimal)** = `8ab743a9d9beae5b6c35739a1e6729a4139e353a681671cd7ffb60573001008b`
- **Trailing zeros** = 124  (analytic check: floor(500/5)+floor(500/25)+floor(500/125) = 100+20+4 = 124)
- **First 40 digits** = `1220136825991110068701238785423046926253`
- **Last 40 digits**  = `0000000000000000000000000000000000000000`

## Split and per-agent results

| Agent | Interval | Digits | SHA-256 | mod 1000003 | vs reference |
| --- | --- | --- | --- | --- | --- |
| `fact-chunk-a` | 1-125 | 210 | `e39b766352cee5648926f512374e95c66f455e257e95c93dbea54afec253f9ce` | 519168 | MATCH |
| `fact-chunk-b` | 126-250 | 284 | `48c847f33a4022f898eef626e5d6d358e364ab1f5ba57f3c32ceb55c15b86968` | 573960 | MATCH |
| `fact-chunk-c` | 251-375 | 312 | `f57c320b395b282fd3188bfd2751aba9f96db864fa347868d14cc83804bd679f` | 814824 | MATCH |
| `fact-chunk-d` | 376-500 | 330 | `89dc4b5c8330809f5dd9edb68c39eb28519bd33c397888bb1e8229ba227b66c4` | 192508 | MATCH |

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
