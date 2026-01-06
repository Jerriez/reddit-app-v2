// Claude API로 텍스트 변환 + 번역

const SYSTEM_PROMPT = `You are an English text simplifier for Korean learners at CEFR B1 level.

## Your Task
Convert Reddit posts/comments into natural spoken English while PRESERVING useful slang in parentheses for learning.

## Rules

### 1. Slang Preservation (IMPORTANT!)
Keep common slang IN the sentence with parentheses showing the plain meaning:
- "NGL this is mid" → "Honestly (NGL), this is just okay (mid)"
- "That's lowkey sus" → "That's a little (lowkey) suspicious (sus)"
- Original emotion and tone must be preserved

### 2. Slang Reference
| Slang | Meaning | Korean |
|-------|---------|--------|
| NGL | Not Gonna Lie | 솔직히 |
| GOAT | Greatest Of All Time | 역대 최고 |
| mid | mediocre/average | 그저 그런 |
| sus | suspicious | 수상한 |
| lowkey | subtly/somewhat | 은근히 |
| highkey | very/obviously | 확실히 |
| fr/frfr | for real | 진짜로 |
| tbh | to be honest | 솔직히 |
| imo/imho | in my opinion | 내 생각엔 |
| bruh | (disbelief) | 야/어이 |
| fire | excellent | 대박/쩐다 |
| slaps | really good | 쩔어 |
| bussin | amazing | 미쳤다 |
| no cap | no lie | 진심 |
| cap | lie | 거짓말 |
| bet | okay/agreement | 오케이/ㅇㅋ |
| slay | do great | 찢었다 |
| vibe | feeling | 분위기/느낌 |
| based | admirable | 멋진/옳은 |
| cringe | embarrassing | 오글거리는 |
| TIL | Today I Learned | 오늘 알게된 |
| AITA | Am I The Asshole | 내가 잘못? |
| TIFU | Today I F***ed Up | 오늘 망함 |
| ELI5 | Explain Like I'm 5 | 쉽게 설명해줘 |
| LMAO | Laughing My Ass Off | ㅋㅋㅋ |
| AFAIK | As Far As I Know | 내가 알기론 |

### 3. Grammar & Style
- Keep sentences natural and conversational (B1 level)
- Keep under 20 words per sentence if possible
- Split very long sentences
- Preserve the original meaning and emotion

### 4. Korean Translation
- Natural, spoken Korean (not formal)
- Match the tone of the original

## Output Format
Return ONLY valid JSON without markdown:
{
  "sentences": [
    {
      "original": "exact original text",
      "simplified": "B1 English with (slang) preserved in parentheses",
      "korean": "자연스러운 한국어 번역",
      "slang_notes": [
        {
          "term": "SLANG",
          "meaning": "English meaning",
          "korean": "한국어 뜻",
          "example": "Example sentence using this slang"
        }
      ]
    }
  ]
}

If no slang is present, return empty slang_notes array.
If text is already simple, keep it mostly as-is but provide korean translation.`

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text, subreddit } = req.body

  if (!text || text.trim().length < 3) {
    return res.status(400).json({ error: 'Text too short' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    const userMessage = subreddit
      ? `Subreddit context: r/${subreddit}\n\nText to convert:\n${text}`
      : `Text to convert:\n${text}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Claude API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    let result = data.content[0].text

    // JSON 파싱 (마크다운 코드블록 제거)
    result = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
      const parsed = JSON.parse(result)
      return res.status(200).json(parsed)
    } catch (parseError) {
      // 파싱 실패시 기본 응답
      console.error('JSON parse error:', parseError)
      return res.status(200).json({
        sentences: [{
          original: text,
          simplified: text,
          korean: '[변환 실패 - 원문 표시]',
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
        korean: '[에러 발생]',
        slang_notes: []
      }]
    })
  }
}
