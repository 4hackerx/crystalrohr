"use client";

import ReactPlayer from "react-player";

import clampBuilder from "@/utils/clamp-builder";
import { cn } from "@/utils";

function VideoPlayer({ url, className }: { url: string; className?: string }) {
  return (
    <div
      className={cn("rounded-md overflow-hidden", className)}
      style={{
        width: `${clampBuilder(320, 732, 14, 39.75)}`,
        height: "auto",
      }}
    >
      <ReactPlayer url={url} width="100%" height="100%" controls />
    </div>
  );
}

export default VideoPlayer;
