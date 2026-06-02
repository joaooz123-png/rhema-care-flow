export type CitationStyle = 'vancouver' | 'apa';
export type ArticleType = 'original' | 'clinical_trial' | 'cohort' | 'case_control' | 'cross_sectional' | 'diagnostic_accuracy' | 'case_report' | 'case_series' | 'narrative_review' | 'systematic_review' | 'meta_analysis' | 'qualitative' | 'experimental' | 'brief_communication' | 'perspective_commentary' | 'letter';
export type SectionStatus = 'empty' | 'draft' | 'revised' | 'complete';
export type WritingMode = 'basic' | 'advanced';
export type ReportingChecklist = 'CONSORT' | 'STROBE' | 'PRISMA' | 'CARE' | 'STARD' | 'SRQR';

export interface ArticleTypeInfo { id: ArticleType; label: string; reportingChecklist: ReportingChecklist | null; abstractStructured: boolean; typicalWordCount: [number, number]; }
export interface ManuscriptSection { id: string; title: string; category: 'core' | 'advanced'; required: boolean; purpose: string; mustInclude: string[]; mustNotInclude: string[]; commonMistakes: string[]; writingPrompt: string; sentenceStarters: string[]; placeholder: string; content: string; status: SectionStatus; coauthorNote: string; wordCountTarget?: [number, number]; }
export interface ManuscriptState { title: string; articleType: ArticleType; citationStyle: CitationStyle; mode: WritingMode; sections: ManuscriptSection[]; activeSection: string; journalNotes: string; coverLetter: string; lastSaved: string | null; }

export const ARTICLE_TYPES: ArticleTypeInfo[] = [
  { id: 'original', label: 'Original Article', reportingChecklist: null, abstractStructured: true, typicalWordCount: [3000, 5000] },
  { id: 'clinical_trial', label: 'Clinical Trial', reportingChecklist: 'CONSORT', abstractStructured: true, typicalWordCount: [3500, 6000] },
  { id: 'cohort', label: 'Cohort Study', reportingChecklist: 'STROBE', abstractStructured: true, typicalWordCount: [3000, 5000] },
  { id: 'case_control', label: 'Case-Control Study', reportingChecklist: 'STROBE', abstractStructured: true, typicalWordCount: [3000, 5000] },
  { id: 'cross_sectional', label: 'Cross-Sectional Study', reportingChecklist: 'STROBE', abstractStructured: true, typicalWordCount: [3000, 4500] },
  { id: 'diagnostic_accuracy', label: 'Diagnostic Accuracy Study', reportingChecklist: 'STARD', abstractStructured: true, typicalWordCount: [3000, 5000] },
  { id: 'case_report', label: 'Case Report', reportingChecklist: 'CARE', abstractStructured: false, typicalWordCount: [1500, 3000] },
  { id: 'case_series', label: 'Case Series', reportingChecklist: 'CARE', abstractStructured: false, typicalWordCount: [2000, 4000] },
  { id: 'narrative_review', label: 'Narrative Review', reportingChecklist: null, abstractStructured: false, typicalWordCount: [4000, 8000] },
  { id: 'systematic_review', label: 'Systematic Review', reportingChecklist: 'PRISMA', abstractStructured: true, typicalWordCount: [4000, 8000] },
  { id: 'meta_analysis', label: 'Meta-Analysis', reportingChecklist: 'PRISMA', abstractStructured: true, typicalWordCount: [4000, 8000] },
  { id: 'qualitative', label: 'Qualitative Study', reportingChecklist: 'SRQR', abstractStructured: true, typicalWordCount: [4000, 7000] },
  { id: 'experimental', label: 'Experimental / Laboratory', reportingChecklist: null, abstractStructured: true, typicalWordCount: [3000, 5000] },
  { id: 'brief_communication', label: 'Brief Communication', reportingChecklist: null, abstractStructured: false, typicalWordCount: [1000, 2000] },
  { id: 'perspective_commentary', label: 'Perspective / Expert Commentary', reportingChecklist: null, abstractStructured: false, typicalWordCount: [1500, 3000] },
  { id: 'letter', label: 'Letter to the Editor', reportingChecklist: null, abstractStructured: false, typicalWordCount: [400, 1000] },
];

