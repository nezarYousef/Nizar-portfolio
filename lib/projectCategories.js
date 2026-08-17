/* Maps a project's existing tags onto the three filter buckets. Unchanged
   from the previous implementation - only moved out of the component so the
   server can compute it once and emit it as a data attribute. */
const FILTER_KEYWORDS = {
  ai: ["AI", "Machine Learning", "Computer Vision", "LLM", "Chatbot", "CNN"],
  web: [
    "React.js",
    "Next.js",
    "JavaScript",
    "HTML/CSS",
    "API",
    "FastAPI",
    "UI Systems",
    "UI Engineering",
    "State Management",
    "Productivity"
  ],
  systems: ["C", "Java", "OOP", "Linux/UNIX", "OS", "Systems", "Desktop App"]
};

export const FILTERS = ["all", "web", "ai", "systems"];

export function categoriesFor(tags = []) {
  return Object.entries(FILTER_KEYWORDS)
    .filter(([, keywords]) => tags.some((tag) => keywords.includes(tag)))
    .map(([category]) => category);
}
