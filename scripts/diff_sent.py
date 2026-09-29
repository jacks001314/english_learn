import json, hashlib
p = r"C:\Users\huoga\.syntropy-run-84792df2ef04e349d97e20b22672cfa0\data\message-inbox.json"
d = json.load(open(p, encoding="utf-8"))
TARGET = "msg-1790650142385316300-151"
rec = next(r for r in d.values() if r["command"]["message"].get("messageId") == TARGET)
t = rec["command"]["message"]["content"][0]["text"]
line = next(l for l in t.splitlines() if l.startswith("#VALUE"))
v = line.split(" ", 1)[1].strip()
file_v = open(r"reports/fact500/500fact_full.txt").read().strip()
print("sent_line_len", len(line), "value_len", len(v))
print("file_len", len(file_v))
print("same_digits_prefix?", file_v[:-124] == v[:len(file_v)-124])
print("compare:", "sent == file + '000'?" , v == file_v + "000")
print("sent == file + '0000'?", v == file_v + "0000")
# find first difference
n=0
for a,b in zip(v, file_v):
    if a!=b:
        break
    n+=1
print("common_prefix_len", n, "sent_extra", repr(v[n:]), "file_extra", repr(file_v[n:n+20]))
print("sha256_sent_value", hashlib.sha256(v.encode()).hexdigest())
print("text_repr_tail", repr(t[-260:]))
