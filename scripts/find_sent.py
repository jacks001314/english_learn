import json, os
p = r"C:\Users\huoga\.syntropy-run-84792df2ef04e349d97e20b22672cfa0\data\message-inbox.json"
print("size", os.path.getsize(p))
raw = open(p, encoding="utf-8", errors="replace").read()
try:
    data = json.loads(raw)
except Exception as e:
    print("json fail", e); data = None
def scan(obj):
    found = []
    if isinstance(obj, dict):
        if obj.get("msg_id") == "msg-1790650142385316300-151" or obj.get("message_id") == "msg-1790650142385316300-151":
            found.append(obj)
        for v in obj.values():
            found += scan(v)
    elif isinstance(obj, list):
        for v in obj:
            found += scan(v)
    return found
hits = scan(data)
print("hits", len(hits))
for h in hits:
    body = h.get("body") or h.get("message") or h.get("text") or ""
    if not isinstance(body, str):
        body = json.dumps(body, ensure_ascii=False)
    for l in body.splitlines():
        if l.startswith("#VALUE"):
            v = l.split(" ", 1)[1] if " " in l else ""
            print("VALUE_len", len(v), "tail_zeros", len(v) - len(v.rstrip("0")))
    print("body_len", len(body))
    open(r"reports/fact500/sent_body_recovered.txt", "w", encoding="utf-8").write(body)
PY
