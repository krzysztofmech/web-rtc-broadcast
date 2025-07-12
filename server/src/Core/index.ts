import { Express } from "express";
import { Server } from "http";
import { Signaling } from "../Signaling";
import { Sfu } from "../Sfu";
import { Rooms } from "../Rooms";
import { WSEvents } from "../constants";

export class Core {
  constructor(httpServer: Server, app: Express) {
    this.signaling = Signaling.getInstance(httpServer);
    this.sfu = Sfu.getInstance(httpServer);
    this.rooms = Rooms.getInstance(app, this.signaling, this.sfu);
    this.addListeners();
  }

  private signaling: Signaling;
  private sfu: Sfu;
  private rooms: Rooms;

  private addListeners() {
    this.signaling.io.on(WSEvents.connection, (socket) => {
      console.log("New socket connection:", socket.id);
      this.signaling.addListeners(socket);
      this.sfu.addListeners(socket);
      this.rooms.addListeners(socket);
    });
  }
}
