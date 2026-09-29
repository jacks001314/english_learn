import json, os, glob
root = r"C:\Users\huoga\.syntropy-run-84792df2ef04e349d97e20b22672cfa0"
print("== inbox structure ==")
d = json.load(open(os.path.join(root, "data", "message-inbox.json"), encoding="utf-8"))
print(type(d), list(d)[:10] if isinstance(d, dict) else len(d))
def walk(o, pre=""):
    if isinstance(o, dict):
        for k, v in list(o.items())[:8]:
            walk(v, pre + "/" + str(k))
    elif isinstance(o, list):
        print(pre, "list len", len(o))
        if o: walk(o[0], pre + "[0]")
    else:
        s = str(o)
        print(pre, "=", s[:80].replace("\n", "\\n"))
walk(d)
print("== my session rollouts ==")
for f in glob.glob(os.path.join(root, "data", "codex", "agent-f1a3e1051c869d98e912cee3", "sessions", "**", "*.jsonl"), recursive=True):
    print(f, os.path.getsize(f))
