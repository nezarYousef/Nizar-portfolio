"use client";

import dynamic from "next/dynamic";

/* Client boundary so the intro bundle stays out of the initial payload until
   after hydration - and out of the page entirely for repeat visits, where the
   component decides within one effect that there is nothing to play. */
const IntroSequence = dynamic(() => import("./IntroSequence"), { ssr: false });

export default function IntroGate(props) {
  return <IntroSequence {...props} />;
}
