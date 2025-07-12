import { Express } from "express";
import { Socket } from "socket.io";
import { WSEvents } from "../constants";
import { Room } from "../types";
import { Signaling } from "src/Signaling";
import { Sfu } from "src/Sfu";
import { RtpCapabilities } from "mediasoup-client/lib/RtpParameters";
import { ConsumerOptions } from "mediasoup-client/lib/Consumer";

export class Rooms {
  constructor(app: Express, signaling: Signaling, sfu: Sfu) {
    this.app = app;
    this.signaling = signaling;
    this.sfu = sfu;

    this.app.get("/rooms", (_req, res) => {
      res.json(this.room);
    });
  }

  private static instance: Rooms;
  private app: Express;
  private signaling: Signaling;
  private sfu: Sfu;

  public room: Room = {
    id: "4af57456-522a-415b-a4dd-cc645a57852f",
    name: "Default Room",
    participants: [],
  };

  public static getInstance(
    app: Express,
    signaling: Signaling,
    sfu: Sfu,
  ): Rooms {
    if (!this.instance) {
      this.instance = new Rooms(app, signaling, sfu);
    }
    return this.instance;
  }

  public addListeners(socket: Socket) {
    socket.on(WSEvents.joinRoom, async ({ rtpCapabilities }) => {
      await this.joinRoom(rtpCapabilities, socket);
    });
  }

  private async joinRoom(
    rtpCapabilities: RtpCapabilities,
    socket: Socket,
  ) {
    const consumer = await this.sfu.createConsumer(rtpCapabilities, socket.id);

    this.updateRoom(socket.id);
    this.signaling.io.emit(WSEvents.roomUpdated, this.room);
    socket.emit(WSEvents.joinedRoom, {
      id: consumer.id,
      producerId: consumer.producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    } as ConsumerOptions);
  }

  private updateRoom(socketId: string) {
    this.room.participants.push(socketId);
  }
}
