"use client";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { ProfileForm } from "@/components/Form";
// import { Form } from "@/components/ui/form";
// import Image from "next/image";
import { BackgroundLines } from "@/components/ui/background-lines";
export default function Home() {
  return (
    // <div className="flex flex-col font-[family-name:var(--font-geist-sans)]">
    //   <ProfileForm />
    // </div>
    <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 gap-24">
      <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-4xl md:text-5xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
        Connect, Chat, Share – All in One Place!
      </h2>
      <div className="z-50">
        <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-zinc-950   ">
          <ProfileForm />
        </BackgroundGradient>
      </div>
    </BackgroundLines>
  );
}
