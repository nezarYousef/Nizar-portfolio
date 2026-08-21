import RootShell from "@/components/RootShell";
import { arabicFontClass } from "@/lib/fonts-ar";
import { buildMetadata, viewport as sharedViewport } from "@/lib/metadata";

export const metadata = buildMetadata("ar");
export const viewport = sharedViewport;

export default function ArabicLayout({ children }) {
  return <RootShell lang="ar" fontClass={arabicFontClass}>{children}</RootShell>;
}
