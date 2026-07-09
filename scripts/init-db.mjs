import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(databaseUrl);
const schema = readFileSync(new URL("../schema.sql", import.meta.url), "utf8");

// Split on ";" but ignore semicolons inside $$...$$ dollar-quoted blocks
// (e.g. plpgsql function bodies), which must be sent as a single statement.
function splitStatements(source) {
  const statements = [];
  let current = "";
  let dollarTag = null;
  for (let i = 0; i < source.length; i++) {
    const tagMatch = source.slice(i).match(/^\$[A-Za-z0-9_]*\$/);
    if (tagMatch) {
      const tag = tagMatch[0];
      if (dollarTag === null) dollarTag = tag;
      else if (dollarTag === tag) dollarTag = null;
      current += tag;
      i += tag.length - 1;
      continue;
    }
    const ch = source[i];
    if (ch === ";" && dollarTag === null) {
      statements.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) statements.push(current.trim());
  return statements.filter(Boolean);
}

for (const statement of splitStatements(schema)) {
  await sql.query(statement);
}

console.log("Schema applied");
