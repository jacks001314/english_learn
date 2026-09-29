import math, hashlib
ref = math.factorial(500)//math.factorial(333)
s = str(ref)
print("MATCH_REF_LEN", len(s))
print("TRAILING_ZEROS", len(s)-len(s.rstrip("0")))
print("TAIL12", s[-12:])
print("SHA256", hashlib.sha256(s.encode()).hexdigest())
print("MOD", ref % 1000003)
