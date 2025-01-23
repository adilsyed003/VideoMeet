"use client";
import { useState, useEffect, useRef } from "react";
import { useCallback } from "react";
import { useSocket } from "@/context/SocketUtils";
import { BackgroundLines } from "@/components/ui/background-lines";
import peer from "@/service/peer";
import { Spinner } from "@/components/ui/Spinner";
const Room = ({ params }: { params: { id: string } }) => {
  const roomId = params.id;
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [isCaller, setIsCaller] = useState<boolean>(false);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socket = useSocket();
  console.log(socket);
  const handleUserJoined = useCallback((data: { id: string }) => {
    console.log(data);
    setRemoteSocketId(data.id);
  }, []);
  //on second user
  const handleIncomingCall = useCallback(
    async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      try {
        // const str = await navigator.mediaDevices.getUserMedia({ video: true });
        const str = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(str);
      } catch (error) {
        console.error("Error accessing user media:", error);
      }
      setRemoteSocketId(data.from);
      console.log(data);
      const ans = await peer.getAnswer(data.offer);
      socket?.emit("call:accepted", { answer: ans, to: data.from });
    },
    [socket]
  );
  //on first user
  const handleCallUser = useCallback(async () => {
    try {
      // const str = await navigator.mediaDevices.getUserMedia({ video: true });
      const str = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(str);
      setIsCaller(true);
    } catch (error) {
      console.error("Error accessing user media:", error);
    }
    const offer = await peer.getOffer();
    socket.emit("call:user", { offer, to: remoteSocketId });
  }, [socket, remoteSocketId]);

  const sendStreams = useCallback(async () => {
    if (!stream) return;
    for (const track of stream.getTracks()) {
      if (peer.peer) {
        peer.peer.addTrack(track, stream);
      }
    }
  }, [stream]);
  const handleCallAccepted = useCallback(
    async (data: { answer: RTCSessionDescriptionInit }) => {
      //on first user
      console.log(data);
      await peer.setDescription(data.answer);
      sendStreams();
    },
    [sendStreams]
  );
  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);
  useEffect(() => {
    if (peer.peer) {
      peer.peer.addEventListener("negotiationneeded", handleNegotiationNeeded);
    }
    return () => {
      peer.peer?.removeEventListener(
        "negotiationneeded",
        handleNegotiationNeeded
      );
    };
  }, [handleNegotiationNeeded]);
  useEffect(() => {
    peer.peer?.addEventListener("track", (e) => {
      const remoteStreams = e.streams;
      console.log("Got Tracks", remoteStreams);
      setRemoteStream(remoteStreams[0]);
    });
  }, []);

  const handleNegotiationIncoming = useCallback(
    async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      const ans = await peer.getAnswer(data.offer);
      socket.emit("nego:done", { answer: ans, to: data.from });
    },
    [socket]
  );
  const handleNegoDone = useCallback(
    async (data: { answer: RTCSessionDescriptionInit }) => {
      await peer.setDescription(data.answer);
    },
    []
  );

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (socket) {
      socket.on("user:joined", handleUserJoined);
      socket.on("incoming:call", handleIncomingCall);
      socket.on("call:accepted", handleCallAccepted);
      socket.on("nego:needed", handleNegotiationIncoming);
      socket.on("nego:done", handleNegoDone);
    }
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("nego:needed", handleNegotiationIncoming);
      socket.off("nego:done", handleNegoDone);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegotiationIncoming,
    handleNegoDone,
  ]);

  return (
    <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 gap-24">
      <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-4xl md:text-5xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
        Room {roomId}
      </h2>

      {!remoteSocketId && (
        <div className="inline-flex flex-col items-center justify-center gap-4">
          <h1>Waiting for Others...</h1>
          <Spinner />
        </div>
      )}
      {remoteSocketId && (
        <div className="inline-flex flex-col items-center justify-center gap-4">
          <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-xl md:text-2xl lg:text-3xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
            Connection Found
          </h2>
          {!isCaller && !stream && (
            <button
              onClick={handleCallUser}
              className="px-10 py-4 rounded-full bg-[#1ED760] font-bold text-white tracking-widest uppercase transform hover:scale-105 hover:bg-[#21e065] transition-colors duration-200"
            >
              Call
            </button>
          )}

          {isCaller && !remoteStream && (
            <h3 className="text-lg font-medium">
              Waiting for the other user to accept...
            </h3>
          )}

          {!isCaller && stream && (
            <button
              onClick={sendStreams}
              className="px-10 py-4 rounded-full bg-[#1ED760] font-bold text-white tracking-widest uppercase transform hover:scale-105 hover:bg-[#21e065] transition-colors duration-200"
            >
              Accept
            </button>
          )}
        </div>
      )}
      <div className="flex flex-col md:flex-row items-center gap-10">
        {stream && (
          <div>
            <h1>Your Video</h1>
            <div className="bg-gray-500 p-4 rounded-lg m-4 h-72 w-72 sm:h-96 sm:w-96 lg:h-[30rem] lg:w-[30rem]">
              <video
                autoPlay
                muted
                style={{ height: "100%", width: "100%", borderRadius: "8px" }}
                ref={videoRef}
              >
                {" "}
              </video>
            </div>
          </div>
        )}
        {remoteStream && (
          <div>
            <h1>Remote Video</h1>
            <div className="bg-gray-500 p-4 rounded-lg m-4 h-72 w-72 sm:h-96 sm:w-96 lg:h-[30rem] lg:w-[30rem]">
              <video
                autoPlay
                style={{ height: "100%", width: "100%", borderRadius: "8px" }}
                ref={remoteVideoRef}
              >
                {" "}
              </video>
            </div>
          </div>
        )}
      </div>
    </BackgroundLines>
  );
};

export default Room;
