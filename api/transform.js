const SYSTEM_PROMPT = `You are an English text simplifier for Korean learners at CEFR B1 level.

Convert Reddit post titles into natural spoken English while keeping useful slang in parentheses.

Rules:
1. Keep slang in parentheses: "NGL this is mid" → "Honestly (NGL), this is just okay (mid)"
2. Keep sentences natural and conversational
3. Provide Korean translation

Common slang: NGL (솔직히), GOAT (최고), mid (그저그런), sus (수상한), lowkey (은근히), fr (진짜), tbh (솔직히), bruh (야), fire (대박), slaps (쩐다)

Return ONLY valid JSON:
{
  "sentences": [
    {
      "original": "original text",
      "simplified": "B1 English with (slang) in parentheses",
      "korean": "한국어 번역",
      "slang_notes": [
        {"term": "slang", "meaning": "English meaning", "korean": "한국어", "example": "Example sentence"}
      ]
    }
  ]
}`

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { text, subreddit } = req.body
  
  if (!text) {
    return res.status(400).json({ error: 'No text provided' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not set' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          { 
            role: 'user', 
            content: subreddit 
              ? `Subreddit: r/${subreddit}\n\nText: ${text}`
              : text
          }
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = await response.json()
    let result = data.content[0].text

    // JSON 파싱
    try {
      // 마크다운 코드블록 제거
      result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(result)
      return res.status(200).json(parsed)
    } catch (e) {
      // 파싱 실패시 기본값
      return res.status(200).json({
        sentences: [{
          original: text,
          simplified: text,
          korean: '[변환 실패]',
          slang_notes: []
        }]
      })
    }
  } catch (error) {
    console.error('Transform error:', error)
    return res.status(500).json({ 
      error: error.message,
      sentences: [{
        original: text,
        simplified: text,
        korean: '[에러]',
        slang_notes: []
      }]
    })
  }
}
