import { Queue } from "../extended-bee-queue/index.mjs";

const queue = new Queue("example");

queue.on("job succeeded", function (jobId, result) {
  console.log({ jobId, result });
});

const job = await queue.addJob({ x: 2, y: 3 });