export const CHECKLIST_INFO: Record<ReportingChecklist, { name: string; fullName: string; items: string[] }> = {
  CONSORT: { name: 'CONSORT', fullName: 'Consolidated Standards of Reporting Trials', items: ['Title', 'Abstract', 'Methods', 'Results', 'Harms', 'Registration'] },
  STROBE: { name: 'STROBE', fullName: 'Strengthening the Reporting of Observational Studies in Epidemiology', items: ['Title', 'Abstract', 'Design', 'Participants', 'Variables', 'Bias', 'Results', 'Limitations'] },
  PRISMA: { name: 'PRISMA', fullName: 'Preferred Reporting Items for Systematic Reviews and Meta-Analyses', items: ['Title', 'Abstract', 'Protocol', 'Search', 'Selection', 'Synthesis', 'Results'] },
  CARE: { name: 'CARE', fullName: 'CAse REport Guidelines', items: ['Title', 'Abstract', 'Patient information', 'Timeline', 'Intervention', 'Follow-up', 'Consent'] },
  STARD: { name: 'STARD', fullName: 'Standards for Reporting Diagnostic Accuracy Studies', items: ['Title', 'Abstract', 'Index test', 'Reference standard', 'Analysis', 'Results'] },
  SRQR: { name: 'SRQR', fullName: 'Standards for Reporting Qualitative Research', items: ['Title', 'Problem', 'Approach', 'Context', 'Ethics', 'Analysis', 'Limitations'] },
};

export const STUDY_DESIGN_METHODS: Partial<Record<ArticleType, string[]>> = {
  clinical_trial: ['Randomization', 'Blinding', 'Intervention', 'Outcomes', 'Registration'],
  cohort: ['Exposure definition', 'Follow-up', 'Outcome measurement', 'Confounding control'],
  case_control: ['Case definition', 'Control selection', 'Matching', 'Exposure ascertainment'],
  case_report: ['Patient history', 'Timeline', 'Diagnostic reasoning', 'Intervention', 'Outcome', 'Consent'],
  systematic_review: ['Protocol', 'Search strategy', 'Eligibility', 'Risk of bias', 'Synthesis'],
  meta_analysis: ['Search strategy', 'Effect measure', 'Model', 'Heterogeneity', 'Publication bias'],
  diagnostic_accuracy: ['Index test', 'Reference standard', 'Sensitivity/specificity', 'ROC/AUC'],
  qualitative: ['Approach', 'Reflexivity', 'Sampling', 'Data collection', 'Analysis'],
  perspective_commentary: ['Conceptual article', 'Healthcare delivery problem', 'Framework', 'Clinical use case', 'Implementation', 'Limitations'],
};

export const CITATION_EXAMPLES: Record<CitationStyle, { journal: string; book: string }> = {
  vancouver: { journal: 'Smolen JS, Aletaha D, McInnes IB. Rheumatoid arthritis. Lancet. 2016;388(10055):2023-38.', book: 'Firestein GS, Budd RC, Gabriel SE, et al., editors. Firestein & Kelley\'s Textbook of Rheumatology. 11th ed. Philadelphia: Elsevier; 2021.' },
  apa: { journal: 'Smolen JS, Aletaha D, McInnes IB. Rheumatoid arthritis. Lancet. 2016;388(10055):2023-38.', book: 'Firestein GS, Budd RC, Gabriel SE, et al., editors. Firestein & Kelley\'s Textbook of Rheumatology. 11th ed. Philadelphia: Elsevier; 2021.' },
};

function s(x: Omit<ManuscriptSection, 'content' | 'status' | 'coauthorNote'>): ManuscriptSection { return { ...x, content: '', status: 'empty', coauthorNote: '' }; }
function sec(id: string, title: string, category: 'core' | 'advanced', required: boolean, purpose: string, prompt: string, placeholder: string, wordCountTarget?: [number, number]): ManuscriptSection {
  return s({ id, title, category, required, purpose, mustInclude: ['Clear, relevant content', 'Journal-appropriate language'], mustNotInclude: ['Unsupported claims', 'Unnecessary details'], commonMistakes: ['Being vague', 'Overclaiming'], writingPrompt: prompt, sentenceStarters: [], placeholder, wordCountTarget });
}

