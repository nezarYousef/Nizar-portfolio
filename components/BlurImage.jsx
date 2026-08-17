"use client";

import Image from "next/image";
import { useState } from "react";

export default function BlurImage({ className = "", onLoad, ...props }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...props}
      className={`blur-load-image ${loaded ? "is-loaded" : ""} ${className}`.trim()}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
    />
  );
}
