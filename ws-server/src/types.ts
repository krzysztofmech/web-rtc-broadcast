export type Peers = {
  [peerId: string]: Peer;
};

export type Peer = {
  socketId: string;
  peerId: string;
};
