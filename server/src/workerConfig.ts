import { WorkerSettings } from "mediasoup/node/lib/types";

export const workerSettings: WorkerSettings = {
  logLevel: "debug",
  logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
  rtcMinPort: 40000,
  rtcMaxPort: 49999,
};
