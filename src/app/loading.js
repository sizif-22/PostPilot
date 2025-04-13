import { Zoomies } from "ldrs/react";
import "ldrs/react/Zoomies.css";

export default function Loading() {
  return (
    <div className="h-screen flex justify-center flex-col items-center bg-black gap-3 text-white">
      <h1 className="text-2xl md:text-4xl select-none font-Jersey">
        Post Pilot
      </h1>
      <Zoomies
        size="100"
        stroke="5"
        bgOpacity="0.1"
        speed="1.4"
        color="white"
      />
    </div>
  );
}
