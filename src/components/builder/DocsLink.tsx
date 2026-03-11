import { ExternalLink } from "lucide-react";

interface DocsLinkProps {
  href: string;
  label?: string;
}

export function DocsLink({ href, label = "Docs" }: DocsLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
    >
      📖 {label} <ExternalLink className="h-3 w-3" />
    </a>
  );
}
