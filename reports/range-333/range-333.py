import hashlib
a, b = 168, 333
p = 1
for i in range(a, b + 1):
    p *= i
s = str(p)
lines = ["#RANGE [%d,%d]" % (a, b),
         "#DIGITS %d" % len(s),
         "#VALUE " + s,
         "#TAIL12 " + s[-12:],
         "#SHA256 " + hashlib.sha256(s.encode()).hexdigest(),
         "#MOD1000003 %d" % (p % 1000003)]
out = "\n".join(lines) + "\n"
with open("reports/range-333/range-333.out.txt", "w", encoding="utf-8", newline="\n") as f:
    f.write(out)
print(out, end="")
