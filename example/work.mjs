import { processor } from "../index.mjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

processor({
  concurrency: 10,
  queueName: "example",
  processorFile: __dirname + "/process.mjs",
});
