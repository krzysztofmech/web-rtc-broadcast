import {
  AppData,
  DtlsParameters,
  MediaKind,
  WebRtcTransport,
  Producer,
  Consumer,
} from "mediasoup/node/lib/types";

import {
  RtpCapabilities,
  RtpParameters,
  TransportOptions,
} from "mediasoup-client/lib/types";

export type Message = {
  type: string;
  sdp: string;
};

export type Connections = Map<string, Connection>;

type Connection = {
  username: string;
};

export type Users = Map<string, User>;

export type Consumers = Map<string, Consumer>;

export type User = {
  socketId: string;
  username: string;
  consumingTransport: UserTransport;
  producer?: Producer;
  consumer?: Consumer;
};

export type UserTransport = {
  transportOptions: TransportOptions;
  transport: WebRtcTransport;
  rtpCapabilities: RtpCapabilities;
};

export type TransportConnectInfo = {
  transportId: string;
  dtlsParameters: DtlsParameters;
};

export type TransportProduceInfo = {
  transportId: string;
  kind: MediaKind;
  rtpParameters: RtpParameters;
  appData: AppData;
};

export type CreateTransportsPayload = {
  consumingTransportOptions: TransportOptions;
};

export type Rooms = Map<string, Room>;

export type Room = {
  id: string;
  name: string;
  participants: string[];
};
