import hashlib

a, b = 251, 375
p = 1
for i in range(a, b + 1):
    p *= i

s = str(p)
out = []

out.append("RANGE %d-%d" % (a, b))
out.append("DIGITS %d" % len(s))
out.append("SHA256 %s" % hashlib.sha256(s.encode("ascii")).hexdigest())
out.append("MOD1000003 %d" % (p % 1000003))
out.append("VALUE %s" % s)

block = "\n".join(out) + "\n"
print(block, end="")
with open("reports/factorial-500/chunk_c_251_375.out.txt", "w", encoding="ascii") as f:
    f.write(block)
