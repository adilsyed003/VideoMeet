"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCallback, useEffect } from "react";
// import { useNavigate } from 'react-router-dom'
import { useSocket } from "@/context/SocketUtils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Socket } from "socket.io-client";

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  room: z.number().min(1, {
    message: "Room no. must be a number and greater than 0.",
  }),
});

export function ProfileForm() {
  const socket = useSocket() as Socket;
  // const navigate = useNavigate()
  const onSubmit = useCallback(
    (data: z.infer<typeof formSchema>) => {
      console.log(data.username, data.room);
      socket.emit("join:room", { name: data.username, room: data.room });
    },
    [socket]
  );

  const router = useRouter();

  interface JoinRoomData {
    room: number;
  }

  const handleJoin = useCallback(
    (data: JoinRoomData) => {
      console.log(data);
      if (router) {
        router.push(`/room/${data.room}`);
      }
    },
    [router]
  );

  useEffect(() => {
    if (socket && socket.on && socket.off) {
      socket.on("join:room", handleJoin);
      return () => {
        socket.off("join:room", handleJoin);
      };
    }
  }, [socket, handleJoin]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // const onSubmit = (data: z.infer<typeof formSchema>) => {
  //   data.room = Number(data.room);
  //   console.log(data);
  // };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 w-full md:w-xl mx-auto p-4 "
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input type="" placeholder="adil.." {...field} />
              </FormControl>
              <FormDescription>Your name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="room"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room no.</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="1"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>Room ID / Existing Room ID</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
