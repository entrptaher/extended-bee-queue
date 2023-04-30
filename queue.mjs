import Queue from "bee-queue";
import Redis from "ioredis";
const redis = new Redis();

class NewQueue extends Queue {
  async addJob(data){
    const job = super.createJob(data);
    await job.save();
    return job;
  }
  async removeJob(jobId) {
    const channel = `queue-subscriber:job-${jobId}`;
    await redis.publish(channel, JSON.stringify({ wannaClose: true }));
    return super.removeJob(jobId);
  }
}

export default NewQueue;
