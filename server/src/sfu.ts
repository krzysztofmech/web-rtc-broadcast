import { Server } from "http";
import * as mediasoup from "mediasoup";
import {
  Consumer,
  Producer,
  Router,
  RtpCapabilities,
  WebRtcTransport,
  Worker,
} from "mediasoup/node/lib/types";
import { routerConfig } from "./routerConfig";
import { workerSettings } from "./workerConfig";
import { webRTCTransportConfig } from "./webRTCTransportConfig";
import {
  TransportConnectInfo,
  TransportProduceInfo,
  UserTransport,
} from "./types";
import { Socket } from "socket.io";
import { users } from "./services/users";
import { updateRooms } from "./services/rooms";
import { WSEvents } from "./constants";

export const createWorker = async (httpServer: Server) => {
  const worker: Worker = await mediasoup.createWorker(workerSettings);
  worker.on("died", () => {
    console.error("mediasoup worker died (this should never happen)");
    setTimeout(() => httpServer.close(), 2000);
  });

  const router: Router = await worker.createRouter(routerConfig);

  return { worker, router };
};

export const handleCreateTransport = async (
  type: "consuming" | "producing",
  router: Router
) => {
  const transport: WebRtcTransport = await createTransport(router);

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
    rtpCapabilities: router.rtpCapabilities,
  };
  return userTransport;
};
export const createTransport = async (router: Router) => {
  const transport = await router.createWebRtcTransport({
    listenIps: webRTCTransportConfig.listenInfos,
  });

  return transport;
};

export const connectTransport = async (
  transport: WebRtcTransport,
  { dtlsParameters }: TransportConnectInfo
) => {
  transport.connect({
    dtlsParameters: {
      role: "server",
      fingerprints: dtlsParameters.fingerprints,
    },
  });
};

export const handleTransportConnect = async (
  socket: Socket,
  transportInfo: TransportConnectInfo
) => {
  const user = users.get(socket.id);

  if (user) {
    const userTransport = user.transports.filter(
      ({ type }) => type === transportInfo.type
    )[0];

    if (userTransport) {
      connectTransport(userTransport.transport, transportInfo);
    }
  }
};

export const handleTransportProduce = async (
  socket: Socket,
  transportInfo: TransportProduceInfo
) => {
  const user = users.get(socket.id);

  if (user) {
    const userTransport = user.transports.find(
      ({ type }) => type === "producing"
    );
    if (userTransport) {
      const producer: Producer = await produce(
        userTransport.transport,
        transportInfo
      );

      updateRooms(socket, transportInfo);
      user.producer = producer;
      users.set(socket.id, user);
    }
  }
};

export const handleCreateConsumer = async (
  socket: Socket,
  deviceRtpCapabilities: RtpCapabilities,
  router: Router
) => {
  const user = users.get(socket.id);

  if (user) {
    const userTransport = user.transports.find(
      ({ type }) => type === "consuming"
    );

    if (userTransport) {
      const consumer: Consumer | null = await consume(
        userTransport?.transport,
        router,
        user.producer!.id,
        deviceRtpCapabilities
      );
      if (consumer) {
        user.consumer = consumer;

        users.set(socket.id, user);
        socket.emit(WSEvents.createConsumer, consumer);
      }
    }
  }
};

export const produce = async (
  transport: WebRtcTransport,
  { kind, appData, rtpParameters }: TransportProduceInfo
) => {
  const producer: Producer = await transport.produce({
    kind,
    rtpParameters,
    appData,
  });

  return producer;
};

export const consume = async (
  transport: WebRtcTransport,
  router: Router,
  producerId: string,
  deviceRtpCapabilities: RtpCapabilities
) => {
  const canConsume = router.canConsume({
    producerId,
    rtpCapabilities: deviceRtpCapabilities,
  });

  if (canConsume) {
    const consumer: Consumer = await transport.consume({
      producerId,
      rtpCapabilities: deviceRtpCapabilities,
      paused: true,
    });

    return consumer;
  }

  return null;
};
