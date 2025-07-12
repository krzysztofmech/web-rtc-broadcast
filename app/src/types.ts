import {
  DtlsParameters,
  MediaKind,
  RtpParameters,
  AppData,
} from "mediasoup-client/lib/types";
import { TransportType } from "../../server/src/types";

export type TransportConnectInfo = {
  transportId: string;
  dtlsParameters: DtlsParameters;
  type: TransportType;
};

export type TransportProduceInfo = {
  transportId: string;
  kind: MediaKind;
  rtpParameters: RtpParameters;
  appData: AppData;
  type: TransportType;
};

export type Peers = {
  [connectionId: string]: Peer;
};

export type Peer = {
  socketId: string;
  connectionId: string;
};
