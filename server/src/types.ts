import {
  AppData,
  DtlsParameters,
  IceParameters,
  MediaKind,
  RtpCapabilities,
  RtpParameters,
  SctpParameters,
  WebRtcTransport,
  IceCandidate,
  Producer,
  Consumer,
} from "mediasoup/node/lib/types";

export type Message = {
  type: string;
  sdp: string;
};

export type Connections = {
  [connectionId: string]: Connection;
};

type Connection = {
  connectionId: string;
};

export type User = {
  id: string;
  transports: UserTransport[];
  producer?: Producer;
  consumer?: Consumer;
  username?: string;
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
  transport: WebRtcTransport;
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
  room: string;
  username: string;
};

export type Room = {
  name: string;
  owner: string;
  producerId: string;
};
