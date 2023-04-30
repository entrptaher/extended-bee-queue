## Extended Bee-Queue (experiment)

The Extended Bee-Queue package is an extension of the original Bee-Queue package, which provides additional features such as the ability to cancel processes and sandbox them. This is achieved using Redis Pub/Sub along with the Worker system from Node version 20.

## Installation
```
npm install https://github.com/entrptaher/extended-bee-queue
```

## Usage
Usage of the Extended Bee-Queue package is similar to the original Bee-Queue package, with some additional methods:

### removeJob(jobId)

Cancels a job with the given ID. If the job is already running, it will be killed immediately.
```js
import { Queue } from "../index.mjs";

const queue = new Queue("example");

queue.removeJob(jobId);
```

### addJob

```js
import { Queue } from "../index.mjs";

const queue = new Queue("example");

queue.on("job succeeded", function (jobId, result) {
  console.log({ jobId, result });
});

const job = await queue.addJob({ x: 2, y: 3 });
```

### Offload with `processor`

Offload a job's code execution using the provided worker script path.

```js
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
```

```js
// process.mjs
import puppeteer from "puppeteer";

export default async function(job){
  console.log({job});
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://example.com/");
  await page.close()
  await browser.close();
}
```

## Limitations

The Extended Bee-Queue package requires the use of ES modules (ESM) or the type: module option in package.json due to the use of dynamic imports for sandboxing. This limitation may be resolved in future updates.