import React from "react";
import { HelpCircle, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface InfoTooltipProps {
  text: string;
  docsUrl?: string;
}

export const InfoTooltip = React.forwardRef<HTMLButtonElement, InfoTooltipProps>(
  ({ text, docsUrl }, ref) => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button ref={ref} type="button" className="inline-flex ml-1 text-muted-foreground hover:text-gold transition-colors">
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-popover border-border text-popover-foreground">
          <p className="text-sm">{text}</p>
          {docsUrl && (
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 mt-2 text-xs text-gold hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Read docs
            </a>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }
);

InfoTooltip.displayName = "InfoTooltip";
