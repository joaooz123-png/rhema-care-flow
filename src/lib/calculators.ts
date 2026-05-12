 // Calculator Registry - Full hub with categories, search, and favorites
 
 export type CalculatorCategory = 
   | 'disease-activity'
   | 'classification'
   | 'functional'
   | 'prognosis'
   | 'monitoring';
 
 export type DiseaseType = 
   | 'ra'
   | 'sle'
   | 'spa'
   | 'psa'
   | 'vasculitis'
   | 'oa'
   | 'fm'
  | 'gout'
  | 'pediatric'
  | 'obgyn'
  | 'general';
 
 export interface Calculator {
   id: string;
   name: string;
   shortName: string;
   description: string;
   category: CalculatorCategory;
   diseases: DiseaseType[];
   formula?: string;
   reference?: string;
   implemented: boolean;
 }
 
 export const CALCULATOR_CATEGORIES: Record<CalculatorCategory, { label: string; description: string }> = {
   'disease-activity': { label: 'Disease Activity', description: 'Measure current disease activity levels' },
   'classification': { label: 'Classification Criteria', description: 'Diagnostic classification criteria' },
   'functional': { label: 'Functional Assessment', description: 'Physical function and disability measures' },
   'prognosis': { label: 'Prognosis & Risk', description: 'Risk stratification and prognosis tools' },
   'monitoring': { label: 'Monitoring', description: 'Treatment monitoring and response criteria' },
 };
 
 export const DISEASE_LABELS: Record<DiseaseType, { label: string; color: string }> = {
   ra: { label: 'RA', color: 'tag-ra' },
   sle: { label: 'SLE', color: 'tag-sle' },
   spa: { label: 'SpA', color: 'tag-spa' },
   psa: { label: 'PsA', color: 'tag-psa' },
   vasculitis: { label: 'Vasculitis', color: 'tag-vasculitis' },
   oa: { label: 'OA', color: 'bg-amber-100 text-amber-800 border-amber-300' },
   fm: { label: 'FM', color: 'tag-fm' },
  gout: { label: 'Gout', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  pediatric: { label: 'Pediatric', color: 'bg-sky-100 text-sky-800 border-sky-300' },
  obgyn: { label: 'OB/GYN', color: 'bg-pink-100 text-pink-800 border-pink-300' },
  general: { label: 'General', color: 'bg-slate-100 text-slate-700 border-slate-300' },
};

const WAVE2_CALCULATORS: Calculator[] = [
  {
    id: 'ckd-epi-2021',
    name: 'CKD-EPI 2021 (eGFR sem coeficiente racial)',
    shortName: 'CKD-EPI 2021',
    description: 'Taxa de filtração glomerular estimada — equação 2021 sem variável racial.',
    category: 'monitoring',
    diseases: ['general'],
    formula: '142 × min(Scr/κ,1)^α × max(Scr/κ,1)^(-1.200) × 0.9938^idade × (1.012 se ♀)',
    reference: 'Inker LA et al. NEJM 2021;385:1737-1749',
    implemented: true,
  },
  {
    id: 'wells',
    name: 'Wells Score — TVP e EP',
    shortName: 'Wells',
    description: 'Probabilidade pré-teste para Trombose Venosa Profunda e Embolia Pulmonar.',
    category: 'prognosis',
    diseases: ['general'],
    reference: 'Wells PS et al. Lancet 1997 / Ann Intern Med 2001',
    implemented: true,
  },
  {
    id: 'centor-mcisaac',
    name: 'Centor / McIsaac (Faringite)',
    shortName: 'Centor/McIsaac',
    description: 'Probabilidade de Streptococcus β-hemolítico A em faringoamigdalite.',
    category: 'classification',
    diseases: ['general'],
    reference: 'Centor RM 1981 / McIsaac WJ 1998',
    implemented: true,
  },
  {
    id: 'apache-ii',
    name: 'APACHE II',
    shortName: 'APACHE II',
    description: 'Acute Physiology and Chronic Health Evaluation II — gravidade em UTI.',
    category: 'prognosis',
    diseases: ['general'],
    reference: 'Knaus WA et al. Crit Care Med 1985;13:818-29',
    implemented: true,
  },
  {
    id: 'abc-gi-bleed',
    name: 'ABC Score — Sangramento GI',
    shortName: 'ABC GI',
    description: 'Predição de mortalidade em 30 dias para sangramento gastrointestinal alto e baixo.',
    category: 'prognosis',
    diseases: ['general'],
    reference: 'Laursen SB et al. Gut 2021;70:707-716',
    implemented: true,
  },
];
 
 export const CALCULATORS: Calculator[] = [
   // Disease Activity Scores
   {
     id: 'das28-esr',
     name: 'DAS28-ESR',
     shortName: 'DAS28',
     description: 'Disease Activity Score using ESR for Rheumatoid Arthritis',
     category: 'disease-activity',
     diseases: ['ra'],
     formula: '0.56×√TJC + 0.28×√SJC + 0.70×ln(ESR) + 0.014×GH',
     reference: 'van der Heijde et al. 1990',
     implemented: true,
   },
   {
     id: 'das28-crp',
     name: 'DAS28-CRP',
     shortName: 'DAS28-CRP',
     description: 'Disease Activity Score using CRP for Rheumatoid Arthritis',
     category: 'disease-activity',
     diseases: ['ra'],
     formula: '0.56×√TJC + 0.28×√SJC + 0.36×ln(CRP+1) + 0.014×GH + 0.96',
    implemented: true,
   },
  {
    id: 'das28-comparison',
    name: 'DAS28-ESR vs DAS28-CRP Comparison',
    shortName: 'DAS28 Compare',
    description: 'Compare ESR and CRP-based Disease Activity Scores side by side',
    category: 'disease-activity',
    diseases: ['ra'],
    reference: 'Useful when both markers are available',
    implemented: true,
  },
   {
     id: 'cdai',
     name: 'CDAI',
     shortName: 'CDAI',
     description: 'Clinical Disease Activity Index for RA',
     category: 'disease-activity',
     diseases: ['ra'],
     formula: 'TJC + SJC + PGA + EGA',
     implemented: true,
   },
   {
     id: 'sdai',
     name: 'SDAI',
     shortName: 'SDAI',
     description: 'Simplified Disease Activity Index for RA',
     category: 'disease-activity',
     diseases: ['ra'],
     formula: 'TJC + SJC + PGA + EGA + CRP',
    implemented: true,
   },
   {
     id: 'basdai',
     name: 'BASDAI',
     shortName: 'BASDAI',
     description: 'Bath Ankylosing Spondylitis Disease Activity Index',
     category: 'disease-activity',
     diseases: ['spa'],
     formula: '(Q1+Q2+Q3+Q4+(Q5+Q6)/2)/5',
     implemented: true,
   },
    {
      id: 'asdas',
      name: 'ASDAS-CRP / ASDAS-VHS',
      shortName: 'ASDAS',
      description: 'Ankylosing Spondylitis Disease Activity Score (variantes CRP e VHS)',
      category: 'disease-activity',
      diseases: ['spa'],
      formula: '0.12×Back + 0.06×Dur + 0.11×PGA + 0.07×Periph + 0.58×ln(CRP+1)',
      reference: 'Lukas C et al. 2009 / ASAS Handbook',
      implemented: true,
    },
    {
      id: 'boolean-remission',
      name: 'Boolean Remission ACR/EULAR',
      shortName: 'Boolean',
      description: 'Critérios booleanos de remissão para AR (TJC, SJC, PCR, PGA)',
      category: 'monitoring',
      diseases: ['ra'],
      reference: 'Felson 2011 / Studenic 2022',
      implemented: true,
    },
    {
      id: 'pmr-2012',
      name: 'PMR 2012 EULAR/ACR',
      shortName: 'PMR',
      description: 'Critérios de classificação para Polimialgia Reumática (≥4 sem US / ≥5 com US)',
      category: 'classification',
      diseases: ['general'],
      reference: 'Dasgupta B et al. 2012',
      implemented: true,
    },
    {
      id: 'sjogren-2016',
      name: 'Sjögren 2016 ACR/EULAR',
      shortName: 'Sjögren',
      description: 'Critérios de classificação para Síndrome de Sjögren primária (≥4 pts)',
      category: 'classification',
      diseases: ['general'],
      reference: 'Shiboski CH et al. 2017',
      implemented: true,
    },
    {
      id: 'mrss',
      name: 'mRSS (Modified Rodnan Skin Score)',
      shortName: 'mRSS',
      description: 'Espessamento cutâneo em 17 áreas para esclerose sistêmica (0–51)',
      category: 'disease-activity',
      diseases: ['general'],
      reference: 'Khanna D et al. 2017',
      implemented: true,
    },
   {
     id: 'sledai',
     name: 'SLEDAI-2K',
     shortName: 'SLEDAI',
     description: 'Systemic Lupus Erythematosus Disease Activity Index',
     category: 'disease-activity',
     diseases: ['sle'],
     reference: 'Gladman et al. 2002',
     implemented: true,
   },
   {
     id: 'bilag',
     name: 'BILAG-2004',
     shortName: 'BILAG',
     description: 'British Isles Lupus Assessment Group Index',
     category: 'disease-activity',
     diseases: ['sle'],
     implemented: false,
   },
   {
     id: 'dapsa',
     name: 'DAPSA',
     shortName: 'DAPSA',
     description: 'Disease Activity in Psoriatic Arthritis',
     category: 'disease-activity',
     diseases: ['psa'],
     formula: 'TJC + SJC + Pain VAS + PGA + CRP',
     implemented: true,
   },
   {
     id: 'mda',
     name: 'MDA',
     shortName: 'MDA',
     description: 'Minimal Disease Activity for PsA (5/7 criteria)',
     category: 'disease-activity',
     diseases: ['psa'],
     implemented: true,
     reference: 'Coates et al. 2010',
   },
   {
     id: 'bvas',
     name: 'BVAS v3',
     shortName: 'BVAS',
     description: 'Birmingham Vasculitis Activity Score',
     category: 'disease-activity',
     diseases: ['vasculitis'],
     implemented: false,
   },
   
   // Classification Criteria
   {
     id: 'acr-eular-ra',
     name: 'ACR/EULAR 2010 RA Criteria',
     shortName: 'RA Criteria',
     description: 'Classification criteria for Rheumatoid Arthritis (≥6 points)',
     category: 'classification',
     diseases: ['ra'],
     reference: 'Aletaha et al. 2010',
    implemented: true,
   },
    {
      id: 'slicc-sle',
      name: 'SLICC 2012 SLE Criteria',
      shortName: 'SLICC',
      description: 'Systemic Lupus International Collaborating Clinics criteria (≥4, ≥1 clínico + ≥1 imunológico)',
      category: 'classification',
      diseases: ['sle'],
      reference: 'Petri M et al. 2012',
      implemented: true,
    },
   {
     id: 'eular-acr-sle',
     name: 'EULAR/ACR 2019 SLE Criteria',
     shortName: 'SLE 2019',
     description: 'Critérios de classificação para LES (FAN+ entry, ≥10 pts, ≥1 clínico)',
     category: 'classification',
     diseases: ['sle'],
     reference: 'Aringer M et al. Ann Rheum Dis 2019;78:1151-9',
     implemented: true,
   },
   {
     id: 'essdai',
     name: 'ESSDAI',
     shortName: 'ESSDAI',
     description: 'EULAR Sjögren\'s Syndrome Disease Activity Index — atividade sistêmica em 12 domínios',
     category: 'disease-activity',
     diseases: ['general'],
     reference: 'Seror R et al. Ann Rheum Dis 2010;69:1103-9',
     implemented: true,
   },
   {
     id: 'asas-axspa',
     name: 'ASAS axSpA Criteria',
     shortName: 'axSpA',
     description: 'Assessment of SpondyloArthritis criteria',
     category: 'classification',
     diseases: ['spa'],
     implemented: false,
   },
   {
     id: 'caspar',
     name: 'CASPAR Criteria',
     shortName: 'CASPAR',
     description: 'Classification Criteria for Psoriatic Arthritis',
     category: 'classification',
     diseases: ['psa'],
     implemented: true,
   },
   {
     id: 'acr-fibromyalgia',
     name: 'ACR 2016 FM Criteria',
     shortName: 'FM Criteria',
     description: 'Fibromyalgia diagnostic criteria (WPI + SSS)',
     category: 'classification',
     diseases: ['fm'],
     implemented: true,
   },
    {
      id: 'acr-eular-gout',
      name: 'ACR/EULAR 2015 Gout Criteria',
      shortName: 'Gout',
      description: 'Critérios de classificação para gota (entry + ≥8 pts ou cristais)',
      category: 'classification',
      diseases: ['gout'],
      reference: 'Neogi T et al. 2015',
      implemented: true,
    },
   
   // Functional Assessment
   {
     id: 'haq-di',
     name: 'HAQ-DI',
     shortName: 'HAQ-DI',
     description: 'Health Assessment Questionnaire Disability Index — capacidade funcional (0–3)',
     category: 'functional',
     diseases: ['ra', 'general'],
     reference: 'Fries JF et al. Arthritis Rheum 1980;23:137-45',
     implemented: true,
   },
   {
     id: 'rapid3',
     name: 'RAPID3',
     shortName: 'RAPID3',
     description: 'Routine Assessment of Patient Index Data 3 — atividade da AR pelo paciente (0–30)',
     category: 'functional',
     diseases: ['ra'],
     formula: 'Function (0–10) + Pain (0–10) + PGA (0–10)',
     reference: 'Pincus T et al. J Rheumatol 2008',
     implemented: true,
   },
   {
     id: 'basmi',
     name: 'BASMI (linear)',
     shortName: 'BASMI',
     description: 'Bath Ankylosing Spondylitis Metrology Index — mobilidade axial (5 medidas, 0–10)',
     category: 'functional',
     diseases: ['spa'],
     reference: 'van der Heijde D et al. J Rheumatol 2008',
     implemented: true,
   },
    {
      id: 'basfi',
      name: 'BASFI',
      shortName: 'BASFI',
      description: 'Bath Ankylosing Spondylitis Functional Index — 10 escalas 0–10',
      category: 'functional',
      diseases: ['spa'],
      reference: 'Calin A et al. 1994',
      implemented: true,
    },
   {
     id: 'womac',
     name: 'WOMAC',
     shortName: 'WOMAC',
     description: 'Western Ontario and McMaster Universities Index (numeric)',
     category: 'functional',
     diseases: ['oa'],
     implemented: false,
   },
   {
     id: 'fiq-r',
     name: 'FIQ-R',
     shortName: 'FIQ-R',
     description: 'Revised Fibromyalgia Impact Questionnaire',
     category: 'functional',
     diseases: ['fm'],
     implemented: true,
   },
   {
     id: 'fm-combined',
     name: 'FM Combined (ACR + FIQR)',
     shortName: 'FM Combined',
     description: 'Avaliação combinada ACR 2016 + FIQR vinculada à consulta',
     category: 'monitoring',
     diseases: ['fm'],
     implemented: true,
   },
   
   // Prognosis & Risk
   {
     id: 'slicc-sdi',
     name: 'SLICC/ACR SDI',
     shortName: 'SDI',
     description: 'Systemic Lupus International Damage Index',
     category: 'prognosis',
     diseases: ['sle'],
     implemented: false,
   },
   {
     id: 'sharp-score',
     name: 'Sharp/van der Heijde Score',
     shortName: 'Sharp',
     description: 'Radiographic progression scoring for RA',
     category: 'prognosis',
     diseases: ['ra'],
     implemented: false,
   },
   {
     id: 'five-factor-score',
     name: 'Five Factor Score',
     shortName: 'FFS',
     description: 'Prognostic score for systemic necrotizing vasculitis',
     category: 'prognosis',
     diseases: ['vasculitis'],
     implemented: false,
   },
   
   // Monitoring
  {
    id: 'eular-response',
    name: 'EULAR Response Criteria',
    shortName: 'EULAR Resp',
    description: 'Treatment response classification (DAS28-based)',
    category: 'monitoring',
    diseases: ['ra'],
    reference: 'van Gestel et al. 1996',
    implemented: true,
  },
   {
     id: 'acr-response',
     name: 'ACR20/50/70 Response',
     shortName: 'ACR Resp',
     description: 'American College of Rheumatology improvement criteria',
     category: 'monitoring',
     diseases: ['ra'],
     implemented: true,
     reference: 'Felson et al. 1995',
   },
  {
    id: 'asas-response',
    name: 'ASAS Response Criteria',
    shortName: 'ASAS Resp',
    description: 'ASAS20/40 response and partial remission for axSpA',
    category: 'monitoring',
    diseases: ['spa'],
    reference: 'Anderson et al. 2001',
    implemented: true,
  },
  {
    id: 'treatment-response-comparison',
    name: 'Treatment Response Comparison',
    shortName: 'Response Compare',
    description: 'Track ACR/EULAR responses across multiple visits',
    category: 'monitoring',
    diseases: ['ra'],
    reference: 'ACR/EULAR Guidelines',
    implemented: true,
  },
   {
     id: 'sle-responder-index',
     name: 'SLE Responder Index',
     shortName: 'SRI',
     description: 'Composite response measure for SLE trials',
     category: 'monitoring',
    diseases: ['sle'],
    implemented: false,
  },

  // ===== Pediatric calculators =====
  {
    id: 'apgar',
    name: 'APGAR Score',
    shortName: 'APGAR',
    description: 'Newborn vitality assessment at 1 and 5 minutes (0–10).',
    category: 'disease-activity',
    diseases: ['pediatric'],
    formula: 'Appearance + Pulse + Grimace + Activity + Respiration',
    reference: 'Apgar V. 1953',
    implemented: true,
  },
  {
    id: 'pews',
    name: 'PEWS — Pediatric Early Warning Score',
    shortName: 'PEWS',
    description: 'Detects clinical deterioration in hospitalized children.',
    category: 'monitoring',
    diseases: ['pediatric'],
    formula: 'Behavior + Cardiovascular + Respiratory (each 0–3)',
    reference: 'Monaghan A. 2005',
    implemented: true,
  },
  {
    id: 'who-growth',
    name: 'WHO Growth — Weight & Height for Age',
    shortName: 'Growth',
    description: 'Approximate z-score and percentile for weight/height by age (0–19y).',
    category: 'monitoring',
    diseases: ['pediatric'],
    reference: 'WHO Child Growth Standards (LMS, simplified)',
    implemented: true,
  },
  {
    id: 'pedi-dose',
    name: 'Pediatric Weight-Based Dose',
    shortName: 'Pedi Dose',
    description: 'mg/kg dose calculator with safety cap (max single dose).',
    category: 'monitoring',
    diseases: ['pediatric'],
    formula: 'dose = min(weight × mg/kg, max_single_dose)',
    implemented: true,
  },

  // ===== OB/GYN calculators =====
  {
    id: 'ballard',
    name: 'Escala de Ballard',
    shortName: 'Ballard',
    description: 'Estimativa da idade gestacional por maturidade neuromuscular e física do RN.',
    category: 'monitoring',
    diseases: ['pediatric'],
    formula: 'IG (sem) derivada da pontuação somática + neuromuscular',
    reference: 'Ballard JL et al. J Pediatr. 1991',
    implemented: true,
  },
  {
    id: 'capurro',
    name: 'Método de Capurro',
    shortName: 'Capurro',
    description: 'Idade gestacional por critérios somáticos neonatais — 5 parâmetros.',
    category: 'monitoring',
    diseases: ['pediatric'],
    formula: 'IG = (pontuação + 204) / 7',
    reference: 'Capurro H et al. J Pediatr. 1978',
    implemented: true,
  },
  {
    id: 'silverman',
    name: 'Silverman-Andersen',
    shortName: 'Silverman',
    description: 'Avaliação do desconforto respiratório neonatal (0–10).',
    category: 'disease-activity',
    diseases: ['pediatric'],
    formula: 'Soma de 5 critérios (0–2 cada)',
    reference: 'Silverman WA, Andersen DH. Pediatrics. 1956',
    implemented: true,
  },
  {
    id: 'wood-downes',
    name: 'Wood-Downes Modificado',
    shortName: 'Wood-Downes',
    description: 'Gravidade do broncoespasmo / crise asmática em crianças (0–14).',
    category: 'disease-activity',
    diseases: ['pediatric'],
    formula: 'Sibilância + Retração + Entrada de ar + Cianose + Consciência',
    reference: 'Wood DW et al. Am J Dis Child. 1972',
    implemented: true,
  },
  {
    id: 'pulmonary-score',
    name: 'Pulmonary Score',
    shortName: 'Pulmonary Score',
    description: 'Escore de gravidade de crise asmática pediátrica baseado em FR, sibilância e retração (0–9).',
    category: 'disease-activity',
    diseases: ['pediatric'],
    formula: 'FR (por idade) + Sibilância + Retração (0–3 cada)',
    reference: 'Becker A et al. J Pediatr. 1984',
    implemented: true,
  },
  {
    id: 'dehydration',
    name: 'Avaliação de Desidratação',
    shortName: 'Desidratação',
    description: 'Escala de Gorelick/OMS — Planos A, B e C de reidratação.',
    category: 'disease-activity',
    diseases: ['pediatric'],
    formula: '6 critérios clínicos, 0–2 cada (total 0–12)',
    reference: 'WHO. The treatment of diarrhoea. 2005',
    implemented: true,
  },
  {
    id: 'holliday-segar',
    name: 'Holliday-Segar',
    shortName: 'Holliday-Segar',
    description: 'Necessidades hídricas de manutenção pediátrica pela regra 4-2-1.',
    category: 'monitoring',
    diseases: ['pediatric'],
    formula: '100/50/20 mL/kg/dia conforme faixas de peso',
    reference: 'Holliday MA, Segar WE. Pediatrics. 1957',
    implemented: true,
  },
  {
    id: 'rochester',
    name: 'Critérios de Rochester',
    shortName: 'Rochester',
    description: 'Risco de infecção bacteriana grave em lactentes febris ≤ 60 dias.',
    category: 'classification',
    diseases: ['pediatric'],
    reference: 'Dagan R et al. J Pediatr. 1985',
    implemented: true,
  },
  {
    id: 'mchat',
    name: 'M-CHAT-R/F',
    shortName: 'M-CHAT-R',
    description: 'Triagem de Transtorno do Espectro Autista em crianças de 16–30 meses.',
    category: 'classification',
    diseases: ['pediatric'],
    reference: 'Robins DL et al. J Autism Dev Disord. 2014',
    implemented: true,
  },

  // ===== Obstetrics & Gynecology calculators =====
  {
    id: 'gestational-age',
    name: 'Idade Gestacional',
    shortName: 'Idade Gestacional',
    description: 'Cálculo da IG e DPP pela DUM (Naegele) ou por ultrassonografia obstétrica.',
    category: 'monitoring',
    diseases: ['general'],
    reference: 'Regra de Naegele / Hadlock',
    implemented: true,
  },
  {
    id: 'bishop',
    name: 'Bishop Score',
    shortName: 'Bishop',
    description: 'Avaliação da maturidade cervical para indução do trabalho de parto.',
    category: 'prognosis',
    diseases: ['obgyn'],
    formula: 'Dilatação + Apagamento + Altura + Consistência + Posição (0–13)',
    reference: 'Bishop EH, 1964',
    implemented: true,
  },
  {
    id: 'gestational-age',
    name: 'Idade Gestacional (DUM)',
    shortName: 'IG',
    description: 'Cálculo da IG e DPP pela regra de Naegele.',
    category: 'monitoring',
    diseases: ['obgyn'],
    formula: 'Hoje − DUM (em dias) → semanas + dias; DPP = DUM + 280 dias',
    reference: 'Naegele FK',
    implemented: true,
  },
  {
    id: 'preeclampsia-risk',
    name: 'Risco de Pré-eclâmpsia',
    shortName: 'PE Risk',
    description: 'Triagem clínica para profilaxia com AAS no 1º trimestre.',
    category: 'prognosis',
    diseases: ['obgyn'],
    reference: 'ACOG 2018 / USPSTF / FEBRASGO',
    implemented: true,
  },
  {
    id: 'pregnancy-bmi',
    name: 'IMC e Ganho Ponderal Gestacional',
    shortName: 'IMC Gestação',
    description: 'Faixas de ganho de peso na gestação por IMC pré-gestacional (IOM 2009).',
    category: 'monitoring',
    diseases: ['obgyn'],
    reference: 'Institute of Medicine, 2009',
    implemented: true,
  },
  {
    id: 'preeclampsia',
    name: 'Pré-eclâmpsia — Critérios ACOG',
    shortName: 'Pré-eclâmpsia',
    description: 'Classificação e critérios de gravidade da pré-eclâmpsia (ACOG 2019 / FEBRASGO 2022).',
    category: 'classification',
    diseases: ['general'],
    reference: 'ACOG Practice Bulletin No. 222, 2020',
    implemented: true,
  },
  {
    id: 'pe-early-risk',
    name: 'Triagem PE — 1° Trimestre',
    shortName: 'Triagem PE 1°T',
    description: 'Risco de pré-eclâmpsia precoce pelo modelo combinado FMF (11–13+6 semanas).',
    category: 'prognosis',
    diseases: ['general'],
    reference: 'Poon LC et al. Ultrasound Obstet Gynecol 2019',
    implemented: true,
  },
  {
    id: 'hpp',
    name: 'Hemorragia Pós-Parto (HPP)',
    shortName: 'HPP',
    description: 'Avaliação de perda sanguínea e fatores de risco — protocolo OMS / FEBRASGO.',
    category: 'disease-activity',
    diseases: ['general'],
    reference: 'WHO. Prevention and treatment of PPH, 2012',
    implemented: true,
  },
  {
    id: 'gdm',
    name: 'Diabetes Mellitus Gestacional',
    shortName: 'DMG',
    description: 'Interpretação da TOTG 75g e rastreio de risco — critérios IADPSG / FEBRASGO / ADA.',
    category: 'classification',
    diseases: ['general'],
    formula: 'Jejum < 92, 1h < 180, 2h < 153 mg/dL (IADPSG)',
    reference: 'IADPSG Consensus Panel. Diabetes Care 2010',
    implemented: true,
  },
  {
    id: 'vbac',
    name: 'PVPC — Parto Vaginal Pós-Cesárea',
    shortName: 'PVPC / VBAC',
    description: 'Estimativa de sucesso do parto vaginal após cesárea (escore de Grobman / MFMU).',
    category: 'prognosis',
    diseases: ['general'],
    reference: 'Grobman WA et al. Obstet Gynecol 2007',
    implemented: true,
  },
  {
    id: 'biophysical-profile',
    name: 'Perfil Biofísico Fetal (Manning)',
    shortName: 'PBF / Manning',
    description: 'Avaliação do bem-estar fetal por USG + CTG — 5 parâmetros, pontuação 0–10.',
    category: 'monitoring',
    diseases: ['general'],
    formula: 'NST + Movimentos resp. + Corpóreos + Tônus + ILA (0 ou 2 cada)',
    reference: 'Manning FA et al. Am J Obstet Gynecol 1980',
    implemented: true,
  },
  {
    id: 'preterm-risk',
    name: 'Risco de Parto Prematuro',
    shortName: 'Parto Prematuro',
    description: 'Avaliação clínica + colo uterino (USTV) + fibronectina fetal — FEBRASGO/ACOG.',
    category: 'prognosis',
    diseases: ['general'],
    reference: 'ACOG Practice Bulletin No. 234, 2021',
    implemented: true,
  },
  {
    id: 'amniotic-fluid',
    name: 'Índice de Líquido Amniótico (ILA)',
    shortName: 'ILA',
    description: 'Cálculo do ILA pelos 4 quadrantes (Phelan) ou maior bolsão único.',
    category: 'monitoring',
    diseases: ['general'],
    reference: 'Phelan JP et al. J Reprod Med 1987',
    implemented: true,
  },
  ...WAVE2_CALCULATORS,
];

// Favorites management
 const FAVORITES_KEY = 'rheumaflow_calculator_favorites';
 
 export function getFavorites(): string[] {
   try {
     const stored = localStorage.getItem(FAVORITES_KEY);
     return stored ? JSON.parse(stored) : [];
   } catch {
     return [];
   }
 }
 
 export function toggleFavorite(calculatorId: string): string[] {
   const favorites = getFavorites();
   const index = favorites.indexOf(calculatorId);
   if (index === -1) {
     favorites.push(calculatorId);
   } else {
     favorites.splice(index, 1);
   }
   localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
   return favorites;
 }
 
 // History management
 const HISTORY_KEY = 'rheumaflow_calculator_history';
 
 export interface HistoryEntry {
   calculatorId: string;
   timestamp: number;
   score: number;
   inputs: Record<string, number | string>;
 }
 
 export function getHistory(): HistoryEntry[] {
   try {
     const stored = localStorage.getItem(HISTORY_KEY);
     return stored ? JSON.parse(stored) : [];
   } catch {
     return [];
   }
 }
 
 export function addToHistory(entry: Omit<HistoryEntry, 'timestamp'>): void {
   const history = getHistory();
   history.unshift({ ...entry, timestamp: Date.now() });
   // Keep only last 50 entries
   localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
 }
 
 export function clearHistory(): void {
   localStorage.removeItem(HISTORY_KEY);
 }