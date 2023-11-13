import { Server as WSServer } from "socket.io";
import {
  Message,
  UserTransport,
  TransportConnectInfo,
  TransportProduceInfo,
  Connections,
} from "./types";
import {
  Router,
  WebRtcTransport,
  IceCandidate,
  RtpCapabilities,
} from "mediasoup/node/lib/types";
import { WSEvents } from "./constants";
import {
  createTransport,
  handleCreateConsumer,
  handleTransportConnect,
  handleTransportProduce,
} from "./sfu";
import { updateUsers, users } from "./services/users";

const connections: Connections = {};

export const runWebsocketServer = async (io: WSServer, router: Router) => {
  io.use((socket, next) => {
    const connectionId = socket.handshake.auth.connectionId;
    if (!connectionId || connections[connectionId]) {
      return next(new Error("invalid connectionId"));
    }

    updateConnections(connectionId, io);

    socket.data.connectionId = connectionId;
    next();
  });

  io.on(WSEvents.connection, (socket) => {
    socket.emit(WSEvents.ready);

    socket.on(WSEvents.message, (message: Message) => {
      socket.broadcast.emit(WSEvents.message, message);
    });

    socket.on(WSEvents.icecandidate, (iceCandidate: IceCandidate) => {
      socket.emit(WSEvents.icecandidate, iceCandidate);
    });

    socket.on(WSEvents.createWebRtcTransport, async () => {
      const webRtcProducingTransport = await handleCreateTransport(
        "producing",
        router
      );
      const webRtcConsumingTransport = await handleCreateTransport(
        "consuming",
        router
      );

      await updateUsers(
        socket,
        webRtcProducingTransport,
        webRtcConsumingTransport
      );

      users.forEach((user) => {
        console.log("user", user.producer);
      });
      socket.emit(WSEvents.createWebRtcTransport, {
        webRtcProducingTransport,
        webRtcConsumingTransport,
      });
    });

    socket.on(
      WSEvents.transportConnect,
      async (transportInfo: TransportConnectInfo) => {
        await handleTransportConnect(socket, transportInfo);
      }
    );

    socket.on(
      WSEvents.transportProduce,
      async (transportInfo: TransportProduceInfo) => {
        await handleTransportProduce(socket, transportInfo);
      }
    );

    socket.on(
      WSEvents.createConsumer,
      async (deviceRtpCapabilities: RtpCapabilities) => {
        await handleCreateConsumer(socket, deviceRtpCapabilities, router);
      }
    );

    socket.on(WSEvents.disconnect, () => {
      connections[socket.id] && delete connections[socket.id];
    });
  });

  console.log("ws server ready");
};

const updateConnections = (connectionId: string, io: WSServer) => {
  connections[connectionId] = { connectionId };

  io.emit(WSEvents.newPeer, connections);
};

const handleCreateTransport = async (
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
