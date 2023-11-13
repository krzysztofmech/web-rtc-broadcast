import { useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketProvider";
import { Device } from "mediasoup-client";
import {
  RtpCapabilities,
  TransportOptions,
  Device as TDevice,
  Transport,
  Consumer,
} from "mediasoup-client/lib/types";
import { WSEvents } from "./constants";
import { CreateWebRtcTransportPayload, UserTransport } from "./types";

export const useSignalingChannel = () => {
  const { socket } = useContext(SocketContext);
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [consumers, _] = useState<Consumer[]>([]);
  const [device, setDevice] = useState<Device>();
  const [consumingTransport, setConsumingTransport] = useState<Transport>();
  const [producingTransport, setProducingTransport] = useState<Transport>();

  useEffect(() => {
    initializeDivice();
    return () => {
      socket.removeAllListeners();
      socket.off(WSEvents.disconnect);
    };
  }, []);

  const initializeDivice = async () => {
    try {
      const device: TDevice = new Device();

      setDevice(device);
    } catch (error) {
      console.warn("couldn't initialize device");
    }
  };

  const connect = async (connectionId: string) => {
    socket.auth = { connectionId };
    socket.connect();
    await addWsEventListeners();
    socket.emit(WSEvents.createWebRtcTransport);
  };

  const addWsEventListeners = async () => {
    socket.on(WSEvents.ready, () => {
      socket.connected ? setIsConnected(true) : setIsConnected(false);
      console.log("ready");
    });

    socket.on(WSEvents.disconnect, () => {
      console.log("disconnected");
      socket.removeAllListeners();
    });

    socket.on(
      WSEvents.createWebRtcTransport,
      async ({
        webRtcProducingTransport,
        webRtcConsumingTransport,
      }: CreateWebRtcTransportPayload) => {
        await handleCreateWebRtcTransport(
          webRtcProducingTransport,
          webRtcConsumingTransport
        );
      }
    );
  };

  const handleCreateWebRtcTransport = async (
    webRtcProducingTransport: UserTransport,
    webRtcConsumingTransport: UserTransport
  ) => {
    try {
      console.log(
        "received web rtc transports: ",
        webRtcProducingTransport,
        webRtcConsumingTransport
      );

      const producingTransport = await createTransport(
        webRtcProducingTransport.rtpCapabilities,
        webRtcProducingTransport.transportOptions,
        webRtcProducingTransport.type
      );

      const consumingTransport = await createTransport(
        webRtcConsumingTransport.rtpCapabilities,
        webRtcConsumingTransport.transportOptions,
        webRtcConsumingTransport.type
      );

      if (producingTransport && consumingTransport) {
        console.log(
          "created local transports: ",
          producingTransport,
          consumingTransport
        );
        await subscribe(producingTransport, consumingTransport);

        setProducingTransport(producingTransport);
        setConsumingTransport(consumingTransport);
      }
    } catch (error) {
      console.log("couldn't create local transports");
    }
  };

  const createTransport = async (
    rtpCapabilities: RtpCapabilities,
    transportOptions: TransportOptions,
    type: "producing" | "consuming"
  ): Promise<Transport | undefined> => {
    try {
      if (device) {
        !device.loaded &&
          (await device.load({
            routerRtpCapabilities: rtpCapabilities,
          } as any));

        const transport =
          type === "producing"
            ? device.createSendTransport(transportOptions)
            : device.createRecvTransport(transportOptions);

        return transport;
      }

      console.log("couldn't find device");
    } catch (error) {
      console.log("error during creating transports: ", error);
    }
  };

  const subscribe = async (
    producingTransport: Transport,
    consumingTransport: Transport
  ) => {
    producingTransport.on("connect", ({ dtlsParameters }, callback) => {
      try {
        console.log(
          "producing transport connect",
          dtlsParameters,
          producingTransport.id
        );
        socket.emit(WSEvents.transportConnect, {
          transportId: producingTransport.id,
          dtlsParameters,
          type: "producing",
        });

        callback();
      } catch (error) {
        console.log("failed to connect");
      }
    });

    producingTransport.on(
      "produce",
      async ({ appData, kind, rtpParameters }, callback) => {
        try {
          console.log(
            "producing transport produce",
            appData,
            kind,
            rtpParameters
          );

          socket.emit(WSEvents.transportProduce, {
            transportId: producingTransport.id,
            kind,
            rtpParameters,
            appData,
            type: "producing",
            room,
            username,
          });

          socket.on(WSEvents.transportProduce, (producerId) => {
            callback({ id: producerId });
          });
        } catch (error) {
          console.log("failed to produce");
        }
      }
    );

    consumingTransport.on("connect", ({ dtlsParameters }, callback) => {
      try {
        console.log(
          "consuming transport connect",
          dtlsParameters,
          consumingTransport.id
        );
        socket.emit(WSEvents.transportConnect, {
          transportId: consumingTransport.id,
          dtlsParameters,
          type: "consuming",
        });
        callback();
      } catch (error) {
        console.log("failed to connect");
      }
    });
  };

  const startConsuming = async ({
    producerId,
    id,
    rtpParameters,
    appData,
    kind,
  }: Consumer) => {
    try {
      console.log("transport", id, producerId, rtpParameters, appData, kind);

      if (consumingTransport) {
        const consumer = await consumingTransport.consume({
          producerId,
          id,
          rtpParameters,
          appData,
          kind,
        });
        return consumer;
      }
    } catch (error) {
      console.log("error during consuming", error);
    }
  };

  const disconnect = () => {
    socket.disconnect();
    setIsConnected(false);
  };

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    createTransport,
    consumers,
    startConsuming,
    consumingTransport,
    producingTransport,
    username,
    room,
    setUsername,
    setRoom,
  };
};
