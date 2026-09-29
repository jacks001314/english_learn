import hashlib

a, b = 1, 125
p = 1
for i in range(a, b + 1):
    p *= i
s = str(p)
print("RANGE", f"{a}-{b}")
print("DIGITS", len(s))
print("SHA256", hashlib.sha256(s.encode("ascii")).hexdigest())
print("MOD1000003", p % 1000003)
print("VALUE", s)