function standardSections(): ManuscriptSection[] {
  return [
    sec('title', 'Title', 'core', true, 'A clear and specific manuscript title.', 'What is the central topic and design?', 'Efficacy of Methotrexate in Early Rheumatoid Arthritis: A Randomized Trial'),
    sec('running_title', 'Running Title', 'core', true, 'A shortened title for manuscript headers.', 'Create a concise running title.', 'MTX in Early RA'),
    sec('authors', 'Authors', 'core', true, 'List all authors.', 'List manuscript authors.', 'João da Silva, MD¹'),
    sec('affiliations', 'Affiliations', 'core', true, 'List author affiliations.', 'List affiliations.', '¹ Department of Rheumatology, University Hospital, São Paulo, Brazil'),
    sec('corresponding', 'Corresponding Author', 'core', true, 'Editorial contact information.', 'Who handles correspondence?', 'Correspondence to: João da Silva, MD\nEmail: name@example.com'),
    sec('abstract', 'Abstract', 'core', true, 'Summary of the manuscript.', 'Summarize the manuscript.', 'Background: ...\nObjective: ...\nMethods: ...\nResults: ...\nConclusion: ...', [200, 350]),
    sec('keywords', 'Keywords', 'core', true, 'Indexing terms.', 'Choose 3-6 keywords.', 'Rheumatoid Arthritis; Methotrexate; Treatment Outcome'),
    sec('introduction', 'Introduction', 'core', true, 'Context, gap, and objective.', 'What is known, what is missing, and what is the objective?', 'Rheumatoid arthritis is...', [400, 800]),
    sec('methods', 'Methods', 'core', true, 'Study design and procedures.', 'Describe study methods.', 'Study Design and Setting\nThis was...', [800, 2000]),
    sec('results', 'Results', 'core', true, 'Objective presentation of findings.', 'What did you find?', 'A total of...', [600, 1500]),
    sec('discussion', 'Discussion', 'core', true, 'Interpret findings and discuss implications.', 'What do the findings mean?', 'The principal finding was...', [800, 1800]),
    sec('conclusion', 'Conclusion', 'core', true, 'Main takeaway.', 'What is the main takeaway?', 'These findings support...', [50, 200]),
    sec('references', 'References', 'core', true, 'Cited sources.', 'List references.', '1. Smolen JS, Aletaha D, McInnes IB. Rheumatoid arthritis. Lancet. 2016;388(10055):2023-38.'),
    sec('ethics', 'Ethics Approval', 'advanced', false, 'Ethics approval statement.', 'Provide ethics details.', 'This study was approved by...'),
    sec('consent', 'Informed Consent', 'advanced', false, 'Consent statement.', 'How was consent handled?', 'Written informed consent was obtained...'),
    sec('trial_registration', 'Trial Registration', 'advanced', false, 'Trial registry.', 'Where is it registered?', 'ClinicalTrials.gov Identifier: NCT...'),
    sec('funding', 'Funding', 'advanced', false, 'Funding disclosure.', 'Who funded the work?', 'This research received no specific grant.'),
    sec('conflicts', 'Conflicts of Interest', 'advanced', false, 'Conflict disclosure.', 'Declare conflicts.', 'The authors have no conflicts of interest to declare.'),
    sec('author_contributions', 'Author Contributions', 'advanced', false, 'Author roles.', 'What did each author do?', 'JDS: Conceptualization, Writing - original draft.'),
    sec('data_availability', 'Data Availability', 'advanced', false, 'Data access statement.', 'How can data be accessed?', 'Data are available upon reasonable request.'),
    sec('acknowledgments', 'Acknowledgments', 'advanced', false, 'Recognize contributors.', 'Who should be acknowledged?', 'The authors thank...'),
    sec('tables', 'Tables', 'advanced', false, 'Tables.', 'What table is needed?', 'Table 1. Baseline characteristics'),
    sec('figures', 'Figures & Legends', 'advanced', false, 'Figures and legends.', 'What figure is needed?', 'Figure 1. Study flow diagram.'),
    sec('supplementary', 'Supplementary Material', 'advanced', false, 'Supplementary material.', 'What supplements support the manuscript?', 'Supplementary Table S1.'),
    sec('cover_letter', 'Cover Letter', 'advanced', false, 'Letter to editor.', 'Why should the journal publish this?', 'Dear Editor,\n\nWe submit...'),
    sec('journal_notes', 'Submission Notes', 'advanced', false, 'Internal submission notes.', 'What are the submission requirements?', 'Target journal: The Kyrios Journal'),
  ];
}

