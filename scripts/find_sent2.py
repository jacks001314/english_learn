import json, os
p = r"C:\Users\huoga\.syntropy-run-84792df2ef04e349d97e20b22672cfa0\data\message-inbox.json"
d = json.load(open(p, encoding="utf-8"))
TARGET = "msg-1790650142385316300-151"
hits = []
for did, rec in d.items():
    msg = rec.get("command", {}).get("message", {})
    if msg.get("messageId") == TARGET:
        hits.append((did, rec))
print("hits", len(hits))
for did, rec in hits:
    msg = rec["command"]["message"]
    print("delivery", did, "target", rec["command"].get("targetAgentId"), "source", msg.get("source"))
    parts = msg.get("content", [])
    for c in parts:
        t = c.get("text", "")
        lines = t.splitlines()
        for i, l in enumerate(lines):
            if l.startswith("#VALUE"):
                v = l[7:] if l.startswith("#VALUE ") else l[6:]
                print("VALUE_len", len(v), "tail_zeros", len(v) - len(v.rstrip("0")))
                print("VALUE_repr_tail", repr(v[-30:]))
        print("text_len", len(t))
        open(r"reports/fact500/sent_body_recovered.txt", "w", encoding="utf-8").write(t)
