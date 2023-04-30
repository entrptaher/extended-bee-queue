import { isMainThread, parentPort, workerData } from "node:worker_threads";

export default async function processWrapper(){
  if(!isMainThread){
    parentPort.on("close", function () {
      console.log("port closed");
      process.exit(1);
    });
    
    parentPort.on("message", function (signal) {
      if (signal.wannaClose) {
        process.exit(1);
      }
    });
    
    const { processorFile, job } = workerData;
    
    try {
      const { default: fn } = await import(processorFile);
      const result = await fn(job);
      parentPort.postMessage(result);
    } catch (e) {
      console.log({ e });
    }
  }
}
