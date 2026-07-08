// Deno Edge Function - runs on Supabase infrastructure.
// Performs automated Git commit history audit and AI detection scans on GitHub repos.
// Triggered by database webhook on insert, or manually invoked by admins.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ---------------------------------------------------------------------------
// Signal A: Code Pattern Analysis
// Detects AI-written code by looking for patterns specific to ChatGPT output.
// Returns 0-100 confidence score.
// ---------------------------------------------------------------------------
function analyzeCodePatterns(code: string): number {
  const lines = code.split('\n')
  const nonEmpty = lines.filter(l => l.trim().length > 0)
  const total = nonEmpty.length
  if (total === 0) return 0

  type Signal = { score: number; weight: number; name: string }
  const signals: Signal[] = []

  // --- 1. ChatGPT linguistic phrases in comments (STRONGEST signal) ---
  // ChatGPT ALWAYS uses these narrating phrases when explaining its code.
  // Humans almost never write comment text like this.
  const aiPhrasePattern = /\/\/.*\b(this function|this component|this method|this hook|this class|this approach|this ensures|this allows|this will|in this|note that|note:|make sure|here we|feel free|the following|we then|we first|we need to|you can use|you may|you should|remember to|keep in mind|as you can see|in this implementation)\b/gi
  const pyPhrasePattern = /#.*\b(this function|this class|this method|note that|make sure|here we|feel free|the following|in this implementation|we then|we first|we need to)\b/gi
  const aiPhraseCount = (code.match(aiPhrasePattern) || []).length + (code.match(pyPhrasePattern) || []).length
  let phraseScore: number
  if (aiPhraseCount >= 6) phraseScore = 98
  else if (aiPhraseCount >= 4) phraseScore = 93
  else if (aiPhraseCount >= 2) phraseScore = 85
  else if (aiPhraseCount >= 1) phraseScore = 72
  else phraseScore = 10
  signals.push({ score: phraseScore, weight: 4.0, name: 'aiPhrases' })

  // --- 2. Comment density ---
  // ChatGPT comments 20-40% of all lines. Humans comment much less.
  const commentLines = nonEmpty.filter(l => {
    const t = l.trim()
    return t.startsWith('//') || t.startsWith('#') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('"""') || t.startsWith("'''")
  }).length
  const commentRatio = commentLines / total
  let commentScore: number
  if (commentRatio >= 0.30) commentScore = 97
  else if (commentRatio >= 0.20) commentScore = 88
  else if (commentRatio >= 0.12) commentScore = 60
  else if (commentRatio >= 0.05) commentScore = 28
  else commentScore = 8
  signals.push({ score: commentScore, weight: 2.5, name: 'commentDensity' })

  // --- 3. JSDoc / docstring blocks ---
  // ChatGPT generates @param, @returns, @description for almost every function.
  const docCount = (code.match(/\/\*\*|\@param|\@returns|\@description|\@throws|\@example|\@type/gi) || []).length
  let docScore: number
  if (docCount >= 6) docScore = 97
  else if (docCount >= 3) docScore = 90
  else if (docCount >= 1) docScore = 72
  else docScore = 8
  signals.push({ score: docScore, weight: 1.5, name: 'jsdoc' })

  // --- 4. Generic variable / function names ---
  // ChatGPT defaults to generic, context-free naming. Humans use domain words.
  const genericPattern = /\b(data|result|response|temp|item|element|value|obj|arr|str|num|idx|ctx|res|req|err|error|success|payload|output|input|config|options|params|args|callback|fn|func|handler|helper|utils|service|manager|controller|component|instance|entity|record|node|list|map|state|props|action|selector)\b/gi
  const genericCount = (code.match(genericPattern) || []).length
  const genericDensity = genericCount / Math.max(1, total)
  let genericScore: number
  if (genericDensity >= 3.5) genericScore = 93
  else if (genericDensity >= 2.0) genericScore = 78
  else if (genericDensity >= 1.0) genericScore = 48
  else genericScore = 10
  signals.push({ score: genericScore, weight: 1.5, name: 'genericNames' })

  // --- 5. Try-catch saturation ---
  // ChatGPT wraps nearly every function in try-catch. Human developers are lazier.
  const tryCatchCount = (code.match(/try\s*\{|try:/g) || []).length
  const funcCount = Math.max(1, (code.match(/function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?(?:function|\()|def\s+\w+|async\s+def|=>\s*\{/g) || []).length)
  const tcrRatio = tryCatchCount / funcCount
  let tcrScore: number
  if (tcrRatio >= 0.7) tcrScore = 93
  else if (tcrRatio >= 0.4) tcrScore = 75
  else if (tcrRatio >= 0.2) tcrScore = 42
  else tcrScore = 8
  signals.push({ score: tcrScore, weight: 1.5, name: 'tryCatch' })

  // --- 6. Template literal error messages (ChatGPT signature pattern) ---
  // ChatGPT almost always writes: throw new Error(`Failed to ${op}: ${err.message}`)
  const templateErrCount = (code.match(/throw new Error\(`|throw new \w+Error\(`|raise \w*Error\(/g) || []).length
  let templateErrScore: number
  if (templateErrCount >= 3) templateErrScore = 95
  else if (templateErrCount >= 2) templateErrScore = 87
  else if (templateErrCount >= 1) templateErrScore = 70
  else templateErrScore = 15
  signals.push({ score: templateErrScore, weight: 1.0, name: 'templateErrors' })

  // --- 7. response.ok / fetch / async-await saturation ---
  // ChatGPT consistently uses the full fetch-response.ok-throw pattern.
  const fetchPatternCount = (code.match(/\.ok\b|if\s*\(!res\.ok|if\s*\(!response\b|\.status\s*===\s*200/g) || []).length
  const asyncCount = (code.match(/\bawait\b/g) || []).length
  const asyncDensity = asyncCount / Math.max(1, total / 10)
  let fetchScore: number
  if (fetchPatternCount >= 2 || asyncDensity >= 3) fetchScore = 85
  else if (fetchPatternCount >= 1 || asyncDensity >= 1.5) fetchScore = 65
  else if (asyncDensity >= 0.5) fetchScore = 40
  else fetchScore = 15
  signals.push({ score: fetchScore, weight: 0.8, name: 'fetchPattern' })

  // --- 8. Perfect indentation (mechanical, never sloppy) ---
  const indents = nonEmpty.map(l => (l.match(/^(\s*)/) || ['', ''])[1].length)
  const nonZeroIndents = indents.filter(n => n > 0)
  const oddIndents = nonZeroIndents.filter(n => n % 2 !== 0).length
  const oddRatio = nonZeroIndents.length > 0 ? oddIndents / nonZeroIndents.length : 0
  let indentScore: number
  if (oddRatio === 0) indentScore = 80        // perfectly consistent → AI
  else if (oddRatio < 0.05) indentScore = 60
  else if (oddRatio < 0.15) indentScore = 30
  else indentScore = 8                         // sloppy → human
  signals.push({ score: indentScore, weight: 0.7, name: 'indentation' })

  const weightedSum = signals.reduce((acc, s) => acc + s.score * s.weight, 0)
  const totalWeight = signals.reduce((acc, s) => acc + s.weight, 0)
  const finalScore = Math.round(weightedSum / totalWeight)

  console.log('Code pattern signals:', signals.map(s => `${s.name}=${s.score}`).join(' | '), '→', finalScore)
  return finalScore
}

// ---------------------------------------------------------------------------
// Signal B: Commit message patterns
// ---------------------------------------------------------------------------
function analyzeCommitMessages(commits: any[]): number {
  if (commits.length === 0) return 0
  const aiPatterns = [
    /^initial commit/i, /^add.*feature/i, /^implement.*functionality/i,
    /^complete.*implementation/i, /^add all files/i, /^first commit/i,
    /^upload project/i, /^added.*complete/i, /^final.*project/i,
    /^project.*upload/i, /^create.*app/i, /^update readme/i,
    /^fix bugs/i, /^add code/i, /^done/i, /^finished/i,
    /^hackathon.*project/i, /^submission/i,
  ]
  const aiCount = commits.filter(c => {
    const msg: string = (c.commit?.message || '').split('\n')[0]
    return aiPatterns.some(p => p.test(msg))
  }).length
  return Math.round((aiCount / commits.length) * 100)
}

// ---------------------------------------------------------------------------
// Signal C: Bulk code dump (very few commits = likely dumped all at once)
// ---------------------------------------------------------------------------
function bulkDumpScore(totalCommits: number): number {
  if (totalCommits <= 1) return 90
  if (totalCommits <= 3) return 65
  if (totalCommits <= 6) return 35
  if (totalCommits <= 10) return 15
  return 0
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl    = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const githubToken    = Deno.env.get('GITHUB_TOKEN')
    const hfToken        = Deno.env.get('HUGGINGFACE_API_KEY')

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const body   = await req.json()
    const record = body.record || body
    const submissionId = record.id
    const githubUrl    = record.github_url

    if (!submissionId || !githubUrl) {
      return new Response(JSON.stringify({ error: 'Missing submission ID or GitHub URL' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    await supabase.from('project_submissions').update({ git_audit_status: 'scanning' }).eq('id', submissionId)

    // Extract owner / repo
    const regex = /github\.com\/([^/]+)\/([^/]+)/i
    const match = githubUrl.match(regex)
    if (!match) {
      await supabase.from('project_submissions').update({
        git_audit_status: 'flagged',
        audit_anomalies: ['Invalid GitHub repository URL format']
      }).eq('id', submissionId)
      return new Response(JSON.stringify({ error: 'Invalid GitHub URL format' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const owner = match[1]
    const repo  = match[2].replace(/\.git$/i, '').split('/')[0]

    const ghHeaders: Record<string, string> = {
      'User-Agent': 'Starlet-Hackathon-Auditor',
      'Accept': 'application/vnd.github.v3+json'
    }
    if (githubToken) ghHeaders['Authorization'] = `token ${githubToken}`

    // -------------------------------------------------------------------
    // 1. Fetch commits
    // -------------------------------------------------------------------
    const commitsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`,
      { headers: ghHeaders }
    )

    if (!commitsRes.ok) {
      const errText = await commitsRes.text()
      await supabase.from('project_submissions').update({
        git_audit_status: 'flagged',
        audit_anomalies: [`Could not access GitHub repo: ${commitsRes.statusText}`]
      }).eq('id', submissionId)
      return new Response(JSON.stringify({ error: `GitHub API error: ${errText}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const commits      = await commitsRes.json()
    const totalCommits = commits.length
    const anomalies: string[] = []
    let gitStatus = 'passed'

    if (totalCommits > 0) {
      const firstDate   = new Date(commits[commits.length - 1].commit.author.date)
      const lastDate    = new Date(commits[0].commit.author.date)
      const durationHrs = Math.abs(lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60)

      if (totalCommits < 3) {
        gitStatus = 'flagged'
        anomalies.push(`Low commit count (${totalCommits} total commit(s))`)
      }
      if (durationHrs < 0.33 && totalCommits >= 2) {
        gitStatus = 'flagged'
        anomalies.push('Bulk code dump (all commits completed within 20 minutes)')
      }
    } else {
      gitStatus = 'flagged'
      anomalies.push('Zero commits found in repository')
    }

    // -------------------------------------------------------------------
    // 2. Fetch code files (GitHub Tree API → largest files first)
    // -------------------------------------------------------------------
    const CODE_EXTS = new Set(['.js','.jsx','.ts','.tsx','.py','.java','.cpp','.c','.go','.rb','.php','.vue','.svelte','.kt','.swift','.rs','.cs'])
    let combinedCode = ''

    try {
      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
        { headers: ghHeaders }
      )
      if (treeRes.ok) {
        const treeData = await treeRes.json()
        const codeFiles = ((treeData.tree as any[]) || [])
          .filter(f => {
            if (f.type !== 'blob') return false
            const ext = '.' + (f.path.split('.').pop() || '').toLowerCase()
            if (!CODE_EXTS.has(ext)) return false
            if (/node_modules|\.min\.|vendor|dist\/|build\//i.test(f.path)) return false
            return true
          })
          .sort((a: any, b: any) => (b.size || 0) - (a.size || 0))
          .slice(0, 5) // top 5 largest code files

        const snippets: string[] = []
        for (const file of codeFiles) {
          if (snippets.length >= 3) break
          for (const branch of ['main', 'master', 'HEAD']) {
            try {
              const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`
              const fileRes = await fetch(rawUrl, { headers: { 'User-Agent': 'Starlet-Hackathon-Auditor' } })
              if (fileRes.ok) {
                const text = await fileRes.text()
                if (text.trim().length > 50) { snippets.push(text.slice(0, 1200)); break }
              }
            } catch (_) { /* skip */ }
          }
        }
        combinedCode = snippets.join('\n\n---FILE BOUNDARY---\n\n')
      }
    } catch (e) {
      console.error('Tree API failed:', e)
    }

    // Fallback to common paths
    if (!combinedCode) {
      for (const path of ['src/App.jsx','src/App.tsx','src/App.js','App.js','main.py','index.js','src/index.ts']) {
        for (const branch of ['main','master']) {
          try {
            const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
            const fileRes = await fetch(rawUrl, { headers: { 'User-Agent': 'Starlet-Hackathon-Auditor' } })
            if (fileRes.ok) {
              const text = await fileRes.text()
              if (text.trim().length > 50) { combinedCode = text; break }
            }
          } catch (_) { /* skip */ }
        }
        if (combinedCode) break
      }
    }

    // -------------------------------------------------------------------
    // 3. Code pattern analysis (Signal A) — no external API needed
    // -------------------------------------------------------------------
    const codePatternScore = combinedCode.trim().length > 50
      ? analyzeCodePatterns(combinedCode)
      : null

    console.log('Code pattern score:', codePatternScore)

    // -------------------------------------------------------------------
    // 4. Hugging Face model (Signal B) — optional but adds accuracy
    // -------------------------------------------------------------------
    let hfScore: number | null = null

    if (combinedCode.trim().length > 100) {
      const snippet = combinedCode.slice(0, 2000)
      const hfHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
      if (hfToken) hfHeaders['Authorization'] = `Bearer ${hfToken}`

      const MODEL_URL = 'https://api-inference.huggingface.co/models/Hello-SimpleAI/chatgpt-detector-roberta'

      const tryHF = async (): Promise<number | null> => {
        try {
          const res = await fetch(MODEL_URL, {
            method: 'POST', headers: hfHeaders,
            body: JSON.stringify({ inputs: snippet })
          })
          const raw = await res.text()
          console.log(`HF status: ${res.status}, sample: ${raw.slice(0, 200)}`)
          if (!res.ok) return null

          let data: any
          try { data = JSON.parse(raw) } catch (_) { return null }

          const items: any[] = Array.isArray(data)
            ? (Array.isArray(data[0]) ? data[0] : data)
            : []

          const aiItem = items.find((i: any) =>
            ['chatgpt','fake','ai','generated'].some(k => i.label?.toLowerCase().includes(k))
          )
          return aiItem ? Math.round(aiItem.score * 100) : null
        } catch (e) {
          console.error('HF fetch error:', e)
          return null
        }
      }

      hfScore = await tryHF()
      if (hfScore === null) {
        console.log('HF returned null, retrying in 15s...')
        await new Promise(r => setTimeout(r, 15000))
        hfScore = await tryHF()
      }
    }

    console.log('HF score:', hfScore)

    // -------------------------------------------------------------------
    // 5. Combine all signals into final ai_percentage
    //
    // Code pattern analysis is the most reliable signal for code.
    // The HF model (trained on text) is used as a supplementary signal.
    //
    //   - Both code patterns + HF → code(55%) + HF(30%) + commits(10%) + bulk(5%)
    //   - Code patterns only      → code(90%) + commits(7%) + bulk(3%)
    //   - No code fetched         → commits(65%) + bulk(35%), cap at 55%
    // -------------------------------------------------------------------
    const commitMsgPct = analyzeCommitMessages(commits)
    const bulkPct      = bulkDumpScore(totalCommits)

    let aiPercentage: number

    if (codePatternScore !== null && hfScore !== null) {
      aiPercentage = Math.round(
        codePatternScore * 0.55 +
        hfScore          * 0.30 +
        commitMsgPct     * 0.10 +
        bulkPct          * 0.05
      )
    } else if (codePatternScore !== null) {
      aiPercentage = Math.round(
        codePatternScore * 0.90 +
        commitMsgPct     * 0.07 +
        bulkPct          * 0.03
      )
    } else {
      // No code content — heuristics only, cap at 55%
      aiPercentage = Math.min(55, Math.round(commitMsgPct * 0.65 + bulkPct * 0.35))
    }

    aiPercentage = Math.min(100, Math.max(0, aiPercentage))

    console.log(`FINAL: codePattern=${codePatternScore} hf=${hfScore} commitMsg=${commitMsgPct} bulk=${bulkPct} → ai_percentage=${aiPercentage}`)

    // -------------------------------------------------------------------
    // 6. Save to database
    // -------------------------------------------------------------------
    const { error: dbError } = await supabase
      .from('project_submissions')
      .update({
        git_audit_status: gitStatus,
        ai_percentage:    aiPercentage,
        commit_count:     totalCommits,
        audit_anomalies:  anomalies
      })
      .eq('id', submissionId)

    if (dbError) throw dbError

    return new Response(JSON.stringify({
      status:             'success',
      git_status:         gitStatus,
      commits:            totalCommits,
      ai_percentage:      aiPercentage,
      code_pattern_score: codePatternScore,
      hf_score:           hfScore,
      commit_msg_score:   commitMsgPct,
      bulk_dump_score:    bulkPct,
      anomalies
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err) {
    console.error('Unhandled error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
