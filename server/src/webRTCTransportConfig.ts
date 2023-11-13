import { WebRtcServerOptions } from "mediasoup/node/lib/types";

export const webRTCTransportConfig: WebRtcServerOptions = {
  listenInfos: [
    {
      ip: "0.0.0.0",
      announcedIp: "127.0.0.1",
      protocol: "tcp",
      port: 44444,
    },
  ],
};
