const fs = require("fs");
let raw = fs.readFileSync("reports/factorial-500/chunk_b.out.txt");
let text = raw[1] === 0 ? raw.toString("utf16le") : raw.toString("utf8");
let val = text.split("VALUE ")[1].trim().replace(/\r?\n.*$/s, "");
let p = 1n; for (let i = 126n; i <= 250n; i++) p *= i;
console.log("PY_FILE_DIGITS", val.length);
console.log("PY_FILE_VALUE_MATCHES_NODE", val === p.toString());
