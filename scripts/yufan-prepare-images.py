#!/usr/bin/env python3
"""yufan 讲义图片预处理：生成"低字节体积"镜像，规避 DeepSeek 网关请求体上限。

背景：每个 view_image 会把整张图以 base64 常驻会话历史，原始扫描图 ~700KB/张
（base64 ~950KB），一个 worker 读 45+ 张即触发
`413 Payload Too Large`（api.deepseek.com / openresty+EdgeOne，实测请求体上限 ~48MiB；
45/46/47MB 通过、48MB 起被拒）。
做法：保持原始分辨率（不影响中文小字可读性），仅重编码 JPEG（quality 60 + optimize
+ progressive）。实测 714,813B -> 120,364B；全量 417 张 319,265,250B -> 54,419,510B（5.87x）。

用法（在 project 根目录执行）：
  python scripts/yufan-prepare-images.py                       # 全量，幂等（目标比源新则跳过）
  python scripts/yufan-prepare-images.py --dirs 名词 连词       # 只处理匹配的目录（按路径段匹配）
  python scripts/yufan-prepare-images.py --force               # 强制重编码
规格：SRC=yufan -> DST=yufan-ds，只写 yufan-ds/，不触碰 yufan/ 原图。
"""
import argparse, os, sys

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default="yufan")
    ap.add_argument("--dst", default="yufan-ds")
    ap.add_argument("--quality", type=int, default=60)
    ap.add_argument("--scale", type=float, default=1.0, help="几何缩放，默认 1.0=保持原分辨率")
    ap.add_argument("--dirs", nargs="*", default=None, help="只处理路径段命中这些名字的目录")
    ap.add_argument("--force", action="store_true", help="忽略幂等检查，强制重编码")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    from PIL import Image
    if not os.path.isdir(a.src):
        print("ERROR: src not found: %s" % a.src); return 2

    hit = lambda parts: (not a.dirs) or any(p in a.dirs for p in parts)
    n_enc = n_skip = 0
    src_bytes = dst_bytes = 0
    per_dir = []
    for root, _dirs, files in os.walk(a.src):
        rel = os.path.relpath(root, a.src)
        parts = [] if rel == "." else rel.replace("\\", "/").split("/")
        if not hit(parts):
            continue
        jpgs = sorted(f for f in files if f.lower().endswith((".jpg", ".jpeg", ".png")))
        if not jpgs:
            continue
        outdir = os.path.join(a.dst, rel) if rel != "." else a.dst
        if not a.dry_run:
            os.makedirs(outdir, exist_ok=True)
        d_src = d_dst = 0
        for f in jpgs:
            sp = os.path.join(root, f); dp = os.path.join(outdir, f)
            d_src += os.path.getsize(sp)
            if not a.force and os.path.exists(dp) and os.path.getmtime(dp) >= os.path.getmtime(sp):
                n_skip += 1; d_dst += os.path.getsize(dp); continue
            if a.dry_run:
                continue
            im = Image.open(sp).convert("RGB")
            if a.scale != 1.0:
                im = im.resize((int(im.size[0]*a.scale), int(im.size[1]*a.scale)), Image.LANCZOS)
            im.save(dp, "JPEG", quality=a.quality, optimize=True, progressive=True)
            n_enc += 1; d_dst += os.path.getsize(dp)
        src_bytes += d_src; dst_bytes += d_dst
        per_dir.append((rel or ".", len(jpgs), d_src, d_dst))

    for rel, cnt, si, so in per_dir:
        print("%-34s %3d zhang  %9.1f KB -> %9.1f KB" % (rel, cnt, si/1024, so/1024))
    print("-" * 72)
    print("encoded=%d skipped=%d total=%d" % (n_enc, n_skip, n_enc + n_skip))
    if dst_bytes:
        print("src=%.0f B -> dst=%.0f B (ratio=%.2fx)" % (src_bytes, dst_bytes, src_bytes/dst_bytes))
    print("output dir: %s  (base64 size ~= file bytes x 1.37)" % a.dst)
    return 0

if __name__ == "__main__":
    sys.exit(main())