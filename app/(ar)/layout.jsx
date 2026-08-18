import RootShell from "@/components/RootShell";
import { fontClassFor } from "@/lib/fonts";
import { buildMetadata, viewport as sharedViewport } from "@/lib/metadata";

export const metadata = buildMetadata("ar");
export const viewport = sharedViewport;

export default function ArabicLayout({ children }) {
  return <RootShell lang="ar" fontClass={fontClassFor("ar")}>{children}</RootShell>;
}
