import { WorkerSettings } from "mediasoup/node/lib/types";

export const workerConfig: WorkerSettings = {
  logLevel: "none",
  // logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
  logTags: [],
  rtcMinPort: 40000,
  rtcMaxPort: 49999,
};
