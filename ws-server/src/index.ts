import { Socket, Server } from "socket.io";
import { Peers } from "./types";

const port = 3000;

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

const peers: Peers = {};

io.use((socket, next) => {
  const peerId = socket.handshake.auth.peerId;
  if (!peerId || peers[peerId]) {
    return next(new Error("invalid peerId"));
  }

  updatePeers(peerId, socket);

  socket.data.peerId = peerId;
  next();
});

const updatePeers = (peerId: string, socket: Socket) => {
  peers[peerId] = { peerId, socketId: socket.id };
};

io.on("connection", (socket) => {
  socket.emit("ready");

  socket.emit("joined", peers);

  socket.on("message", (message: any) => {
    socket.broadcast.emit("message", message);
  });

  socket.on("icecandidate", (candidate) => {
    socket.emit("icecandidate", candidate);
  });

  socket.on("disconnect", () => {
    peers[socket.id] && delete peers[socket.id];
  });
});

io.listen(port);
