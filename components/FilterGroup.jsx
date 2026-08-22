"use client";

import { useId, useState } from "react";
import styles from "./FilterGroup.module.css";

/* Holds the active filter and stamps it on the wrapper as a data attribute.
   The items themselves stay server-rendered - CSS decides what is shown, so
   filtering costs no re-render and every item is present in the HTML for
   search engines and for visitors without JavaScript. */
export default function FilterGroup({ options, label, children, className = "" }) {
  const [active, setActive] = useState("all");
  const groupId = useId();

  return (
    <div className={className}>
      <div className={styles.group} role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${styles.option} u-mono`}
            aria-pressed={active === option.value}
            onClick={() => setActive(option.value)}
            id={`${groupId}-${option.value}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div data-filter={active}>{children}</div>
    </div>
  );
}
