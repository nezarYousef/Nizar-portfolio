export const profileImage = "/images/profile/nizar-profile-full.webp";

const coreStack = [
  "Python",
  "Java",
  "C",
  "JavaScript",
  "HTML/CSS",
  "React.js",
  "Next.js",
  "Machine Learning",
  "AI",
  "CNN",
  "Computer Vision",
  "PyCaret",
  "API",
  "OOP"
];

/* Project content now lives in ./projects.js (typed, featured/archive
   split, live/repo URL fields). This file keeps site-wide copy only. */

/* The phone number is stored in parts and joined at runtime, so neither the
   digits nor a `tel:` / `wa.me` href ever appear in the served HTML. Resolves
   to the same destinations as before: tel:+972597781945 and
   https://wa.me/972597781945 */
export const phoneParts = ["+972", "59", "778", "1945"];

export const joinPhone = () => phoneParts.join("");
export const phoneHref = () => `tel:${joinPhone()}`;
export const whatsappHref = () => `https://wa.me/${joinPhone().replace("+", "")}`;

const contactLinks = {
  email: "mailto:nizaryousef01@gmail.com",
  github: "https://github.com/nezarYousef",
  linkedin: "https://linkedin.com/in/nizar-alqerem-33829a3a1",
  instagram: "https://www.instagram.com/eng.nizar_/"
};

/* Download-CV wiring. Drop the PDF into public/ (e.g. /cv/nizar-alqerem.pdf)
   and set path below - the hero and contact buttons enable themselves. While
   path is null both render as disabled "coming soon" placeholders, matching
   the projects-button convention. */
export const cvConfig = /** @type {{ path: string | null }} */ ({ path: null });

/* ── Skill evidence ─────────────────────────────────────────────────────────
   Replaces the old self-assigned `level` percentages. Every entry below is
   sourced from content that already exists elsewhere in this file: `projects`
   lists the ids of projects whose own `tags` contain the skill, and `programs`
   points at a program listed under `experience` or `education`.
   Nothing here is an assessment - it is a join over the existing data.
   Skills with neither key have no linked proof yet and render as a plain name.
   ────────────────────────────────────────────────────────────────────────── */
const SKILL_EVIDENCE = {
  JavaScript: { projects: ["expenses", "tasks"] },
  Python: { projects: ["grade", "ai", "vision"] },
  Java: { projects: ["school"] },
  C: { projects: ["shell"] },

  "React.js": { projects: ["restaurant", "expenses", "tasks", "advancedTasks"] },
  "HTML/CSS": { projects: ["restaurant", "expenses", "tasks", "advancedTasks"] },
  API: { projects: ["restaurant", "ai"] },
  "Next.js": { projects: ["advancedTasks"] },
  "Responsive UI": { programs: ["masar"] },

  AI: { projects: ["grade", "ai", "vision"] },
  ML: { projects: ["grade"] },
  "Data Preprocessing": { programs: ["gsgVision"] },
  PyCaret: {},

  "Computer Vision": { projects: ["vision"], programs: ["gsgVision"] },
  CNN: { programs: ["gsgVision"] },
  "Deep Learning": { programs: ["gsgVision"] },
  "Image Processing": { programs: ["gsgVision"] },

  OOP: { projects: ["school"], programs: ["iug"] },
  "System Design": { programs: ["iug"] },
  "Clean Code": { programs: ["masar"] },

  "Git/GitHub": { projects: ["shell", "school"] },
  "REST API": { projects: ["restaurant", "ai"] },
  "Linux/UNIX": { projects: ["shell"] },
  "Digital Tools": {}
};

/* Program labels are composed from the title + company of entries that already
   exist under `experience` and `education` in each language. */
