import { ServerResponse } from "http";
import http from "http";
import { Server } from "socket.io";
const port = 3000;
const app = http.createServer((_, response: ServerResponse) => {
  response.statusCode = 200;
  response.setHeader("Content-Type", "text/plain");
  response.end("Hello World");
});

const io = new Server(app, {
  cors: {
    origin: "*",
  },
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.data.username = username;
  next();
});

io.on("connection", async (socket) => {
  socket.join("chat");

  socket.to("chat").emit("joined", socket.data.username);

  socket.on("message", (data) => {
    socket.to("chat").emit("message", data);
  });

  socket.on("disconnect", (id) => {
    console.log(`Client ${id} disconnected`);
  });
});

io.listen(port);
