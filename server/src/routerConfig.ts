import { RouterOptions } from "mediasoup/node/lib/types";
export const routerConfig: RouterOptions = {
  mediaCodecs: [
    {
      kind: "audio",
      mimeType: "audio/opus",
      preferredPayloadType: 111,
      clockRate: 48000,
      channels: 2,
    },
  ],
};