const PROGRAM_LABELS = {
  en: {
    masar: "Masar Institute - Frontend Development Internship",
    gsgFoundations: "Gaza Sky Geeks - Programming Fundamentals & Algorithms",
    gsgVision: "Gaza Sky Geeks - Computer Vision and Neural Networks",
    iug: "Islamic University of Gaza - Computer Engineering"
  },
  ar: {
    masar: "معهد مسار - تدريب تطوير واجهات أمامية",
    gsgFoundations: "Gaza Sky Geeks - أساسيات البرمجة والخوارزميات",
    gsgVision: "Gaza Sky Geeks - الرؤية الحاسوبية والشبكات العصبية",
    iug: "الجامعة الإسلامية بغزة - هندسة حاسوب"
  }
};

const EVIDENCE_LABELS = {
  en: {
    usedIn: "Used in",
    studiedIn: "Studied in",
    filterAll: "All",
    filterLabel: "Filter skill categories",
    details: "View details",
    back: "Back"
  },
  ar: {
    usedIn: "مستخدمة في",
    studiedIn: "مدروسة في",
    filterAll: "الكل",
    filterLabel: "تصفية فئات المهارات",
    details: "عرض التفاصيل",
    back: "رجوع"
  }
};

/* Only one skill name was ever translated; the rest stay as written. */
const SKILL_NAMES = {
  en: {},
  ar: { "Responsive UI": "واجهات متجاوبة" }
};

const buildSkillCategories = (lang, spec) =>
  spec.map((category) => ({
    title: category.title,
    items: category.items.map((key) => {
      const evidence = SKILL_EVIDENCE[key] ?? {};
      return {
        key,
        name: SKILL_NAMES[lang][key] ?? key,
        projects: evidence.projects ?? [],
        programs: evidence.programs ?? []
      };
    })
  }));

