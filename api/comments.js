// Redlib 기반 댓글 가져오기 - API 키 불필요!

// 여러 Redlib 인스턴스 (하나 실패시 다른 것 사용)
const REDLIB_INSTANCES = [
  'https://redlib.catsarch.com',
  'https://safereddit.com',
  'https://redlib.perennialte.ch',
  'https://red.ngn.tf',
  'https://redlib.freedit.eu'
]

// old.reddit.com JSON도 백업으로 사용
const FALLBACK_SOURCES = [
  'https://old.reddit.com'
]

// 여러 소스에서 시도
async function fetchWithFallback(path) {
  const allSources = [...REDLIB_INSTANCES, ...FALLBACK_SOURCES]
  
  for (const baseUrl of allSources) {
    try {
      const url = `${baseUrl}${path}`
      console.log(`Trying comments: ${url}`)
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`Comments success from: ${baseUrl}`)
        return { data, source: baseUrl }
      }
    } catch (error) {
      console.log(`Comments failed ${baseUrl}: ${error.message}`)
      continue
    }
  }
  
  throw new Error('All sources failed for comments')
}

// 댓글을 평면화하는 함수 (중첩 댓글 처리)
function flattenComments(comments, depth = 0, maxDepth = 3) {
  const result = []
  
  if (!Array.isArray(comments)) return result
  
  for (const comment of comments) {
    if (comment.kind !== 't1') continue // t1 = comment
    
    const c = comment.data
    if (!c.body || c.body === '[deleted]' || c.body === '[removed]') continue
    
    result.push({
      id: c.id,
      body: c.body,
      author: c.author,
      score: c.score,
      created_utc: c.created_utc,
      depth: depth
    })
    
    // 대댓글 처리 (최대 깊이까지만)
    if (depth < maxDepth && c.replies && c.replies.data && c.replies.data.children) {
      const childComments = flattenComments(c.replies.data.children, depth + 1, maxDepth)
      result.push(...childComments)
    }
  }
  
  return result
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const { postId, subreddit, limit = 10 } = req.query

  if (!postId || !subreddit) {
    return res.status(400).json({ error: 'postId and subreddit required' })
  }

  try {
    // 댓글 JSON 엔드포인트
    const path = `/r/${subreddit}/comments/${postId}.json?limit=${limit}&sort=top&raw_json=1`
    const { data } = await fetchWithFallback(path)

    // data[0] = 포스트 정보, data[1] = 댓글들
    const commentsData = data[1]?.data?.children || []
    
    // 댓글 평면화 및 정리
    const comments = flattenComments(commentsData).slice(0, 20) // 최대 20개

    res.status(200).json({
      comments,
      total: comments.length
    })

  } catch (error) {
    console.error('Comments API error:', error)
    res.status(500).json({ 
      error: error.message,
      comments: []
    })
  }
}
