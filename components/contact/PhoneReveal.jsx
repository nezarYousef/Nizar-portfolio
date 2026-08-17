"use client";

import { Phone } from "lucide-react";
import { useState } from "react";
import { joinPhone, phoneHref } from "@/data/portfolio";
import styles from "./PhoneReveal.module.css";

/* The number is assembled from parts on click, so the served HTML contains
   neither the digits nor a tel: href. That defeats the harvesters that just
   regex the markup; a scraper that executes JavaScript can still reach it,
   which is the honest limit of any client-side approach. A recruiter pays
   one click. */
export default function PhoneReveal({ label, revealLabel, hint }) {
  const [revealed, setRevealed] = useState(false);

  if (!revealed) {
    return (
      <button
        className={styles.trigger}
        type="button"
        onClick={() => setRevealed(true)}
      >
        <Phone size={18} aria-hidden="true" />
        <span>{revealLabel}</span>
        <span className={styles.hint}>{hint}</span>
      </button>
    );
  }

  return (
    <a className={styles.link} href={phoneHref()}>
      <Phone size={18} aria-hidden="true" />
      <span>{label}</span>
      <span className={`${styles.number} u-mono`} dir="ltr">
        {joinPhone()}
      </span>
    </a>
  );
}
