import hashlib, math, sys, time

N = 500

# --- Method 1: recursive divide & conquer product tree (naive-loop-free) ---
def prod_tree(lo, hi):
    if lo > hi:
        return 1
    if lo == hi:
        return lo
    mid = (lo + hi) // 2
    return prod_tree(lo, mid) * prod_tree(mid + 1, hi)

# --- Method 2: iterative pairwise (balanced) product tree ---
def pairwise_tree(nums):
    if not nums:
        return 1
    level = list(nums)
    while len(level) > 1:
        nxt = []
        for i in range(0, len(level) - 1, 2):
            nxt.append(level[i] * level[i + 1])
        if len(level) % 2:
            nxt.append(level[-1])
        level = nxt
    return level[0]

# --- Method 3: prime factorization (Legendre) reconstruction ---
def sieve(n):
    s = bytearray([1]) * (n + 1)
    s[0] = s[1] = 0
    for i in range(2, int(n ** 0.5) + 1):
        if s[i]:
            s[i * i::i] = bytearray(len(s[i * i::i]))
    return [i for i in range(2, n + 1) if s[i]]

def factor_factorial(n):
    fac = {}
    for p in sieve(n):
        e, q = 0, p
        while q <= n:
            e += n // q
            q *= p
        fac[p] = e
    return fac

def vp_factorial(n, p):
    e, q = 0, p
    while q <= n:
        e += n // q
        q *= p
    return e

t0 = time.perf_counter()
a = prod_tree(1, N)
t1 = time.perf_counter()
b = pairwise_tree(list(range(1, N + 1)))
t2 = time.perf_counter()
fac = factor_factorial(N)
c = 1
for p, e in fac.items():
    c *= p ** e
t3 = time.perf_counter()
d = math.factorial(N)
t4 = time.perf_counter()

s = str(a)
v2 = vp_factorial(N, 2)
v5 = vp_factorial(N, 5)

res = {
    "VALUE": s,
    "DIGITS": len(s),
    "HEAD20": s[:20],
    "TAIL20": s[-20:],
    "TRAILING_ZEROS": len(s) - len(s.rstrip("0")),
    "V2_V5": (v2, v5),
    "SHA256": hashlib.sha256(s.encode()).hexdigest(),
    "METHOD_CONSISTENT": (a == b == c == d),
    "TIMING_ms": {"prod_tree": round((t1-t0)*1000, 2), "pairwise": round((t2-t1)*1000, 2),
                  "factorization": round((t3-t2)*1000, 2), "math.factorial": round((t4-t3)*1000, 3)},
}

out = []
out.append("#DIGITS " + str(res["DIGITS"]))
out.append("#HEAD20 " + res["HEAD20"])
out.append("#TAIL20 " + res["TAIL20"])
out.append("#TRAILING_ZEROS " + str(res["TRAILING_ZEROS"]))
out.append("#V2_V5 " + str(v2) + " " + str(v5))
out.append("#SHA256 " + res["SHA256"])
out.append("#VALUE " + s)
with open(r"reports/fact500/500fact_result.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out) + "\n")
with open(r"reports/fact500/500fact_full.txt", "w", encoding="utf-8") as f:
    f.write(s + "\n")
with open(r"reports/fact500/500fact_report.json", "w", encoding="utf-8") as f:
    import json
    j = dict(res); j["VALUE_head"] = s[:50]; j["VALUE_len"] = len(s); j["VALUE"] = s
    json.dump(j, f, indent=2)

print("#DIGITS", res["DIGITS"])
print("#HEAD20", res["HEAD20"])
print("#TAIL20", res["TAIL20"])
print("#TRAILING_ZEROS", res["TRAILING_ZEROS"])
print("#V2_V5", v2, v5)
print("#SHA256", res["SHA256"])
print("#METHOD_CONSISTENT", res["METHOD_CONSISTENT"])
print("#TIMING_ms", res["TIMING_ms"])
print("#VALUE", s)
