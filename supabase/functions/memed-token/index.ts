import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Credenciais ──────────────────────────────────────────────────────────────
// Em homologação, a Memed publica o par de chaves fixo na documentação oficial:
// https://doc.memed.com.br/docs/primeiros-passos#obtendo-o-par-de-chaves-homologa%C3%A7%C3%A3o
// Em produção, defina MEMED_API_KEY / MEMED_SECRET_KEY como secrets + MEMED_ENV=production.
const MEMED_ENV = Deno.env.get('MEMED_ENV') ?? 'homologacao'
const IS_PROD = MEMED_ENV === 'production'

const HOMOLOG_API_KEY = 'iJGiB4kjDGOLeDFPWMG3no9VnN7Abpqe3w1jEFm6olkhkZD6oSfSmYCm'
const HOMOLOG_SECRET_KEY = 'Xe8M5GvBGCr4FStKfxXKisRo3SfYKI7KrTMkJpCAstzu2yXVN4av5nmL'

const MEMED_API_KEY = Deno.env.get('MEMED_API_KEY') ?? (IS_PROD ? '' : HOMOLOG_API_KEY)
const MEMED_SECRET_KEY = Deno.env.get('MEMED_SECRET_KEY') ?? (IS_PROD ? '' : HOMOLOG_SECRET_KEY)

const MEMED_API_BASE = IS_PROD
  ? 'https://api.memed.com.br/v1'
  : 'https://integrations.api.memed.com.br/v1'

const MEMED_SCRIPT_URL = IS_PROD
  ? 'https://partners.memed.com.br/integration.js'
  : 'https://integrations.memed.com.br/modulos/plataforma.sinapse-prescricao/build/sinapse-prescricao.min.js'

function memedUrl(path: string) {
  return `${MEMED_API_BASE}${path}?api-key=${MEMED_API_KEY}&secret-key=${MEMED_SECRET_KEY}`
}

// ─── Helpers de validação ────────────────────────────────────────────────────
function onlyDigits(v?: string | null) {
  return (v ?? '').replace(/\D+/g, '')
}

function splitName(full?: string | null): { nome: string; sobrenome: string } {
  const parts = (full ?? '').trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return { nome: 'Prescritor', sobrenome: '—' }
  if (parts.length === 1) return { nome: parts[0], sobrenome: '—' }
  return { nome: parts[0], sobrenome: parts.slice(1).join(' ') }
}

/** Extrai número e UF de um CRM tipo "12345/SP", "CRM-SP 12345" etc. */
function parseCrm(crm?: string | null, fallbackUf?: string | null) {
  const raw = (crm ?? '').toUpperCase()
  const ufMatch = raw.match(/\b([A-Z]{2})\b/)
  const numMatch = raw.match(/\d{2,}/)
  return {
    board_number: numMatch ? numMatch[0] : '',
    board_state: ufMatch ? ufMatch[1] : (fallbackUf ?? '').toUpperCase().slice(0, 2),
  }
}

/** Converte data ISO (YYYY-MM-DD) → dd/mm/YYYY (formato Memed). */
function toMemedDate(d?: string | null): string | undefined {
  if (!d) return undefined
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d)
  if (m) return `${m[3]}/${m[2]}/${m[1]}`
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) return d
  return undefined
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!MEMED_API_KEY || !MEMED_SECRET_KEY) {
      return new Response(
        JSON.stringify({
          configured: false,
          scriptUrl: MEMED_SCRIPT_URL,
          message: 'Memed (produção) não configurada — usar token manual',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // ── Perfil do prescritor ────────────────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, specialty')
      .eq('user_id', user.id)
      .maybeSingle()

    const { data: verification } = await supabase
      .from('verification_requests_secure')
      .select('full_name, email, license_number')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Perfil do prescritor não encontrado' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    type Profile = {
      full_name?: string | null; specialty?: string | null;
    }
    const p = profile as Profile
    const v = (verification ?? {}) as { full_name?: string | null; email?: string | null; license_number?: string | null }

    // ── Token já existente? ─────────────────────────────────────────────────
    const { data: memedRecord } = await supabase
      .from('memed_users')
      .select('memed_user_id, token')
      .eq('user_id', user.id)
      .maybeSingle()

    let memedToken: string | null = null

    if (memedRecord?.memed_user_id) {
      const getRes = await fetch(
        memedUrl(`/sinapse-prescricao/usuarios/${memedRecord.memed_user_id}`),
        { headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/json' } },
      )
      if (getRes.ok) {
        const body = await getRes.json()
        memedToken = body?.data?.attributes?.token ?? body?.token ?? null
      } else if (memedRecord.token) {
        memedToken = memedRecord.token
      }
    }

    // ── Cadastrar prescritor (payload conforme doc oficial) ─────────────────
    if (!memedToken) {
      const homologFallback = !IS_PROD
      const cpf = homologFallback ? '53076220403' : ''
      const { board_number, board_state } = parseCrm(v.license_number, null)
      const { nome, sobrenome } = splitName(v.full_name || p.full_name || 'Prescritor UHS')
      const sexo = homologFallback ? 'M' : undefined
      const birthDate = homologFallback ? '05/09/1972' : undefined

      // Validações mínimas que a Memed exige (evita 400 desnecessário)
      const missing: string[] = []
      if (!nome) missing.push('nome')
      if (!cpf || cpf.length !== 11) missing.push('cpf (11 dígitos)')
      if (!board_number && !homologFallback) missing.push('CRM (número)')
      if (!board_state && !homologFallback) missing.push('UF do CRM')
      if (!birthDate) missing.push('data de nascimento')

      if (missing.length) {
        return new Response(
          JSON.stringify({
            configured: false,
            scriptUrl: MEMED_SCRIPT_URL,
            error: `Perfil incompleto para Memed. Faltando: ${missing.join(', ')}.`,
            missingFields: missing,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const payload = {
        data: {
          type: 'usuarios',
          attributes: {
            external_id: user.id,
            nome,
            sobrenome,
            cpf,
            board: {
              board_code: 'CRM',
              board_number: board_number || '315435435',
              board_state: board_state || 'SP',
            },
            email: v.email || user.email,
            sexo,
            data_nascimento: birthDate,
          },
        },
      }

      const postRes = await fetch(memedUrl('/sinapse-prescricao/usuarios'), {
        method: 'POST',
        headers: { 'Accept': 'application/vnd.api+json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const postBody = await postRes.json()

      if (!postRes.ok) {
        console.error('Memed POST error:', JSON.stringify(postBody))
        return new Response(
          JSON.stringify({ error: 'Erro ao cadastrar prescritor na Memed', details: postBody }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const memedUserId = postBody?.data?.id ?? postBody?.id ?? null
      memedToken = postBody?.data?.attributes?.token ?? postBody?.token ?? null

      if (memedUserId) {
        await supabase.from('memed_users').upsert({
          user_id: user.id,
          memed_user_id: String(memedUserId),
          token: memedToken,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
      }
    }

    if (!memedToken) {
      return new Response(JSON.stringify({ error: 'Token Memed não obtido' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ token: memedToken, scriptUrl: MEMED_SCRIPT_URL, env: MEMED_ENV }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('memed-token error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
