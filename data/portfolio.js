export const profileImage = "/images/profile/nizar-profile-full.jpeg";

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
  "JavaFX",
  "PyCaret",
  "API",
  "OOP"
];

const gallery = (folder, count) =>
  Array.from({ length: count }, (_, index) => ({
    src: `/images/${folder}/${index + 1}.png`,
    alt: `${folder} project screenshot ${index + 1}`
  }));

const edufusionGallery = [
  ...gallery("edufusion", 10),
  {
    src: "/images/edufusion/11.jpeg",
    alt: "EduFusion AI LectureScribe screenshot"
  }
];

const projectMeta = {
  restaurant: {
    tags: ["React.js", "HTML/CSS", "API", "UI Systems"],
    gallery: gallery("restaurant", 19)
  },
  expenses: {
    tags: ["React.js", "JavaScript", "HTML/CSS", "State Management"],
    gallery: gallery("expenses", 2)
  },
  tasks: {
    tags: ["React.js", "JavaScript", "HTML/CSS", "Productivity"],
    gallery: gallery("tasks", 5)
  },
  grade: {
    tags: ["Python", "Machine Learning", "FastAPI", "AI", "LLM", "Chatbot"],
    previewImage: "/images/edufusion/ba.png",
    gallery: edufusionGallery
  },
  shell: {
    tags: ["C", "Linux/UNIX", "OS", "Systems"],
    gallery: [],
    github: "https://github.com/nezarYousef/shell.git"
  },
  school: {
    tags: ["Java", "JavaFX", "OOP", "Desktop App"],
    gallery: [],
    github: "https://github.com/nezarYousef/school.git"
  },
  ai: {
    tags: ["AI", "API", "Python", "Automation"],
    gallery: []
  },
  vision: {
    tags: ["Computer Vision", "Python", "CNN", "AI"],
    gallery: []
  },
  advancedTasks: {
    tags: ["React.js", "Next.js", "HTML/CSS", "UI Engineering"],
    gallery: []
  }
};

const withMeta = (projects) =>
  projects.map((project) => ({
    ...projectMeta[project.id],
    ...project
  }));

