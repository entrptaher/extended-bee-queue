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
import processWrapper from "./process.mjs"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if(!isMainThread){
  processWrapper().catch(console.log)
}

function processor({ concurrency = 1, queueName, queueArgs, processorFile }) {
  const queue = new Queue(queueName, queueArgs);
  const event = new EventEmitter();
  const redis = new Redis();

  redis.on("message", function (channel, message) {
    event.emit(channel, message);
  });

  queue.process(concurrency, async (job, done) => {
    try {
      const { id, data } = job;
      const channel = `queue-subscriber:job-${id}`;
      console.log(`Processing job ${id} ${channel}`);

      /**
       * @type {Worker}
       */
      let worker;
        worker = new Worker(__filename, {
          workerData: { processorFile, job: { id, data } },
        });
        console.log(processWrapper, __filename);

      return new Promise(async (resolve, reject) => {
        redis.subscribe(channel, (err, count) => {
          if (err) console.error(err.message);
          console.log(`Subscribed to ${count} channels.`);
        });

        event.on(channel, function (data) {
          const signal = JSON.parse(data);
          if (signal.wannaClose) {
            worker.postMessage(signal);
            // worker.terminate();
            redis.unsubscribe(channel);
            reject(new Error("Wanted to close"));
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
}

export default processor;
