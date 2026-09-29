import hashlib, math
p = math.factorial(167)
s = str(p)
txt = open("reports/range-167/range_2_167.out.txt", encoding="utf-16").read()
other = txt.split("VALUE ",1)[1].strip()
print("X_MATCH", s == other)
print("LEN_A", len(s), "LEN_B", len(other))
