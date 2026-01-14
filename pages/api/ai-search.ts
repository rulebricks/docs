import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

interface DocEntry {
  title: string
  description: string
  path: string
  content: string
}

interface SearchResponse {
  answer: string
  relevantPages: Array<{
    title: string
    path: string
    description: string
  }>
  error?: string
}

// Cache the docs index in memory
let docsCache: DocEntry[] | null = null

function loadDocsIndex(): DocEntry[] {
  if (docsCache) return docsCache

  const indexPath = path.join(process.cwd(), 'public', 'docs-index.json')

  try {
    const data = fs.readFileSync(indexPath, 'utf-8')
    docsCache = JSON.parse(data)
    return docsCache!
  } catch (error) {
    console.error('Failed to load docs index:', error)
    return []
  }
}

function buildContext(docs: DocEntry[]): string {
  return docs
    .map((doc) => {
      return `## ${doc.title} (${doc.path})\n${
        doc.description ? doc.description + '\n' : ''
      }${doc.content}`
    })
    .join('\n\n---\n\n')
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      answer: '',
      relevantPages: [],
      error: 'Method not allowed',
    })
  }

  const { query } = req.body

  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      answer: '',
      relevantPages: [],
      error: 'Query is required',
    })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return res.status(500).json({
      answer: '',
      relevantPages: [],
      error: 'ANTHROPIC_API_KEY is not configured',
    })
  }

  try {
    const anthropic = new Anthropic({ apiKey })
    const docs = loadDocsIndex()

    if (docs.length === 0) {
      return res.status(500).json({
        answer: '',
        relevantPages: [],
        error: 'Documentation index not found. Please run the build script.',
      })
    }

    const context = buildContext(docs)

    const systemPrompt = `You are a helpful documentation assistant for Rulebricks, a decision automation platform. Answer questions based on the provided documentation.

Guidelines:
- Be highly concise and helpful
- Reference specific features and concepts
- If you're not sure about something, say so
- Format your response with clear paragraphs using clear markdown
- If the user seems uninformed, respond in a way that is easy to understand and doesn't assume too much knowledge
- If the user's query sounds like they might be an engineer, respond like one, focusing on the crux/"hard part" of their question

IMPORTANT: Do NOT list or mention documentation page names/titles in your response text. The relevant pages will be shown separately in the UI.

At the very end of your response, you MUST include a JSON block with 2-4 relevant pages and a brief reason why each is helpful. Use this EXACT format:
\`\`\`json
{"pages": [{"path": "/getting-started/what-is-a-rule", "reason": "Explains the core concept"}, {"path": "/getting-started/start-building", "reason": "Step-by-step tutorial"}]}
\`\`\`

Only include paths that exist in the documentation. The reason should be a short phrase explaining why this page helps answer the user's question.

Documentation context:
${context}`

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: query }],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse the response to extract the answer and relevant pages
    let answer = responseText
    let relevantPages: SearchResponse['relevantPages'] = []

    // Try to extract JSON block with relevant pages (supports multiple formats)
    const jsonMatch = responseText.match(/```json\s*(\{[\s\S]*?\})\s*```/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1])

        // Handle format with reasons: {"pages": [{path, reason}]}
        if (
          parsed.pages &&
          Array.isArray(parsed.pages) &&
          parsed.pages.length > 0 &&
          typeof parsed.pages[0] === 'object'
        ) {
          relevantPages = parsed.pages
            .map((item: { path: string; reason?: string }) => {
              const doc = docs.find((d) => d.path === item.path)
              if (doc) {
                return {
                  title: doc.title,
                  path: doc.path,
                  description: item.reason || '', // Use AI's reason
                }
              }
              return null
            })
            .filter(Boolean)
            .slice(0, 4)
        }
        // Handle simple format: {"pages": ["/path1", "/path2"]}
        else if (parsed.pages && Array.isArray(parsed.pages)) {
          relevantPages = parsed.pages
            .map((pagePath: string) => {
              const doc = docs.find((d) => d.path === pagePath)
              if (doc) {
                return {
                  title: doc.title,
                  path: doc.path,
                  description: '', // No reason available
                }
              }
              return null
            })
            .filter(Boolean)
            .slice(0, 4)
        }
        // Handle legacy format: {"relevantPages": [{path, reason}]}
        else if (parsed.relevantPages && Array.isArray(parsed.relevantPages)) {
          relevantPages = parsed.relevantPages
            .map((suggestion: { path: string; reason?: string }) => {
              const doc = docs.find((d) => d.path === suggestion.path)
              if (doc) {
                return {
                  title: doc.title,
                  path: doc.path,
                  description: suggestion.reason || '',
                }
              }
              return null
            })
            .filter(Boolean)
            .slice(0, 4)
        }

        // Remove the JSON block from the answer (handle various formats)
        answer = responseText
          .replace(/```json[\s\S]*?```/g, '')
          .replace(/```[\s\S]*?\{"pages"[\s\S]*?\}[\s\S]*?```/g, '')
          .trim()
      } catch {
        // JSON parsing failed, continue with full response
      }
    }

    // Fallback: Try to extract paths mentioned in parentheses like (/getting-started/what-is-a-rule)
    if (relevantPages.length === 0) {
      const pathMatches = responseText.match(/\(\/[a-z0-9-/]+\)/gi) || []
      const extractedPaths = pathMatches
        .map((match) => match.slice(1, -1)) // Remove parentheses
        .filter((p, i, arr) => arr.indexOf(p) === i) // Unique paths

      if (extractedPaths.length > 0) {
        relevantPages = extractedPaths
          .map((pagePath) => {
            const doc = docs.find((d) => d.path === pagePath)
            if (doc) {
              return {
                title: doc.title,
                path: doc.path,
                description: doc.description,
              }
            }
            return null
          })
          .filter(Boolean)
          .slice(0, 4) as SearchResponse['relevantPages']
      }
    }

    // Final fallback: keyword-based search
    if (relevantPages.length === 0) {
      const queryLower = query.toLowerCase()
      const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 3)

      // Score docs by relevance
      const scoredDocs = docs
        .map((doc) => {
          const titleLower = doc.title.toLowerCase()
          const contentLower = doc.content.toLowerCase()
          let score = 0

          // Title matches are worth more
          queryWords.forEach((word) => {
            if (titleLower.includes(word)) score += 3
            if (contentLower.includes(word)) score += 1
          })

          return { doc, score }
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)

      relevantPages = scoredDocs.map((item) => ({
        title: item.doc.title,
        path: item.doc.path,
        description: '', // No AI reason available for fallback results
      }))
    }

    // Clean up any remaining page references and JSON from the answer text
    answer = answer
      .replace(/```json[\s\S]*?```/g, '')
      .replace(/\{"pages":\s*\[[\s\S]*?\]\}/g, '')
      .replace(/\{"relevantPages":\s*\[[\s\S]*?\]\}/g, '')
      .replace(/\*\*Helpful documentation pages?:\*\*[\s\S]*$/i, '')
      .replace(/Helpful documentation pages?:[\s\S]*$/i, '')
      .replace(/Relevant pages?:[\s\S]*$/i, '')
      .replace(/See also:[\s\S]*$/i, '')
      .trim()

    return res.status(200).json({
      answer,
      relevantPages,
    })
  } catch (error) {
    console.error('AI search error:', error)
    return res.status(500).json({
      answer: '',
      relevantPages: [],
      error: error instanceof Error ? error.message : 'An error occurred',
    })
  }
}
