/* Single typed source for every project rendered on the site.
   Add a real URL to liveUrl / repoUrl and the matching button enables
   itself — no JSX changes needed. Projects without URLs render disabled
   "Coming soon" placeholders (aria-disabled + title tooltip).

   featured projects render as full cinematic scenes; the rest collapse
   into the compact "Other Projects" archive list below them. */

/** @typedef {{ src: string, alt: string }} GalleryImage */

/** @typedef {{
 *   id: string,
 *   title: string,
 *   description: string,
 *   tags: string[],
 *   cover?: string,
 *   previewFit?: "cover" | "contain",
 *   gallery?: GalleryImage[],
 *   highlights?: string[],
 *   liveUrl?: string,
 *   repoUrl?: string,
 *   featured?: boolean
 * }} Project */

const gallery = (folder, count) =>
  Array.from({ length: count }, (_, index) => ({
    src: `/images/${folder}/${index + 1}.webp`,
    alt: `${folder} project screenshot ${index + 1}`
  }));

const edufusionGallery = [
  ...gallery("edufusion", 10),
  {
    src: "/images/edufusion/11.webp",
    alt: "EduFusion AI LectureScribe screenshot"
  }
];

const aidSignGallery = [
  {
    src: "/images/aid-sign/1.webp",
    alt: "AidSign landing page with patient and doctor views"
  },
  {
    src: "/images/aid-sign/2.webp",
    alt: "AidSign patient and doctor experience cards"
  },
  {
    src: "/images/aid-sign/3.webp",
    alt: "AidSign patient view with phrasebook and sign recognition actions"
  },
  {
    src: "/images/aid-sign/4.0.webp",
    alt: "AidSign doctor view with communication scope and safety guidance"
  },
  {
    src: "/images/aid-sign/4.webp",
    alt: "AidSign doctor phrasebook with searchable sign cards"
  },
  {
    src: "/images/aid-sign/5.webp",
    alt: "AidSign sign recognition interface"
  },
  {
    src: "/images/aid-sign/6.webp",
    alt: "AidSign recognition controls and experimental result state"
  }
];

/** @type {Project[]} */
export const projects = [
  {
    id: "restaurant",
    featured: true,
    title: "Smart Restaurant Management",
    description:
      "A digital restaurant workflow system with role-based interfaces for customers, chefs, waiters, and administrators, designed around real-time order tracking and clean UI engineering.",
    tags: ["React.js", "HTML/CSS", "API", "UI Systems"],
    gallery: gallery("restaurant", 19)
  },
  {
    id: "grade",
    featured: true,
    title: "EduFusion AI",
    description:
      "A production-ready AI academic platform with authentication, dashboard, and chatbot integration.",
    tags: ["Python", "Machine Learning", "FastAPI", "AI", "LLM", "Chatbot"],
    cover: "/images/edufusion/ba.webp",
    gallery: edufusionGallery,
    highlights: [
      "Project Overview: EduPredict was developed as a graduation project focused on student success analytics. The project started with supervised, unsupervised, segmentation, semi-supervised, and hybrid machine learning experiments, then evolved into a practical temporal prediction system with a FastAPI backend.",
      "The final deliverable focuses on real-time style prediction: given a student's current course day, demographic information, VLE activity, and assessment submissions so far, the system returns a risk probability, risk level, recommended action, explanation, model confidence, and data completeness summary.",
      "LectureScribe AI converts YouTube lectures into readable text. It downloads the lecture audio, transcribes it with Faster-Whisper, optionally formats the transcript with Groq or Ollama, and keeps the text output for future cache hits.",
      "QuizForge is an AI-powered exam question generator that takes lecture files and automatically produces high-quality exam questions, supporting Arabic, English, and mixed-language content. Built with a local LLM, it runs entirely on your machine with full privacy and no cloud API costs.",
      "Smart chatbot for academic support, course guidance, and student questions."
    ]
  },
  {
    id: "vision",
    featured: true,
    title: "AidSign - Computer Vision Project",
    description:
      "An educational communication aid that combines a reviewed ASL phrasebook with a clearly labelled, experimental sign-recognition demo.",
    tags: ["Computer Vision", "Python", "AI", "OpenHands"],
    cover: "/images/aid-sign/1.webp",
    previewFit: "contain",
    gallery: aidSignGallery,
    highlights: [
      "Patient and doctor views keep the phrasebook, supported scope, and next steps clear for each role.",
      "The phrasebook supports searchable, categorized signs with a dedicated video for each reviewed phrase.",
      "Camera, upload, and technical sample flows are separated from verified content so the experimental recognition feature is not presented as a replacement for qualified interpretation."
    ]
  },
  {
    id: "advancedTasks",
    featured: true,
    title: "Advanced Task Management App",
    description:
      "A modern task management experience focused on clean UI architecture, advanced task organization, and maintainable React component structure.",
    tags: ["React.js", "Next.js", "HTML/CSS", "UI Engineering"],
    cover: "/images/advanced-tasks/ba.webp",
    gallery: gallery("advanced-tasks", 4)
  },
  {
    id: "shell",
    title: "Custom Unix Shell",
    description:
      "A C-based Linux shell built from scratch with internal commands, I/O redirection, batch files, background processes, environment variables, and error handling.",
    tags: ["C", "Linux/UNIX", "OS", "Systems"],
    repoUrl: "https://github.com/nezarYousef/shell.git"
  },
  {
    id: "school",
    title: "School Management System",
    description:
      "A Java desktop system for managing students, classes, and administrative records using object-oriented design.",
    tags: ["Java", "OOP", "Desktop App"],
    repoUrl: "https://github.com/nezarYousef/school.git"
  },
  {
    id: "expenses",
    title: "Expense Tracker App",
    description:
      "A personal finance interface for recording, categorizing, and monitoring spending, built with practical JavaScript and React UI patterns.",
    tags: ["React.js", "JavaScript", "HTML/CSS", "State Management"],
    gallery: gallery("expenses", 2)
  },
  {
    id: "tasks",
    title: "Task Management App",
    description:
      "A productivity application for creating, organizing, and tracking daily tasks with a clear user flow and responsive interface.",
    tags: ["React.js", "JavaScript", "HTML/CSS", "Productivity"],
    gallery: gallery("tasks", 5)
  },
  {
    id: "ai",
    title: "AI Assistant Tools",
    description:
      "AI and API-based tools that simplify learning, improve access to information, and support understanding complex concepts through intelligent assistance.",
    tags: ["AI", "API", "Python", "Automation"]
  }
];

export const featuredProjects = /** @type {Project[]} */ (
  projects.filter((project) => project.featured)
);

export const archiveProjects = /** @type {Project[]} */ (
  projects.filter((project) => !project.featured)
);
