export type Message = {
  type: string;
  sdp: string;
};

export type IceCandidate = {
  candidate: {
    readonly address: string | null;
    readonly candidate: string;
    readonly component: any;
    readonly foundation: string | null;
    readonly port: number | null;
    readonly priority: number | null;
    readonly protocol: any;
    readonly relatedAddress: string | null;
    readonly relatedPort: number | null;
    readonly sdpMLineIndex: number | null;
    readonly sdpMid: string | null;
    readonly tcpType: any;
    readonly type: any;
    readonly usernameFragment: string | null;
  };
};
export type Peers = {
  [peerId: string]: Peer;
};

type Peer = {
  socketId: string;
  peerId: string;
};
