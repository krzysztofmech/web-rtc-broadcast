import { Device } from "mediasoup-client";
import React, {
  MutableRefObject,
  ReactNode,
  createContext,
  useContext,
  useRef,
} from "react";
import { Transport } from "mediasoup-client/lib/types";

type WebRTCProps = {
  children: ReactNode;
};

type WebRTCContextValue = {
  deviceRef: MutableRefObject<Device | null>;
  clientConsumingTransportRef: MutableRefObject<Transport | null>;
};

const WebRTCContext = createContext<WebRTCContextValue | null>(null);

export const WebRTC: React.FC<WebRTCProps> = ({ children }) => {
  const deviceRef = useRef<Device | null>(null);
  const clientConsumingTransportRef = useRef<Transport | null>(null);

  return (
    <WebRTCContext.Provider
      value={{ deviceRef, clientConsumingTransportRef }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTCContext = () => {
  const context = useContext(WebRTCContext);

  if (!context) {
    throw new Error("useWebRTCContext must be used within a WebRTCProvider");
  }

  return context;
};
