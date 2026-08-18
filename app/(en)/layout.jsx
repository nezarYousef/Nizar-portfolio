import RootShell from "@/components/RootShell";
import { fontClassFor } from "@/lib/fonts";
import { buildMetadata, viewport as sharedViewport } from "@/lib/metadata";

export const metadata = buildMetadata("en");
export const viewport = sharedViewport;

export default function EnglishLayout({ children }) {
  return <RootShell lang="en" fontClass={fontClassFor("en")}>{children}</RootShell>;
}