const contactLinks = {
  email: "mailto:nizaryousef01@gmail.com",
  phone: "tel:+972597781945",
  github: "https://github.com/nezarYousef",
  linkedin: "https://linkedin.com/in/nizar-alqerem-33829a3a1",
  whatsapp: "https://wa.me/972597781945",
  instagram: "https://www.instagram.com/eng.nizar_/"
};

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
    hero: {
      eyebrow: "Computer Engineer / Software, AI & Web",
      name: "Nizar Yousef Alqerem",
      title: "Computer engineer building software, intelligent systems, and modern web experiences.",
      typedRole: "AI + Web Engineering",
      description:
        "I combine computer engineering fundamentals with practical development across Python, Java, C, JavaScript, React, Next.js, Machine Learning, AI, CNN, Computer Vision, JavaFX, APIs, and OOP.",
      primaryAction: "View Projects",
      secondaryAction: "Get In Touch",
      status: "Available for software, web, and AI opportunities",
      imageAlt: "Portrait of Nizar Yousef Alqerem",
      stats: [
        { value: "9", label: "Engineering Projects" },
        { value: "2026", label: "Computer Engineering Graduate" },
        { value: "AI + Web", label: "Core Technical Focus" }
      ]
    },
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
        "OOP and desktop application experience with JavaFX"
      ],
      cardTitle: "Computer Engineering Profile",
      cardMeta: "Software Systems / AI / Web Engineering"
    },
    skills: {
      eyebrow: "Technical Stack",
      title: "A stack that covers systems, web interfaces, AI, and applied software projects.",
      categories: [
        {
          title: "Programming Languages",
          items: ["Python", "Java", "C", "JavaScript"]
        },
        {
          title: "Web Engineering",
          items: ["HTML/CSS", "React.js", "Next.js", "Responsive UI", "API"]
        },
        {
          title: "AI & Machine Learning",
          items: ["Machine Learning", "AI", "PyCaret", "Data Preprocessing"]
        },
        {
          title: "Computer Vision",
          items: ["Computer Vision", "CNN", "Image Processing", "Deep Learning"]
        },
        {
          title: "Software Engineering",
          items: ["OOP", "JavaFX", "System Design", "Clean Code"]
        },
        {
          title: "Tools & Workflow",
          items: ["Git/GitHub", "Linux/UNIX", "REST APIs", "Digital Tools"]
        }
      ],
      coreStack
    },
    projects: {
      eyebrow: "Featured Engineering Work",
      title: "Projects across web development, systems programming, AI, and applied software.",
      viewGallery: "View project gallery",
      viewGithub: "View on GitHub",
      comingSoon: "Details coming soon",
      list: withMeta([
        {
          id: "restaurant",
          title: "Smart Restaurant Management",
          description:
            "A digital restaurant workflow system with role-based interfaces for customers, chefs, waiters, and administrators, designed around real-time order tracking and clean UI engineering."
        },
        {
          id: "expenses",
          title: "Expense Tracker App",
          description:
            "A personal finance interface for recording, categorizing, and monitoring spending, built with practical JavaScript and React UI patterns."
        },
        {
          id: "tasks",
          title: "Task Management App",
          description:
            "A productivity application for creating, organizing, and tracking daily tasks with a clear user flow and responsive interface."
        },
        {
          id: "grade",
          title: "EduFusion AI",
          description:
            "A production-ready AI academic platform with authentication, dashboard, and chatbot integration.",
          highlights: [
            "Project Overview: EduPredict was developed as a graduation project focused on student success analytics. The project started with supervised, unsupervised, segmentation, semi-supervised, and hybrid machine learning experiments, then evolved into a practical temporal prediction system with a FastAPI backend.",
            "The final deliverable focuses on real-time style prediction: given a student's current course day, demographic information, VLE activity, and assessment submissions so far, the system returns a risk probability, risk level, recommended action, explanation, model confidence, and data completeness summary.",
            "LectureScribe AI converts YouTube lectures into readable text. It downloads the lecture audio, transcribes it with Faster-Whisper, optionally formats the transcript with Groq or Ollama, and keeps the text output for future cache hits.",
            "QuizForge is an AI-powered exam question generator that takes lecture files and automatically produces high-quality exam questions, supporting Arabic, English, and mixed-language content. Built with a local LLM, it runs entirely on your machine with full privacy and no cloud API costs.",
            "Smart chatbot for academic support, course guidance, and student questions."
          ]
        },
        {
          id: "shell",
          title: "Custom Unix Shell",
          description:
            "A C-based Linux shell built from scratch with internal commands, I/O redirection, batch files, background processes, environment variables, and error handling."
        },
        {
          id: "school",
          title: "School Management System",
          description:
            "A Java and JavaFX desktop system for managing students, classes, and administrative records using object-oriented design."
        },
        {
          id: "ai",
          title: "AI Assistant Tools",
          description:
            "AI and API-based tools that simplify learning, improve access to information, and support understanding complex concepts through intelligent assistance."
        },
        {
          id: "vision",
          title: "Computer Vision Project",
          description:
            "A Python computer vision project focused on image processing and object detection concepts using AI, CNN, and deep learning workflows."
        },
        {
          id: "advancedTasks",
          title: "Advanced Task Management App",
          description:
            "A modern task management experience focused on clean UI architecture, advanced task organization, and maintainable React component structure."
        }
      ])
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
            "Worked on academic and practical projects in web development, machine learning, JavaFX, and system programming",
            "Developed analytical thinking, OOP design habits, and technical problem-solving skills"
          ]
        },
        {
          title: "Skill Stack Paths Program",
          company: "Gaza Sky Geeks",
          date: "May 2023 - Aug 2025",
          points: ["Programming Fundamentals", "Data Structures & Algorithms"]
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
    hero: {
      eyebrow: "مهندس حاسوب / برمجيات وذكاء اصطناعي وويب",
      name: "نزار يوسف القرَم",
      title: "مهندس حاسوب يبني برمجيات وأنظمة ذكية وتجارب ويب حديثة.",
      typedRole: "هندسة ذكاء وويب",
      description:
        "أجمع بين أساسيات هندسة الحاسوب والتطوير العملي باستخدام Python و Java و C و JavaScript و React و Next.js و Machine Learning و AI و CNN و Computer Vision و JavaFX و API و OOP.",
      primaryAction: "عرض المشاريع",
      secondaryAction: "تواصل معي",
      status: "متاح لفرص البرمجيات والويب والذكاء الاصطناعي",
      imageAlt: "صورة شخصية لنزار يوسف القرَم",
      stats: [
        { value: "9", label: "مشاريع هندسية" },
        { value: "2026", label: "خريج هندسة حاسوب" },
        { value: "AI + Web", label: "تركيز تقني أساسي" }
      ]
    },
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
        "خبرة في OOP وتطبيقات سطح المكتب باستخدام JavaFX"
      ],
      cardTitle: "ملف هندسة الحاسوب",
      cardMeta: "أنظمة برمجية / ذكاء اصطناعي / هندسة ويب"
    },
    skills: {
      eyebrow: "المهارات التقنية",
      title: "حزمة تقنية تغطي الأنظمة والويب والذكاء الاصطناعي والمشاريع البرمجية التطبيقية.",
      categories: [
        {
          title: "لغات البرمجة",
          items: ["Python", "Java", "C", "JavaScript"]
        },
        {
          title: "هندسة الويب",
          items: ["HTML/CSS", "React.js", "Next.js", "واجهات متجاوبة", "API"]
        },
        {
          title: "الذكاء الاصطناعي وتعلم الآلة",
          items: ["Machine Learning", "AI", "PyCaret", "Data Preprocessing"]
        },
        {
          title: "الرؤية الحاسوبية",
          items: ["Computer Vision", "CNN", "Image Processing", "Deep Learning"]
        },
        {
          title: "هندسة البرمجيات",
          items: ["OOP", "JavaFX", "System Design", "Clean Code"]
        },
        {
          title: "الأدوات وسير العمل",
          items: ["Git/GitHub", "Linux/UNIX", "REST APIs", "Digital Tools"]
        }
      ],
      coreStack
    },
    projects: {
      eyebrow: "أعمال هندسية مختارة",
      title: "مشاريع تجمع بين تطوير الويب وبرمجة الأنظمة والذكاء الاصطناعي والبرمجيات التطبيقية.",
      viewGallery: "عرض صور المشروع",
      viewGithub: "عرض على GitHub",
      comingSoon: "التفاصيل قريباً",
      list: withMeta([
        {
          id: "restaurant",
          title: "نظام إدارة مطعم ذكي",
          description:
            "نظام رقمي لإدارة سير عمل المطعم بواجهات حسب الدور للعملاء والطهاة والنوادل والمديرين، مع تتبع الطلبات لحظياً وهندسة واجهة واضحة."
        },
        {
          id: "expenses",
          title: "تطبيق تتبع المصاريف",
          description:
            "واجهة لإدارة المال الشخصي تساعد على تسجيل المصاريف وتصنيفها ومتابعتها باستخدام أنماط عملية في JavaScript و React."
        },
        {
          id: "tasks",
          title: "تطبيق إدارة المهام",
          description:
            "تطبيق إنتاجية لإنشاء المهام وتنظيمها وتتبعها من خلال تجربة استخدام واضحة وواجهة متجاوبة."
        },
        {
          id: "grade",
          title: "EduFusion AI",
          description:
            "A production-ready AI academic platform with authentication, dashboard, and chatbot integration.",
          highlights: [
            "Project Overview: EduPredict was developed as a graduation project focused on student success analytics. The project started with supervised, unsupervised, segmentation, semi-supervised, and hybrid machine learning experiments, then evolved into a practical temporal prediction system with a FastAPI backend.",
            "The final deliverable focuses on real-time style prediction: given a student's current course day, demographic information, VLE activity, and assessment submissions so far, the system returns a risk probability, risk level, recommended action, explanation, model confidence, and data completeness summary.",
            "LectureScribe AI converts YouTube lectures into readable text. It downloads the lecture audio, transcribes it with Faster-Whisper, optionally formats the transcript with Groq or Ollama, and keeps the text output for future cache hits.",
            "QuizForge is an AI-powered exam question generator that takes lecture files and automatically produces high-quality exam questions, supporting Arabic, English, and mixed-language content. Built with a local LLM, it runs entirely on your machine with full privacy and no cloud API costs.",
            "Smart chatbot for academic support, course guidance, and student questions."
          ]
        },
        {
          id: "shell",
          title: "صدفة Unix مخصصة",
          description:
            "صدفة Linux مبنية بلغة C من الصفر وتدعم الأوامر الداخلية وإعادة توجيه الإدخال والإخراج وملفات الدفعات والعمليات الخلفية ومتغيرات البيئة ومعالجة الأخطاء."
        },
        {
          id: "school",
          title: "نظام إدارة مدرسة",
          description:
            "نظام سطح مكتب باستخدام Java و JavaFX لإدارة الطلاب والصفوف والسجلات الإدارية اعتماداً على التصميم كائني التوجه OOP."
        },
        {
          id: "ai",
          title: "أدوات مساعد ذكي",
          description:
            "أدوات تعتمد على AI و API لتسهيل التعلم وتحسين الوصول للمعلومة ودعم فهم المفاهيم المعقدة بمساعدة ذكية."
        },
        {
          id: "vision",
          title: "مشروع رؤية حاسوبية",
          description:
            "مشروع رؤية حاسوبية باستخدام Python يركز على معالجة الصور ومفاهيم اكتشاف الأجسام بالاعتماد على AI و CNN وسير عمل التعلم العميق."
        },
        {
          id: "advancedTasks",
          title: "تطبيق متقدم لإدارة المهام",
          description:
            "تجربة حديثة لإدارة المهام تركز على بنية واجهة نظيفة، وتنظيم متقدم للمهام، وهيكلة مكونات React قابلة للصيانة."
        }
      ])
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
            "العمل على مشاريع أكاديمية وعملية في تطوير الويب وتعلم الآلة و JavaFX وبرمجة الأنظمة",
            "تطوير التفكير التحليلي وعادات تصميم OOP ومهارات حل المشكلات التقنية"
          ]
        },
        {
          title: "برنامج Skill Stack Paths",
          company: "Gaza Sky Geeks",
          date: "مايو 2023 - أغسطس 2025",
          points: ["أساسيات البرمجة", "هياكل البيانات والخوارزميات"]
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
