// scripts/css-pixel-diff.mjs —— 两张 PNG 的像素级差异报告（用于"改样式前后外观是否变了"）
// ---------------------------------------------------------------------------
// 用法：
//   node scripts/css-pixel-diff.mjs a.png b.png [最大差异行数]
// 输出：尺寸、不同像素数与占比、差异包围盒、差异行段；退出码 0 = 逐像素一致，1 = 有差异。
// 说明：只依赖 Node 内置 zlib，自己解 PNG（8bit / 非隔行，RGB 或 RGBA），不引入第三方库。
import fs from "node:fs";
import zlib from "node:zlib";

function decode(p) {
  const b = fs.readFileSync(p);
  let i = 8; let w = 0; let h = 0; let bd = 0; let ct = 0;
  const idat = [];
  while (i < b.length) {
    const len = b.readUInt32BE(i);
    const type = b.toString("ascii", i + 4, i + 8);
    const data = b.subarray(i + 8, i + 8 + len);
    if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; }
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    i += 12 + len;
  }
  if (bd !== 8) throw new Error("只支持 8bit PNG，实际 " + bd);
  const ch = ct === 6 ? 4 : ct === 2 ? 3 : ct === 0 ? 1 : 0;
  if (!ch) throw new Error("不支持的 PNG colorType " + ct);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = w * ch;
  const out = Buffer.alloc(h * stride);
  let pos = 0;
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y += 1) {
    const ft = raw[pos]; pos += 1;
    const line = Buffer.from(raw.subarray(pos, pos + stride)); pos += stride;
    for (let x = 0; x < stride; x += 1) {
      const a = x >= ch ? line[x - ch] : 0;
      const bb = prev[x];
      const c = x >= ch ? prev[x - ch] : 0;
      let v = line[x];
      if (ft === 1) v = (v + a) & 255;
      else if (ft === 2) v = (v + bb) & 255;
      else if (ft === 3) v = (v + ((a + bb) >> 1)) & 255;
      else if (ft === 4) {
        const pa = Math.abs(bb - c); const pb = Math.abs(a - c); const pc = Math.abs(a + bb - 2 * c);
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? bb : c;
        v = (v + pr) & 255;
      }
      line[x] = v;
    }
    line.copy(out, y * stride);
    prev = line;
  }
  return { w, h, ch, data: out };
}

const [fa, fb, limArg] = process.argv.slice(2);
if (!fa || !fb) { console.error("用法：node scripts/css-pixel-diff.mjs a.png b.png"); process.exit(2); }
const A = decode(fa);
const B = decode(fb);
const W = Math.min(A.w, B.w);
const H = Math.min(A.h, B.h);
if (A.w !== B.w || A.h !== B.h) console.log(`⚠️ 尺寸不同：${A.w}x${A.h} vs ${B.w}x${B.h}，只比较左上 ${W}x${H}`);
const rowDiff = new Array(H).fill(0);
let n = 0; let minX = 1e9; let minY = 1e9; let maxX = -1; let maxY = -1;
for (let y = 0; y < H; y += 1) {
  for (let x = 0; x < W; x += 1) {
    const ia = (y * A.w + x) * A.ch;
    const ib = (y * B.w + x) * B.ch;
    if (A.data[ia] !== B.data[ib] || A.data[ia + 1] !== B.data[ib + 1] || A.data[ia + 2] !== B.data[ib + 2]) {
      n += 1; rowDiff[y] += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
console.log(`尺寸 ${A.w}x${A.h} vs ${B.w}x${B.h}`);
console.log(`不同像素 ${n}（占 ${((n / (W * H)) * 100).toFixed(2)}%）`);
if (!n) { console.log("✅ 逐像素一致"); process.exit(0); }
console.log(`差异包围盒 x ${minX}-${maxX}  y ${minY}-${maxY}；有差异的行 ${rowDiff.filter((v) => v > 0).length}`);
const segs = []; let s = -1;
for (let y = 0; y < H; y += 1) { if (rowDiff[y] > 0) { if (s < 0) s = y; } else if (s >= 0) { segs.push([s, y - 1]); s = -1; } }
if (s >= 0) segs.push([s, H - 1]);
const lim = Number(limArg || 30);
console.log("差异行段：" + segs.slice(0, lim).map(([a, b]) => `${a}-${b}(${b - a + 1})`).join(", ") + (segs.length > lim ? ` … 共 ${segs.length} 段` : ""));
process.exit(1);