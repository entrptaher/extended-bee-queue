import Queue from "bee-queue";
import Redis from "ioredis";

class NewQueue extends Queue {

}

const queue = new NewQueue("example");

async function addJob() {
  const job = queue.createJob({ x: 2, y: 3 });
  await job.save();

  const redis = await new Redis();
  const channel = `queue-subscriber:job-${job.id}`;
  setTimeout(() => {
    console.log({ channel });
    redis.publish(channel, JSON.stringify({ wannaClose: true }));
  }, 1000);

  job.on("succeeded", (result) => {
    console.log(`Received result for job ${job.id}: ${result}`);
  });
}

addJob();
addJob();
addJob();
addJob();
addJob();
