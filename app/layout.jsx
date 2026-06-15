import "./globals.css";

export const metadata = {
  title: "Nizar Alqerem | Systems Portfolio",
  description:
    "Professional portfolio of Nizar Yousef Alqerem, a computer engineer focused on software engineering, modern web development, AI, machine learning, computer vision, and applied systems.",
  authors: [{ name: "Nizar Yousef Alqerem" }],
  keywords: [
    "Nizar Yousef Alqerem",
    "Computer Engineer",
    "Software Engineer",
    "Machine Learning",
    "AI",
    "Computer Vision",
    "React",
    "Next.js",
    "Python",
    "Java",
    "Portfolio"
  ],
  openGraph: {
    title: "Nizar Yousef Alqerem | Computer Engineer",
    description:
      "Engineering portfolio showcasing software, web, AI, machine learning, computer vision, and systems projects.",
    type: "website"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0ea5a4"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
