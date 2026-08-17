"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

/* Framer Motion and the gallery markup are only fetched when someone actually
   opens a project, so the animation library stays out of the initial load. */
const ProjectModal = dynamic(() => import("./ProjectModal"), { ssr: false });

const GalleryContext = createContext(null);

export function useGallery() {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error("useGallery must be used inside GalleryProvider");
  }
  return context;
}

export default function GalleryProvider({ projects, labels, modalCopy, children }) {
  const [openId, setOpenId] = useState(null);

  const open = useCallback((id) => setOpenId(id), []);
  const close = useCallback(() => setOpenId(null), []);

  const value = useMemo(() => ({ open, close, openId }), [open, close, openId]);
  const activeProject = projects.find((project) => project.id === openId) ?? null;

  return (
    <GalleryContext.Provider value={value}>
      {children}
      {activeProject ? (
        <ProjectModal
          project={activeProject}
          labels={labels}
          modalCopy={modalCopy}
          onClose={close}
        />
      ) : null}
    </GalleryContext.Provider>
  );
}
