import Queue from "bee-queue";

import {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} from "node:worker_threads";
import path from "path";
import { fileURLToPath } from "url";
import Redis from "ioredis";
import EventEmitter from "node:events";

const queue = new Queue("example");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const redis = new Redis();

const event = new EventEmitter();

redis.on("message", function (channel, message) {
  event.emit(channel, message);
});

queue.process(10, async ({ id, data }, done) => {
  try {
    const channel = `queue-subscriber:job-${id}`;
    console.log(`Processing job ${id} ${channel}`);

    return new Promise(async (resolve, reject) => {
      const worker = new Worker(__dirname + "/process.mjs", {
        workerData: data,
      });

      redis.subscribe(channel, (err, count) => {
        if (err) console.error(err.message);
        console.log(`Subscribed to ${count} channels.`);
      });

      event.on(channel, function (data) {
        const signal = JSON.parse(data);
        if (signal.wannaClose) {
          worker.postMessage(signal)
          // worker.terminate();
          redis.unsubscribe(channel);
          reject(new Error('Wanted to close'))
        }
      });

      worker.on("online", (resp) => {
        console.log("worker is online");
      });

      worker.on("message", (resp) => {
        resolve(resp);
      });

      worker.on("messageerror", (resp) => {
        console.log({ error: resp });
      });

      worker.on("error", (error) => {
        redis.unsubscribe(channel);
        reject(error);
      });

      worker.on("exit", (code) => {
        redis.unsubscribe(channel);
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  } catch (e) {
    console.log(e);
  }
});
