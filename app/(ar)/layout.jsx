import RootShell from "@/components/RootShell";
import { buildMetadata, viewport as sharedViewport } from "@/lib/metadata";

export const metadata = buildMetadata("ar");
export const viewport = sharedViewport;

export default function ArabicLayout({ children }) {
  return <RootShell lang="ar">{children}</RootShell>;
}
