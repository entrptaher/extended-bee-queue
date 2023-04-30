import puppeteer from "puppeteer";

export default async function(job){
  console.log({job});
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://example.com/");
  await page.close()
  await browser.close();
}

// const result = workerData.x + workerData.y;
// await setTimeout(2000);
// console.log({ result, workerData });

// await process.exit(1);
// parentPort.postMessage(result);
