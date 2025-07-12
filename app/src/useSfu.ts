import { useEffect } from "react";
import { useSocketContext } from "@/Context/Socket";
import { useWebRTCContext } from "@/Context/WebRTC";
import { Device } from "mediasoup-client";
import {
  RtpCapabilities,
  TransportOptions,
  Device as TDevice,
  Transport,
  ConsumerOptions,
} from "mediasoup-client/lib/types";
import { WSEvents } from "../../server/src/constants";
import {
  CreateTransportsPayload,
  TransportType,
} from "../../server/src/types";

export const useSfu = () => {
  const { socket, isConnected, setIsConnected } = useSocketContext();
  const { deviceRef, user, setUser, clientConsumingTransportRef } =
    useWebRTCContext();

  useEffect(() => {
    addWsEventListeners();
    return () => {
      socket.removeAllListeners();
    };
  }, []);

  const initializeDevice = async (rtpCapabilities: RtpCapabilities) => {
    try {
      const newDevice: TDevice = new Device();
      await newDevice.load({
        routerRtpCapabilities: rtpCapabilities,
      });

      deviceRef.current = newDevice;
      socket.emit(WSEvents.createTransports);
    } catch (error) {
      console.warn("couldn't initialize device");
    }
  };

  const connect = async (username: string) => {
    try {
      socket.auth = { username };
      socket.connect();
    } catch (error) {
      console.log("couldn't connect");
    }
  };

  const addWsEventListeners = () => {
    socket.on(WSEvents.connect, () => {
      if (socket.connected) {
        setIsConnected(socket.connected);
      }
    });

    socket.on(WSEvents.loadDevice, (rtpCapabilities: RtpCapabilities) => {
      initializeDevice(rtpCapabilities);
    });

    socket.on(
      WSEvents.createTransports,
      async ({
        producingTransportOptions,
        consumingTransportOptions,
      }: CreateTransportsPayload) => {
        await handleCreateTransports(
          producingTransportOptions,
          consumingTransportOptions,
        );
      },
    );

    socket.on(WSEvents.disconnect, () => {
      console.log("disconnected");
      socket.removeAllListeners();
    });
  };

  const handleCreateTransports = async (
    producingTransportOptions: TransportOptions,
    consumingTransportOptions: TransportOptions,
  ) => {
    try {
      const clientProducingTransport = await createTransport(
        producingTransportOptions,
        "producing",
      );

      const clientConsumingTransport = await createTransport(
        consumingTransportOptions,
        "consuming",
      );

      if (clientConsumingTransport && clientProducingTransport) {
        console.log(
          "created local transports: ",
          clientProducingTransport,
          clientConsumingTransport,
        );
        await subscribe(clientProducingTransport, clientConsumingTransport);

        // setClientProducingTransport(clientProducingTransport);
        clientConsumingTransportRef.current = clientConsumingTransport;
      }
    } catch (error) {
      console.log("couldn't create local transports");
    }
  };

  const createTransport = async (
    transportOptions: TransportOptions,
    type: TransportType,
  ): Promise<Transport | undefined> => {
    try {
      if (!deviceRef.current) {
        throw new Error("Device is not initialized");
      }

      const transport =
        type === "producing"
          ? deviceRef.current.createSendTransport(transportOptions)
          : deviceRef.current.createRecvTransport(transportOptions);

      return transport;
    } catch (error) {
      console.log("error during creating transports: ", error);
    }
  };

  const subscribe = async (
    clientProducingTransport: Transport,
    clientConsumingTransport: Transport,
  ) => {
    clientProducingTransport.on("connect", ({ dtlsParameters }, callback) => {
      try {
        console.log(
          "producing transport connect",
          dtlsParameters,
          clientProducingTransport.id,
        );
        socket.emit(WSEvents.transportConnect, {
          transportId: clientProducingTransport.id,
          dtlsParameters,
          type: "producing",
        });

        callback();
      } catch (error) {
        console.log("failed to connect");
      }
    });

    clientProducingTransport.on(
      "produce",
      async ({ appData, kind, rtpParameters }, callback) => {
        try {
          console.log(
            "producing transport produce",
            appData,
            kind,
            rtpParameters,
          );

          socket.on(WSEvents.transportProduce, (producerId) => {
            callback({ id: producerId });
          });

          const transportProduceInfo = {
            transportId: clientProducingTransport.id,
            kind,
            rtpParameters,
            appData,
            type: "producing",
          };

          socket.emit(WSEvents.transportProduce, transportProduceInfo);
        } catch (error) {
          console.log("failed to produce");
        }
      },
    );

    clientConsumingTransport.on("connect", ({ dtlsParameters }, callback) => {
      try {
        socket.emit(WSEvents.transportConnect, {
          transportId: clientConsumingTransport.id,
          dtlsParameters,
          type: "consuming",
        });
        console.log('successfully connected consuming transport');
        callback();
      } catch (error) {
        console.log("failed to connect");
      }
    });
  };

  const consume = async (consumerOptions: ConsumerOptions) => {
    const { id, producerId, kind, rtpParameters } = consumerOptions;
    if (!clientConsumingTransportRef.current) {
      console.error("Client consuming transport is not initialized");
      return;
    }

    const consumer = await clientConsumingTransportRef.current.consume({
      id,
      producerId,
      kind,
      rtpParameters,
    });

    return consumer;
  };

  return {
    device: deviceRef.current,
    user,
    socket,
    isConnected,
    connect,
    createTransport,
    clientConsumingTransport: clientConsumingTransportRef.current,
    consume,
  };
};
