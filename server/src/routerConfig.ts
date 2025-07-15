import { RouterOptions } from "mediasoup/node/lib/types";
export const routerConfig: RouterOptions = {
  mediaCodecs: [
    {
      kind: "audio",
      mimeType: "audio/opus",
      preferredPayloadType: 101,
      clockRate: 48000,
      channels: 2,
      rtcpFeedback: [],
      parameters: { "sprop-stereo": 1 },
    },
  ],
};
