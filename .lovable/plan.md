# Implementação do Catálogo Clínico UHS

## Diagnóstico do estado atual

Mapeei o catálogo enviado contra `src/lib/calculators.ts` e `src/components/scores/`:

**Já implementadas e operando:** DAS28-ESR/CRP, CDAI, SDAI, BASDAI, SLEDAI-2K, ACR/EULAR 2010 RA, CASPAR, DAPSA, MDA, ACR/EULAR resposta, APGAR, PEWS, Bishop, Capurro, Ballard, ACR FM 2016, FIQR e toda a bateria pediátrica/obstétrica.

**Listadas mas não implementadas (`implemented: false`):** ASDAS-CRP, SLICC 2012, EULAR/ACR 2019 SLE, ASAS axSpA, ACR/EULAR 2015 Gota, BILAG, BVAS, HAQ-DI, RAPID3, BASFI, WOMAC, SLICC SDI, Sharp/vdH, FFS, SRI.

**Ausentes do catálogo, citadas como prioritárias no docx:** PMR 2012, Sjögren 2016, Esclerose Sistêmica 2013, APACHE II, CKD-EPI 2021, Wells TVP/EP, ABC GI Bleed, Centor/McIsaac, ESSDAI, mRSS (Rodnan), Boolean remission, BASMI, aGAPSS, LLDAS.

## Ondas de entrega

### Onda 1 — Núcleo reumatológico ausente (esta entrega)
Foco no que o docx marca como "maior valor clínico e maior previsibilidade":

1. **ASDAS-CRP & ASDAS-ESR** (axSpA — fórmulas exatas do docx p.18)
2. **PMR 2012** (Dasgupta — score ≥4 sem US / ≥5 com US)
3. **Sjögren 2016 ACR/EULAR** (≥4 pontos)
4. **Gota 2015 ACR/EULAR** (entry + score ≥8)
5. **SLICC 2012 SLE** (≥4 critérios, ≥1 clínico + ≥1 imunológico)
6. **mRSS (Rodnan modificado)** (Esclerose Sistêmica — 17 áreas × 0-3)
7. **BASFI** (10 questões NRS)
8. **Boolean remission ACR/EULAR** (TJC≤1, SJC≤1, CRP≤1, PGA≤1)

### Onda 2 — Medicina geral de alto impacto
9. **CKD-EPI 2021** (sem coeficiente racial — eGFR)
10. **Wells TVP** + **Wells EP**
11. **Centor / McIsaac** (faringite)
12. **APACHE II** (12 variáveis fisiológicas + idade + comorbidades)
13. **ABC GI Bleed** (idade, ureia, hemoglobina, PA, comorbidades)

### Onda 3 — Lúpus/vasculite/SS estendido
14. **EULAR/ACR 2019 SLE** (entry ANA + 10 domínios ponderados)
15. **ESSDAI** (Sjögren — 12 domínios de atividade)
16. **HAQ-DI** (20 itens, 8 categorias)
17. **RAPID3** (3 escalas 0-10)
18. **BASMI** (5 medidas mobilidade espinhal)

## Detalhes técnicos

**Padrão de implementação** (segue exatamente os componentes existentes em `src/components/scores/`):
- Cada calculadora = um componente `<NomeCalculator />` em `src/components/scores/`
- Inputs com `Input`/`RadioGroup`/`Slider` do shadcn
- Card de resultado com `Alert` + cor semântica baseada na faixa (low/moderate/high)
- Disclaimer "ferramenta organizacional, não substitui julgamento clínico" (já é padrão do projeto)
- Fontes oficiais citadas no rodapé do componente
- Sem PHI: scores transitórios; persistência opcional via `addToHistory()` já existente

**Mudanças por arquivo:**
- `src/lib/calculators.ts` — atualizar `implemented: true` nos itens existentes; adicionar entradas novas (PMR, Sjögren, mRSS, BASMI, Boolean, ESSDAI, CKD-EPI, Wells, Centor, APACHE II, ABC, BASFI, HAQ-DI, RAPID3); novas categorias `'general'` ou subcategoria `'risk-stratification'` se necessário
- `src/pages/Scores.tsx` — adicionar imports e `case` no `renderCalculator()` para cada nova calculadora
- 18 novos arquivos `src/components/scores/<Nome>Calculator.tsx`
- Tipo `DiseaseType` ganha `'nephro' | 'emergency' | 'thrombosis' | 'critical-care'` se a Onda 2 entrar nesta sessão

**Sem mudanças em:**
- Backend / edge functions (puro frontend)
- Banco de dados (scores são efêmeros / opt-in para histórico local)
- Roteamento (todas dentro de `/scores`)

## Decisão a tomar

Esta entrega cobre as **3 ondas (18 calculadoras) de uma vez** ou prefere que eu entregue **Onda 1 primeiro** (8 calculadoras reumatológicas — o foco direto do docx) e itere?

Recomendo: **Onda 1 agora, Ondas 2 e 3 em mensagens separadas** — mantém os diffs revisáveis, valida o padrão antes de escalar e respeita o foco reumatológico do projeto.
