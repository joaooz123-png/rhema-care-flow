// Centralized criteria, cutoffs and OFFICIAL references for every implemented calculator.
// This file overrides/enriches the lightweight `reference` field on CALCULATORS in calculators.ts
// without forcing edits in 60+ component files.
//
// Convention:
//  - `criteria`: short bullet of inputs / domains / scoring rule
//  - `cutoffs`:  category bands or decision thresholds used by the calculator
//  - `reference`: full citation (Author. Journal Year;Vol:Pages)
//  - `referenceUrl`: link to the primary source (PubMed, society guideline, WHO/ACOG, etc.)

export interface CalculatorMeta {
  criteria?: string;
  cutoffs?: string;
  reference?: string;
  referenceUrl?: string;
  guideline?: string; // optional society/guideline tag
}

export const CALCULATOR_META: Record<string, CalculatorMeta> = {
  // ===== RA =====
  'das28-esr': {
    criteria: '28 articulações dolorosas (TJC) + 28 inchadas (SJC) + VHS + GH (EVA 0–100).',
    cutoffs: 'Remissão <2.6 · Baixa <3.2 · Moderada 3.2–5.1 · Alta >5.1',
    reference: 'Prevoo MLL et al. Arthritis Rheum 1995;38:44-48',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/7818570/',
    guideline: 'EULAR',
  },
  'das28-crp': {
    criteria: '28 TJC + 28 SJC + PCR (mg/L) + GH (EVA 0–100).',
    cutoffs: 'Remissão <2.6 · Baixa <3.2 · Moderada 3.2–5.1 · Alta >5.1 (mesmo cut-off; tende a subestimar atividade vs. ESR).',
    reference: 'Wells G et al. Ann Rheum Dis 2009;68:954-960',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/18490431/',
  },
  'das28-comparison': {
    criteria: 'Comparação direta DAS28-ESR × DAS28-CRP no mesmo paciente.',
    cutoffs: 'Mesmos pontos de corte; discrepâncias frequentes em obesidade, idosos e mulheres.',
    reference: 'Hensor EMA et al. Rheumatology 2010;49:1521-9',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/20435665/',
  },
  'cdai': {
    criteria: 'TJC28 + SJC28 + PGA (0–10) + EGA (0–10). Sem reagentes de fase aguda.',
    cutoffs: 'Remissão ≤2.8 · Baixa >2.8–10 · Moderada >10–22 · Alta >22',
    reference: 'Aletaha D, Smolen J. Clin Exp Rheumatol 2005;23(Suppl 39):S100-8',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/16273793/',
  },
  'sdai': {
    criteria: 'TJC28 + SJC28 + PGA (0–10) + EGA (0–10) + PCR (mg/dL).',
    cutoffs: 'Remissão ≤3.3 · Baixa >3.3–11 · Moderada >11–26 · Alta >26',
    reference: 'Smolen JS et al. Rheumatology 2003;42:244-57',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/12595618/',
  },
  'boolean-remission': {
    criteria: 'TJC28 ≤1 · SJC28 ≤1 · PCR ≤1 mg/dL · PGA ≤1 (0–10). Versão 2022 usa PGA ≤2.',
    cutoffs: 'Remissão = todos os 4 critérios atendidos simultaneamente.',
    reference: 'Studenic P et al. Ann Rheum Dis 2023;82:74-80 (revisão 2022)',
    referenceUrl: 'https://ard.bmj.com/content/82/1/74',
    guideline: 'ACR/EULAR 2022',
  },
  'acr-eular-ra': {
    criteria: 'Entry: ≥1 articulação com sinovite clínica não explicada por outra doença. 4 domínios: articulações, sorologia, fase aguda, duração.',
    cutoffs: 'AR definida ≥6/10 pontos.',
    reference: 'Aletaha D et al. Arthritis Rheum 2010;62:2569-81',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/20872595/',
    guideline: 'ACR/EULAR 2010',
  },
  'eular-response': {
    criteria: 'ΔDAS28 e DAS28 atual.',
    cutoffs: 'Boa: Δ>1.2 e DAS28 ≤3.2 · Moderada: Δ>0.6 ou DAS28 >3.2 com Δ>1.2 · Ausente: Δ≤0.6.',
    reference: 'van Gestel AM et al. Arthritis Rheum 1996;39:34-40',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/8546736/',
  },
  'acr-response': {
    criteria: 'Melhora ≥X% em TJC e SJC + ≥3 de 5 (PGA, EGA, dor, HAQ, fase aguda).',
    cutoffs: 'ACR20 / ACR50 / ACR70 conforme limiar de melhora.',
    reference: 'Felson DT et al. Arthritis Rheum 1995;38:727-35',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/7779114/',
  },
  'rapid3': {
    criteria: 'MDHAQ função (0–10) + dor EVA (0–10) + PGA EVA (0–10).',
    cutoffs: 'Remissão ≤3 · Baixa >3–6 · Moderada >6–12 · Alta >12 (escala 0–30).',
    reference: 'Pincus T et al. J Rheumatol 2008;35:2136-47',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/18793006/',
  },
  'haq-di': {
    criteria: '8 categorias × 4 níveis (0 sem dificuldade — 3 incapaz). Ajuste por dispositivo de auxílio/ajuda.',
    cutoffs: '0 sem incapacidade · ≤1 leve · 1–2 moderada · >2 grave. MCID ≈ 0.22.',
    reference: 'Fries JF et al. Arthritis Rheum 1980;23:137-45',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/7362664/',
  },
  'treatment-response-comparison': {
    criteria: 'Visualização longitudinal de DAS28/CDAI/SDAI e respostas ACR/EULAR.',
    reference: 'Smolen JS et al. Ann Rheum Dis 2023;82:3-18 (EULAR recommendations for the management of RA)',
    referenceUrl: 'https://ard.bmj.com/content/82/1/3',
    guideline: 'EULAR 2022 update',
  },

  // ===== SpA =====
  'basdai': {
    criteria: '6 NRS (0–10): fadiga, dor axial, dor periférica, entesite, intensidade e duração da rigidez matinal.',
    cutoffs: 'Atividade alta ≥4 (gatilho para terapia biológica).',
    reference: 'Garrett S et al. J Rheumatol 1994;21:2286-91',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/7699630/',
    guideline: 'ASAS',
  },
  'asdas': {
    criteria: 'Dor lombar + duração rigidez + PGA + dor periférica + ln(PCR+1) ou VHS.',
    cutoffs: 'Inativa <1.3 · Baixa 1.3–<2.1 · Alta 2.1–≤3.5 · Muito alta >3.5. Melhora clinicamente importante ΔASDAS ≥1.1; melhora maior ≥2.0.',
    reference: 'Machado P et al. Ann Rheum Dis 2011;70:47-53',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/21068095/',
    guideline: 'ASAS',
  },
  'basfi': {
    criteria: '10 EVA (0–10) sobre função em atividades cotidianas. Score = média.',
    cutoffs: 'Sem ponto de corte único; usado para acompanhamento longitudinal.',
    reference: 'Calin A et al. J Rheumatol 1994;21:2281-85',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/7699629/',
  },
  'basmi': {
    criteria: '5 medidas: tragus-parede, flexão lombar (Schober mod.), flexão lateral lombar, rotação cervical, distância intermaleolar.',
    cutoffs: 'Linear 0–10; valores maiores = pior mobilidade.',
    reference: 'van der Heijde D et al. J Rheumatol 2008;35:1815-8',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/18634160/',
  },
  'asas-response': {
    criteria: 'Melhora ≥20%/40% e ≥1/2 unidades em ≥3 de 4 domínios (PGA, dor, função, inflamação).',
    cutoffs: 'ASAS20 · ASAS40 · ASAS5/6 · Remissão parcial: ≤2/10 em todos os 4 domínios.',
    reference: 'Anderson JJ et al. Arthritis Rheum 2001;44:1876-86',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/11508441/',
    guideline: 'ASAS',
  },

  // ===== PsA =====
  'dapsa': {
    criteria: 'TJC68 + SJC66 + Dor EVA (0–10) + PGA (0–10) + PCR (mg/dL).',
    cutoffs: 'Remissão ≤4 · Baixa >4–14 · Moderada >14–28 · Alta >28',
    reference: 'Schoels MM et al. Ann Rheum Dis 2010;69:1441-7',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/20525846/',
  },
  'mda': {
    criteria: '7 critérios: TJC ≤1, SJC ≤1, PASI ≤1 ou BSA ≤3, dor ≤15/100, PGA ≤20/100, HAQ ≤0.5, entesite ≤1.',
    cutoffs: 'MDA = ≥5/7 critérios. VLDA = 7/7.',
    reference: 'Coates LC et al. Ann Rheum Dis 2010;69:48-53',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/19147615/',
  },

  // ===== SLE / Sjögren =====
  'sledai': {
    criteria: '24 itens clínicos e laboratoriais ponderados (1, 2, 4, 8 pontos).',
    cutoffs: 'Remissão 0 · Leve 1–5 · Moderada 6–10 · Alta 11–19 · Muito alta ≥20.',
    reference: 'Gladman DD et al. J Rheumatol 2002;29:288-91',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/11838846/',
  },
  'slicc-sle': {
    criteria: '11 critérios clínicos + 6 imunológicos. Alternativa: nefrite lúpica comprovada por biópsia + FAN ou anti-DNAds.',
    cutoffs: '≥4 critérios (com ≥1 clínico e ≥1 imunológico).',
    reference: 'Petri M et al. Arthritis Rheum 2012;64:2677-86',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/22553077/',
  },
  'eular-acr-sle': {
    criteria: 'Entrada: FAN ≥1:80 (Hep-2). 7 domínios clínicos + 3 imunológicos, ponderados.',
    cutoffs: 'LES classificado se ≥10 pontos com pelo menos 1 critério clínico.',
    reference: 'Aringer M et al. Ann Rheum Dis 2019;78:1151-9',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/31383717/',
    guideline: 'EULAR/ACR 2019',
  },
  'sjogren-2016': {
    criteria: 'Score ponderado: foco linfocitário ≥1 (3) · anti-SSA/Ro+ (3) · OSS ≥5 (1) · Schirmer ≤5 mm/5 min (1) · fluxo salivar ≤0.1 mL/min (1).',
    cutoffs: 'Classificação se ≥4 pontos. Critérios de entrada e exclusão obrigatórios.',
    reference: 'Shiboski CH et al. Arthritis Rheumatol 2017;69:35-45',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/27785888/',
    guideline: 'ACR/EULAR 2016',
  },
  'essdai': {
    criteria: '12 domínios sistêmicos, ponderados por atividade (low/moderate/high).',
    cutoffs: 'Atividade baixa <5 · Moderada 5–13 · Alta ≥14. MCII ≥3.',
    reference: 'Seror R et al. Ann Rheum Dis 2010;69:1103-9',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/19561361/',
    guideline: 'EULAR',
  },

  // ===== Outras reumatológicas =====
  'mrss': {
    criteria: '17 áreas anatômicas, espessura cutânea 0–3 cada.',
    cutoffs: 'Total 0–51. Maior = maior extensão/espessamento.',
    reference: 'Khanna D et al. J Scleroderma Relat Disord 2017;2:11-18',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/28516167/',
  },
  'pmr-2012': {
    criteria: 'Idade ≥50, dor cintura escapular bilateral, ↑VHS/PCR + 4 critérios ponderados (rigidez matinal >45 min, dor pélvica, ausência FR/CCP, sem outra articulação).',
    cutoffs: '≥4 sem US · ≥5 com US (sinovite/bursite).',
    reference: 'Dasgupta B et al. Ann Rheum Dis 2012;71:484-92',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/22388996/',
    guideline: 'EULAR/ACR 2012',
  },
  'caspar': {
    criteria: 'Doença articular inflamatória + ≥3 pontos de: psoríase atual (2)/passada/familiar, distrofia ungueal, FR negativo, dactilite, evidência radiográfica.',
    cutoffs: 'Classificação ≥3 pontos.',
    reference: 'Taylor W et al. Arthritis Rheum 2006;54:2665-73',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/16871531/',
  },
  'acr-fibromyalgia': {
    criteria: 'WPI (0–19 áreas) + SSS (0–12: fadiga, sono, sintomas cognitivos + sintomas somáticos).',
    cutoffs: 'Diagnóstico: WPI ≥7 e SSS ≥5, ou WPI 4–6 e SSS ≥9; sintomas ≥3 meses; presença de dor generalizada.',
    reference: 'Wolfe F et al. Semin Arthritis Rheum 2016;46:319-29',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/27916278/',
    guideline: 'ACR 2016 revisão',
  },
  'fiq-r': {
    criteria: '21 itens (0–10) em 3 domínios: função, impacto global, sintomas.',
    cutoffs: 'Total 0–100. Leve <39 · Moderado 39–59 · Grave 60–79 · Muito grave ≥80.',
    reference: 'Bennett RM et al. Arthritis Res Ther 2009;11:R120',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/19664287/',
  },
  'fm-combined': {
    criteria: 'Aplica simultaneamente ACR 2016 e FIQR a uma mesma consulta.',
    reference: 'Ver fontes ACR 2016 (Wolfe 2016) e FIQR (Bennett 2009).',
  },
  'acr-eular-gout': {
    criteria: 'Entrada: ≥1 episódio de tumefação, dor ou hipersensibilidade em articulação periférica/bursa. Critério suficiente: cristais de UMS. Caso contrário: 8 itens ponderados (clínicos, laboratoriais, imagem).',
    cutoffs: 'Classificação se ≥8 pontos.',
    reference: 'Neogi T et al. Arthritis Rheumatol 2015;67:2557-68',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/26352873/',
    guideline: 'ACR/EULAR 2015',
  },

  // ===== Pediatria =====
  'apgar': {
    criteria: 'Aparência, Pulso, Caretas, Atividade, Respiração (0–2 cada).',
    cutoffs: '7–10 normal · 4–6 depressão moderada · 0–3 depressão grave (1 e 5 minutos).',
    reference: 'Apgar V. Curr Res Anesth Analg 1953;32:260-7',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/13083014/',
  },
  'pews': {
    criteria: 'Comportamento + Cardiovascular + Respiratório (0–3 cada).',
    cutoffs: 'Score ≥3 → reavaliação imediata; ≥5 → time de resposta rápida.',
    reference: 'Monaghan A. Paediatr Nurs 2005;17:32-5',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/15751446/',
  },
  'who-growth': {
    criteria: 'Peso/estatura para idade (0–19 anos) — aproximação LMS.',
    cutoffs: 'Z-score: <-2 baixo peso/baixa estatura · >+2 sobrepeso/alta estatura.',
    reference: 'WHO Child Growth Standards. Acta Paediatr Suppl 2006;450:5-101',
    referenceUrl: 'https://www.who.int/tools/child-growth-standards',
    guideline: 'WHO',
  },
  'pedi-dose': {
    criteria: 'dose = peso × mg/kg, com teto = dose máxima única.',
    cutoffs: 'Sempre conferir formulário e contraindicações.',
    reference: 'WHO Model Formulary for Children 2010',
    referenceUrl: 'https://www.who.int/publications/i/item/9789241599320',
  },
  'ballard': {
    criteria: '6 sinais neuromusculares + 6 físicos.',
    cutoffs: 'IG estimada por tabela de pontuação (-10 a 50).',
    reference: 'Ballard JL et al. J Pediatr 1991;119:417-23',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/1880657/',
  },
  'capurro': {
    criteria: 'Forma orelha, glândula mamária, formação mamilo, textura pele, prega plantar.',
    cutoffs: 'IG (semanas) = (soma + 204) / 7.',
    reference: 'Capurro H et al. J Pediatr 1978;93:120-2',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/650322/',
  },
  'silverman': {
    criteria: 'Movimentos tóraco-abdominais, retração intercostal, retração xifóide, batimento de aleta nasal, gemido expiratório (0–2 cada).',
    cutoffs: '0 sem desconforto · 1–3 leve · 4–6 moderado · 7–10 grave.',
    reference: 'Silverman WA, Andersen DH. Pediatrics 1956;17:1-10',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/13353856/',
  },
  'wood-downes': {
    criteria: 'Sibilos, retrações, entrada de ar, cianose, consciência.',
    cutoffs: 'Leve 1–3 · Moderado 4–7 · Grave 8–14.',
    reference: 'Wood DW et al. Am J Dis Child 1972;123:227-8',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/5026197/',
  },
  'pulmonary-score': {
    criteria: 'FR (ajustada à idade), sibilos, uso de musculatura acessória — 0–3 cada.',
    cutoffs: 'Leve 0–3 · Moderado 4–6 · Grave 7–9.',
    reference: 'Smith SR et al. Acad Emerg Med 2002;9:99-104 (validação)',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/11825832/',
  },
  'dehydration': {
    criteria: '6 sinais clínicos (turgor, mucosas, olhos, fontanela, perfusão, estado geral).',
    cutoffs: 'Plano A <3% · Plano B 3–9% · Plano C ≥10% ou choque.',
    reference: 'WHO. The Treatment of Diarrhoea: A manual for physicians, 2005',
    referenceUrl: 'https://www.who.int/publications/i/item/9241593180',
    guideline: 'WHO',
  },
  'holliday-segar': {
    criteria: 'Regra 4-2-1 mL/kg/h ou 100/50/20 mL/kg/dia.',
    cutoffs: '≤10 kg: 100 mL/kg/dia · 11–20 kg: +50 mL/kg adicional · >20 kg: +20 mL/kg adicional.',
    reference: 'Holliday MA, Segar WE. Pediatrics 1957;19:823-32',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/13431307/',
  },
  'rochester': {
    criteria: 'Lactente <60 dias, bom estado geral, sem foco bacteriano, leucócitos 5–15k, bastões ≤1.5k, urina <10 leuco/cga, sem comorbidade.',
    cutoffs: 'Baixo risco: TODOS critérios atendidos.',
    reference: 'Jaskiewicz JA et al. Pediatrics 1994;94:390-6',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/8065869/',
  },
  'mchat': {
    criteria: '20 itens (sim/não). Itens críticos: 2, 7, 9, 13, 14, 15.',
    cutoffs: 'Risco baixo 0–2 · Médio 3–7 (aplicar follow-up) · Alto ≥8 (encaminhar).',
    reference: 'Robins DL et al. J Autism Dev Disord 2014;44:185-203',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/23659712/',
  },

  // ===== OB/GYN =====
  'gestational-age': {
    criteria: 'IG por DUM (Naegele) ou USG (Hadlock 1º T preferencial).',
    cutoffs: 'DPP = DUM + 280 dias. Discrepância DUM × USG do 1º T >7 dias → adotar USG.',
    reference: 'ACOG Committee Opinion 700, 2017',
    referenceUrl: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date',
    guideline: 'ACOG',
  },
  'gestational-age-dum': {
    criteria: 'Apenas DUM confiável + ciclos regulares.',
    cutoffs: 'IG (sem) = (hoje − DUM)/7. DPP = DUM + 280 dias.',
    reference: 'Naegele FK, 1812 — ratificado por FIGO/ACOG.',
    referenceUrl: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date',
  },
  'bishop': {
    criteria: 'Dilatação, apagamento, altura de apresentação, consistência, posição cervical.',
    cutoffs: '≤5 colo desfavorável (preparo cervical) · 6–8 intermediário · ≥9 favorável.',
    reference: 'Bishop EH. Obstet Gynecol 1964;24:266-8',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/14199536/',
  },
  'preeclampsia-risk': {
    criteria: 'Fatores de alto risco (1 = indica AAS) e moderado (≥2 = indica AAS) — USPSTF/ACOG.',
    cutoffs: 'AAS 81–162 mg/dia entre 12–28 sem (idealmente <16 sem) até o parto.',
    reference: 'USPSTF. JAMA 2021;326:1186-91 / ACOG Committee Opinion 743',
    referenceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/aspirin-use-to-prevent-preeclampsia-and-related-morbidity-and-mortality-preventive-medication',
    guideline: 'USPSTF/ACOG',
  },
  'pregnancy-bmi': {
    criteria: 'IMC pré-gestacional (kg/m²).',
    cutoffs: 'Baixo peso <18.5 → 12.5–18 kg · Eutrófica 18.5–24.9 → 11.5–16 kg · Sobrepeso 25–29.9 → 7–11.5 kg · Obesidade ≥30 → 5–9 kg.',
    reference: 'IOM/NRC. Weight Gain During Pregnancy, 2009',
    referenceUrl: 'https://www.ncbi.nlm.nih.gov/books/NBK32813/',
    guideline: 'IOM 2009',
  },
  'preeclampsia': {
    criteria: 'PA ≥140/90 após 20 sem + proteinúria OU disfunção de órgão-alvo / RCF.',
    cutoffs: 'Grave: PA ≥160/110, plaquetas <100k, Cr >1.1 ou ×2, transaminases ×2, edema pulmonar, sintomas cerebrais/visuais.',
    reference: 'ACOG Practice Bulletin 222, Obstet Gynecol 2020;135:e237-60',
    referenceUrl: 'https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2020/06/gestational-hypertension-and-preeclampsia',
    guideline: 'ACOG 2020',
  },
  'pe-early-risk': {
    criteria: 'Fatores maternos + PAM + IP de artérias uterinas + PlGF (modelo FMF 11–13+6 sem).',
    cutoffs: 'Risco ≥1:100 → AAS 150 mg/noite até 36 sem.',
    reference: 'Poon LC et al. Ultrasound Obstet Gynecol 2019;54:3-15 (FIGO)',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/31106497/',
    guideline: 'FIGO/FMF',
  },
  'hpp': {
    criteria: 'Perda >500 mL (vaginal) ou >1000 mL (cesárea), OU sinais de instabilidade.',
    cutoffs: 'Estágio 1 (≤1000 mL e estável) → 4 (>1500 mL ou instabilidade): protocolo OMS/FEBRASGO.',
    reference: 'WHO Recommendations for the Prevention and Treatment of Postpartum Haemorrhage, 2012',
    referenceUrl: 'https://www.who.int/publications/i/item/9789241548502',
    guideline: 'WHO/FEBRASGO',
  },
  'gdm': {
    criteria: 'TOTG 75 g entre 24–28 sem (jejum, 1 h, 2 h).',
    cutoffs: 'IADPSG: ≥92 / ≥180 / ≥153 mg/dL — 1 valor alterado define DMG.',
    reference: 'IADPSG Consensus Panel. Diabetes Care 2010;33:676-82',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/20190296/',
    guideline: 'IADPSG/ADA/FEBRASGO',
  },
  'vbac': {
    criteria: 'Idade, IMC, raça, cesárea anterior por distócia, parto vaginal prévio.',
    cutoffs: 'Sucesso esperado ≥60–70% → favorável a TOLAC; <60% reavaliar.',
    reference: 'Grobman WA et al. Obstet Gynecol 2007;109:806-12',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/17400840/',
    guideline: 'MFMU/ACOG',
  },
  'biophysical-profile': {
    criteria: 'NST + movimentos respiratórios + corpóreos + tônus + ILA (0 ou 2 pts cada).',
    cutoffs: '8–10 normal · 6 equívoco · ≤4 anormal (avaliar resolução da gestação).',
    reference: 'Manning FA et al. Am J Obstet Gynecol 1980;136:787-95',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/7355965/',
  },
  'preterm-risk': {
    criteria: 'Anamnese + comprimento cervical USTV + fibronectina fetal.',
    cutoffs: 'Colo <25 mm entre 16–24 sem ou fFN+ → alto risco.',
    reference: 'ACOG Practice Bulletin 234, Obstet Gynecol 2021;138:e65-e90',
    referenceUrl: 'https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2021/08/prediction-and-prevention-of-spontaneous-preterm-birth',
    guideline: 'ACOG 2021',
  },
  'amniotic-fluid': {
    criteria: 'Soma dos 4 quadrantes (Phelan) ou maior bolsão único (MVP).',
    cutoffs: 'Oligo: ILA ≤5 cm ou MVP <2 cm · Polidrâmnio: ILA ≥24 cm ou MVP >8 cm.',
    reference: 'Phelan JP et al. J Reprod Med 1987;32:540-2',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/3305930/',
  },

  // ===== Wave 2 (gerais) =====
  'ckd-epi-2021': {
    criteria: 'Equação 2021 sem coeficiente racial; usa creatinina sérica, idade, sexo.',
    cutoffs: 'G1 ≥90 · G2 60–89 · G3a 45–59 · G3b 30–44 · G4 15–29 · G5 <15.',
    reference: 'Inker LA et al. NEJM 2021;385:1737-49',
    referenceUrl: 'https://www.nejm.org/doi/10.1056/NEJMoa2102953',
    guideline: 'NKF/ASN 2021',
  },
  'wells': {
    criteria: 'TVP: 9 itens (Wells 1997). EP: 7 itens (Wells 2000/2001).',
    cutoffs: 'TVP: <2 baixa/improvável · ≥2 provável. EP: <2 baixa · 2–6 moderada · >6 alta · ≤4 PE-improvável (combinar com D-dímero).',
    reference: 'Wells PS et al. Lancet 1997;350:1795-8 / Ann Intern Med 2001;135:98-107',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/11453709/',
  },
  'centor-mcisaac': {
    criteria: 'Febre, ausência de tosse, linfadenopatia cervical anterior, exsudato, idade (McIsaac).',
    cutoffs: '0–1 sem teste/ATB · 2–3 teste rápido (RADT) · ≥4 considerar tratar (validar com cultura).',
    reference: 'McIsaac WJ et al. CMAJ 1998;158:75-83 / Centor RM. Med Decis Making 1981;1:239-46',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/9475915/',
    guideline: 'IDSA',
  },
  'apache-ii': {
    criteria: '12 variáveis fisiológicas + idade + comorbidades (0–71 pontos).',
    cutoffs: 'Mortalidade hospitalar estimada cresce com pontuação (ex.: 25 pts ≈ 50% em clínica não-cirúrgica).',
    reference: 'Knaus WA et al. Crit Care Med 1985;13:818-29',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/3928249/',
  },
  'abc-gi-bleed': {
    criteria: 'Idade, ureia, albumina, creatinina, alteração consciência, comorbidades.',
    cutoffs: 'Baixo ≤3 (mortalidade ~1%) · Médio 4–7 (~7%) · Alto ≥8 (~25%).',
    reference: 'Laursen SB et al. Gut 2021;70:707-16',
    referenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/32816921/',
  },
};

export function getCalculatorMeta(id: string): CalculatorMeta | undefined {
  return CALCULATOR_META[id];
}
