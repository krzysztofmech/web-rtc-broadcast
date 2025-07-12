import { Device } from "mediasoup-client";
import React, {
  Dispatch,
  MutableRefObject,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useRef,
  useState,
} from "react";
import { User } from "../../../server/src/types";
import { Transport } from "mediasoup-client/lib/types";

type WebRTCProps = {
  children: ReactNode;
};

type WebRTCContextValue = {
  deviceRef: MutableRefObject<Device | null>;
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  clientConsumingTransportRef: MutableRefObject<Transport | null>;
};

const WebRTCContext = createContext<WebRTCContextValue | null>(null);

export const WebRTC: React.FC<WebRTCProps> = ({ children }) => {
  const deviceRef = useRef<Device | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const clientConsumingTransportRef = useRef<Transport | null>(null);

  return (
    <WebRTCContext.Provider
      value={{ deviceRef, user, setUser, clientConsumingTransportRef }}
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
