import { Server } from "http";
import { Socket, Server as WSServer } from "socket.io";
import { WSEvents } from "../constants";
import { Connections } from "../types";

export class Signaling {
  constructor(httpServer: Server) {
    this.initSignalingServer(httpServer);
    this.addHandshakeMiddleware();
  }

  public io: WSServer;
  public connections: Connections = new Map();
  private static instance: Signaling;

  public static getInstance(httpServer: Server): Signaling {
    if (!this.instance) {
      this.instance = new Signaling(httpServer);
    }
    return this.instance;
  }

  public addListeners(socket: Socket) {
    socket.on(WSEvents.disconnect, () => {
      console.log("Socket disconnected:", socket.id);
      const { username } = socket.data;
      if (this.connections.has(username)) {
        this.connections.delete(username);
      }
    });
  }

  private initSignalingServer(httpServer: any) {
    this.io = new WSServer(httpServer, {
      cors: {
        origin: "http://localhost:5173",
      },
    });
  }

  private addHandshakeMiddleware() {
    this.io.use((socket, next) => {
      const username = socket.handshake.auth.username;
      if (!username || this.connections.has(username)) {
        return next(new Error("Invalid username or already connected"));
      }

      socket.data.username = username;
      this.addNewConnection(socket);
      next();
    });
  }

  private addNewConnection(socket: Socket) {
    const { username } = socket.data;
    this.connections.set(username, {
      username,
    });
  }
}
