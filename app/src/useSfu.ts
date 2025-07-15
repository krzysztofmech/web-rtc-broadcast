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
import { CreateTransportsPayload } from "../../server/src/types";

export const useSfu = () => {
  const { socket, isConnected, setIsConnected } = useSocketContext();
  const { deviceRef, clientConsumingTransportRef } =
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
      socket.emit(WSEvents.createTransport);
    } catch (error) {
      console.warn("couldn't initialize device");
    }
  };

  const connect = async (username: string) => {
    try {
      socket.auth = { username };
      socket.connect();
    } catch (error) {
      console.error("couldn't connect");
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
      WSEvents.createTransport,
      async ({ consumingTransportOptions }: CreateTransportsPayload) => {
        await handleCreateTransports(consumingTransportOptions);
      },
    );

    socket.on(WSEvents.disconnect, () => {
      console.log("disconnected");
      socket.removeAllListeners();
    });
  };

  const handleCreateTransports = async (
    consumingTransportOptions: TransportOptions,
  ) => {
    try {
      const clientConsumingTransport = await createTransport(
        consumingTransportOptions,
      );

      if (clientConsumingTransport) {
        await subscribe(clientConsumingTransport);

        clientConsumingTransportRef.current = clientConsumingTransport;
      }
    } catch (error) {
      console.log("couldn't create local transports");
    }
  };

  const createTransport = async (
    transportOptions: TransportOptions,
  ): Promise<Transport | undefined> => {
    try {
      if (!deviceRef.current) {
        throw new Error("Device is not initialized");
      }

      const transport = deviceRef.current.createRecvTransport(transportOptions);

      return transport;
    } catch (error) {
      console.log("error during creating transports: ", error);
    }
  };

  const subscribe = async (clientConsumingTransport: Transport) => {
    clientConsumingTransport.on("connect", ({ dtlsParameters }, callback) => {
      try {
        socket.emit(WSEvents.transportConnect, {
          transportId: clientConsumingTransport.id,
          dtlsParameters,
          type: "consuming",
        });
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
    socket,
    isConnected,
    connect,
    createTransport,
    clientConsumingTransport: clientConsumingTransportRef.current,
    consume,
  };
};
