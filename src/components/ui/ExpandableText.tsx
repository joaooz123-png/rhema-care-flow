import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpandableContentProps {
  children: React.ReactNode;
  showWhen?: boolean;
  collapsedClassName?: string;
  expandedClassName?: string;
  className?: string;
  moreLabel?: string;
  lessLabel?: string;
  stopPropagation?: boolean;
  fade?: boolean;
}

export function ExpandableContent({
  children,
  showWhen = true,
  collapsedClassName = 'max-h-28 overflow-hidden',
  expandedClassName = 'max-h-80 overflow-y-auto pr-2',
  className,
  moreLabel = 'Ver mais',
  lessLabel = 'Ver menos',
  stopPropagation = false,
  fade = true,
}: ExpandableContentProps) {
  const [expanded, setExpanded] = useState(false);
  const isCollapsed = showWhen && !expanded;

  return (
    <div className={cn('min-w-0 max-w-full', className)}>
      <div
        className={cn(
          'relative min-w-0 max-w-full break-words',
          showWhen && (expanded ? expandedClassName : collapsedClassName),
        )}
      >
        {children}
        {fade && isCollapsed && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-muted to-transparent" />
        )}
      </div>
      {showWhen && (
        <button
          type="button"
          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          onClick={(event) => {
            if (stopPropagation) event.stopPropagation();
            setExpanded((value) => !value);
          }}
        >
          {expanded ? (
            <>
              {lessLabel}
              <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              {moreLabel}
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

interface ExpandableTextProps {
  text: string;
  threshold?: number;
  className?: string;
  textClassName?: string;
  collapsedClassName?: string;
  expandedClassName?: string;
  stopPropagation?: boolean;
}

export function ExpandableText({
  text,
  threshold = 180,
  className,
  textClassName,
  collapsedClassName,
  expandedClassName,
  stopPropagation,
}: ExpandableTextProps) {
  const shouldCollapse = text.length > threshold || text.split('\n').length > 4;

  return (
    <ExpandableContent
      showWhen={shouldCollapse}
      className={className}
      collapsedClassName={collapsedClassName}
      expandedClassName={expandedClassName}
      stopPropagation={stopPropagation}
    >
      <p className={cn('whitespace-pre-wrap break-words', textClassName)}>{text}</p>
    </ExpandableContent>
  );
}
