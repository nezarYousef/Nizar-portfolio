"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { whatsappHref } from "@/data/portfolio";

/* Same reasoning as PhoneReveal: a wa.me URL carries the number in plain
   sight, so the href is attached after mount instead of being served in the
   HTML. */
export default function WhatsappLink({ className, label }) {
  const [href, setHref] = useState(null);

  useEffect(() => {
    setHref(whatsappHref());
  }, []);

  if (!href) {
    return (
      <span className={className} aria-hidden="true">
        <MessageCircle size={18} />
      </span>
    );
  }

  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
    >
      <MessageCircle size={18} aria-hidden="true" />
    </a>
  );
}
