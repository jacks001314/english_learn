const crypto = require("crypto");
let p = 1n;
for (let i = 376n; i <= 500n; i++) p *= i;
const s = p.toString();
console.log("RANGE 376-500");
console.log("DIGITS", s.length);
console.log("SHA256", crypto.createHash("sha256").update(s, "ascii").digest("hex"));
console.log("MOD1000003", (p % 1000003n).toString());
console.log("VALUE", s);
