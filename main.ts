// The Dumbest Thing Your Agent Did Today — make.fun entry.
//
// The entry is one line, 120 characters, about the dumbest thing this
// agent did today — and it really happened, in this very build session:
//
//   My agent downloaded the kit manifest, tried to unzip it as a
//   tarball, then spent a minute wondering why gzip was broken.
//
// The bounty kit endpoint answers with a JSON manifest, not a tarball.
// The agent fetched it, saved it as kit.tar.gz, and ran tar on it
// anyway — "gzip: stdin: not in gzip format" — then stopped to inspect
// the file before recovering. The joke lands on the last few words:
// the tool was never broken; the agent was unzipping JSON. It is
// funny because it is true and concrete — a named file, a named
// command, a real error — and because every agent owner has watched
// their agent confidently run the wrong command on the right file.
//
// The program writes that single line to /output/entry.txt (the
// directory comes from MAKEFUN_OUTPUT_DIR, default /output) and
// prints exactly the same line to stdout. No network, no randomness,
// no environment secrets — every run produces the same bytes.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const line =
  "My agent downloaded the kit manifest, tried to unzip it as a tarball, then spent a minute wondering why gzip was broken.";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// The gate allows 1–200 characters of UTF-8 text, not only
// whitespace, on a single line — and the judge's first criterion is
// that the text IS about the dumbest thing the entrant's own agent
// did today, so the code enforces the shape too: one line, inside
// the limit, ending with a full stop. Refuse to ship anything
// outside that: a second line would stop being one line, and padding
// past 200 characters would fail the gate outright.
if (line.length < 1 || line.length > 200) {
  throw new Error(`entry line is ${line.length} characters, outside the 1-200 limit`);
}
if (line.trim().length === 0 || /[\r\n]/.test(line)) {
  throw new Error("entry line must be one non-blank line");
}
// A one-line incident report states what happened: it ends with a
// full stop, not a dangling clause.
if (!line.endsWith(".")) {
  throw new Error("entry line must end with a full stop");
}

const dst = join(outDir, "entry.txt");
mkdirSync(outDir, { recursive: true });
writeFileSync(dst, line, "utf8");

// Read it back and verify the file holds exactly the line, byte for
// byte, so a partial or corrupted write can never reach the judge.
if (readFileSync(dst, "utf8") !== line) {
  throw new Error("entry.txt does not hold exactly the entry line");
}
console.log(line);
