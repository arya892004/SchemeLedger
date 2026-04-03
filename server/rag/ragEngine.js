import Groq from 'groq-sdk'
import { SCHEMES_KNOWLEDGE } from '../data/schemes-knowledge.js'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'

// ── TF-IDF Retrieval ──
function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2)
}

function computeTFIDF(query, documents) {
  const queryTokens = tokenize(query)
  const N = documents.length

  return documents.map(doc => {
    const docText = `${doc.content} ${doc.tags.join(' ')} ${doc.name} ${doc.category}`
    const docTokens = tokenize(docText)
    const tokenCounts = {}
    docTokens.forEach(t => tokenCounts[t] = (tokenCounts[t] || 0) + 1)

    let score = 0
    queryTokens.forEach(qt => {
      const tf = (tokenCounts[qt] || 0) / docTokens.length
      const docsWithTerm = documents.filter(d => {
        const dt = tokenize(`${d.content} ${d.tags.join(' ')}`)
        return dt.includes(qt)
      }).length
      const idf = Math.log((N + 1) / (docsWithTerm + 1)) + 1
      score += tf * idf
    })

    return { doc, score }
  }).sort((a, b) => b.score - a.score)
}

function matchByProfile(profile) {
  return SCHEMES_KNOWLEDGE.filter(scheme => {
    const e = scheme.eligibility

    if (e.occupation && e.occupation.length > 0) {
      const userOcc = (profile.occupation || '').toLowerCase()
      const matches = e.occupation.some(o => userOcc.includes(o.toLowerCase()))
      if (!matches) return false
    }

    if (e.incomeMax && profile.income) {
      const income = parseInt(profile.income)
      if (!isNaN(income) && income > e.incomeMax) return false
    }

    if (e.gender && profile.gender) {
      if (e.gender !== profile.gender.toLowerCase()) return false
    }

    if (e.student === true && (profile.occupation || '').toLowerCase() !== 'student') {
      return false
    }

    return true
  })
}

export function retrieveSchemes(query, topK = 5) {
  const results = computeTFIDF(query, SCHEMES_KNOWLEDGE)
  return results.slice(0, topK).map(r => r.doc)
}

export function retrieveByProfile(profile, topK = 5) {
  const profileMatched = matchByProfile(profile)

  if (profileMatched.length > 0) {
    const query = [profile.occupation, profile.state, profile.gender, profile.age].filter(Boolean).join(' ')
    const scored = computeTFIDF(query || 'general welfare', profileMatched)
    return scored.slice(0, topK).map(r => r.doc)
  }

  const query = Object.values(profile).filter(Boolean).join(' ')
  return retrieveSchemes(query || 'welfare scheme india', topK)
}

function buildContext(schemes) {
  return schemes.map((s, i) => `
[${i + 1}] SCHEME: ${s.name}
    CATEGORY: ${s.category}
    BENEFIT: ${s.amount}
    DETAILS: ${s.content}
`).join('\n')
}

// ── RAG: Recommendations ──
export async function getRecommendations(profile) {
  const retrieved = retrieveByProfile(profile)
  const context = buildContext(retrieved)

  const prompt = `You are SchemeSaathi, an expert Indian government welfare scheme advisor.

USER PROFILE:
- Name: ${profile.name || 'Citizen'}
- Age: ${profile.age || 'Not specified'}
- Occupation: ${profile.occupation || 'Not specified'}
- Annual Income: ${profile.income ? '₹' + parseInt(profile.income).toLocaleString('en-IN') : 'Not specified'}
- Gender: ${profile.gender || 'Not specified'}
- State: ${profile.state || 'Not specified'}

RELEVANT SCHEMES FROM KNOWLEDGE BASE:
${context}

Based on this profile, recommend the TOP 3 most suitable schemes.
Respond ONLY with valid JSON - no markdown, no explanation outside JSON:

{
  "recommendations": [
    {
      "schemeId": "scheme-id-here",
      "schemeName": "Full official scheme name",
      "whyEligible": "Clear simple explanation of why this person qualifies in 1-2 sentences",
      "benefit": "Exact benefit amount or description",
      "nextStep": "Specific action to apply",
      "priority": "high"
    }
  ],
  "summary": "One friendly sentence summarizing what was found"
}`

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful Indian government welfare scheme advisor. Always respond with valid JSON only. No markdown code blocks. No explanation outside the JSON object.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    })

    const text = completion.choices[0]?.message?.content || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No valid JSON in response')
  } catch (err) {
    console.error('Groq recommendation error:', err.message)
    return {
      recommendations: retrieved.slice(0, 3).map(s => ({
        schemeId: s.id,
        schemeName: s.name,
        whyEligible: 'Based on your profile, you appear eligible for this scheme.',
        benefit: s.amount,
        nextStep: 'Visit the official government website to apply.',
        priority: 'medium',
      })),
      summary: 'Found relevant schemes based on your profile.',
    }
  }
}

// ── RAG: Chat ──
export async function chatWithAssistant(message, conversationHistory = [], userProfile = {}) {
  const retrieved = retrieveSchemes(message, 4)
  const context = buildContext(retrieved)

  const systemMessage = `You are SchemeSaathi, a helpful and knowledgeable Indian government welfare scheme assistant. You help Indian citizens understand and apply for government welfare schemes.

${Object.keys(userProfile).length > 0 ? `USER PROFILE: ${JSON.stringify(userProfile)}` : ''}

RELEVANT KNOWLEDGE BASE FOR THIS QUERY:
${context}

RULES:
- Answer based on the knowledge base provided above
- Be friendly, clear and accurate
- Keep answers concise but complete (3-5 sentences max unless asked for more)
- Always mention required documents when discussing how to apply
- If asked in Hindi, respond in Hindi
- If a scheme is not in your knowledge base, say so honestly
- Never make up eligibility criteria or benefit amounts
- Always end with a helpful next step`

  const messages = [
    { role: 'system', content: systemMessage },
    ...conversationHistory.slice(-6).map(m => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.content,
    })),
    { role: 'user', content: message },
  ]

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 512,
    })

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not process your request.'

    return {
      response,
      retrievedSchemes: retrieved.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        amount: s.amount,
      })),
    }
  } catch (err) {
    console.error('Groq chat error:', err.message)
    throw new Error('AI service unavailable. Please try again.')
  }
}