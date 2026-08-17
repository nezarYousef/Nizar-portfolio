"use client";

import { Images, Wrench } from "lucide-react";
import { useGallery } from "./GalleryProvider";

export default function GalleryButton({ id, label, className, variant = "gallery" }) {
  const { open } = useGallery();
  const Icon = variant === "gallery" ? Images : Wrench;

  return (
    <button
      className={className}
      type="button"
      aria-label={label}
      title={label}
      onClick={() => open(id)}
    >
      <Icon size={16} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