function perspectiveSections(): ManuscriptSection[] {
  return [
    sec('title', 'Title', 'core', true, 'A focused title for a perspective or expert commentary.', 'What healthcare problem and conceptual response does this article present?', 'From Fragmented Encounters to Longitudinal Care: A Health Operating System Framework for Trust, Interoperability, and Outcome-Oriented Medicine'),
    sec('running_title', 'Running Title', 'core', true, 'A short recognizable manuscript header.', 'Create a concise running title.', 'Health OS for Longitudinal Care'),
    sec('authors', 'Authors', 'core', true, 'Authors meeting authorship criteria.', 'List authors.', 'João Otávio Rennó Grilo, MD¹'),
    sec('affiliations', 'Affiliations', 'core', true, 'Professional affiliations.', 'List affiliations.', '¹ Rheumatology, Ourinhos, São Paulo, Brazil'),
    sec('corresponding', 'Corresponding Author', 'core', true, 'Editorial contact.', 'Who handles correspondence?', 'Correspondence to: João Otávio Rennó Grilo, MD\nOurinhos, São Paulo, Brazil\nEmail: [professional email]'),
    sec('abstract', 'Abstract', 'core', true, 'Unstructured summary of the problem, argument, framework, and implications.', 'Summarize the commentary in one unstructured paragraph.', 'Healthcare systems increasingly generate digital records without producing longitudinal clinical memory. This commentary proposes...', [150, 250]),
    sec('keywords', 'Keywords', 'core', true, 'Indexing terms.', 'Choose searchable terms.', 'Digital Health; Interoperability; Longitudinal Care; Clinical Governance; Health Information Systems; Artificial Intelligence'),
    sec('introduction', 'Introduction', 'core', true, 'Introduce the fragmentation problem and the aim of the commentary.', 'Why is healthcare fragmentation clinically relevant?', 'Modern healthcare is increasingly digital but not necessarily continuous...', [250, 450]),
    sec('problem_statement', 'Problem Statement', 'core', true, 'Define the gap between episodic documentation and longitudinal coordination.', 'What fails when information remains episodic and fragmented?', 'The central problem is not the absence of data, but the absence of operational continuity...', [200, 400]),
    sec('conceptual_framework', 'Conceptual Framework', 'core', true, 'Describe the Health OS framework as a conceptual architecture.', 'What are the framework components and how do they address the problem?', 'The proposed framework can be understood as interacting layers: longitudinal clinical memory, interoperability, trust and auditability, consent governance, and outcome-oriented intelligence...', [350, 650]),
    sec('clinical_use_case', 'Clinical Use Case', 'core', true, 'Anchor the framework in a practical clinical scenario.', 'How would the framework operate in a real pathway such as rheumatology?', 'Rheumatology illustrates the need for longitudinal clinical memory...', [250, 500]),
    sec('implementation_considerations', 'Implementation Considerations', 'core', true, 'Discuss practical, ethical, regulatory, and technical implementation requirements.', 'What is necessary to implement the framework responsibly?', 'Implementation would require more than software development...', [250, 500]),
    sec('limitations', 'Limitations', 'core', true, 'State boundaries of the commentary and avoid overclaiming.', 'What can this article not prove?', 'This commentary has limitations. The framework remains conceptual and requires empirical validation...', [150, 300]),
    sec('future_directions', 'Future Directions', 'core', true, 'Define next steps for research and deployment.', 'What should be tested first?', 'Future work should prioritize small-scale pilots evaluating feasibility, clinician burden, consent comprehension, interoperability performance, and longitudinal outcome capture...', [150, 300]),
    sec('conclusion', 'Conclusion', 'core', true, 'Close with a balanced final message.', 'What is the final message?', 'Healthcare does not need more isolated digital records as much as it needs longitudinal clinical memory, accountable governance, and outcome-oriented coordination...', [75, 175]),
    sec('references', 'References', 'core', true, 'References in Vancouver style.', 'List references.', '1. World Health Organization. Global strategy on digital health 2020-2025. Geneva: WHO; 2021.'),
    sec('conflicts', 'Conflicts of Interest', 'core', true, 'Disclose competing interests and conceptual/development involvement.', 'What interests should readers know about?', 'The author is involved in the conceptual development of the proposed Health OS framework. No external funding was received for this manuscript.'),
    sec('funding', 'Funding', 'core', true, 'Disclose funding or absence of funding.', 'Was there funding?', 'This manuscript received no external funding.'),
    sec('acknowledgments', 'Acknowledgments', 'core', false, 'Acknowledge contributors who do not meet authorship criteria.', 'Who should be acknowledged?', 'The author thanks colleagues and reviewers who provided informal feedback.'),
  ];
}

export function createDefaultSections(articleType: ArticleType = 'original'): ManuscriptSection[] {
  if (articleType === 'perspective_commentary') return perspectiveSections();
  return standardSections();
}
