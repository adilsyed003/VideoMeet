"use client";
import { createContext } from "react";
import { Socket } from "socket.io-client";

const defaultSocket = {
  emit: () => defaultSocket as unknown as Socket,
  on: () => defaultSocket as unknown as Socket,
  off: () => defaultSocket as unknown as Socket,
};

export const SocketContext = createContext<Socket>(
  defaultSocket as unknown as Socket
);
