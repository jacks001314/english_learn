import hashlib

a, b = 334, 500
p = 1
for i in range(a, b + 1):
    p *= i

s = str(p)
lines = []
lines.append("#RANGE [%d,%d]" % (a, b))
lines.append("#DIGITS %d" % len(s))
lines.append("#VALUE %s" % s)
lines.append("#TAIL12 %s" % s[-12:])
lines.append("#METHOD iterative product over range(a,b+1) with Python big ints; cmd: python reports/factorial-500/chunk_c_334_500_range500.py")
lines.append("#EVIDENCE reports/factorial-500/chunk_c_334_500_range500.out.txt")
lines.append("#SHA256 %s" % hashlib.sha256(s.encode("ascii")).hexdigest())
lines.append("#MOD1000003 %d" % (p % 1000003))
block = "\n".join(lines) + "\n"
print(block, end="")
with open("reports/factorial-500/chunk_c_334_500_range500.out.txt", "w", encoding="ascii") as f:
    f.write(block)
