"use client";

import Image from "next/image";
import { useState } from "react";

/* next/image with a soft fade-in once the bitmap has decoded. */
export default function BlurImage({ className = "", onLoad, style, ...props }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...props}
      className={className}
      ref={(node) => {
        // Cached images can finish before hydration; don't leave them hidden.
        if (node?.complete && node.naturalWidth > 0 && !loaded) setLoaded(true);
      }}
      style={{
        ...style,
        opacity: loaded ? 1 : 0,
        transition: "opacity 600ms cubic-bezier(0.23, 1, 0.32, 1)"
      }}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
    />
  );
}
