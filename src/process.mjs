import { parentPort, workerData } from "node:worker_threads";
import { setTimeout } from "timers/promises";
import puppeteer from "puppeteer";

parentPort.on("close", function () {
  console.log("port closed");
  process.exit(1);
});

parentPort.on("message", function (signal) {
  if (signal.wannaClose) {
    process.exit(1);
  }
});

const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();
await page.goto("https://example.com/");

const result = workerData.x + workerData.y;
await setTimeout(2000);
console.log({ result, workerData });

await process.exit(1);
parentPort.postMessage(result);
