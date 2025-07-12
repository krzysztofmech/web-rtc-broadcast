import * as mediasoup from "mediasoup";
import { Server } from "http";
import { Worker } from "mediasoup/node/lib/WorkerTypes";
import { workerConfig } from "../workerConfig";
import { Router } from "mediasoup/node/lib/RouterTypes";
import { routerConfig } from "../routerConfig";
import { Socket } from "socket.io";
import { WSEvents } from "../constants";
import {
  TransportType,
  User,
  Users,
  UserTransport,
  CreateTransportsPayload,
  Consumers,
} from "../types";
import { WebRtcTransport } from "mediasoup/node/lib/WebRtcTransportTypes";
import { webRTCTransportConfig } from "../webRTCTransportConfig";
import { RtpCapabilities } from "mediasoup-client/lib/RtpParameters";
import { Producer } from "mediasoup/node/lib/ProducerTypes";

export class Sfu {
  constructor(httpServer: Server) {
    this.httpServer = httpServer;
    this.initSfuServer();
  }

  private static instance: Sfu;
  private httpServer: Server;
  private worker: Worker;

  public router: Router;
  public users: Users = new Map();
  public producer: Producer;
  public consumers: Consumers = new Map();

  public static getInstance(httpServer: Server): Sfu {
    if (!this.instance) {
      this.instance = new Sfu(httpServer);
    }
    return this.instance;
  }

  public addListeners(socket: Socket) {
    socket.emit(WSEvents.loadDevice, this.router.rtpCapabilities);

    socket.on(WSEvents.createTransports, async () => {
      const producingTransport = await this.createTransport("producing");
      const consumingTransport = await this.createTransport("consuming");

      this.createUser(socket, producingTransport, consumingTransport);

      socket.emit(WSEvents.createTransports, {
        producingTransportOptions: producingTransport.transportOptions,
        consumingTransportOptions: consumingTransport.transportOptions,
      } as CreateTransportsPayload);
    });

    socket.on(WSEvents.transportConnect, async ({ dtlsParameters }) => {
      if (!this.users.has(socket.id)) {
        throw new Error(`User with socket ID ${socket.id} not found`);
      }

      const user = this.users.get(socket.id);
      if (user) {
        user.transports.consumingTransport.transport.connect({
          dtlsParameters: {
            role: "server",
            fingerprints: dtlsParameters.fingerprints,
          },
        });
      }
    });

    socket.on(WSEvents.consume, async () => {
      this.consume(socket.id);
    });
  }

  private async initSfuServer() {
    try {
      await this.createWorker();
      await this.createRouter();
      await this.createProducer();
    } catch (error) {
      console.error("Error initializing SFU server:", error);
      this.httpServer.close();
    }
  }

  private async createWorker() {
    this.worker = await mediasoup.createWorker(workerConfig);

    this.worker.on("died", () => {
      console.error("mediasoup worker died (this should never happen)");
      setTimeout(() => this.httpServer.close(), 2000);
    });
  }

  private async createRouter() {
    if (!this.worker) {
      throw new Error("Worker is not initialized");
    }
    this.router = await this.worker.createRouter(routerConfig);
  }

  private async createProducer() {
    const transport = await this.router.createPlainTransport({
      listenIp: "127.0.0.1",
      rtcpMux: false,
      comedia: true,
    });

    transport.tuple.localPort;
    transport.rtcpTuple?.localPort;

    const producer = await transport.produce({
      kind: "audio",
      rtpParameters: {
        codecs: [
          {
            mimeType: "audio/opus",
            clockRate: 48000,
            payloadType: 101,
            channels: 2,
            rtcpFeedback: [],
            parameters: { "sprop-stereo": 1 },
          },
        ],
        encodings: [{ ssrc: 11111111 }],
      },
    });

    this.producer = producer as any;
  }

  public async createConsumer(
    rtpCapabilities: RtpCapabilities,
    socketId: string,
  ) {
    if (!this.producer) {
      throw new Error("Producer is not initialized");
    }

    const canConsume = this.router.canConsume({
      producerId: this.producer.id,
      rtpCapabilities: rtpCapabilities,
    });

    if (!canConsume) {
      throw new Error("Cannot consume producer with given RTP capabilities");
    }

    if (!this.users.has(socketId)) {
      throw new Error(`User with socket ID ${socketId} not found`);
    }

    const user = this.users.get(socketId)!;

    const consumer = await user.transports.consumingTransport.transport.consume(
      {
        producerId: this.producer.id,
        rtpCapabilities: rtpCapabilities,
        paused: true,
      },
    );
    this.consumers.set(socketId, consumer);
    return consumer;
  }

  private async createTransport(type: TransportType) {
    const transport: WebRtcTransport = await this.router.createWebRtcTransport({
      listenIps: webRTCTransportConfig.listenInfos,
    });

    const transportOptions = {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
      sctpParameters: transport.sctpParameters,
    };

    const userTransport: UserTransport = {
      type,
      transport,
      transportOptions,
      rtpCapabilities: this.router.rtpCapabilities,
    };

    return userTransport;
  }

  private createUser(
    socket: Socket,
    producingTransport: UserTransport,
    consumingTransport: UserTransport,
  ) {
    const user: User = {
      socketId: socket.id,
      username: socket.data.username,
      transports: {
        producingTransport,
        consumingTransport,
      },
    };

    this.users.set(socket.id, user);
  }

  private async consume(socketId: string) {
    const consumer = this.consumers.get(socketId);

    if (consumer) {
      consumer.resume();
    }
  }
}
