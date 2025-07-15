export enum WSEvents {
  // General events
  connect = "connect",
  connection = "connection",
  disconnect = "disconnect",
  // SFU events
  loadDevice = "loadDevice",
  createTransport = "createTransport",
  transportConnect = "transportConnect",
  consume = "consume",
  // Room events
  joinRoom = "joinRoom",
  joinedRoom = "joinedRoom",
  roomUpdated = "roomUpdated",
}
