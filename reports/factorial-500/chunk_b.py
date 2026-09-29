import hashlib
a, b = 126, 250
p = 1
for i in range(a, b + 1):
    p *= i
s = str(p)
lines = ["RANGE %d-%d" % (a, b), "DIGITS %d" % len(s),
         "SHA256 " + hashlib.sha256(s.encode()).hexdigest(),
         "MOD1000003 %d" % (p % 1000003), "VALUE " + s]
out = "\n".join(lines) + "\n"
with open("reports/factorial-500/chunk_b.out.txt", "w", encoding="utf-8", newline="\n") as f:
    f.write(out)
print(out, end="")
