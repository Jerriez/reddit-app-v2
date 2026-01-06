// 단어 뜻 검색 API - Claude로 영어 단어/표현 설명

const SYSTEM_PROMPT = `You are an English vocabulary teacher for Korean learners.
When given an English word or phrase, provide a clear explanation.

Return ONLY valid JSON (no markdown):
{
  "word": "the word/phrase",
  "meaning": "Simple English explanation (1-2 sentences)",
  "korean": "한국어 뜻",
  "pronunciation": "발음 힌트 (한글로)",
  "examples": [
    "Example sentence 1",
    "Example sentence 2"
  ],
  "tips": "Usage tip or note (optional, can be empty string)"
}

Keep explanations simple and practical for intermediate learners.
If it's slang or informal, mention that.`

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { word, context } = req.body

  if (!word || word.trim().length < 1) {
    return res.status(400).json({ error: 'Word is required' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  // 캐시 키 생성
  const cacheKey = `word_${word.toLowerCase().trim()}`
  
  try {
    const userMessage = context 
      ? `Word/phrase: "${word}"\nContext: "${context}"\n\nExplain this word/phrase.`
      : `Word/phrase: "${word}"\n\nExplain this word/phrase.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`)
    }

    const data = await response.json()
    let result = data.content[0].text

    // JSON 파싱
    result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
      const parsed = JSON.parse(result)
      return res.status(200).json(parsed)
    } catch (parseError) {
      // 파싱 실패시 기본 응답
      return res.status(200).json({
        word: word,
        meaning: "Unable to parse response",
        korean: "검색 실패",
        pronunciation: "",
        examples: [],
        tips: ""
      })
    }

  } catch (error) {
    console.error('Word lookup error:', error)
    return res.status(500).json({
      error: error.message,
      word: word,
      meaning: "Error looking up word",
      korean: "오류 발생",
      examples: []
    })
  }
}
