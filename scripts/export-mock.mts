import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  customers,
  events,
  payments,
  subscriptions,
} from "../src/lib/mock-data.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicMock = join(root, "public", "mock");

mkdirSync(publicMock, { recursive: true });

const files = {
  customers,
  subscriptions,
  payments,
  events,
} as const;

for (const [name, data] of Object.entries(files)) {
  writeFileSync(
    join(publicMock, `${name}.json`),
    `${JSON.stringify(data, null, 2)}\n`,
  );
}

writeFileSync(
  join(root, "db.json"),
  `${JSON.stringify(files, null, 2)}\n`,
);

console.log("Wrote public/mock/*.json and db.json");
