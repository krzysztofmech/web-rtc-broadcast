import {
  IceParameters,
  IceCandidate,
  DtlsParameters,
  SctpParameters,
  RtpCapabilities,
  MediaKind,
  RtpParameters,
  AppData,
} from "mediasoup-client/lib/types";

export type CreateWebRtcTransportPayload = {
  webRtcProducingTransport: UserTransport;
  webRtcConsumingTransport: UserTransport;
};
export type UserTransport = {
  type: "producing" | "consuming";
  transportOptions: {
    id: string;
    iceParameters: IceParameters;
    iceCandidates: IceCandidate[];
    dtlsParameters: DtlsParameters;
    sctpParameters: SctpParameters | undefined;
  };
  rtpCapabilities: RtpCapabilities;
};

export type TransportConnectInfo = {
  transportId: string;
  dtlsParameters: DtlsParameters;
  type: "producing" | "consuming";
};

export type TransportProduceInfo = {
  transportId: string;
  kind: MediaKind;
  rtpParameters: RtpParameters;
  appData: AppData;
  type: "producing" | "consuming";
};

export type Peers = {
  [connectionId: string]: Peer;
};

export type Peer = {
  socketId: string;
  connectionId: string;
};
