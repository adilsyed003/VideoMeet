"use client";
import { useMemo } from "react";
import PropTypes from "prop-types";
import { io, Socket } from "socket.io-client";
import { SocketContext } from "./SocketContext";

import { ReactNode } from "react";

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = (props: SocketProviderProps) => {
  const socket: Socket = useMemo(
    () => io(process.env.NEXT_PUBLIC_BACKEND_URL),
    []
  );
  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
