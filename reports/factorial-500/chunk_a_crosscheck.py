import hashlib, math
s = str(math.factorial(125))
print("XFACT_DIGITS", len(s))
print("XFACT_SHA256", hashlib.sha256(s.encode("ascii")).hexdigest())
print("XFACT_MOD", math.factorial(125) % 1000003)
