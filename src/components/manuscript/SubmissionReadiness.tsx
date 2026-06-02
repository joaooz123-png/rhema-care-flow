import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle } from 'lucide-react';
import type { ManuscriptSection } from './types';
import { cn } from '@/lib/utils';

interface CheckItem {
  label: string;
  passed: boolean;
}

interface Props {
  sections: ManuscriptSection[];
}

function isFilled(section: ManuscriptSection): boolean {
  return section.content.trim().length > 10;
}

function labelFor(section: ManuscriptSection): string {
  const labels: Record<string, string> = {
    title: 'Title completed',
    running_title: 'Running title completed',
    authors: 'Authors listed',
    affiliations: 'Affiliations listed',
    corresponding: 'Corresponding author',
    abstract: 'Abstract completed',
    keywords: 'Keywords provided',
    introduction: 'Introduction written',
    methods: 'Methods written',
    results: 'Results presented',
    discussion: 'Discussion completed',
    problem_statement: 'Problem statement written',
    conceptual_framework: 'Framework described',
    clinical_use_case: 'Clinical use case included',
    implementation_considerations: 'Implementation considered',
    limitations: 'Limitations discussed',
    future_directions: 'Future directions provided',
    conclusion: 'Conclusion provided',
    references: 'References listed',
    funding: 'Funding disclosed',
    conflicts: 'Conflicts declared',
    acknowledgments: 'Acknowledgments considered',
  };

  return labels[section.id] ?? section.title;
}

export function SubmissionReadiness({ sections }: Props) {
  const requiredSections = sections.filter((section) => section.required);

  const checks: CheckItem[] = requiredSections.map((section) => ({
    label: labelFor(section),
    passed: isFilled(section),
  }));

  const passed = checks.filter((c) => c.passed).length;
  const total = checks.length;
  const ready = total > 0 && passed === total;

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">Submission Readiness</p>
        <Badge
          variant={ready ? 'default' : 'outline'}
          className={cn(
            'text-[9px] h-4',
            ready ? 'bg-emerald-600 text-white' : 'border-stone-300 text-stone-400'
          )}
        >
          {passed}/{total}
        </Badge>
      </div>
      <div className="space-y-0.5">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {c.passed ? (
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="h-2.5 w-2.5 text-stone-300 shrink-0" />
            )}
            <span className={cn('text-[10px]', c.passed ? 'text-stone-600' : 'text-stone-400')}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function isSubmissionReady(sections: ManuscriptSection[]): boolean {
  const requiredSections = sections.filter((section) => section.required);
  return requiredSections.length > 0 && requiredSections.every(isFilled);
}