export const portfolioCopy = {
  en: {
    lang: "en",
    dir: "ltr",
    brand: "Nizar Alqerem",
    nav: [
      { id: "about", label: "About" },
      { id: "skills", label: "Skills" },
      { id: "projects", label: "Projects" },
      { id: "experience", label: "Experience" },
      { id: "other-experience", label: "Community & Field Work" },
      { id: "education", label: "Education" },
      { id: "contact", label: "Contact" }
    ],
    controls: {
      language: "AR",
      languageLabel: "Switch to Arabic",
      themeLabel: "Toggle light and dark mode",
      menuLabel: "Open navigation menu",
      closeMenuLabel: "Close navigation menu"
    },
    ui: {
      skipToContent: "Skip to content",
      skipIntro: "Skip intro",
      sectionRailLabel: "Section navigation",
      mainNavLabel: "Main navigation",
      readingProgress: "Reading progress",
      decorativeVisual: "Decorative visualization"
    },
    hero: {
      eyebrow: "Computer Engineer / Software, AI & Web",
      name: "Nizar Y. Alqerem",
      identity: "Computer Engineer - Palestine 🇵🇸",
      title: "Computer engineer building software, intelligent systems, and modern web experiences.",
      typedRole: "AI + Web Engineering",
      primaryAction: "View Projects",
      secondaryAction: "Get In Touch",
      downloadCv: "Download CV",
      status: "Available for software, web, and AI opportunities",
      imageAlt: "Portrait of Nizar Yousef Alqerem",
      stats: [
        { value: "9", label: "Engineering Projects" },
        { value: "2026", label: "Computer Engineering Graduate" },
        { value: "AI + Web", label: "Core Technical Focus" }
      ]
    },
    /* Owner's real text, kept verbatim. Suggestion for a future pass (owner's
       call, intentionally not applied): tighten the generic openers —
       "highly motivated" and "strong foundation" carry no information a
       recruiter can verify. Replacing them with one concrete fact (e.g. the
       graduation project, or the 96% GPA already listed under Education)
       would make the first line do real work. */
    about: {
      eyebrow: "About Me",
      title: "A computer engineer who connects software fundamentals with AI and polished interfaces.",
      paragraphs: [
        "I'm a highly motivated computer engineering student at the Islamic University of Gaza with a strong foundation in programming, algorithms, data structures, operating systems, and software development.",
        "My work spans practical web interfaces, object-oriented Java applications, C system programming, machine learning pipelines, AI tools, and computer vision experiments using CNN concepts.",
        "I enjoy turning engineering ideas into reliable products: clean user interfaces, structured APIs, maintainable code, and intelligent features that solve real problems."
      ],
      highlights: [
        "Programming foundation across Python, Java, C, and JavaScript",
        "Modern web development with HTML/CSS, React.js, Next.js, and API integration",
        "Applied AI skills in Machine Learning, PyCaret, CNN concepts, and Computer Vision",
        "OOP and desktop application experience"
      ],
      cardTitle: "Computer Engineering Profile",
      cardMeta: "Software Systems / AI / Web Engineering",
      availability: "Available for hire"
    },
    skills: {
      eyebrow: "Technical Stack",
      title: "A stack that covers systems, web interfaces, AI, and applied software projects.",
      evidence: EVIDENCE_LABELS.en,
      programs: PROGRAM_LABELS.en,
      categories: buildSkillCategories("en", [
        {
          title: "Programming Lang",
          items: ["JavaScript", "Python", "Java", "C"]
        },
        {
          title: "Web Engineering",
          items: ["React.js", "HTML/CSS", "API", "Next.js", "Responsive UI"]
        },
        {
          title: "AI & Machine Learning",
          items: ["AI", "ML", "Data Preprocessing", "PyCaret"]
        },
        {
          title: "Computer Vision",
          items: ["Computer Vision", "CNN", "Deep Learning", "Image Processing"]
        },
        {
          title: "Software Engineering",
          items: ["OOP", "System Design", "Clean Code"]
        },
        {
          title: "Tools & Workflow",
          items: ["Git/GitHub", "REST API", "Linux/UNIX", "Digital Tools"]
        }
      ]),
      coreStack
    },
    projects: {
      eyebrow: "Featured Engineering Work",
      title: "Projects across web development, systems programming, AI, and applied software.",
      viewGallery: "View project gallery",
      viewGithub: "View on GitHub",
      viewLive: "Live Demo",
      comingSoon: "Details coming soon",
      soon: "Coming soon",
      screenshots: "screenshots",
      inDevelopment: "In Development",
      archiveTitle: "Other Projects",
      filterLabel: "Filter projects by category",
      filters: { all: "All", web: "Web", ai: "AI", systems: "Systems" }
    },
    experience: {
      eyebrow: "Experience",
      title: "Practical training in frontend engineering with a broader computer engineering foundation.",
      items: [
        {
          title: "Frontend Development Internship",
          company: "Masar Institute",
          date: "2026",
          points: [
            "Built responsive web interfaces using HTML, CSS, JavaScript, React.js, and Next.js",
            "Applied UI/UX principles to create clearer and more usable software interfaces",
            "Developed practical projects with clean, maintainable, and component-based code",
            "Strengthened API integration, teamwork, and professional development workflow"
          ]
        },
        {
          title: "SkillStack Paths - Programming & DSA",
          company: "Gaza Sky Geeks",
          date: "May 2023 - Aug 2025",
          points: ["Programming Fundamentals", "Data Structures & Algorithms"]
        },
        {
          title: "SkillStack Paths - Neural Networks & Computer Vision",
          company: "Gaza Sky Geeks",
          date: "March 2026 - July 2026",
          points: [
            "Computer Vision and Neural Networks",
            "Learned image formation fundamentals and core visual data concepts",
            "Practiced preprocessing, feature detection, and feature matching techniques",
            "Explored image registration, stereo vision, and multi-view reconstruction",
            "Studied image classification, object detection, and segmentation workflows",
            "Covered motion estimation, object tracking, and action recognition"
          ]
        }
      ]
    },
    otherExperience: {
      eyebrow: "Community & Field Work",
      title: "Field, interview, and coordination work shaped by responsibility and accuracy.",
      items: [
        {
          title: "Student Interviewer & Evaluator",
          company: "Masarat Initiative - Cohort 2",
          date: "2026",
          image: "/images/other-experience/masar.webp",
          imageAlt: "Nizar conducting student evaluation work for Masarat Initiative",
          points: [
            "Conducted structured interviews to assess applicants for the second cohort of the Masarat Initiative",
            "Evaluated students based on motivation, technical aptitude, and potential for growth",
            "Contributed to the selection of qualified candidates for the program"
          ]
        },
        {
          title: "Data Collection & Entry",
          company: "Reach Education Fund",
          date: "Feb 2024 - May 2024",
          image: "/images/other-experience/reach-1.webp",
          imageAlt: "Reach Education Fund data collection and entry work",
          points: [
            "Collected field data on displaced families during the 2023-2024 conflict",
            "Entered large volumes of data efficiently with a high degree of accuracy",
            "Maintained data confidentiality and met all deadlines"
          ]
        },
        {
          title: "Scholarship Interview Coordinator Assistant",
          company: "Reach Education Fund",
          date: "2026",
          image: "/images/other-experience/coordinator.webp",
          imagePosition: "center 25%",
          imageAlt: "Reach Education Fund scholarship interview coordination work",
          points: [
            "Coordinated and managed the interview process for students eligible for the 2026 scholarship cycle",
            "Arranged candidate schedules and facilitated the interview environment",
            "Supported panel members with documentation and records"
          ]
        },
        {
          title: "Relief Work",
          company: "Reach Education Fund",
          date: "May 2024 - May 2025",
          image: "/images/other-experience/reach-2.webp",
          imageAlt: "Reach Education Fund relief work in the field",
          points: [
            "Conducted field investigations to identify urgent needs among displaced families",
            "Participated in the distribution of humanitarian aid during the 2023 conflict",
            "Ensured accurate documentation and reporting of aid activities"
          ]
        }
      ]
    },
    education: {
      eyebrow: "Education",
      title: "Computer engineering foundations behind software, systems, and intelligent applications.",
      items: [
        {
          title: "Bachelor's Degree in Computer Engineering",
          company: "Islamic University of Gaza",
          date: "2021 - 2026",
          points: [
            "Studied programming, algorithms, data structures, computer architecture, and software engineering fundamentals",
            "Built knowledge in operating systems, databases, APIs, and applied software development",
            "Worked on academic and practical projects in web development, machine learning, and system programming",
            "Developed analytical thinking, OOP design habits, and technical problem-solving skills"
          ]
        },
        {
          title: "High School Diploma - Scientific Stream",
          company: "Palestine School - Secondary Boys School",
          date: "2020 - 2021",
          points: [
            "Graduated with honors, achieving a GPA of 96%",
            "Excelled in mathematics, physics, and computer science",
            "Demonstrated leadership and discipline in academic projects"
          ]
        }
      ]
    },
    contact: {
      eyebrow: "Contact",
      title: "Let's build software that is useful, intelligent, and well-engineered.",
      description:
        "I'm interested in software engineering, frontend development, AI, machine learning, and computer vision opportunities. Feel free to reach out for collaborations, projects, or technical discussions.",
      emailLabel: "Email Me",
      phoneLabel: "Call Me",
      downloadCv: "Download CV",
      availability: "Available for new opportunities",
      showPhone: "Show phone number",
      phoneRevealHint: "Revealed on request to keep it away from scrapers",
      links: contactLinks
    },
    modal: {
      close: "Close modal",
      emptyTitle: "Coming Soon",
      emptyBody: "Project details and documentation will be added soon."
    },
    footer: "2026 Nizar Yousef Alqerem. Computer Engineer."
  },
  ar: {
    lang: "ar",
    dir: "rtl",
    brand: "نزار القرَم",
    nav: [
      { id: "about", label: "نبذة" },
      { id: "skills", label: "المهارات" },
      { id: "projects", label: "المشاريع" },
      { id: "experience", label: "الخبرة" },
      { id: "other-experience", label: "أعمال مجتمعية وميدانية" },
      { id: "education", label: "التعليم" },
      { id: "contact", label: "التواصل" }
    ],
    controls: {
      language: "EN",
      languageLabel: "التبديل إلى الإنجليزية",
      themeLabel: "تبديل الوضع الليلي والنهاري",
      menuLabel: "فتح قائمة التنقل",
      closeMenuLabel: "إغلاق قائمة التنقل"
    },
    ui: {
      skipToContent: "تخطي إلى المحتوى",
      skipIntro: "تخطي المقدمة",
      sectionRailLabel: "التنقل بين الأقسام",
      mainNavLabel: "التنقل الرئيسي",
      readingProgress: "تقدم القراءة",
      decorativeVisual: "رسم توضيحي زخرفي"
    },
    hero: {
      eyebrow: "مهندس حاسوب / برمجيات وذكاء اصطناعي وويب",
      name: "نزار يوسف القرَم",
      identity: "مهندس حاسوب - فلسطين 🇵🇸",
      title: "مهندس حاسوب يبني برمجيات وأنظمة ذكية وتجارب ويب حديثة.",
      typedRole: "هندسة ذكاء وويب",
      primaryAction: "عرض المشاريع",
      secondaryAction: "تواصل معي",
      downloadCv: "تحميل السيرة الذاتية",
      status: "متاح لفرص البرمجيات والويب والذكاء الاصطناعي",
      imageAlt: "صورة شخصية لنزار يوسف القرَم",
      stats: [
        { value: "9", label: "مشاريع هندسية" },
        { value: "2026", label: "خريج هندسة حاسوب" },
        { value: "AI + Web", label: "تركيز تقني أساسي" }
      ]
    },
    /* نص صاحب الموقع كما هو، دون تعديل. اقتراح لتمريرة لاحقة (قرار صاحب
       الموقع، لم يُطبَّق عمدًا): استبدال الافتتاحيات العامة - "عالي الدافعية"
       و"أساس قوي" - بحقيقة ملموسة واحدة (مشروع التخرج، أو معدل 96% المذكور
       أصلًا في التعليم) تجعل السطر الأول يشتغل فعلاً. */
    about: {
      eyebrow: "نبذة عني",
      title: "مهندس حاسوب يربط أساسيات البرمجيات بالذكاء الاصطناعي والواجهات الحديثة.",
      paragraphs: [
        "أنا طالب هندسة حاسوب عالي الدافعية في الجامعة الإسلامية بغزة، ولدي أساس قوي في البرمجة والخوارزميات وهياكل البيانات وأنظمة التشغيل وتطوير البرمجيات.",
        "يمتد عملي بين واجهات الويب العملية، وتطبيقات Java المعتمدة على OOP، وبرمجة الأنظمة بلغة C، ومسارات تعلم الآلة، وأدوات الذكاء الاصطناعي، وتجارب الرؤية الحاسوبية باستخدام مفاهيم CNN.",
        "أستمتع بتحويل الأفكار الهندسية إلى منتجات موثوقة: واجهات نظيفة، API منظم، كود قابل للصيانة، وميزات ذكية تحل مشكلات واقعية."
      ],
      highlights: [
        "أساس برمجي في Python و Java و C و JavaScript",
        "تطوير ويب حديث باستخدام HTML/CSS و React.js و Next.js وربط API",
        "مهارات تطبيقية في Machine Learning و PyCaret و CNN و Computer Vision",
        "خبرة في OOP وتطبيقات سطح المكتب"
      ],
      cardTitle: "ملف هندسة الحاسوب",
      cardMeta: "أنظمة برمجية / ذكاء اصطناعي / هندسة ويب",
      availability: "متاح للعمل"
    },
    skills: {
      eyebrow: "المهارات التقنية",
      title: "حزمة تقنية تغطي الأنظمة والويب والذكاء الاصطناعي والمشاريع البرمجية التطبيقية.",
      evidence: EVIDENCE_LABELS.ar,
      programs: PROGRAM_LABELS.ar,
      categories: buildSkillCategories("ar", [
        {
          title: "لغات البرمجة",
          items: ["JavaScript", "Python", "Java", "C"]
        },
        {
          title: "هندسة الويب",
          items: ["React.js", "HTML/CSS", "API", "Next.js", "Responsive UI"]
        },
        {
          title: "الذكاء الاصطناعي وتعلم الآلة",
          items: ["AI", "ML", "Data Preprocessing", "PyCaret"]
        },
        {
          title: "الرؤية الحاسوبية",
          items: ["Computer Vision", "CNN", "Deep Learning", "Image Processing"]
        },
        {
          title: "هندسة البرمجيات",
          items: ["OOP", "System Design", "Clean Code"]
        },
        {
          title: "الأدوات وسير العمل",
          items: ["Git/GitHub", "REST API", "Linux/UNIX", "Digital Tools"]
        }
      ]),
      coreStack
    },
    projects: {
      eyebrow: "أعمال هندسية مختارة",
      title: "مشاريع تجمع بين تطوير الويب وبرمجة الأنظمة والذكاء الاصطناعي والبرمجيات التطبيقية.",
      viewGallery: "عرض صور المشروع",
      viewGithub: "عرض على GitHub",
      viewLive: "معاينة حية",
      comingSoon: "التفاصيل قريباً",
      soon: "قريباً",
      screenshots: "صورة",
      inDevelopment: "قيد التطوير",
      archiveTitle: "مشاريع أخرى",
      filterLabel: "تصفية المشاريع حسب الفئة",
      filters: { all: "الكل", web: "ويب", ai: "ذكاء اصطناعي", systems: "أنظمة" }
    },
    experience: {
      eyebrow: "الخبرة",
      title: "تدريب عملي في هندسة الواجهات مع أساس أوسع في هندسة الحاسوب.",
      items: [
        {
          title: "تدريب تطوير واجهات أمامية",
          company: "معهد مسار",
          date: "2026",
          points: [
            "بناء واجهات ويب متجاوبة باستخدام HTML و CSS و JavaScript و React.js و Next.js",
            "تطبيق مبادئ UI/UX لإنشاء واجهات برمجية أوضح وأسهل استخداماً",
            "تطوير مشاريع عملية بكود نظيف وقابل للصيانة ومعتمد على المكونات",
            "تعزيز مهارات ربط API والعمل الجماعي وسير العمل الاحترافي"
          ]
        },
        {
          title: "SkillStack Paths - البرمجة وهياكل البيانات",
          company: "Gaza Sky Geeks",
          date: "مايو 2023 - أغسطس 2025",
          points: ["أساسيات البرمجة", "هياكل البيانات والخوارزميات"]
        },
        {
          title: "SkillStack Paths - الشبكات العصبية والرؤية الحاسوبية",
          company: "Gaza Sky Geeks",
          date: "مارس 2026 - يوليو 2026",
          points: [
            "الرؤية الحاسوبية والشبكات العصبية",
            "دراسة أساسيات تكوين الصور ومفاهيم البيانات البصرية",
            "تطبيق المعالجة المسبقة واكتشاف السمات ومطابقتها",
            "استكشاف تسجيل الصور والرؤية المجسمة وإعادة البناء متعددة المشاهد",
            "دراسة تصنيف الصور واكتشاف الأجسام وتقسيم الصور",
            "تغطية تقدير الحركة والتتبع والتعرف على الأفعال"
          ]
        }
      ]
    },
    otherExperience: {
      eyebrow: "أعمال مجتمعية وميدانية",
      title: "خبرات ميدانية وتنظيمية ومقابلات مبنية على المسؤولية والدقة.",
      items: [
        {
          title: "مقابل ومقيم طلاب",
          company: "مبادرة مسارات - الفوج الثاني",
          date: "2026",
          image: "/images/other-experience/masar.webp",
          imageAlt: "نزار أثناء عمل تقييم ومقابلات طلابية لمبادرة مسارات",
          points: [
            "إجراء مقابلات منظمة لتقييم المتقدمين للفوج الثاني من مبادرة مسارات",
            "تقييم الطلاب بناءً على الدافعية والقدرة التقنية وقابلية التطور",
            "المساهمة في اختيار المرشحين المؤهلين للبرنامج"
          ]
        },
        {
          title: "جمع وإدخال بيانات",
          company: "Reach Education Fund",
          date: "فبراير 2024 - مايو 2024",
          image: "/images/other-experience/reach-1.webp",
          imageAlt: "عمل جمع وإدخال بيانات مع Reach Education Fund",
          points: [
            "جمع بيانات ميدانية عن العائلات النازحة خلال حرب 2023-2024",
            "إدخال كميات كبيرة من البيانات بكفاءة ودقة عالية",
            "الحفاظ على سرية البيانات والالتزام بجميع المواعيد النهائية"
          ]
        },
        {
          title: "مساعد منسق مقابلات منح",
          company: "Reach Education Fund",
          date: "2026",
          image: "/images/other-experience/coordinator.webp",
          imagePosition: "center 25%",
          imageAlt: "تنسيق مقابلات المنح مع Reach Education Fund",
          points: [
            "تنسيق وإدارة مقابلات الطلاب المؤهلين لدورة منح 2026",
            "ترتيب جداول المرشحين وتجهيز بيئة المقابلات",
            "دعم أعضاء اللجنة بالوثائق والسجلات"
          ]
        },
        {
          title: "عمل إغاثي",
          company: "Reach Education Fund",
          date: "مايو 2024 - مايو 2025",
          image: "/images/other-experience/reach-2.webp",
          imageAlt: "عمل إغاثي ميداني مع Reach Education Fund",
          points: [
            "إجراء زيارات وتحريات ميدانية لتحديد الاحتياجات العاجلة للعائلات النازحة",
            "المشاركة في توزيع المساعدات الإنسانية خلال حرب 2023",
            "ضمان التوثيق الدقيق وإعداد تقارير أنشطة المساعدات"
          ]
        }
      ]
    },
    education: {
      eyebrow: "التعليم",
      title: "أساس هندسة حاسوب يدعم البرمجيات والأنظمة والتطبيقات الذكية.",
      items: [
        {
          title: "بكالوريوس هندسة حاسوب",
          company: "الجامعة الإسلامية بغزة",
          date: "2021 - 2026",
          points: [
            "دراسة البرمجة والخوارزميات وهياكل البيانات ومعمارية الحاسوب وأساسيات هندسة البرمجيات",
            "اكتساب معرفة في أنظمة التشغيل وقواعد البيانات وواجهات API وتطوير البرمجيات التطبيقية",
            "العمل على مشاريع أكاديمية وعملية في تطوير الويب وتعلم الآلة وبرمجة الأنظمة",
            "تطوير التفكير التحليلي وعادات تصميم OOP ومهارات حل المشكلات التقنية"
          ]
        },
        {
          title: "الثانوية العامة - الفرع العلمي",
          company: "مدرسة فلسطين الثانوية للبنين",
          date: "2020 - 2021",
          points: [
            "التخرج بتفوق وبمعدل 96%",
            "التميز في الرياضيات والفيزياء وعلوم الحاسوب",
            "إظهار القيادة والانضباط في المشاريع الأكاديمية"
          ]
        }
      ]
    },
    contact: {
      eyebrow: "التواصل",
      title: "لنبنِ برمجيات مفيدة وذكية ومتقنة هندسياً.",
      description:
        "أهتم بفرص هندسة البرمجيات وتطوير الواجهات والذكاء الاصطناعي وتعلم الآلة والرؤية الحاسوبية. يسعدني تواصلك للتعاون أو المشاريع أو النقاشات التقنية.",
      emailLabel: "راسلني",
      phoneLabel: "اتصل بي",
      downloadCv: "تحميل السيرة الذاتية",
      availability: "متاح لفرص جديدة",
      showPhone: "إظهار رقم الهاتف",
      phoneRevealHint: "يظهر عند الطلب لحمايته من برامج جمع البيانات",
      links: contactLinks
    },
    modal: {
      close: "إغلاق النافذة",
      emptyTitle: "قريباً",
      emptyBody: "ستتم إضافة تفاصيل المشروع والتوثيق قريباً."
    },
    footer: "2026 نزار يوسف القرَم. مهندس حاسوب."
  }
};
